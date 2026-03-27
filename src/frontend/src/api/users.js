import { URL } from "@api/url.js";

export async function loginService(email, password) {
	// Try to login the user
	const response = await fetch(`${URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		return null; // Invalid credentials or user not found
	}

	const data = await response.json();
	const token = data.token;
	// Get user information after successful login
	return getCurrentUserService(token);
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

	if (!response.ok) {
		const errorData = await response.json();
		return { success: false, errors: errorData }; // Registration failed
	}

	return { success: true }; // Registration successful
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
