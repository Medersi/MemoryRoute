import { progressService } from "../services/progressService.js";
import { storageService } from "../services/storageService.js";
import { renderAchievements, renderAchievementsError } from "../views/achievementsView.js";

async function initialize() {
    try {
        const user = storageService.getAuthenticatedUser();
        const newlyUnlocked = await progressService.checkAndUnlockAchievements(user.id);
        const progress = await progressService.getProgressData(user.id);
        renderAchievements(progress, newlyUnlocked);
    } catch {
        renderAchievementsError();
    }
}

initialize();
