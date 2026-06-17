// Usa o mesmo host da pagina para funcionar no PC e no telemovel pela rede local.
const API_URL = `http://${window.location.hostname}:3000`;

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options
    });

    if (!response.ok) {
        throw new Error(`Pedido à API falhou (${response.status}).`);
    }

    return response.status === 204 ? null : response.json();
}

export const apiService = {
    getUsers: () => request("/users"),

    getUserById: (id) => request(`/users/${encodeURIComponent(id)}`),

    async getUserByEmail(email) {
        const users = await request(`/users?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return users[0] ?? null;
    },

    createUser: (user) => request("/users", {
        method: "POST",
        body: JSON.stringify(user)
    }),

    updateUser: (id, changes) => request(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    }),

    getRoutes: () => request("/routes"),
    async getRoutesByUser(userId) {
        const routes = await request("/routes");
        return routes.filter((route) => String(route.createdBy ?? route.userId) === String(userId));
    },
    async getCompletedRoutesByUser(userId) {
        const routes = await request("/routes");
        return routes.filter((route) => route.completedBy?.map(String).includes(String(userId)));
    },
    getRouteById: (id) => request(`/routes/${id}`),
    createRoute: (route) => request("/routes", {
        method: "POST",
        body: JSON.stringify(route)
    }),
    updateRoute: (id, changes) => request(`/routes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    }),
    deleteRoute: (id) => request(`/routes/${id}`, { method: "DELETE" }),

    getRouteSteps(routeId = null) {
        const query = routeId ? `?routeId=${encodeURIComponent(routeId)}` : "";
        return request(`/routeSteps${query}`);
    },

    createRouteStep: (step) => request("/routeSteps", {
        method: "POST",
        body: JSON.stringify(step)
    }),

    createRouteSteps(steps) {
        return Promise.all(steps.map((step) => this.createRouteStep(step)));
    },

    updateRouteStep: (id, changes) => request(`/routeSteps/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    }),
    deleteRouteStep: (id) => request(`/routeSteps/${id}`, { method: "DELETE" }),
    async deleteRouteSteps(routeId) {
        const steps = await this.getRouteSteps(routeId);
        await Promise.all(steps.map((step) => this.deleteRouteStep(step.id)));
    },

    getAchievements: () => request("/achievements"),
    getUserAchievements: (userId) => request(`/userAchievements?userId=${encodeURIComponent(userId)}`),
    createUserAchievement: (userAchievement) => request("/userAchievements", {
        method: "POST",
        body: JSON.stringify(userAchievement)
    }),
    updateAchievement: (id, changes) => request(`/achievements/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    }),

    getFavoritesByUser: (userId) => request(`/favorites?userId=${encodeURIComponent(userId)}`),
    addFavorite: (userId, routeId) => request("/favorites", {
        method: "POST",
        body: JSON.stringify({
            userId: String(userId),
            routeId: String(routeId),
            createdAt: new Date().toISOString()
        })
    }),
    async removeFavorite(userId, routeId) {
        const favorites = await request(`/favorites?userId=${encodeURIComponent(userId)}&routeId=${encodeURIComponent(routeId)}`);
        await Promise.all(favorites.map((favorite) => request(`/favorites/${favorite.id}`, { method: "DELETE" })));
    },
    async removeFavoritesByRoute(routeId) {
        const favorites = await request(`/favorites?routeId=${encodeURIComponent(routeId)}`);
        await Promise.all(favorites.map((favorite) => request(`/favorites/${favorite.id}`, { method: "DELETE" })));
    }
};
