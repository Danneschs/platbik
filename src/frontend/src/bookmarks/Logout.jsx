import { useContext } from "react";

import { AuthContext } from "@auth/AuthContext.js";
import { LogoutFormDialog } from "@danneschs/libnik-ui";

/**
 * Auth component for handling logout confirmation
 * @param {*} onClose - Callback function for closing the logout confirmation dialog
 * @returns
 */
function Auth({ onClose }) {
	const { logout } = useContext(AuthContext);

	const handleLogout = () => {
		logout();
		onClose();
	};

	return <LogoutFormDialog onClose={onClose} handleLogout={handleLogout} />;
}

export default Auth;
