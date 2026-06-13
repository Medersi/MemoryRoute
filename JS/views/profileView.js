function initials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export function renderProfile(user) {
    document.querySelector("[data-profile-name]").textContent = user.name;
    document.querySelector("[data-profile-email]").textContent = user.email;
    document.querySelector("[data-profile-coins]").textContent = user.coins;
    document.querySelector("[data-profile-level]").textContent = user.level;
    document.querySelector("[data-profile-avatar]").textContent = initials(user.name);

    const contact = user.emergencyContact;
    document.querySelector("[data-profile-emergency]").textContent = contact
        ? `${contact.name} · ${contact.phone}`
        : "Nenhum contacto definido";
}
