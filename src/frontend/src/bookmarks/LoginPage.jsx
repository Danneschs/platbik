import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "@auth/AuthContext.js";
import { AuthFormPage, MessageDialog } from "@danneschs/libnik-ui";

import { LoginMessage } from "@objects/AuthStatus";

const DEFAULT_REDIRECT = "/vsechny-nakupy";

/**
 * Login page
 * @description uses libnik-ui's AuthFormPage component for the Login/Register page form
 */
function LoginPage() {
	const { login, register } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from ?? DEFAULT_REDIRECT;

	const [registrationStatus, setRegistrationStatus] = useState(null);
	const [registeringUserAlreadyExists, setRegisteringUserAlreadyExists] = useState(false);
	const [registrationSuccessful, setRegistrationSuccessful] = useState(false);

	const [notResponding, setNotResponding] = useState(false);
	const [notRespondingMessage, setNotRespondingMessage] = useState(null);

	const onLoginSuccess = () => {
		navigate(from, { replace: true });
	};

	async function handleLogin(email, password) {
		const loginStatus = await login(email, password);
		if (!loginStatus.isServerResponding) {
			// server is not responding
			setNotResponding(true);
			setNotRespondingMessage(loginStatus.message);
			return new LoginMessage(false, loginStatus.message);
		} else if (!loginStatus.success) {
			// server is responding, but something went wrong
			return new LoginMessage(false, loginStatus.message);
		} else {
			return new LoginMessage(true, loginStatus.message);
		}
	}

	async function handleRegister(name, surname, accountNumber, email, password) {
		const registrationStatus = await register(name, surname, accountNumber, email, password);

		setRegistrationStatus({ ...registrationStatus });

		if (!registrationStatus.isServerResponding) {
			// server is not responding
			setNotResponding(true);
			setNotRespondingMessage(registrationStatus.message);
		} else if (registrationStatus.alreadyExists) {
			// user already exists -- form + modal handle
			setRegisteringUserAlreadyExists(true);
		} else if (registrationStatus.success) {
			// successful registration -- modal handles
			setRegistrationSuccessful(true);
		}

		// either invalid data format -- form handles
		return registrationStatus;
	}

	return (
		<>
			<AuthFormPage handleLogin={handleLogin} handleRegister={handleRegister} onLoginSuccess={onLoginSuccess} />

			{notResponding && (
				<MessageDialog title="Chyba" message={notRespondingMessage} onClose={() => setNotResponding(false)} />
			)}

			{registeringUserAlreadyExists && (
				<MessageDialog
					title="Chyba"
					message={registrationStatus.message}
					onClose={() => setRegisteringUserAlreadyExists(false)}
				/>
			)}
			{registrationSuccessful && (
				<MessageDialog
					title="Úspěch"
					message={registrationStatus.message}
					onClose={() => setRegistrationSuccessful(false)}
				/>
			)}
		</>
	);
}
export default LoginPage;
