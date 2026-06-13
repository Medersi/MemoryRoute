import { Route } from "../models/Route.js";
import { RouteStep } from "../models/RouteStep.js";
import { apiService } from "../services/apiService.js";
import { storageService } from "../services/storageService.js";
import { progressService } from "../services/progressService.js";
import {
    addStepCard,
    clearCreateRouteMessage,
    getStepCards,
    removeStepCard,
    setEditMode,
    setSaving,
    showCreateRouteMessage,
    updateMainImagePreview,
    updateStepPreview
} from "../views/createRouteView.js";

const form = document.querySelector("#create-route-form");
const addStepButton = document.querySelector("#add-step-button");
const stepsContainer = document.querySelector("#steps-container");
const mainImageInput = document.querySelector("#route-main-image");
const user = storageService.getAuthenticatedUser();
const fields = form.elements;
const editRouteId = new URLSearchParams(window.location.search).get("edit");
let mainImage = "";
let existingRoute = null;
let existingSteps = [];

function readImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve("");
        if (!file.type.startsWith("image/")) return reject(new Error("Seleciona um ficheiro de imagem válido."));

        const reader = new FileReader();
        reader.onload = () => resizeImage(reader.result).then(resolve).catch(reject);
        reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
        reader.readAsDataURL(file);
    });
}

function resizeImage(source) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const maximumSize = 900;
            const scale = Math.min(1, maximumSize / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);

            const context = canvas.getContext("2d");
            if (!context) return reject(new Error("Não foi possível preparar a fotografia."));

            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(compressCanvas(canvas));
        };
        image.onerror = () => reject(new Error("Não foi possível preparar a fotografia."));
        image.src = source;
    });
}

function compressCanvas(canvas) {
    const maximumLength = 85000;
    let quality = 0.75;
    let result = canvas.toDataURL("image/jpeg", quality);

    while (result.length > maximumLength && quality > 0.35) {
        quality -= 0.1;
        result = canvas.toDataURL("image/jpeg", quality);
    }

    while (result.length > maximumLength && canvas.width > 320 && canvas.height > 320) {
        const resized = document.createElement("canvas");
        resized.width = Math.round(canvas.width * 0.8);
        resized.height = Math.round(canvas.height * 0.8);
        resized.getContext("2d").drawImage(canvas, 0, 0, resized.width, resized.height);
        canvas = resized;
        result = canvas.toDataURL("image/jpeg", 0.45);
    }

    return result;
}

addStepButton.addEventListener("click", () => addStepCard());

stepsContainer.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-step]");
    if (removeButton) removeStepCard(removeButton.closest(".step-builder-card"));
});

stepsContainer.addEventListener("change", async (event) => {
    if (!event.target.matches("[data-step-image]")) return;

    try {
        const image = await readImage(event.target.files[0]);
        if (image) updateStepPreview(event.target.closest(".step-builder-card"), image);
    } catch (error) {
        showCreateRouteMessage(error.message);
        event.target.value = "";
    }
});

