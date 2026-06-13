export class Achievement {
    constructor({
        id = null,
        name,
        description = "",
        coinReward = 0,
        unlockedBy = []
    }) {
        Object.assign(this, { id, name, description, coinReward, unlockedBy });
    }

    unlockFor(userId) {
        const normalizedId = String(userId);
        if (!this.unlockedBy.includes(normalizedId)) {
            this.unlockedBy.push(normalizedId);
        }
        return this;
    }

    isUnlockedBy(userId) {
        return this.unlockedBy.includes(String(userId));
    }
}
