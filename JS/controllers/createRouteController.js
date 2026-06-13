import { Route } from "../models/Route.js";
import { RouteStep } from "../models/RouteStep.js";
import { apiService } from "../services/apiService.js";
import { storageService } from "../services/storageService.js";
import {
    addStepCard,
    clearCreateRouteMessage,
    getStepCards,
    removeStepCard,
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
let mainImage = "";

function readImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve("");
        if (!file.type.startsWith("image/")) return reject(new Error("Seleciona um ficheiro de imagem válido."));

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
        reader.readAsDataURL(file);
    });
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
    try {
        const route = new Route({
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

        const createdRoute = await apiService.createRoute(route.toApiData());
        const steps = stepCards.map((card, index) => new RouteStep({
            routeId: createdRoute.id,
            order: index + 1,
            title: actionLabel(card.querySelector("[data-step-action]").value),
            instruction: card.querySelector("[data-step-instruction]").value.trim(),
            actionType: card.querySelector("[data-step-action]").value,
            image: card.dataset.image || card.querySelector("[data-step-reference]").value.trim(),
            completed: false
        }));

        await apiService.createRouteSteps(steps.map((step) => step.toApiData()));
        window.location.replace("rotas.html");
    } catch {
        showCreateRouteMessage("Não foi possível guardar o caminho. Confirma se o JSON Server está ativo.");
        setSaving(false);
    }
});

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

addStepCard();
