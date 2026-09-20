import { useState, useEffect } from "react";
import { AuthContext } from "@auth/AuthContext";

import { loginService, getCurrentUserService, requestRegistrationService } from "@api/users";
import RegisterUserDto from "@objects/RegisterUserDto";
import { LoginStatus, RegistrationStatus, LoginMessage } from "@objects/AuthStatus";

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
				const loggedUser = await getCurrentUserService(tokenFromStorage);

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
			const loginStatus = await loginService(email, password);

			if (!loginStatus.success) {
				setLogoutState();
				return loginStatus;
			} else {
				setLoggedInState(loginStatus.token, loginStatus.user);
				return loginStatus;
			}
		} catch (err) {
			setLogoutState();
			console.error("Login failed:", err);
			return new LoginMessage(false, LoginStatus.getUnexpectedMessage());
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
		try {
			return await requestRegistrationService(newUserDto);
		} catch (err) {
			console.error("Registration failed:", err);
			return new RegistrationStatus(); // unexpected error
		}
	};

	return (
		<AuthContext.Provider
			value={{
				currentUser,
				loading,
				login,
				logout,
				register,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
