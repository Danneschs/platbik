import { markRegistrationRequestAsRead } from "@api/pendingUsers";

export default class PendingRegisterRequestDto {
	constructor(id, name, surname, accountNumber, email, requestedAt, isRead) {
		this.id = id;
		this.name = name;
		this.surname = surname;
		this.accountNumber = accountNumber;
		this.email = email;
		this.requestedAt = requestedAt;
		this.isRead = isRead;
	}

	async markAsRead(token) {
		this.isRead = true;
		return await markRegistrationRequestAsRead(token, this.id);
	}
}
