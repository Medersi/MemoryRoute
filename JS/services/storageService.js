const SESSION_KEY = "memoryRouteAuthenticatedUser";

export const storageService = {
    saveAuthenticatedUser(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    },

    getAuthenticatedUser() {
        const storedUser = localStorage.getItem(SESSION_KEY);
        if (!storedUser) return null;

        try {
            return JSON.parse(storedUser);
        } catch {
            this.logout();
            return null;
        }
    },

    hasSession() {
        return Boolean(this.getAuthenticatedUser());
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
    }
};
