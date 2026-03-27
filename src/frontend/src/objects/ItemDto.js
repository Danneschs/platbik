export class ItemDto {
	constructor(id, name, quantity, priceInCents) {
		this.id = id; // For backend, int
		this.name = name;
		this.quantity = quantity;
		this.priceInCents = priceInCents;
	}
}
