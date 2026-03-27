import { useContext, useState } from "react";

import { AuthContext } from "@auth/AuthContext.js";
import { LoginForm, RegisterForm, LogoutForm } from "@danneschs/libnik-ui";

/**
 * Auth component for handling user authentication
 * @param {*} onFail - Callback function for failed authentication
 * @param {*} onSuccess - Callback function for successful authentication
 * @param {*} onClose - Callback function for closing the authentication dialog
 * @returns
 */
function Auth({ onFail, onSuccess, onClose }) {
	const [showRegister, setShowRegister] = useState(false);
	const { currentUser, login, logout, register } = useContext(AuthContext);

	const handleLogin = async (email, password) => {
		const success = await login(email, password);
		if (success) {
			onClose();
			return true;
		}
		return false;
	};

	const handleLogout = () => {
		logout();
		onClose();
	};

	if (showRegister) {
		return <RegisterForm onFail={onFail} onSuccess={onSuccess} onClose={onClose} handleRegister={register} />;
	}

	if (currentUser) {
		return <LogoutForm onClose={onClose} handleLogout={handleLogout} />;
	}

	return <LoginForm onClose={onClose} handleLogin={handleLogin} setShowRegister={setShowRegister} />;
}

export default Auth;
