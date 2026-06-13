import { Route } from "../models/Route.js";
import { apiService } from "../services/apiService.js";
import { storageService } from "../services/storageService.js";
import { renderRoutes, renderRoutesError } from "../views/routesView.js";

async function initialize() {
    try {
        const user = storageService.getAuthenticatedUser();
        const routes = (await apiService.getRoutes())
            .filter((route) => String(route.createdBy ?? route.userId) === String(user.id))
            .map((route) => new Route(route));
        renderRoutes(routes, user);
    } catch {
        renderRoutesError();
    }
}

initialize();
