import { useState, useContext } from "react";
import PayDialog from "@dialogs/PayDialog.jsx";
import { GenericButton, ConfirmationDialog, GenericDialog, GenericTable } from '@danneschs/libnik-ui';
import getTransactionColumns from "@columns/getTransactionColumns.jsx";
import "@fontsource/roboto";
import { ConfigContext } from "@config/ConfigContext";

const contentSx = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	height: "100%",
};

const totalToPaySx = {
	padding: "8px",
	borderTop: "1px solid #ccc",
	width: "100%",
	textAlign: "center",
};

/**
 * Dialog for displaying all purchases between two users -- debtor and creditor
 * @param {*} onClose -- function to close the dialog
 * @param {*} fromUser -- user who owes money (debtor)
 * @param {*} toUser -- user who is owed money (creditor)
 * @param {*} handleSettle -- function to settle the commitment
 * @param {*} handleCreatePendingSettlement -- function to create pending settlement
 * @param {*} transactionsBetweenUsers -- list of transactions between the two users
 * @param {*} clickedCommitment -- commitment object containing details about the debt
 * @returns
 */
function DebtorDetailDialog({
	onClose,
	fromUser,
	toUser,
	handleSettle,
	handleCreatePendingSettlement,
	transactionsBetweenUsers,
	clickedCommitment,
}) {
	const [showQr, setShowQr] = useState(false);
	const [showSetAsPaidDialogForCreditor, setshowSetAsPaidDialogForCreditor] = useState(false);
	const { currencyFormat, isDefaultCurrency } = useContext(ConfigContext);
	const dialogTitle = "Podrobné transakce";

	const absoluteTotalAmount = clickedCommitment.amount < 0 ? -clickedCommitment.amount : clickedCommitment.amount;
	const absoluteTotalAmountToShow = absoluteTotalAmount / 100;

	// If creditorId is not provided, this dialog shows transactions between current user and his debtor
	// If debtorId is not provided, this dialog shows transactions between current user and his creditor
	const isCurrentUserCreditor = clickedCommitment?.state === "claim";

	/**
	 * Settle the purchase between two users
	 * Settles, or creates pending settlement
	 */
	const handlePay = async () => {
		if (!isCurrentUserCreditor) {
			// I owe money to the creditor, so I pay him (this dialog shows)
			// Disabled, because just creditor can mark the purchase as paid
			await handleCreatePendingSettlement(fromUser.id, toUser.id, absoluteTotalAmount);
		} else {
			// I am the creditor, so I mark the purchase as paid
			try {
				await handleSettle(fromUser.id, toUser.id, absoluteTotalAmount);
			} catch (error) {
				console.error("Error settling the purchase:", error);
			}
		}
		setShowQr(false); // Close the QR dialog
		onClose(); // Close the detail dialog
	};
	return (
		<GenericDialog
			onClose={onClose}
			dialogTitle={dialogTitle}
			dialogContent={
				<>
					<div style={contentSx}>
						<GenericTable rows={transactionsBetweenUsers} columns={getTransactionColumns(currencyFormat)} />

						<div style={totalToPaySx}>
							<div>
								{isCurrentUserCreditor ? "Celkem pohledáváte: " : "Celkem dlužíte: "}{" "}
								{absoluteTotalAmountToShow.toLocaleString("cs-CZ", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}{" "}
								{currencyFormat}
							</div>
						</div>

						{/* If I am a debtor, show PayDialog */}
						{showQr && !isCurrentUserCreditor && (
							<PayDialog
								handleSetAsPaid={handlePay}
								amountInCents={absoluteTotalAmount}
								creditor={toUser}
								currencyFormat={currencyFormat}
								isDefaultCurrency={isDefaultCurrency}
								onClose={() => setShowQr(false)}
							/>
						)}
						{showSetAsPaidDialogForCreditor && (
							<ConfirmationDialog
								onCancel={() => setshowSetAsPaidDialogForCreditor(false)}
								onConfirm={handlePay}
								title="Zaplaceno"
								content="Opravdu Vám dlužník zaplatil tento dluh?"
							/>
						)}
					</div>
				</>
			}
			dialogActions={
				<>
					<GenericButton triggerOnEnter={absoluteTotalAmount === 0} onClick={onClose} name="Zavřít" />

					{
						//If I am creditor, I can set the debt as paid
						// If the relationship is even, just show the detail of the transactions
					}
					{absoluteTotalAmount !== 0 && (
						<GenericButton
							triggerOnEnter={true}
							onClick={() =>
								isCurrentUserCreditor ? setshowSetAsPaidDialogForCreditor(true) : setShowQr(true)
							}
							name={isCurrentUserCreditor ? "Označit jako zaplacené" : "Zaplatit"}
						/>
					)}
				</>
			}
		/>
	);
}

export default DebtorDetailDialog;
