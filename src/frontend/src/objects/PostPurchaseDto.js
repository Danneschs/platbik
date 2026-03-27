export class PostPurchaseDto {
	constructor(id, name, buyerId, coPayerIds, timestamp, shopName, items, buyerPays) {
		this.id = id;
		this.name = name;
		this.buyerId = buyerId;
		this.timestamp = timestamp;
		this.shopName = shopName;
		this.items = items;
		this.coPayerIds = coPayerIds;
		this.buyerPays = buyerPays;
	}
}
