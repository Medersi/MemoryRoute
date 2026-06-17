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

        const user = await getFreshUser(userId);
        const unlockedIds = new Set(userAchievements.map((item) => String(item.achievementId)));

        return {
            user,
            level: user.level ?? 1,
            routesCreated,
            completedRoutes,
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
        let keepChecking = true;

        while (keepChecking) {
            keepChecking = false;

            for (const achievement of [...data.unlockedAchievements, ...data.lockedAchievements]) {
                if (alreadyUnlocked.has(String(achievement.id))) continue;
                if (!meetsCriteria(achievement.criteria, data)) continue;

                await apiService.createUserAchievement({
                    userId: String(userId),
                    achievementId: String(achievement.id),
                    unlockedAt: new Date().toISOString()
                });

                alreadyUnlocked.add(String(achievement.id));
                newlyUnlocked.push(achievement);

                const reward = getAchievementReward(achievement);
                if (reward > 0) {
                    data.user.addCoins(reward);
                    keepChecking = true;
                }
            }
        }

        if (newlyUnlocked.length > 0) {
            await apiService.updateUser(data.user.id, {
                coins: data.user.coins,
                level: data.user.level
            });
            storageService.saveAuthenticatedUser(data.user.toSessionData());
        }

        return newlyUnlocked;
    }
};

async function getFreshUser(userId) {
    const sessionUser = storageService.getAuthenticatedUser();
    const userData = await apiService.getUserById(userId ?? sessionUser.id);
    const user = new User(userData);

    const calculatedLevel = user.calculateLevel();
    if (user.level !== calculatedLevel) {
        user.level = calculatedLevel;
        await apiService.updateUser(user.id, { level: user.level });
    }

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

export function getAchievementReward(achievement) {
    if (Number.isFinite(Number(achievement.coinReward))) {
        return Number(achievement.coinReward);
    }

    const rewards = {
        "achievement-first-route": 20,
        "achievement-neighborhood-explorer": 50,
        "achievement-path-creator": 15,
        "achievement-active-tutor": 30,
        "achievement-100-coins": 20,
        "achievement-200-coins": 40
    };

    return rewards[achievement.id] ?? 10;
}
