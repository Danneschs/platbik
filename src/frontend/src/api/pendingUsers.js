import { URL } from "@api/url.js";
import PendingRegisterRequestDto from "@objects/PendingRegisterRequestDto";

export async function markRegistrationRequestAsRead(token, id) {
	const response = await fetch(`${URL}/pendinguser/mark-as-read/${id}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error("Unable to fetch pending users, bad response from server");
	}
}

export async function getAllRegistrationRequestsService(token) {
	const response = await fetch(`${URL}/pendinguser/all`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error("Unable to fetch registration requests, bad response from server");
	}

	const data = await response.json();
	return data
		.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
		.map(
			(item) =>
				new PendingRegisterRequestDto(
					item.id,
					item.name,
					item.surname,
					item.accountNumber,
					item.email,
					new Date(item.requestedAt).toLocaleString("cs-CZ"),
					item.isRead
				)
		);
}