mainImageInput.addEventListener("change", async () => {
    try {
        mainImage = await readImage(mainImageInput.files[0]);
        if (mainImage) updateMainImagePreview(mainImage);
    } catch (error) {
        showCreateRouteMessage(error.message);
        mainImageInput.value = "";
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearCreateRouteMessage();

    const stepCards = getStepCards();
    const validationError = validateRoute(stepCards);
    if (validationError) {
        showCreateRouteMessage(validationError);
        return;
    }

    setSaving(true);
    let createdRoute = null;
    try {
        const route = new Route({
            id: existingRoute?.id ?? null,
            name: fields.namedItem("name").value.trim(),
            origin: fields.namedItem("origin").value.trim(),
            destination: fields.namedItem("destination").value.trim(),
            description: fields.namedItem("description").value.trim(),
            durationMinutes: Number(fields.namedItem("duration").value) || 0,
            difficulty: fields.namedItem("difficulty").value,
            mainImage,
            ownerId: user.id,
            createdBy: user.id,
            userId: user.id,
            status: "not_started",
            completedBy: []
        });

        const routeData = route.toApiData();
        delete routeData.id;
        const savedRoute = existingRoute
            ? await apiService.updateRoute(existingRoute.id, routeData)
            : await apiService.createRoute(routeData);
        if (!existingRoute) createdRoute = savedRoute;
        const steps = stepCards.map((card, index) => new RouteStep({
            id: card.dataset.existingStepId || null,
            routeId: savedRoute.id,
            order: index + 1,
            title: actionLabel(card.querySelector("[data-step-action]").value),
            instruction: card.querySelector("[data-step-instruction]").value.trim(),
            actionType: card.querySelector("[data-step-action]").value,
            image: card.dataset.image || card.querySelector("[data-step-reference]").value.trim(),
            completed: false
        }));

        if (existingRoute) await saveEditedSteps(steps);
        else await apiService.createRouteSteps(steps.map((step) => step.toApiData()));
        if (existingRoute && user.completedRouteIds?.includes(String(existingRoute.id))) {
            user.completedRouteIds = user.completedRouteIds.filter((id) => String(id) !== String(existingRoute.id));
            await apiService.updateUser(user.id, { completedRouteIds: user.completedRouteIds });
            storageService.saveAuthenticatedUser(user);
        }
        await progressService.checkAndUnlockAchievements(user.id).catch(() => []);
        window.location.replace("rotas.html");
    } catch (error) {
        if (createdRoute) {
            await apiService.deleteRouteSteps(createdRoute.id).catch(() => {});
            await apiService.deleteRoute(createdRoute.id).catch(() => {});
        }
        showCreateRouteMessage(`Não foi possível guardar o caminho. ${error.message}`);
        setSaving(false);
    }
});

async function saveEditedSteps(steps) {
    const savedIds = new Set(steps.filter((step) => step.id).map((step) => String(step.id)));

    await Promise.all(steps.map((step) => {
        const data = step.toApiData();
        delete data.id;
        return step.id
            ? apiService.updateRouteStep(step.id, data)
            : apiService.createRouteStep(data);
    }));

    const removedSteps = existingSteps.filter((step) => !savedIds.has(String(step.id)));
    await Promise.all(removedSteps.map((step) => apiService.deleteRouteStep(step.id)));
}

function validateRoute(stepCards) {
    if (!fields.namedItem("name").value.trim()) return "Indica um nome para a rota.";
    if (!fields.namedItem("destination").value.trim()) return "Indica o destino da rota.";
    if (!stepCards.length) return "Adiciona pelo menos um passo.";

    for (const [index, card] of stepCards.entries()) {
        if (!card.querySelector("[data-step-instruction]").value.trim()) {
            return `Escreve a instrução do passo ${index + 1}.`;
        }

        const reference = card.querySelector("[data-step-reference]").value.trim();
        if (!card.dataset.image && !reference) {
            return `Adiciona uma imagem ou referência visual ao passo ${index + 1}.`;
        }
    }

    return "";
}

function actionLabel(action) {
    const labels = {
        straight: "Seguir em frente",
        left: "Virar à esquerda",
        right: "Virar à direita",
        cross: "Atravessar",
        landmark: "Ponto de referência",
        arrival: "Chegada"
    };
    return labels[action] || "Próximo passo";
}

async function initialize() {
    if (!editRouteId) {
        addStepCard();
        return;
    }

    try {
        const [routeData, steps] = await Promise.all([
            apiService.getRouteById(editRouteId),
            apiService.getRouteSteps(editRouteId)
        ]);

        if (String(routeData.createdBy ?? routeData.userId) !== String(user.id)) {
            window.location.replace("rotas.html");
            return;
        }

        existingRoute = new Route(routeData);
        existingSteps = steps.map((step) => new RouteStep(step));
        mainImage = existingRoute.mainImage || "";
        setEditMode(existingRoute);
        existingSteps
            .sort((a, b) => a.order - b.order)
            .forEach((step) => addStepCard(step));
        if (!existingSteps.length) addStepCard();
    } catch {
        showCreateRouteMessage("Não foi possível carregar a rota para edição.");
        addStepCard();
    }
}

initialize();
