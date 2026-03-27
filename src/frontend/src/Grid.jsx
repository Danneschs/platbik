import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "@auth/AuthContext";

import Auth from "@bookmarks/Auth.jsx";
import { GenericGrid } from "@danneschs/libnik-ui";
import FullPageSpinner from "@auth/FullPageSpinner";
import NotificationsDialog from "@dialogs/NotificationsDialog.jsx";
import RegistrationRequestsDialog from "@dialogs/RegistrationRequestsDialog.jsx";
import { getAllNotificationsService } from "@api/transactionLogs";
import { getAllRegistrationRequestsService } from "@api/pendingUsers";
import { registerFromRequestService } from "@api/users";
import { getCurrencyFormatService } from "@api/configs";
import { ToastBar, ConfirmationDialog, MessageDialog } from "@danneschs/libnik-ui";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

/** Nav-link definitions for this app. */
const APP_NAV_LINKS = [
{ label: "Všechny nákupy", to: "/vsechny-nakupy", key: "vsechny-nakupy" },
{ label: "Moje nákupy", to: "/moje-nakupy", key: "moje-nakupy" },
{ label: "Závazkové vztahy", to: "/zavazkove-vztahy", key: "zavazkove-vztahy" },
];

/**
 * Grid component
 * @description App-specific grid wrapper. Owns all state and side-effects;
 *              delegates rendering to GenericGrid.
 * @param {string}    title    Page title displayed in the header.
 * @param {ReactNode} children Main page content.
 */
