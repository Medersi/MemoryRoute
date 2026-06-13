export class User {
    constructor({
        id = null,
        name,
        email,
        password = "",
        role = "user",
        coins = 0,
        level = 1,
        emergencyContact = null,
        completedRouteIds = [],
        createdAt = new Date().toISOString()
    }) {
        this.id = id;
        this.name = name;
        this.email = email.toLowerCase();
        this.password = password;
        this.role = role;
        this.coins = coins;
        this.level = level;
        this.emergencyContact = emergencyContact;
        this.completedRouteIds = completedRouteIds.map(String);
        this.createdAt = createdAt;
    }

    matchesCredentials(email, password) {
        return this.email === email.trim().toLowerCase() && this.password === password;
    }

    addCoins(amount) {
        if (amount > 0) this.coins += amount;
        return this.coins;
    }

    calculateLevel() {
        if (this.coins >= 350) return 5;
        if (this.coins >= 200) return 4;
        if (this.coins >= 100) return 3;
        if (this.coins >= 50) return 2;
        return 1;
    }

    isAdmin() {
        return this.role === "admin";
    }

    hasCompletedRoute(routeId) {
        return this.completedRouteIds.includes(String(routeId));
    }

    completeRoute(routeId, reward = 20) {
        const normalizedId = String(routeId);
        if (this.hasCompletedRoute(normalizedId)) return false;

        this.completedRouteIds.push(normalizedId);
        this.addCoins(reward);
        return true;
    }

    toSessionData() {
        const { password, ...safeUser } = this;
        return safeUser;
    }

    toApiData() {
        const data = { ...this };
        if (data.id === null) delete data.id;
        return data;
    }
}
