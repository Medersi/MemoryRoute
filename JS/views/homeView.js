const routesList = document.querySelector("[data-home-routes-list]");

export function renderHomeSummary(user, summary) {
    const firstName = getFirstName(user.name);
    setText("[data-home-greeting]", `Olá, ${firstName}`);
    setAvatar("[data-home-avatar]", user, firstName[0]?.toUpperCase() || "A");
    setText("[data-home-coins]", user.coins ?? 0);
    setText("[data-home-level]", user.level ?? 1);
    setText("[data-home-created-routes]", summary.createdRoutesCount ?? 0);
    setText("[data-home-completed-routes]", summary.completedRoutesCount ?? 0);
}

export function renderRecentRoutes(routes, stepsByRouteId = new Map()) {
    if (!routesList) return;

    routesList.innerHTML = routes.length
        ? routes.map((route) => routeCard(route, stepsByRouteId.get(String(route.id)) ?? [])).join("")
        : emptyRoutesState();
}

export function renderHomeError() {
    if (!routesList) return;
    routesList.innerHTML = `
        <div class="empty-routes-card">
            <h3>Não foi possível carregar as rotas.</h3>
            <p>Confirma se o JSON Server está ativo e tenta novamente.</p>
        </div>
    `;
}

function routeCard(route, steps) {
    const routeName = route.name || "Rota sem nome";
    const routeMeta = route.origin && route.destination
        ? `${route.origin} → ${route.destination}`
        : route.description || "Percurso visual";
    const stepCount = steps.length;

    return `
        <article class="home-route-card">
            <div>
                <h3>${escapeHtml(routeName)}</h3>
                <p>${escapeHtml(routeMeta)}</p>
                <span>${stepCount} ${stepCount === 1 ? "passo" : "passos"}</span>
            </div>
            <a href="explorar-rota.html?id=${encodeURIComponent(route.id)}">Abrir</a>
        </article>
    `;
}

function emptyRoutesState() {
    return `
        <div class="empty-routes-card">
            <h3>Ainda não tens rotas.</h3>
            <p>Cria o primeiro caminho visual para começares a usar o MemoryRoute.</p>
            <a href="criar-rota.html">Criar rota</a>
        </div>
    `;
}

function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

function setAvatar(selector, user, fallback) {
    const element = document.querySelector(selector);
    if (!element) return;

    if (user.profilePhoto) {
        element.textContent = "";
        element.style.backgroundImage = `url("${user.profilePhoto}")`;
        element.classList.add("has-image");
        return;
    }

    element.style.backgroundImage = "";
    element.textContent = fallback;
    element.classList.remove("has-image");
}

function getFirstName(name = "") {
    return name.trim().split(" ")[0] || "Amigo";
}

function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = value ?? "";
    return element.innerHTML;
}
