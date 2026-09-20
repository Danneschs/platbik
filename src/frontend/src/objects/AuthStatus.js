export class LoginStatus {
	constructor() {
		this.success = false;
		this.isServerResponding = false;
		this.message = LoginStatus.getUnexpectedMessage();
		this.token = null;
		this.user = null;
	}

	setNotResponding() {
		this.success = false;
		this.isServerResponding = false;
		this.message = "Server neodpovídá. Zkuste to prosím později.";
	}

	setInvalidCredentials() {
		this.success = false;
		this.isServerResponding = true;
		this.message = "Neplatné přihlašovací údaje.";
	}

	addUser(token, user) {
		this.success = true;
		this.isServerResponding = true;
		this.message = "Přihlášení bylo úspěšné.";
		this.token = token;
		this.user = user;
	}

	static getUnexpectedMessage() {
		return "Nastala neočekávaná chyba. Zkuste to znovu později.";
	}
}

export class LoginMessage {
	constructor(loggedIn, message) {
		this.loggedIn = loggedIn;
		this.message = message;
	}
}

export class RegistrationStatus {
	constructor() {
		this.success = false;
		this.isServerResponding = false;
		this.message = "Nastala neočekávaná chyba. Zkuste to znovu později.";
		this.alreadyExists = false;
		this.errors = null;
	}

	setNotResponding() {
		this.success = false;
		this.isServerResponding = false;
		this.alreadyExists = false;
		this.message = "Server neodpovídá. Zkuste to prosím později.";
	}

	setErrors(errors) {
		this.success = false;
		this.alreadyExists = false;
		this.isServerResponding = true;
		this.errors = errors;
	}

	setAlreadyExists() {
		this.success = false;
		this.isServerResponding = true;
		this.alreadyExists = true;
		this.message = "Uživatel s tímto emailem již existuje.";
	}

	setOk() {
		this.success = true;
		this.isServerResponding = true;
		this.alreadyExists = false;
		this.message = "Požadavek na registraci byl odeslán. Nyní se čeká na schválení administrátorem.";
	}
}
