import { useState, useEffect } from "react";
import { AuthContext } from "@auth/AuthContext";

import { loginService, getCurrentUserService, requestRegistrationService } from "@api/users";
import RegisterUserDto from "@objects/RegisterUserDto";

/**
 * AuthProvider component to provide authentication context for children components
 * @param {*} children
 * @returns currentUser, loading, login, logout, register
 */
function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const tokenFromStorage = localStorage.getItem("jwtToken");
		// No token in storage
		if (!tokenFromStorage) {
			setLoading(false);
			return;
		}

		const fetchUser = async () => {
			try {
				const { user: loggedUser } = await getCurrentUserService(tokenFromStorage);

				// Invalid token or user not found
				if (!loggedUser) {
					setLogoutState();
					setLoading(false);
					return;
				}
				setCurrentUser(loggedUser);
			} catch (err) {
				console.error("Failed to fetch user while loading the web:", err);
				setLogoutState();
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	const login = async (email, password) => {
		try {
			const credentials = await loginService(email, password);
			const { token, user } = credentials || {};

			// Invalid credentials or user not found
			if (!credentials || !token || !user) {
				//console.error("Invalid login response:", { token, user });
				setLogoutState();
				return false;
			}
			setLoggedInState(token, user);
			return true;
		} catch (err) {
			console.error("Login failed:", err);
			setLogoutState();
			return false;
		}
	};

	const setLoggedInState = (token, user) => {
		localStorage.setItem("jwtToken", token);
		setCurrentUser(user);
	};

	const setLogoutState = () => {
		localStorage.removeItem("jwtToken");
		setCurrentUser(null);
	};

	const logout = () => {
		setLogoutState();
	};

	const register = async (name, surname, accountNumber, email, password) => {
		const newUserDto = new RegisterUserDto(name, surname, accountNumber, email, password);
		let registerServiceResponse = null;
		try {
			registerServiceResponse = await requestRegistrationService(newUserDto);
			if (registerServiceResponse.success) {
				// Optionally, you can auto-login after registration
				//const loginSuccess = await login(email, password);
				return { success: true }; // Request for registration was successful
			}
		} catch (err) {
			console.error("Registration failed:", err);
		}
		return registerServiceResponse;
	};

	return (
		<AuthContext.Provider
			value={{
				currentUser,
				loading,
				login,
				logout,
				register,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
