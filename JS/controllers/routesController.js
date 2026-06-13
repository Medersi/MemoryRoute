import { Route } from "../models/Route.js";
import { apiService } from "../services/apiService.js";
import { storageService } from "../services/storageService.js";
import { renderRoutes, renderRoutesError, setActiveRouteFilter } from "../views/routesView.js";

let user;
let routes = [];
let favorites = [];
let currentFilter = "all";

async function initialize() {
    try {
        user = storageService.getAuthenticatedUser();
        routes = (await apiService.getRoutes())
            .filter((route) => String(route.createdBy ?? route.userId) === String(user.id))
            .map((route) => new Route(route));
        favorites = await apiService.getFavoritesByUser(user.id);
        bindEvents();
        renderCurrentRoutes();
    } catch {
        renderRoutesError();
    }
}

function bindEvents() {
    document.querySelector("#route-filters")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-route-filter]");
        if (!button) return;
        currentFilter = button.dataset.routeFilter;
        renderCurrentRoutes();
    });

    document.querySelector("#routes-list")?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-favorite-route-id]");
        if (!button) return;
        button.disabled = true;
        await toggleFavorite(button.dataset.favoriteRouteId);
    });
}

async function toggleFavorite(routeId) {
    try {
        const isFavorite = favorites.some((favorite) => String(favorite.routeId) === String(routeId));
        if (isFavorite) await apiService.removeFavorite(user.id, routeId);
        else await apiService.addFavorite(user.id, routeId);

        favorites = await apiService.getFavoritesByUser(user.id);
        renderCurrentRoutes();
    } catch {
        renderRoutesError();
    }
}

function renderCurrentRoutes() {
    const favoriteIds = favorites.map((favorite) => String(favorite.routeId));
    const visibleRoutes = routes.filter((route) => {
        if (currentFilter === "favorites") return favoriteIds.includes(String(route.id));
        if (currentFilter === "completed") return route.completedBy?.includes(String(user.id));
        if (currentFilter === "in_progress") return ["in_progress", "in-progress"].includes(route.status);
        return true;
    });

    setActiveRouteFilter(currentFilter);
    renderRoutes(visibleRoutes, user, favoriteIds);
}

initialize();
