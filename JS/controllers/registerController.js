import { authService } from "../services/authService.js";
import { clearMessage, setSubmitting, showMessage } from "../views/messageView.js";

const form = document.querySelector("#register-form");
const message = document.querySelector("#register-message");
const button = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(message);
    setSubmitting(button, true, { loading: "A criar...", idle: "Criar conta" });

    try {
        await authService.register({
            name: form.name.value.trim(),
            email: form.email.value,
            password: form.password.value
        });
        showMessage(message, "Conta criada com sucesso. A redirecionar...", "success");
        setTimeout(() => window.location.replace("login.html"), 900);
    } catch (error) {
        showMessage(message, error.message);
        setSubmitting(button, false, { loading: "A criar...", idle: "Criar conta" });
    }
});
