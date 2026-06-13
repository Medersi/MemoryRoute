export function renderAchievements(data, newlyUnlocked = []) {
    setText("[data-progress-coins]", data.user.coins);
    setText("[data-progress-level]", data.level);
    setText("[data-progress-completed]", data.completedRoutes.length);
    setText("[data-progress-created]", data.routesCreated.length);
    setText("[data-progress-distance]", `${data.totalKilometers.toFixed(1)} km`);
    setText("[data-unlocked-count]", data.unlockedAchievements.length);
    setText("[data-locked-count]", data.lockedAchievements.length);

    const levelFill = document.querySelector("[data-level-fill]");
    if (levelFill) levelFill.style.width = `${levelProgress(data.user.coins)}%`;

    const message = document.querySelector("[data-achievement-message]");
    if (message) {
        message.textContent = newlyUnlocked.length
            ? `Nova conquista: ${newlyUnlocked.map((item) => item.name).join(", ")}`
            : "";
    }

    renderUnlocked(data.unlockedAchievements);
    renderLocked(data.lockedAchievements, data);
}

export function renderAchievementsError() {
    setText("[data-achievement-message]", "Não foi possível carregar o teu progresso.");
}

function renderUnlocked(achievements) {
    const container = document.querySelector("#unlocked-achievements");
    container.innerHTML = achievements.length
        ? achievements.map((achievement, index) => `
            <article class="achievement-card">
                <div class="achievement-icon ${colors[index % colors.length]}">★</div>
                <h3>${escapeHtml(achievement.name)}</h3>
                <p>${escapeHtml(achievement.description)}</p>
            </article>
        `).join("")
        : '<p class="progress-message">Ainda não desbloqueaste conquistas.</p>';
}

function renderLocked(achievements, data) {
    const container = document.querySelector("#locked-achievements");
    container.innerHTML = achievements.length
        ? achievements.map((achievement) => {
            const current = criteriaValue(achievement.criteria, data);
            const target = Number(achievement.criteria?.target) || 1;
            const percentage = Math.min(100, Math.round((current / target) * 100));
            return `
                <article class="locked-card">
                    <div class="locked-icon">?</div>
                    <div>
                        <h3>${escapeHtml(achievement.name)}</h3>
                        <p>${escapeHtml(achievement.description)}</p>
                        <div class="goal-progress"><div style="width:${percentage}%"></div></div>
                    </div>
                    <strong>${current}/${target}</strong>
                </article>
            `;
        }).join("")
        : '<p class="progress-message">Desbloqueaste todas as conquistas disponíveis.</p>';
}

function criteriaValue(criteria, data) {
    return {
        completed_routes: data.completedRoutes.length,
        created_routes: data.routesCreated.length,
        coins: data.user.coins
    }[criteria?.type] ?? 0;
}

function levelProgress(coins) {
    const bands = [[0, 50], [50, 100], [100, 200], [200, 350], [350, 350]];
    const level = coins >= 350 ? 5 : coins >= 200 ? 4 : coins >= 100 ? 3 : coins >= 50 ? 2 : 1;
    const [start, end] = bands[level - 1];
    return level === 5 ? 100 : Math.round(((coins - start) / (end - start)) * 100);
}

function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

function escapeHtml(value = "") {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
}

const colors = ["green", "blue", "orange", "purple"];
