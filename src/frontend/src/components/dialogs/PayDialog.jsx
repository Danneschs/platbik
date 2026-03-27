import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { GenericButton, ConfirmationDialog, GenericDialog } from '@danneschs/libnik-ui';
import { getCurrentRate } from "@api/exchangeRates";
import { ToastBar } from "@danneschs/libnik-ui";

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

const customDialogContentSx = {
	display: "flex",
	flexDirection: "row",
	alignItems: "center",
	justifyContent: "center",

	"@media (max-width: 600px)": {
		display: "block",
	},
};

const contentSx = css({
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",
	gap: "50px",

	"@media (max-width: 600px)": {
		flexDirection: "column",
		alignItems: "center",
	},
});

const qrCodeSx = css({
	width: "250px",
	height: "250px",
});

const textBlocksSx = {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",

	maxWidth: "250px",
	maxHeight: "250px",

	width: "220px",
	height: "250px",

	"@media (max-width: 600px)": {
		fontSize: "1.5em",

		overflowY: "none",
		maxWidth: "100%",
		maxHeight: "100%",

		width: "auto",
		height: "auto",
		margin: "0",
	},
};

const textBlockSx = {
	textAlign: "center",
	wordBreak: "break-word",
	overflowWrap: "anywhere",
};

/**
 * Dialog for displaying payment information
 * @param {*} creditor -- creditor information (name, surname, account number)
 * @param {*} handleSetAsPaid -- function to mark the payment as paid
 * @param {*} onClose -- function to close the dialog
 * @param {*} amountInCents -- amount to pay in cents
 * @param {*} currencyFormat -- currency format from config (e.g. Kč, €)
 * @param {*} isDefaultCurrency -- whether the currency is the default (Kč)
 * @returns
 */
function PayDialog({ creditor, handleSetAsPaid, onClose, amountInCents, currencyFormat, isDefaultCurrency }) {
	const [copyButtonName, setCopyButtonName] = useState("Zkopírovat");
	const [confirmDialog, setConfirmDialog] = useState(null);
	const [currentRate, setCurrentRate] = useState(1);
	const [toastBarSettings, setToastBarSettings] = useState(null);

	const token = localStorage.getItem("jwtToken");

	useEffect(() => {
		const fetchCurrentRate = async () => {
			const defaultRate = 1;
			try {
				const exchangeRate = await getCurrentRate(token);

				setCurrentRate(exchangeRate.rateDecimal);
				setToastBarSettings({
					message: `Poslední dostupný kurz z ${exchangeRate.date.toLocaleDateString()} načten, 1 ${currencyFormat} = ${
						exchangeRate.rateDecimal
					} Kč.`,
					type: "success",
				});
			} catch (error) {
				setCurrentRate(defaultRate); // Fallback to 1 if fetch fails
				setToastBarSettings({
					message:
						error.message ||
						`Neznámá chyba při načítání aktuálního kurzu, 1 ${currencyFormat} = ${defaultRate} Kč.`,
					type: "error",
				});
			}
		};
		if (!isDefaultCurrency) {
			fetchCurrentRate();
		}
	}, [currencyFormat, isDefaultCurrency, token]);

	const amount = (amountInCents / 100) * currentRate;
	const formattedAmount = Number(amount).toLocaleString("cs-CZ", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	/**
	 * Gets IBAN from account number
	 * @description Converts account number to IBAN format
	 * @param {*} fullAccount account number in format "number/bankCode"
	 * @returns
	 */
	const getIban = (fullAccount) => {
		const prefix = "CZ";
		// fullAccount = "143929001/5500"; // For testing

		// Get the bank code and account number
		const [accountPart, bankCode] = fullAccount.split("/");

		if (!bankCode || !accountPart) {
			throw new Error("Invalid account format -- expected 'number/bankCode' or 'prefix-number/bankCode'");
		}

		// Get the prefix and main part of the account number
		const [prefixPart, numberPart] = accountPart.includes("-") ? accountPart.split("-") : ["", accountPart];

		const pre = prefixPart.padStart(6, "0"); // Prefix (6 ciphers)
		const main = numberPart.padStart(10, "0"); // Account number (10 ciphers)

		const accountBase = `${bankCode}${pre}${main}`; // BBBBPPPPPPCCCCCCCCCC
		const ibanRaw = `${accountBase}${prefix}00`; // For chesksum

		// Chars to numbers (C=12, Z=35)
		const ibanNumeric = ibanRaw.replace(/[A-Z]/g, (ch) => (ch.charCodeAt(0) - 55).toString());

		// Compute control numbers (mod 97)
		const mod97 = BigInt(ibanNumeric) % 97n;
		const checksum = String(98n - mod97).padStart(2, "0");

		// Result -- IBAN
		return `${prefix}${checksum}${bankCode}${pre}${main}`;
	};

	const iban = getIban(creditor.accountNumber);
	const textInQr = `SPD*1.0*ACC:${iban}*AM:${formattedAmount}*CC:CZK`;

	/**
	 * Handles copying text to clipboard
	 * @description Copies text to clipboard and changes button name
	 */
	const handleCopyInfoToClipboard = () => {
		navigator.clipboard
			.writeText(textInQr)
			.then(() => {
				setCopyButtonName("Zkopírováno");
			})
			.catch((err) => {
				console.error("Error copying text: ", err);
			});
	};

	const handleConfirmPay = () => {
		setConfirmDialog({
			title: "Zaplatit nákup",
			content: "Oprvdu chcete označit tento nákup jako zaplacený?",
			handler: handleSetAsPaid,
		});
	};

	return (
		<GenericDialog
			sxSize="medium"
			onClose={onClose}
			dialogTitle={"Zaplatit"}
			customContentSx={customDialogContentSx}
			dialogContent={
				<div css={contentSx}>
					<div css={qrCodeSx}>
						<QRCodeSVG value={textInQr} width="100%" height="100%" />
					</div>

					<div css={textBlocksSx}>
						<div css={textBlockSx}>
							<h3>Komu:</h3>
							{creditor.name} {creditor.surname}
						</div>
						<div css={textBlockSx}>
							<h3>Částka:</h3>
							{formattedAmount} Kč
						</div>
						<div css={textBlockSx}>
							<h3>Číslo účtu:</h3>
							{creditor.accountNumber}
						</div>
					</div>

					{confirmDialog && (
						<ConfirmationDialog
							title={confirmDialog.title}
							content={confirmDialog.content}
							onCancel={() => setConfirmDialog(null)}
							onConfirm={confirmDialog.handler}
						/>
					)}
					{toastBarSettings && <ToastBar {...toastBarSettings} duration={10000} />}
				</div>
			}
			dialogActions={
				<>
					<GenericButton onClick={onClose} name="Zavřít" />
					<GenericButton onClick={handleCopyInfoToClipboard} name={copyButtonName} />
					<GenericButton triggerOnEnter={true} onClick={handleConfirmPay} name="Zaplaceno" />
				</>
			}
		/>
	);
}

export default PayDialog;
