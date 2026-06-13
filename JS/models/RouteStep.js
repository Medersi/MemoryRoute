export class RouteStep {
    constructor({
        id = null,
        routeId,
        order,
        instruction,
        landmark = "",
        completed = false
    }) {
        Object.assign(this, { id, routeId, order, instruction, landmark, completed });
    }

    markCompleted() {
        this.completed = true;
        return this;
    }

    reset() {
        this.completed = false;
        return this;
    }
}
