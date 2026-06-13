export class Route {
    constructor({
        id = null,
        name,
        description = "",
        distanceKm = 0,
        durationMinutes = 0,
        difficulty = "fácil",
        ownerId = null,
        status = "saved"
    }) {
        Object.assign(this, {
            id, name, description, distanceKm, durationMinutes,
            difficulty, ownerId, status
        });
    }

    calculateProgress(steps = []) {
        if (!steps.length) return 0;
        const completed = steps.filter((step) => step.completed).length;
        return Math.round((completed / steps.length) * 100);
    }

    markCompleted() {
        this.status = "completed";
        return this;
    }
}
