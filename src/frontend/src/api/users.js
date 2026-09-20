import { URL } from "@api/url.js";
import { LoginStatus, RegistrationStatus } from "@objects/AuthStatus.js";

export async function loginService(email, password) {
	// Try to login the user
	const response = await fetch(`${URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	const loginStatus = new LoginStatus();

	// server is not responding
	if (response.status >= 500) {
		loginStatus.setNotResponding();
		return loginStatus;
	} else if (response.status === 400 || response.status === 401) {
		//400 - invalid format
		//401 - invalid credentials
		loginStatus.setInvalidCredentials();
		return loginStatus;
	}

	// checking the user info, if exists
	const data = await response.json();
	const token = data.token;
	const me = await getCurrentUserService(token); // Get user information after successful login

	if (me === null) {
		loginStatus.setInvalidCredentials();
	} else {
		loginStatus.addUser(me.token, me.user);
	}

	return loginStatus;
}

export async function getCurrentUserService(token) {
	const userResponse = await fetch(`${URL}/user/me`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	// Not logged in
	if (userResponse.status === 401) return null;

	if (!userResponse.ok) {
		throw new Error("Unable to fetch user, bad response from server");
	}

	const user = await userResponse.json();

	return { token, user };
}

export async function registerFromRequestService(token, id) {
	const response = await fetch(`${URL}/user/register-${id}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!response.ok) {
		throw new Error("Unable to register user from request");
	}

	return await response.json();
}

export async function requestRegistrationService(newUserDto) {
	const response = await fetch(`${URL}/user/request-registration`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(newUserDto),
	});

	const registrationStatus = new RegistrationStatus();

	// server is not responding
	if (response.status >= 500) {
		registrationStatus.setNotResponding();
		return registrationStatus;
	} else if (response.status === 400) {
		//400 - invalid format
		const errors = response.json();
		registrationStatus.setErrors(errors);
	} else if (response.status === 409) {
		//409 - user or registration request with this email already exists
		registrationStatus.setAlreadyExists();
	} else if (response.ok) {
		registrationStatus.setOk(); // Registration request successful
	}

	return registrationStatus;
}

export async function getAllUsersService(token) {
	const response = await fetch(`${URL}/user/all`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!response.ok) {
		throw new Error("Unable to fetch users, bad response from server");
	}
	const users = await response.json();
	return users;
}

export async function getUserByIdService(token, userId) {
	const response = await fetch(`${URL}/user/${userId}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!response.ok) {
		throw new Error("Unable to fetch user, bad response from server");
	}
	const user = await response.json();
	return user;
}
