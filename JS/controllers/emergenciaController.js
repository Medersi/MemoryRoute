import { apiService } from "../services/apiService.js";
import { storageService } from "../services/storageService.js";

const form = document.getElementById("form-emergencia");
const currentName = document.getElementById("current-name");
const currentPhone = document.getElementById("current-phone");
const inputName = document.getElementById("input-emergencia-nome");
const inputPhone = document.getElementById("input-emergencia-fone");

initialize();

function initialize() {
    const user = storageService.getAuthenticatedUser();
    if (!user) return;

    renderContact(user.emergencyContact);
    form?.addEventListener("submit", handleSubmit);
}

async function handleSubmit(event) {
    event.preventDefault();

    const user = storageService.getAuthenticatedUser();
    if (!user) return;

    const emergencyContact = {
        name: inputName.value.trim(),
        phone: inputPhone.value.trim()
    };

    try {
        await apiService.updateUser(user.id, { emergencyContact });
        const updatedUser = { ...user, emergencyContact };
        storageService.saveAuthenticatedUser(updatedUser);
        renderContact(emergencyContact);
        alert("Contacto de emergencia atualizado!");
    } catch (error) {
        console.error(error);
        alert("Nao foi possivel guardar o contacto. Confirma se o JSON Server esta ativo.");
    }
}

function renderContact(contact) {
    if (!contact) return;

    if (currentName) currentName.textContent = contact.name;
    if (currentPhone) currentPhone.textContent = contact.phone;
    if (inputName) inputName.value = contact.name;
    if (inputPhone) inputPhone.value = contact.phone;
}
