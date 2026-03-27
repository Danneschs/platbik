export default class CommitmentDto {
	constructor(id, fromUserId, toUserId, state, toName, totalInCents) {
		this.id = id;
		this.fromUserId = fromUserId;
		this.toUserId = toUserId;
		this.state = state;
		this.toName = toName;
		this.amount = totalInCents;
	}
}
