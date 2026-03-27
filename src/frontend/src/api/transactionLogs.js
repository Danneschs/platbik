import { URL } from "@api/url.js";
import GetTransactionLogDto from "@objects/GetTransactionLogDto.js";
import PostTransactionLogDto from "@objects/PostTransactionLogDto.js";
import NotificationDto from "@objects/NotificationDto.js";
import CommitmentDto from "@objects/CommitmentDto";
import { v4 as uuidv4 } from "uuid";

export async function getTransactionLogsBetweenUsersService(token, userId1, userId2) {
	const response = await fetch(`${URL}/transactionlog/logs-between-users?userId1=${userId1}&userId2=${userId2}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch transaction logs");
	}

	const data = await response.json();

	return data.map(
		(item) =>
			new GetTransactionLogDto(
				item.id,
				item.date,
				item.type,
				item.fromName,
				item.toName,
				item.amount,
				item.description
			)
	);
}

export async function createPendingSettlementService(token, fromUserId, toUserId, amountInCents) {
	const body = new PostTransactionLogDto(fromUserId, toUserId, amountInCents);
	const response = await fetch(`${URL}/transactionlog/pending-settle`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error("Failed to create pending settlement");
	}

	return response.ok;
}

export async function settleService(token, fromUserId, toUserId, amountInCents) {
	const body = new PostTransactionLogDto(fromUserId, toUserId, amountInCents);

	const response = await fetch(`${URL}/transactionlog/settle`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error("Failed to settle transaction");
	}
	const newCommitments = await response.json();

	return newCommitments.map(
		(c) => new CommitmentDto(uuidv4(), c.fromUserId, c.toUserId, c.state, c.toName, c.totalInCents)
	);
}

export async function getAllNotificationsService(token) {
	const response = await fetch(`${URL}/transactionlog/my-notifications`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch notifications");
	}

	const data = await response.json();

	return data
		.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
		.map(
			(item) =>
				new NotificationDto(
					item.id,
					item.type,
					item.header,
					item.text,
					new Date(item.timestamp).toLocaleString("cs-CZ"),
					item.isRead,
					item.fromUserId,
					item.toUserId,
					item.amount
				)
		);
}

export async function markNotificationAsReadService(token, transactionId) {
	const response = await fetch(`${URL}/transactionlog/mark-as-read/${transactionId}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Unable to mark notification as read on server.");
	}
}
