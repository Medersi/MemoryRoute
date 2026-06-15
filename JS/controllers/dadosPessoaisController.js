import { storageService } from "../services/storageService.js";

async function initialize() {
    const user = storageService.getAuthenticatedUser();
    if (!user) {
        console.warn("Nenhum utilizador autenticado encontrado.");
        return;
    }
    const inputName = document.getElementById("input-name");
    const inputEmail = document.getElementById("input-email");
    if (inputName) inputName.value = user.name || user.username || "";
    if (inputEmail) inputEmail.value = user.email || "";
}

const form = document.getElementById("form-dados-pessoais");
if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const updatedName = document.getElementById("input-name").value;
        const updatedEmail = document.getElementById("input-email").value;
        const updatedPassword = document.getElementById("input-password").value;

        console.log("Dados prontos para guardar:", { updatedName, updatedEmail, updatedPassword });
        alert("Alterações guardadas com sucesso!");
    });
}

initialize();