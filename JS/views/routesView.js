const routesList = document.querySelector("#routes-list");
const routeCount = document.querySelector("[data-route-count]");

const statusData = {
    completed: { label: "Concluída", className: "done-status", button: "Iniciar novamente", visual: "green-visual", icon: "✓" },
    in_progress: { label: "Em progresso", className: "progress-status", button: "Continuar rota", visual: "blue-visual", icon: "⌖" },
    "in-progress": { label: "Em progresso", className: "progress-status", button: "Continuar rota", visual: "blue-visual", icon: "⌖" },
    not_started: { label: "Não iniciada", className: "new-status", button: "Iniciar rota", visual: "orange-visual", icon: "⌖" }
};

export function renderRoutes(routes, user, favoriteRouteIds = []) {
    const favoriteIds = new Set(favoriteRouteIds.map(String));
    routeCount.textContent = `${routes.length} ${routes.length === 1 ? "rota" : "rotas"}`;
    routesList.innerHTML = routes.length
        ? routes.map((route) => routeCard(route, user, favoriteIds.has(String(route.id)))).join("")
        : '<p class="routes-message">Não existem rotas neste filtro.</p>';
}

export function renderRoutesError() {
    routesList.innerHTML = '<p class="routes-message">Não foi possível carregar as rotas.</p>';
}

export function setActiveRouteFilter(filter) {
    document.querySelectorAll("[data-route-filter]").forEach((button) => {
        button.classList.toggle("active", button.dataset.routeFilter === filter);
    });
}

function routeCard(route, user, isFavorite) {
    const completed = route.completedBy?.includes(String(user.id));
    const status = completed
        ? "completed"
        : route.status === "completed" ? "not_started" : route.status;
    const info = statusData[status] || statusData.not_started;
    const image = route.mainImage
        ? `<img src="${route.mainImage}" alt="" class="route-card-image">`
        : `<span class="route-icon">${info.icon}</span>`;
    const meta = [
        route.origin && route.destination ? `${route.origin} → ${route.destination}` : "",
        route.durationMinutes ? `${route.durationMinutes} minutos` : ""
    ].filter(Boolean).join(" · ");

    return `
        <article class="route-card">
            <div class="route-visual ${info.visual}">${image}</div>
            <div class="route-details">
                <h3>${escapeHtml(route.name)}</h3>
                <p>${escapeHtml(meta || route.description || "Percurso visual")}</p>
                <span class="status ${info.className}">${info.label}</span>
                <div class="route-actions">
                    <a href="explorar-rota.html?id=${encodeURIComponent(route.id)}" class="route-start-button">${info.button}</a>
                    <button type="button" class="favorite-button ${isFavorite ? "active" : ""}"
                        data-favorite-route-id="${escapeHtml(route.id)}"
                        aria-label="${isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
                        ${isFavorite ? "★" : "☆"}
                    </button>
                </div>
            </div>
            <a href="explorar-rota.html?id=${encodeURIComponent(route.id)}" class="chevron" aria-label="Explorar ${escapeHtml(route.name)}">›</a>
        </article>
    `;
}

function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
}
