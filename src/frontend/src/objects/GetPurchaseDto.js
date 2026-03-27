export class GetPurchaseDto {
	constructor(id, name, buyerName, coPayers, timestamp, shopName, priceInCents, buyerPays) {
		this.id = id;
		this.name = name;
		this.buyerName = buyerName;
		this.coPayers = coPayers || [];
		this.timestamp = timestamp;
		this.shopName = shopName;
		this.priceInCents = priceInCents;
		this.buyerPays = buyerPays;
	}
}
