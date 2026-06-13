export class RouteStep {
    constructor({
        id = null,
        routeId,
        order,
        title = "",
        instruction,
        image = "logo.png",
        actionType = "landmark",
        landmark = "",
        completed = false
    }) {
        Object.assign(this, {
            id, routeId, order, title, instruction, image,
            actionType, landmark, completed
        });
    }

    markCompleted() {
        this.completed = true;
        return this;
    }

    reset() {
        this.completed = false;
        return this;
    }

    toApiData() {
        const data = { ...this };
        if (data.id === null) delete data.id;
        return data;
    }
}
