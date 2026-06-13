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
}

document.querySelector("#logout-button").addEventListener("click", (event) => {
    event.preventDefault();
    authService.logout();
    window.location.replace("login.html");
});

initialize();
