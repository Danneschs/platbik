export class Item {
	constructor(id, name, quantity, priceInCrowns) {
		this.id = id; // For frontend, string -- uuidv4 (sometimes int xd)
		this.name = name;
		this.quantity = quantity;
		this.priceInCrowns = priceInCrowns;
	}
}
