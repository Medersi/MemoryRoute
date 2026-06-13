import { storageService } from "../services/storageService.js";

if (!storageService.hasSession()) {
    window.location.replace("login.html");
}
