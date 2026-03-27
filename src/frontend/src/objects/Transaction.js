/**
 * Transaction class representing a financial transaction between users.
 * "User A owes User B X amount of money" -- purchase meaning
 * "User A pays User B X amount of money" -- settlement meaning
 */
export class Transaction {
    constructor(id, groupId, type, fromUserId, toUserId, amount, relatedPurchaseId, relatedSettlementId, timestamp, note) {
        this.id = id;
        this.groupId = groupId;
        this.type = type; // add_purchase, add_settlement, remove_purchase (meaning: reason, why user A owes user B)
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.amount = amount;
        this.relatedPurchaseId = relatedPurchaseId;
        this.relatedSettlementId = relatedSettlementId;
        this.timestamp = timestamp;
        this.note = note;
    }

    toString() {
        return `Transaction ID: ${this.id}, Date: ${this.date}, Items: ${this.items.length}, Payers: ${this.payers.length}, Settlement: ${this.settlement}`;
    }
}

/*
| Typ transakce     | fromUserId    | toUserId      | amount | Význam                                                                                     |
| ----------------- | ------------- | ------------- | ------ | ------------------------------------------------------------------------------------------ |
| `add_purchase`    | spoluplatitel | kupující      | částka | Někdo dluží kupujícímu za nákup                                                            |
| `remove_purchase` | spoluplatital | kupující      | částka | Smazání dluhu, že někdo dluží kupujícímu za nákup (kopíruje add_purchase, ale má jiný typ) |
| `add_settlement`  | plátce        | příjemce      | částka | Čistá platba mezi uživateli                                                                |
*/