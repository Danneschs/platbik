export class Settlement {
    constructor(id, fromUserId, toUserId, amount, date) {
        this.id = id;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.amount = amount;
        this.date = date;
    }

    toString() {
        return `Settlement: from ${this.fromUserId} to ${this.toUserId}, amount: ${this.amount}, date: ${this.date}`;
    }
}
