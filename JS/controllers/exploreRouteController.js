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

const routeId = new URLSearchParams(window.location.search).get("id");
const sessionUser = storageService.getAuthenticatedUser();
const elements = getExploreElements();

let route;
let steps = [];
let currentIndex = 0;

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
            .map((step) => new RouteStep({ ...step, completed: false }))
            .sort((a, b) => a.order - b.order);

        if (!steps.length) {
            showExploreMessage("Esta rota ainda não tem passos configurados.", "error");
            elements.nextButton.disabled = true;
            return;
        }

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

async function completeCurrentStep() {
    clearExploreMessage();
    setStepButtonLoading(true);

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
        setStepButtonLoading(false);
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

elements.nextButton.addEventListener("click", completeCurrentStep);
elements.helpButton.addEventListener("click", requestHelp);
initialize();
