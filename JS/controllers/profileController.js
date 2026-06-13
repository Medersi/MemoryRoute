import { authService } from "../services/authService.js";
import { storageService } from "../services/storageService.js";
import { renderProfile } from "../views/profileView.js";

const user = storageService.getAuthenticatedUser();

if (user) {
    renderProfile(user);
}

document.querySelector("#logout-button").addEventListener("click", (event) => {
    event.preventDefault();
    authService.logout();
    window.location.replace("login.html");
});
