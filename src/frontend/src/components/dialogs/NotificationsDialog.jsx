import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { GenericButton, GenericDialog } from "@danneschs/libnik-ui";
import AlertTitle from "@mui/material/AlertTitle";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";

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
 * Notifications dialog component
 * @param {*} onClose -- function to close the dialog
 * @param {*} notifications -- list of notifications to display
 * @param {*} handleNavigateToCommitments -- function to navigate to commitments page
 * @returns
 */
function NotificationsDialog({ onClose, notifications, handleNavigateToCommitments }) {
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
		},
	};

	const areThereNotifications = notifications.length > 0;
	return (
		<GenericDialog
			sxSize="medium"
			onClose={onClose}
			dialogTitle="Notifikace"
			dialogContent={
				areThereNotifications ? (
					<Stack spacing={1}>
						{notifications.map((notification) => (
							<Alert
								icon={
									notification.type === "add_purchase" ? (
										<AddShoppingCartIcon />
									) : notification.type === "remove_purchase" ? (
										<RemoveShoppingCartIcon />
									) : notification.type === "pending_settlement" ? (
										<PaidOutlinedIcon />
									) : (
										<PaidIcon />
									)
								}
								key={notification.id}
								severity="info"
								sx={alertSx}
							>
								<AlertTitle>
									{notification.timestamp} | {notification.header}
								</AlertTitle>
								{notification.text}
							</Alert>
						))}
					</Stack>
				) : (
					"Žádné notifikace"
				)
			}
			dialogActions={
				<>
					<GenericButton
						onClick={handleNavigateToCommitments}
						name="Zobrazit závazkové vztahy"
						primary={true}
					/>
					<GenericButton onClick={onClose} name="Zavřít" />
				</>
			}
			customContentSx={!areThereNotifications ? contentTextSx : null}
		/>
	);
}

export default NotificationsDialog;
