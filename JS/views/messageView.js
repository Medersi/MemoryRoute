export function showMessage(element, message, type = "error") {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.hidden = false;
}

export function clearMessage(element) {
    element.textContent = "";
    element.hidden = true;
}

export function setSubmitting(button, submitting, labels) {
    button.disabled = submitting;
    button.textContent = submitting ? labels.loading : labels.idle;
}
