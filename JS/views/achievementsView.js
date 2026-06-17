export function renderAchievements(data, newlyUnlocked = []) {
    setText("[data-progress-coins]", data.user.coins);
    setText("[data-progress-level]", data.level);
    setText("[data-progress-completed]", data.completedRoutes.length);
    setText("[data-progress-created]", data.routesCreated.length);
    setText("[data-unlocked-count]", data.unlockedAchievements.length);
    setText("[data-locked-count]", data.lockedAchievements.length);

    const levelFill = document.querySelector("[data-level-fill]");
    if (levelFill) levelFill.style.width = `${levelProgress(data.user.coins, data.level)}%`;

    const message = document.querySelector("[data-achievement-message]");
    if (message) {
        message.textContent = newlyUnlocked.length
            ? `Nova conquista: ${newlyUnlocked.map((item) => `${item.name} (+${getAchievementReward(item)} moedas)`).join(", ")}`
            : "";
    }

    renderUnlocked(data.unlockedAchievements);
    renderLocked(data.lockedAchievements, data);
}

export function renderAchievementsError() {
    setText("[data-achievement-message]", "Nao foi possivel carregar o teu progresso.");
}

function renderUnlocked(achievements) {
    const container = document.querySelector("#unlocked-achievements");
    container.innerHTML = achievements.length
        ? achievements.map((achievement, index) => `
            <article class="achievement-card">
                <div class="achievement-icon ${colors[index % colors.length]}">★</div>
                <h3>${escapeHtml(achievement.name)}</h3>
                <p>${escapeHtml(achievement.description)}</p>
                <span class="coin-reward">+${getAchievementReward(achievement)} moedas</span>
            </article>
        `).join("")
        : '<p class="progress-message">Ainda nao desbloqueaste conquistas.</p>';
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
                        <span class="coin-reward">+${getAchievementReward(achievement)} moedas</span>
                        <div class="goal-progress"><div style="width:${percentage}%"></div></div>
                    </div>
                    <strong>${current}/${target}</strong>
                </article>
            `;
        }).join("")
        : '<p class="progress-message">Desbloqueaste todas as conquistas disponiveis.</p>';
}

function criteriaValue(criteria, data) {
    return {
        completed_routes: data.completedRoutes.length,
        created_routes: data.routesCreated.length,
        coins: data.user.coins
    }[criteria?.type] ?? 0;
}

function levelProgress(coins, level) {
    const normalizedCoins = Math.max(0, Number(coins) || 0);
    const normalizedLevel = Math.min(5, Math.max(1, Number(level) || 1));
    const bands = {
        1: [0, 50],
        2: [50, 100],
        3: [100, 200],
        4: [200, 350],
        5: [350, 350]
    };
    const [start, end] = bands[normalizedLevel];

    if (normalizedLevel === 5) return 100;
    if (normalizedCoins <= start) return 0;
    if (normalizedCoins >= end) return 100;

    return Math.round(((normalizedCoins - start) / (end - start)) * 100);
}

function getAchievementReward(achievement) {
    if (Number.isFinite(Number(achievement.coinReward))) {
        return Number(achievement.coinReward);
    }

    const rewards = {
        "achievement-first-route": 20,
        "achievement-neighborhood-explorer": 50,
        "achievement-path-creator": 15,
        "achievement-active-tutor": 30,
        "achievement-100-coins": 20,
        "achievement-200-coins": 40
    };

    return rewards[achievement.id] ?? 10;
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
