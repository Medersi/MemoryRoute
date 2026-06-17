import { authService } from "../services/authService.js";
import { storageService } from "../services/storageService.js";
import { clearMessage, setSubmitting, showMessage } from "../views/messageView.js";

if (storageService.hasSession()) {
    window.location.replace("index.html");
} else {
    const form = document.querySelector("#login-form");
    const message = document.querySelector("#login-message");
    const button = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage(message);
        setSubmitting(button, true, "Entrar");

        try {
            await authService.login(form.email.value, form.password.value);
            window.location.replace("index.html");
        } catch (error) {
            showMessage(message, error.message);
            setSubmitting(button, false, "Entrar");
        }
    });
}
