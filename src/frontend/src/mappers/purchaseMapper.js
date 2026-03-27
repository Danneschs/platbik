import { PostPurchaseDto } from "@objects/PostPurchaseDto.js";
import { GetPurchaseDto } from "@objects/GetPurchaseDto.js";

export default class PurchaseMapper {
	static fromEditToPost(purchase, currentUserId, id = 0) {
		return new PostPurchaseDto(
			id, // ID will be assigned by the server
			purchase.name,
			currentUserId,
			purchase.coPayers.map((user) => user.id),
			purchase.timestamp,
			purchase.shopName,
			purchase.items, // here are items of type ItemDto, so id is type int and has value 0; prices are in cents
			purchase.buyerPays
		);
	}

	static fromEditToGet(purchase, currentUserId) {
		return new GetPurchaseDto(
			purchase.id,
			purchase.name,
			currentUserId,
			purchase.coPayers,
			purchase.timestamp,
			purchase.shopName,
			purchase.priceInCents,
			purchase.buyerPays
		);
	}
}
