const elements = {
    content: document.querySelector("#explore-content"),
    routeTitle: document.querySelector("[data-route-title]"),
    stepImage: document.querySelector("[data-step-image]"),
    stepTitle: document.querySelector("[data-step-title]"),
    instruction: document.querySelector("[data-step-instruction]"),
    counter: document.querySelector("[data-step-counter]"),
    progress: document.querySelector("[data-step-progress]"),
    message: document.querySelector("#explore-message"),
    previousButton: document.querySelector("#previous-step-button"),
    nextButton: document.querySelector("#step-complete-button"),
    helpButton: document.querySelector("#help-button"),
    success: document.querySelector("#route-success")
};

export function renderStep(route, step, currentIndex, totalSteps, progress) {
    elements.routeTitle.textContent = route.name;
    elements.stepImage.src = step.image || "logo.png";
    elements.stepImage.alt = step.title || `Passo ${currentIndex + 1}`;
    elements.stepTitle.textContent = step.title || `Passo ${currentIndex + 1}`;
    elements.instruction.textContent = step.instruction;
    elements.counter.textContent = `Passo ${currentIndex + 1} de ${totalSteps}`;
    elements.progress.style.width = `${progress}%`;
    elements.progress.parentElement.setAttribute("aria-valuenow", String(progress));
    elements.previousButton.disabled = currentIndex === 0;
}

export function showExploreMessage(message, type = "info") {
    elements.message.textContent = message;
    elements.message.className = `explore-message ${type}`;
    elements.message.hidden = false;
}

export function clearExploreMessage() {
    elements.message.hidden = true;
}

export function setStepButtonLoading(loading, canGoPrevious = false) {
    elements.nextButton.disabled = loading;
    elements.previousButton.disabled = loading || !canGoPrevious;
    elements.nextButton.textContent = loading ? "A atualizar..." : "Já aqui estou";
}

export function showCompletion(routeName, rewarded, achievementUnlocked) {
    elements.routeTitle.textContent = routeName;
    elements.content.hidden = true;
    elements.success.hidden = false;
    document.querySelector("[data-success-title]").textContent = `${routeName} concluída!`;
    document.querySelector("[data-success-reward]").textContent = rewarded
        ? "Ganhaste 20 moedas de autonomia."
        : "Esta rota já tinha sido concluída por ti.";
    document.querySelector("[data-success-achievement]").hidden = !achievementUnlocked;
}

export function getExploreElements() {
    return elements;
}
