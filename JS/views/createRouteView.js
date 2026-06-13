const stepsContainer = document.querySelector("#steps-container");
const stepTemplate = document.querySelector("#step-template");
const message = document.querySelector("#create-route-message");
let nextStepId = 1;

export function addStepCard() {
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
    button.textContent = saving ? "A guardar caminho..." : "Guardar caminho";
}

function updateStepNumbers() {
    getStepCards().forEach((card, index) => {
        card.querySelector("[data-step-number]").textContent = `Passo ${index + 1}`;
        card.querySelector("[data-remove-step]").hidden = stepsContainer.children.length === 1;
    });
}
