import { User } from "../models/User.js";
import { apiService } from "./apiService.js";
import { storageService } from "./storageService.js";

export const authService = {
    async login(email, password) {
        const data = await apiService.getUserByEmail(email);
        const user = data ? new User(data) : null;

        if (!user || !user.matchesCredentials(email, password)) {
            throw new Error("Email ou palavra-passe incorretos.");
        }

        storageService.saveAuthenticatedUser(user.toSessionData());
        return user;
    },

    async register({ name, email, password }) {
        if (await apiService.getUserByEmail(email)) {
            throw new Error("Já existe uma conta associada a este email.");
        }

        const user = new User({ name, email, password });
        return apiService.createUser(user.toApiData());
    },

    logout() {
        storageService.logout();
    }
};
