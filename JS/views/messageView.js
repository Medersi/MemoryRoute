export function showMessage(element, message, type = "error") {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.hidden = false;
}

export function clearMessage(element) {
    element.textContent = "";
    element.hidden = true;
}

export function setSubmitting(button, submitting, label) {
    button.disabled = submitting;
    button.textContent = label;
}
