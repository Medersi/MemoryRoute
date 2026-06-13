import { storageService } from "../services/storageService.js";

const user = storageService.getAuthenticatedUser();

if (user) {
    const firstName = user.name.split(" ")[0];
    document.querySelector("[data-home-greeting]").textContent = `Olá, ${firstName}`;
    document.querySelector("[data-home-avatar]").textContent = firstName[0].toUpperCase();
}
