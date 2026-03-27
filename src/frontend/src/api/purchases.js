import { URL } from "@api/url.js";
import { GetPurchaseDto } from "@objects/GetPurchaseDto.js";

export async function getAllPurchasesService(token) {
	const response = await fetch(`${URL}/purchase/all-purchases`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!response.ok) {
		throw new Error("Unable to fetch purchases, bad response from server");
	}
	const purchases = await response.json();
	return purchases;
}

export async function getMyPurchasesService(token) {
	const response = await fetch(`${URL}/purchase/my-purchases`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!response.ok) {
		throw new Error("Unable to fetch purchases, bad response from server");
	}
	const purchases = await response.json();
	return purchases.map(
		(p) =>
			new GetPurchaseDto(
				p.id,
				p.name,
				p.buyerName,
				p.coPayers,
				p.timestamp,
				p.shopName,
				p.priceInCents,
				p.buyerPays
			)
	);
}

export async function removePurchaseService(purchaseId, token) {
	const response = await fetch(`${URL}/purchase/${purchaseId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!response.ok) {
		throw new Error("Unable to remove purchase, bad response from server");
	}
	return response.ok ? null : await response.json();
}

export async function addPurchaseService(purchase, token) {
	const response = await fetch(`${URL}/purchase/add-purchase`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(purchase),
	});
	if (!response.ok) {
		throw new Error("Unable to add purchase, bad response from server");
	}

	const newPurchase = await response.json();

	return new GetPurchaseDto(
		newPurchase.id,
		newPurchase.name,
		newPurchase.buyerName,
		newPurchase.coPayers,
		newPurchase.timestamp,
		newPurchase.shopName,
		newPurchase.priceInCents,
		newPurchase.buyerPays
	);
}

export async function updatePurchaseService(purchase, token) {
	const response = await fetch(`${URL}/purchase/update`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(purchase),
	});
	if (!response.ok) {
		throw new Error("Unable to update purchase, bad response from server");
	}

	const newPurchase = await response.json();

	return new GetPurchaseDto(
		newPurchase.id,
		newPurchase.name,
		newPurchase.buyerName,
		newPurchase.coPayers,
		newPurchase.timestamp,
		newPurchase.shopName,
		newPurchase.priceInCents,
		newPurchase.buyerPays
	);
}
