export default class RegisterUserDto {
	constructor(name, surname, accountNumber, email, password) {
		this.name = name;
		this.surname = surname;
		this.accountNumber = accountNumber;
		this.email = email;
		this.password = password;
	}
}
