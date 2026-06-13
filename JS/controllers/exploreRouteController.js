import { Route } from "../models/Route.js";
import { RouteStep } from "../models/RouteStep.js";
import { User } from "../models/User.js";
import { apiService } from "../services/apiService.js";
import { storageService } from "../services/storageService.js";
import { progressService } from "../services/progressService.js";
import {
    clearExploreMessage,
    getExploreElements,
    renderStep,
    setStepButtonLoading,
    showCompletion,
    showExploreMessage
} from "../views/exploreRouteView.js";

const searchParams = new URLSearchParams(window.location.search);
const routeId = searchParams.get("id");
const repeatRoute = searchParams.get("repeat") === "1";
const sessionUser = storageService.getAuthenticatedUser();
const elements = getExploreElements();

let route;
let steps = [];
let currentIndex = 0;
let isProcessing = false;

async function initialize() {
    if (!sessionUser || !routeId) {
        if (!routeId) showExploreMessage("Não foi indicada nenhuma rota.", "error");
        return;
    }

    try {
        const [routeData, stepData] = await Promise.all([
            apiService.getRouteById(routeId),
            apiService.getRouteSteps(routeId)
        ]);

        route = new Route(routeData);
        steps = stepData
            .map((step) => new RouteStep(step))
            .sort((a, b) => a.order - b.order);

        if (!steps.length) {
            showExploreMessage("Esta rota ainda não tem passos configurados.", "error");
            elements.nextButton.disabled = true;
            return;
        }

        const alreadyCompleted = route.completedBy.includes(String(sessionUser.id));
        if (alreadyCompleted && !repeatRoute) {
            showCompletion(route.name, false, false);
            return;
        }

        if (repeatRoute && steps.every((step) => step.completed)) {
            steps.forEach((step) => step.reset());
            await Promise.all(steps.map((step) => apiService.updateRouteStep(step.id, { completed: false })));
        }

        const firstIncompleteStep = steps.findIndex((step) => !step.completed);
        currentIndex = firstIncompleteStep === -1 ? steps.length - 1 : firstIncompleteStep;
        renderCurrentStep();
    } catch {
        showExploreMessage("Não foi possível carregar esta rota. Confirma se o servidor está ativo.", "error");
        elements.nextButton.disabled = true;
    }
}

function renderCurrentStep() {
    const progress = route.calculateProgress(steps);
    renderStep(route, steps[currentIndex], currentIndex, steps.length, progress);
}

function showPreviousStep() {
    if (isProcessing || currentIndex === 0) return;
    currentIndex -= 1;
    clearExploreMessage();
    renderCurrentStep();
}

async function completeCurrentStep() {
    if (isProcessing) return;
    isProcessing = true;
    clearExploreMessage();
    setStepButtonLoading(true, currentIndex > 0);

    try {
        const step = steps[currentIndex].markCompleted();
        await apiService.updateRouteStep(step.id, { completed: true });

        if (currentIndex < steps.length - 1) {
            currentIndex += 1;
            renderCurrentStep();
            return;
        }

        await completeRoute();
    } catch {
        showExploreMessage("Não foi possível atualizar o progresso. Tenta novamente.", "error");
    } finally {
        isProcessing = false;
        setStepButtonLoading(false, currentIndex > 0);
    }
}

async function completeRoute() {
    const freshUserData = await apiService.getUserByEmail(sessionUser.email);
    const user = new User(freshUserData);
    const rewarded = user.completeRoute(route.id, 20);

    route.markCompleted().markCompletedBy(user.id);

    await Promise.all([
        apiService.updateRoute(route.id, {
            status: route.status,
            completedBy: route.completedBy
        }),
        apiService.updateUser(user.id, {
            coins: user.coins,
            completedRouteIds: user.completedRouteIds
        })
    ]);

    storageService.saveAuthenticatedUser(user.toSessionData());
    const newlyUnlocked = await progressService.checkAndUnlockAchievements(user.id).catch(() => []);
    const achievementUnlocked = newlyUnlocked.some((achievement) => achievement.name === "Primeira rota sozinho");
    window.history.replaceState(null, "", `explorar-rota.html?id=${encodeURIComponent(route.id)}`);
    showCompletion(route.name, rewarded, achievementUnlocked);
}

function requestHelp() {
    const contact = storageService.getAuthenticatedUser()?.emergencyContact;
    if (!contact?.phone) {
        showExploreMessage("Configura um contacto de emergência no perfil para pedir ajuda.", "error");
        return;
    }

    window.location.href = `tel:${contact.phone.replace(/\s+/g, "")}`;
}

elements.previousButton.addEventListener("click", showPreviousStep);
elements.nextButton.addEventListener("click", completeCurrentStep);
elements.helpButton.addEventListener("click", requestHelp);
initialize();
