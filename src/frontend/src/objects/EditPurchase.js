export class EditPurchase {
	constructor(id, name, coPayers, timestamp, shopName, priceInCrowns, items, buyerPays) {
		this.id = id;
		this.name = name;
		this.coPayers = coPayers;
		this.timestamp = timestamp;
		this.shopName = shopName;
		this.priceInCents = Math.floor(priceInCrowns * 100); // Convert crowns to cents;
		this.items = items;
		this.buyerPays = buyerPays;
	}
}
