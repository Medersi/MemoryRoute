export class Route {
    constructor({
        id = null,
        name,
        origin = "",
        destination = "",
        description = "",
        mainImage = "",
        durationMinutes = 0,
        difficulty = "fácil",
        ownerId = null,
        createdBy = null,
        userId = null,
        status = "saved",
        completedBy = []
    }) {
        Object.assign(this, {
            id, name, origin, destination, description, mainImage,
            durationMinutes, difficulty, ownerId, createdBy,
            userId, status, completedBy
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

    markCompletedBy(userId) {
        const normalizedId = String(userId);
        if (!this.completedBy.includes(normalizedId)) {
            this.completedBy.push(normalizedId);
        }
        return this;
    }

    toApiData() {
        const data = { ...this };
        if (data.id === null) delete data.id;
        return data;
    }
}
