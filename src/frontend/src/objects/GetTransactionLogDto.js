export default class GetTransactionLogDto {
    constructor(id, date, type, fromName, toName, amountInCents, description) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.fromName = fromName;
        this.toName = toName;
        this.amount = amountInCents / 100;
        this.description = description;
    }
}
