import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { GenericDialog, GenericButton } from "@danneschs/libnik-ui";
import AlertTitle from "@mui/material/AlertTitle";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";

import AddIcon from "@mui/icons-material/Add";

const contentTextSx = {
	height: "100%",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	fontSize: "1.5rem",
	textAlign: "center",
};

/**
 * Registration requests dialog component
 * @param {*} onClose -- function to close the dialog
 * @param {*} registrationRequests -- list of registration requests to display
 * @param {*} handleRegisterFromRequest -- function to handle registration from request
 * @returns
 */
function RegistrationRequestsDialog({ onClose, registrationRequests, handleRegisterFromRequest }) {
	const theme = useTheme();
	const alertSx = {
		backgroundColor: alpha(theme.palette.primary.main, 0.06),
		color: theme.palette.text.primary,
		"& .MuiAlert-icon": {
			color: theme.palette.primary.main,
		},
		"&:hover": {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.background.default,
			"& .MuiAlert-icon": {
				color: theme.palette.background.default,
			},
			"& svg": {
				color: theme.palette.background.default,
			},
		},
	};

	const areThereRequests = registrationRequests.length > 0;

	return (
		<GenericDialog
			sxSize="medium"
			onClose={onClose}
			dialogTitle="Žádosti o registraci"
			dialogContent={
				areThereRequests ? (
					<Stack spacing={1}>
						{registrationRequests.map((notification) => (
							<Alert
								icon={
									<Link
										onClick={() => handleRegisterFromRequest(notification.id)}
										sx={{ cursor: "pointer" }}
									>
										<AddIcon sx={{ color: theme.palette.primary.main }} />
									</Link>
								}
								key={notification.id}
								severity="info"
								sx={alertSx}
							>
								<AlertTitle>
									{notification.requestedAt} | {notification.name} {notification.surname}
								</AlertTitle>
								{notification.email} | {notification.accountNumber}
							</Alert>
						))}
					</Stack>
				) : (
					"Žádné žádosti o registraci"
				)
			}
			customContentSx={!areThereRequests ? contentTextSx : null}
			dialogActions={
				<>
					<GenericButton onClick={onClose} name="Zavřít" />
				</>
			}
		/>
	);
}
export default RegistrationRequestsDialog;
