// JS/controllers/emergenciaController.js

import { storageService } from "../services/storageService.js";

async function initialize() {
    const user = storageService.getAuthenticatedUser();
    if (!user) return;

    // Se o utilizador já tiver dados, mostra-os no cartão e preenche o formulário
    if (user.emergencyContact) {
        document.getElementById("current-name").textContent = user.emergencyContact.name;
        document.getElementById("current-phone").textContent = user.emergencyContact.phone;
        
        document.getElementById("input-emergencia-nome").value = user.emergencyContact.name;
        document.getElementById("input-emergencia-fone").value = user.emergencyContact.phone;
    }
}

const form = document.getElementById("form-emergencia");
if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const user = storageService.getAuthenticatedUser();
        if (!user) return;

        const nome = document.getElementById("input-emergencia-nome").value;
        const fone = document.getElementById("input-emergencia-fone").value;

        // Gravar no objeto do utilizador
        user.emergencyContact = {
            name: nome,
            phone: fone
        };

        // Atualizar no Local Storage
        localStorage.setItem("authenticatedUser", JSON.stringify(user));

        alert("Contacto de emergência atualizado!");
        
        // Recarregar a página para atualizar o cartão instantaneamente
        window.location.reload();
    });
}

initialize();