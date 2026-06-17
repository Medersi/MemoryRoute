import { apiService } from "../services/apiService.js";
import { storageService } from "../services/storageService.js";

const form = document.getElementById("form-dados-pessoais");
const inputName = document.getElementById("input-name");
const inputEmail = document.getElementById("input-email");
const inputPhoto = document.getElementById("input-profile-photo");
const photoPreview = document.querySelector("[data-photo-preview]");

let user = storageService.getAuthenticatedUser();
let selectedPhoto = user?.profilePhoto ?? null;

initialize();

function initialize() {
    if (!user) {
        console.warn("Nenhum utilizador autenticado encontrado.");
        return;
    }

    if (inputName) inputName.value = user.name || user.username || "";
    if (inputEmail) inputEmail.value = user.email || "";
    renderPhotoPreview(selectedPhoto, user.name);

    inputPhoto?.addEventListener("change", handlePhotoChange);
    form?.addEventListener("submit", handleSubmit);
}

async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Escolhe um ficheiro de imagem.");
        inputPhoto.value = "";
        return;
    }

    try {
        selectedPhoto = await resizeImage(file);
        renderPhotoPreview(selectedPhoto, inputName?.value || user.name);
    } catch (error) {
        console.error(error);
        alert("Não foi possível preparar a foto.");
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!user) return;

    const updatedUser = {
        ...user,
        name: inputName.value.trim(),
        email: inputEmail.value.trim().toLowerCase(),
        profilePhoto: selectedPhoto
    };

    if (!updatedUser.name || !updatedUser.email) {
        alert("Preenche o nome e o email.");
        return;
    }

    try {
        const savedUser = await apiService.updateUser(user.id, {
            name: updatedUser.name,
            email: updatedUser.email,
            profilePhoto: updatedUser.profilePhoto
        });

        user = toSessionUser({ ...updatedUser, ...savedUser });
        storageService.saveAuthenticatedUser(user);
        alert("Alterações guardadas com sucesso!");
        window.location.href = "perfil.html";
    } catch (error) {
        console.error(error);
        alert("Não foi possível guardar as alterações. Confirma se o JSON Server está ativo.");
    }
}

function renderPhotoPreview(photo, name = "") {
    if (!photoPreview) return;

    if (photo) {
        photoPreview.innerHTML = `<img src="${photo}" alt="Pré-visualização da foto de perfil">`;
        photoPreview.classList.add("has-image");
        return;
    }

    photoPreview.textContent = initials(name);
    photoPreview.classList.remove("has-image");
}

function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const canvas = document.createElement("canvas");
                const size = 320;
                const scale = Math.max(size / image.width, size / image.height);
                const width = image.width * scale;
                const height = image.height * scale;
                const x = (size - width) / 2;
                const y = (size - height) / 2;
                const context = canvas.getContext("2d");

                canvas.width = size;
                canvas.height = size;
                context.drawImage(image, x, y, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.82));
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function initials(name = "") {
    const letters = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return letters || "A";
}

function toSessionUser(userData) {
    const { password, ...safeUser } = userData;
    return safeUser;
}
