import { storageService } from "../services/storageService.js";

async function initialize() {
    const user = storageService.getAuthenticatedUser();
    if (!user) return;
    console.log("Controlador de preferências carregado com sucesso para o utilizador:", user.name);
}

const slider = document.getElementById("range-distancia");
const txtDistancia = document.getElementById("valor-distancia");
if (slider && txtDistancia) {
    slider.addEventListener("input", (e) => {
        txtDistancia.textContent = `${e.target.value} km`;
    });
}

initialize();