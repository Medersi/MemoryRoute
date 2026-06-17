function initials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export function renderProfile(user, progress = null) {
    setText("[data-profile-name]", user.name);
    setText("[data-profile-email]", user.email);
    setText("[data-profile-coins]", user.coins);
    setText("[data-profile-level]", progress?.level ?? user.level);
    setProfileAvatar("[data-profile-avatar]", user);
    setText("[data-profile-completed]", progress?.completedRoutes.length ?? 0);
    setText("[data-profile-created]", progress?.routesCreated.length ?? 0);
    setText("[data-profile-achievements]", progress?.unlockedAchievements.length ?? 0);
    setText("[data-profile-favorites]", progress?.favorites.length ?? 0);

    const contact = user.emergencyContact;
    setText("[data-profile-emergency]", contact
        ? `${contact.name} · ${contact.phone}`
        : "Nenhum contacto definido");
}

function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

function setProfileAvatar(selector, user) {
    const element = document.querySelector(selector);
    if (!element) return;

    if (user.profilePhoto) {
        element.innerHTML = `<img src="${user.profilePhoto}" alt="Foto de perfil">`;
        element.classList.add("has-image");
        return;
    }

    element.textContent = initials(user.name);
    element.classList.remove("has-image");
}
