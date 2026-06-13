const API_URL = "http://localhost:3000";

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
    getRouteById: (id) => request(`/routes/${id}`),
    createRoute: (route) => request("/routes", {
        method: "POST",
        body: JSON.stringify(route)
    }),
    updateRoute: (id, changes) => request(`/routes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    }),

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

    getAchievements: () => request("/achievements"),
    updateAchievement: (id, changes) => request(`/achievements/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    })
};
