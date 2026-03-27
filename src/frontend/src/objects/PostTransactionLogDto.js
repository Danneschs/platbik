export default class PostTransactionLogDto {
    constructor(fromUserId, toUserId, amountInCents) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.amountInCents = amountInCents;
    }
}
