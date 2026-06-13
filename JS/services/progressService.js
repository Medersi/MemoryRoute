import { User } from "../models/User.js";
import { apiService } from "./apiService.js";
import { storageService } from "./storageService.js";

export const progressService = {
    async getProgressData(userId) {
        const [routesCreated, completedRoutes, achievements, userAchievements, favorites] = await Promise.all([
            apiService.getRoutesByUser(userId),
            apiService.getCompletedRoutesByUser(userId),
            apiService.getAchievements(),
            apiService.getUserAchievements(userId),
            apiService.getFavoritesByUser(userId)
        ]);

        const user = await getFreshUser();
        const unlockedIds = new Set(userAchievements.map((item) => String(item.achievementId)));
        const totalKilometers = completedRoutes.reduce((total, route) => total + (Number(route.distanceKm) || 0), 0);

        return {
            user,
            level: user.calculateLevel(),
            routesCreated,
            completedRoutes,
            totalKilometers,
            favorites,
            unlockedAchievements: achievements.filter((achievement) => unlockedIds.has(String(achievement.id))),
            lockedAchievements: achievements.filter((achievement) => !unlockedIds.has(String(achievement.id))),
            userAchievements
        };
    },

    async checkAndUnlockAchievements(userId) {
        const data = await this.getProgressData(userId);
        const alreadyUnlocked = new Set(data.userAchievements.map((item) => String(item.achievementId)));
        const newlyUnlocked = [];

        for (const achievement of [...data.unlockedAchievements, ...data.lockedAchievements]) {
            if (alreadyUnlocked.has(String(achievement.id))) continue;
            if (!meetsCriteria(achievement.criteria, data)) continue;

            await apiService.createUserAchievement({
                userId: String(userId),
                achievementId: String(achievement.id),
                unlockedAt: new Date().toISOString()
            });
            newlyUnlocked.push(achievement);
        }

        return newlyUnlocked;
    }
};

async function getFreshUser() {
    const sessionUser = storageService.getAuthenticatedUser();
    const userData = await apiService.getUserByEmail(sessionUser.email);
    const user = new User(userData);
    storageService.saveAuthenticatedUser(user.toSessionData());
    return user;
}

function meetsCriteria(criteria, data) {
    const target = Number(criteria?.target) || 0;
    const values = {
        completed_routes: data.completedRoutes.length,
        created_routes: data.routesCreated.length,
        coins: data.user.coins
    };
    return (values[criteria?.type] ?? 0) >= target;
}
