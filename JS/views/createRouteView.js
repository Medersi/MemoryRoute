const stepsContainer = document.querySelector("#steps-container");
const stepTemplate = document.querySelector("#step-template");
const message = document.querySelector("#create-route-message");
let nextStepId = 1;
let editing = false;

export function addStepCard(step = null) {
    const fragment = stepTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".step-builder-card");
    const stepId = nextStepId++;

    card.dataset.stepId = String(stepId);
    card.querySelector("[data-step-number]").textContent = `Passo ${stepsContainer.children.length + 1}`;
    card.querySelector("[data-step-instruction]").name = `step-instruction-${stepId}`;
    card.querySelector("[data-step-action]").name = `step-action-${stepId}`;
    card.querySelector("[data-step-image]").name = `step-image-${stepId}`;
    card.querySelector("[data-step-reference]").name = `step-reference-${stepId}`;
    stepsContainer.appendChild(fragment);
    if (step) fillStepCard(stepsContainer.lastElementChild, step);
    updateStepNumbers();
    return stepsContainer.lastElementChild;
}

export function removeStepCard(card) {
    card.remove();
    updateStepNumbers();
}

export function updateStepPreview(card, imageSource) {
    const preview = card.querySelector("[data-step-preview]");
    preview.src = imageSource;
    preview.hidden = false;
    card.querySelector("[data-step-placeholder]").hidden = true;
    card.dataset.image = imageSource;
}

export function updateMainImagePreview(imageSource) {
    const preview = document.querySelector("#main-image-preview");
    preview.src = imageSource;
    preview.hidden = false;
    document.querySelector("#main-image-placeholder").hidden = true;
}

export function getStepCards() {
    return [...stepsContainer.querySelectorAll(".step-builder-card")];
}

export function showCreateRouteMessage(text, type = "error") {
    message.textContent = text;
    message.className = `builder-message ${type}`;
    message.hidden = false;
    message.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function clearCreateRouteMessage() {
    message.hidden = true;
}

export function setSaving(saving) {
    const button = document.querySelector("#save-route-button");
    button.disabled = saving;
    button.textContent = saving
        ? "A guardar caminho..."
        : editing ? "Guardar alterações" : "Guardar caminho";
}

export function setEditMode(route) {
    editing = true;
    document.querySelector(".builder-header h1").textContent = "Editar rota visual";
    document.querySelector("#save-route-button").textContent = "Guardar alterações";
    document.querySelector("#route-name").value = route.name || "";
    document.querySelector("#route-origin").value = route.origin || "";
    document.querySelector("#route-destination").value = route.destination || "";
    document.querySelector("#route-description").value = route.description || "";
    document.querySelector("#route-duration").value = route.durationMinutes || "";
    document.querySelector("#route-difficulty").value = route.difficulty || "fácil";
    if (route.mainImage) updateMainImagePreview(route.mainImage);
}

function fillStepCard(card, step) {
    card.dataset.existingStepId = step.id || "";
    card.querySelector("[data-step-instruction]").value = step.instruction || "";
    card.querySelector("[data-step-action]").value = step.actionType || "landmark";

    if (step.image) {
        updateStepPreview(card, step.image);
        if (!step.image.startsWith("data:")) {
            card.querySelector("[data-step-reference]").value = step.image;
        }
    }
}

function updateStepNumbers() {
    getStepCards().forEach((card, index) => {
        card.querySelector("[data-step-number]").textContent = `Passo ${index + 1}`;
        card.querySelector("[data-remove-step]").hidden = stepsContainer.children.length === 1;
    });
}
