import { useContext, useEffect, useState } from "react";
import NotLogged from "@bookmarks/NotLogged.jsx";
import { AuthContext } from "@auth/AuthContext.js";
import { GenericTable } from "@danneschs/libnik-ui";
import DebtorDetailDialog from "@dialogs/DebtorDetailDialog.jsx";
import { getAllCommitmentsService } from "@api/commitments.js";
import {
	getTransactionLogsBetweenUsersService,
	createPendingSettlementService,
	settleService,
} from "@api/transactionLogs";
import getCommitmentColumns from "@columns/getCommitmentColumns.jsx";
import { getUserByIdService } from "@api/users";
import { ToastBar } from "@danneschs/libnik-ui";
import { ConfigContext } from "@config/ConfigContext.js";

/**
 * Component for displaying user's commitments
 * Bookmark component
 * @returns
 */
function MyCommitments() {
	const [showDetail, setShowDetail] = useState(false);
	const [clickedCommitment, setClickedCommitment] = useState({});
	const [commitments, setCommitments] = useState([]);
	const [transactionsBetweenUsers, setTransactionsBetweenUsers] = useState([]);
	const [fromUser, setFromUser] = useState({});
	const [toUser, setToUser] = useState({});
	const [toastBarSettings, setToastBarSettings] = useState(null);

	const token = localStorage.getItem("jwtToken");

	const { currencyFormat } = useContext(ConfigContext);
	const { currentUser } = useContext(AuthContext);
	useEffect(() => {
		const getAllCommitments = async () => {
			try {
				const commitments = await getAllCommitmentsService(token);
				setCommitments(commitments);
			} catch (error) {
				console.error("Error fetching commitments:", error);
			}
		};

		if (!currentUser) return;
		getAllCommitments();
	}, [currentUser, token]);

	if (!currentUser) {
		return <NotLogged />;
	}

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

	/**
	 * Shows the detail dialog
	 * @param {*} row -- The row that was clicked
	 */
	const handleActionButtonClick = async (row) => {
		const txs = await getTransactionLogsBetweenUsersService(token, row.fromUserId, row.toUserId);
		const fromUser = await getUserByIdService(token, row.fromUserId);
		const toUser = await getUserByIdService(token, row.toUserId);

		setFromUser(fromUser);
		setToUser(toUser);
		setTransactionsBetweenUsers(txs.sort((a, b) => new Date(b.date) - new Date(a.date)));
		setClickedCommitment(row);
		setShowDetail(true);
	};

	const handleSettle = async (fromUserId, toUserId, amount) => {
		try {
			const newCommitments = await settleService(token, fromUserId, toUserId, amount);

			if (newCommitments && newCommitments.length > 0) {
				// Update commitments state to reflect the settled commitment
				setCommitments(newCommitments);
			} else {
				setErrorToastBar("Chyba ve vrácení transakce.");
			}
			setSuccessToastBar("Dluh byl úspěšně označen jako splacený.");
		} catch {
			// TODO?: různé výjimky
			setErrorToastBar("Dlužník neoznačil dluh jako zaplacený.");
		}
	};

	const handleCreatePendingSettlement = async (fromUserId, toUserId, amount) => {
		try {
			await createPendingSettlementService(token, fromUserId, toUserId, amount);
			setSuccessToastBar("Dluh byl označen jako zaplacený.");
		} catch {
			// TODO?: různé výjimky
			setErrorToastBar("Neočekávaná chyba.");
		}
	};

	const columns = getCommitmentColumns(handleActionButtonClick, currencyFormat);

	return (
		<>
			<GenericTable rows={commitments} columns={columns} />
			{showDetail && (
				<DebtorDetailDialog
					fromUser={fromUser}
					toUser={toUser}
					clickedCommitment={clickedCommitment}
					handleSettle={handleSettle}
					handleCreatePendingSettlement={handleCreatePendingSettlement}
					transactionsBetweenUsers={transactionsBetweenUsers}
					onClose={() => setShowDetail(false)}
				/>
			)}
			{toastBarSettings && <ToastBar {...toastBarSettings} />}
		</>
	);
}

export default MyCommitments;
