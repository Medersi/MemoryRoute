import { apiService } from "../services/apiService.js";
import { authService } from "../services/authService.js";
import { storageService } from "../services/storageService.js";
import { renderHomeError, renderHomeSummary, renderRecentRoutes } from "../views/homeView.js";

async function initialize() {
    const sessionUser = storageService.getAuthenticatedUser();
    if (!sessionUser) return;

    bindLogout();
    let displayUser = sessionUser;

    renderHomeSummary(sessionUser, {
        createdRoutesCount: 0,
        completedRoutesCount: sessionUser.completedRouteIds?.length ?? 0
    });

    try {
        const user = await getFreshUser(sessionUser);
        displayUser = user;
        const routes = await apiService.getRoutesByUser(user.id);
        const routeSteps = await apiService.getRouteSteps();
        const stepsByRouteId = groupStepsByRoute(routeSteps);
        const recentRoutes = getRecentRoutes(routes);

        renderHomeSummary(user, {
            createdRoutesCount: routes.length,
            completedRoutesCount: getCompletedRoutesCount(user, routes)
        });
        renderRecentRoutes(recentRoutes, stepsByRouteId);
    } catch {
        renderHomeSummary(displayUser, {
            createdRoutesCount: 0,
            completedRoutesCount: displayUser.completedRouteIds?.length ?? 0
        });
        renderHomeError();
    }
}

function bindLogout() {
    document.querySelector("[data-logout-button]")?.addEventListener("click", () => {
        authService.logout();
        window.location.replace("login.html");
    });
}

async function getFreshUser(sessionUser) {
    if (!sessionUser.id && !sessionUser.email) return sessionUser;
    const apiUser = sessionUser.id
        ? await apiService.getUserById(sessionUser.id)
        : await apiService.getUserByEmail(sessionUser.email);
    if (!apiUser) return sessionUser;

    const { password, ...safeUser } = apiUser;
    storageService.saveAuthenticatedUser(safeUser);
    return safeUser;
}

function groupStepsByRoute(steps) {
    return steps.reduce((map, step) => {
        const routeId = String(step.routeId);
        if (!map.has(routeId)) map.set(routeId, []);
        map.get(routeId).push(step);
        return map;
    }, new Map());
}

function getRecentRoutes(routes) {
    return [...routes]
        .sort((first, second) => getRouteTime(second) - getRouteTime(first))
        .slice(0, 2);
}

function getRouteTime(route) {
    return new Date(route.createdAt ?? route.updatedAt ?? 0).getTime() || 0;
}

function getCompletedRoutesCount(user, routes) {
    const completedIds = new Set((user.completedRouteIds ?? []).map(String));
    routes.forEach((route) => {
        if (route.completedBy?.map(String).includes(String(user.id))) {
            completedIds.add(String(route.id));
        }
    });
    return completedIds.size;
}

initialize();