function Grid({ title, children }) {
const [showAuth, setShowAuth] = useState(false);
const [showLogout, setShowLogout] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
const [myNotifications, setMyNotifications] = useState([]);
const location = useLocation();
const [activeLink, setActiveLink] = useState("");
const [showSuccessRegistrationRequest, setShowSuccessRegistrationRequest] = useState(false);
const [showFailedRegistrationRequest, setShowFailedRegistrationRequest] = useState(false);
const [showRegistrationRequests, setShowRegistrationRequests] = useState(false);
const [allRegistrationRequests, setAllRegistrationRequests] = useState([]);
const [showConfirmRegister, setShowConfirmRegister] = useState(false);
const [clickedRegisterRequestId, setClickedRegisterRequestId] = useState(0);
const [toastBarSettings, setToastBarSettings] = useState(null);

const { currentUser, loading } = useContext(AuthContext);

const navigate = useNavigate();

const amIAdmin = currentUser?.roleCode === "admin";

// Update activeLink when route changes
useEffect(() => {
if (loading) return;
getCurrencyFormatService();

setActiveLink(location.pathname.substring(1));

const fetchNotifications = async () => {
const notifications = await getAllNotificationsService(localStorage.getItem("jwtToken"));
setMyNotifications(notifications || []);
};

const fetchAllRegistrationRequests = async () => {
const requests = await getAllRegistrationRequestsService(localStorage.getItem("jwtToken"));
setAllRegistrationRequests(requests || []);
};

if (!currentUser) {
setShowAuth(true);
} else {
fetchNotifications();
if (currentUser.roleCode === "admin") {
fetchAllRegistrationRequests();
}
}
}, [location.pathname, currentUser, loading]);

const handleOnSuccessRegistrationRequest = () => {
setShowAuth(false);
setShowSuccessRegistrationRequest(true);
};

const handleOnFailedRegistrationRequest = () => {
setShowAuth(false);
setShowFailedRegistrationRequest(true);
};

const handleClick = (link) => {
setActiveLink(link);
handleCloseNotifications(false);
};

const handleRegisterFromRequest = async (id) => {
setShowConfirmRegister(true);
setClickedRegisterRequestId(id);
};

const setSuccessToastBar = (message) => {
setToastBarSettings({
message: message,
type: "success",
onClose: () => setToastBarSettings(null),
});
};

const setErrorToastBar = (message) => {
setToastBarSettings({
message: message,
type: "error",
onClose: () => setToastBarSettings(null),
});
};

const registerFromRequest = async (id) => {
const token = localStorage.getItem("jwtToken");
try {
const result = await registerFromRequestService(token, id);
if (result) {
setSuccessToastBar("Uživatel úspěšně zaregistrován.");
setAllRegistrationRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
}
} catch (error) {
setErrorToastBar("Registrace uživatele se nezdařila.");
console.error("Failed to register from request:", error);
}
};

const handleSetShowLoginWithActiveLink = (link) => {
setShowAuth(true);
setActiveLink(link);
};

const handleShowNotifications = async () => {
setShowNotifications(true);
};

const handleCloseNotifications = async (shouldMarkAsRead = true) => {
const token = localStorage.getItem("jwtToken");
if (shouldMarkAsRead) {
try {
await Promise.all(myNotifications.map((element) => element.markAsRead(token)));
} catch (error) {
//setErrorToastBar("Nepodařilo se označit notifikace jako přečtené.");
console.error("Failed to mark notifications as read:", error);
}
}
setShowNotifications(false);
};

const getUnreadNotificationsCount = () => {
return myNotifications.filter((notification) => !notification.isRead).length;
};

const getUnreadRegisterRequestsCount = () => {
if (amIAdmin) {
return allRegistrationRequests.filter((request) => !request.isRead).length;
}
return 0;
};

const handleCloseRegistrationRequests = async () => {
const token = localStorage.getItem("jwtToken");
try {
await Promise.all(allRegistrationRequests.map((element) => element.markAsRead(token)));
} catch (error) {
//setErrorToastBar("Nepodařilo se označit žádosti o registraci jako přečtené.");
console.error("Failed to mark registration requests as read:", error);
}
setShowRegistrationRequests(false);
};

// Build nav links: onClick is auth-aware — logged-in users navigate normally,
// guests are shown the login dialog first.
const navLinks = APP_NAV_LINKS.map((link) => ({
...link,
isActive: activeLink === link.key,
onClick: currentUser
? () => handleClick(link.key)
: () => handleSetShowLoginWithActiveLink(link.key),
}));

const dialogs = (
<>
{showNotifications && currentUser && (
<NotificationsDialog
onClose={handleCloseNotifications}
notifications={myNotifications}
handleNavigateToCommitments={() => {
handleClick("zavazkove-vztahy");
navigate("/zavazkove-vztahy");
}}
/>
)}
{showAuth && !currentUser && (
<Auth
onFail={handleOnFailedRegistrationRequest}
onSuccess={handleOnSuccessRegistrationRequest}
onClose={() => setShowAuth(false)}
/>
)}
{showLogout && currentUser && <Auth onClose={() => setShowLogout(false)} />}
{showSuccessRegistrationRequest && (
<MessageDialog
title="Úspěch"
message="Požadavek na registraci byl odeslán. Nyní se čeká na schválení administrátorem."
onClose={() => setShowSuccessRegistrationRequest(false)}
/>
)}
{showFailedRegistrationRequest && (
<MessageDialog
title="Neočekávaná chyba"
message="Požadavek na registraci se nezdařil. Zkuste to prosím znovu."
onClose={() => setShowFailedRegistrationRequest(false)}
/>
)}
{showRegistrationRequests && currentUser && amIAdmin && (
<RegistrationRequestsDialog
onClose={handleCloseRegistrationRequests}
registrationRequests={allRegistrationRequests}
handleRegisterFromRequest={handleRegisterFromRequest}
/>
)}
{showConfirmRegister && (
<ConfirmationDialog
title="Potvrzení registrace"
content="Opravdu chcete zaregistrovat tohoto uživatele?"
onConfirm={() => {
registerFromRequest(clickedRegisterRequestId);
setShowConfirmRegister(false);
}}
onCancel={() => setShowConfirmRegister(false)}
/>
)}
{toastBarSettings && <ToastBar {...toastBarSettings} />}
</>
);

return (
<GenericGrid
logo="PLATBÍK"
title={title}
navLinks={navLinks}
userDisplayName={currentUser ? `${currentUser.name} ${currentUser.surname}` : null}
onLoginClick={() => setShowAuth(true)}
onLogoutClick={() => setShowLogout(true)}
notificationCount={getUnreadNotificationsCount()}
onNotificationsClick={handleShowNotifications}
adminBadgeCount={amIAdmin ? getUnreadRegisterRequestsCount() : 0}
onAdminClick={amIAdmin ? () => setShowRegistrationRequests(true) : undefined}
AdminIcon={amIAdmin ? AutoFixHighIcon : null}
loading={loading}
loadingFallback={<FullPageSpinner variant="determinate" value={80} />}
dialogs={dialogs}
>
{children}
</GenericGrid>
);
}

export default Grid;
