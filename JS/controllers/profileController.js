import { authService } from "../services/authService.js";
import { progressService } from "../services/progressService.js";
import { storageService } from "../services/storageService.js";
import { renderProfile } from "../views/profileView.js";

async function initialize() {
    const user = storageService.getAuthenticatedUser();
    if (!user) return;

    try {
        const progress = await progressService.getProgressData(user.id);
        renderProfile(progress.user, progress);
    } catch {
        renderProfile(user);
    }

    setupProfileActions();
}

function setupProfileActions() {
    //Botão de Dados Pessoais
    const btnDadosPessoais = document.querySelector(".settings-row:nth-of-type(1)"); // Ou usa um ID se preferires mudar no HTML
    if (btnDadosPessoais) {
        btnDadosPessoais.addEventListener("click", () => {
            event.preventDefault();
            window.location.href = "dados-pessoais.html"; 
        });
    }

    //Botão de Preferências de Rota
    const btnPreferencias = document.querySelector(".settings-row:nth-of-type(2)");
    if (btnPreferencias) {
        btnPreferencias.addEventListener("click", () => {
            event.preventDefault();
             window.location.href = "preferencias.html";
        });
    }

     //Botão de emergência
    const btnEmergencia = document.querySelector(".settings-row:nth-of-type(3)");
    if (btnEmergencia) {
        btnEmergencia.addEventListener("click", () => {
            event.preventDefault();
             window.location.href = "emergencia.html";
        });
    }

    //Botão de suporte
    const btnSuporte = document.querySelector(".settings-row:nth-of-type(4)");
    if (btnSuporte) {
        btnSuporte.addEventListener("click", () => {
            event.preventDefault();
             window.location.href = "suporte.html";
        });
    }

    //Botão sobre memoryroute
    const btnSobre = document.querySelector(".settings-row:nth-of-type(5)");
    if (btnSobre) {
        btnSobre.addEventListener("click", () => {
            window.location.href = "sobre.html";
        });
    }

    //Botão Editar Perfil
    const btnEditarPerfil = document.querySelector(".edit-button");
    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener("click", () => {
            console.log("Clicou no botão Editar Perfil!");
        });
    }
    
}

// Listener do Logout (mantém-se igual)
document.querySelector("#logout-button").addEventListener("click", (event) => {
    event.preventDefault();
    authService.logout();
    window.location.replace("login.html");
});

initialize();
