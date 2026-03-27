import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PaymentIcon from "@mui/icons-material/Payment";
import { getDebtorColumnWidths } from "@columns/widths/ColumnWidths.js";
import { GenericColumnButton } from "@danneschs/libnik-ui";

/**
 * Function to get columns for commitment table, contains button in the last column
 * @param {*} handleShowDetail -- function to show detail of the purchase (onClick event)
 * @param {*} currencyFormat -- currency format from config (e.g. Kč, €)
 * @returns
 */
function getCommitmentColumns(handleShowDetail, currencyFormat) {
	const widths = getDebtorColumnWidths();
	const flexes = {};

	return [
		{
			field: "state",
			headerName: "Typ vztahu",
			headerClassName: "column-header",
			...(widths.state ? { width: widths.state } : {}),
			...(flexes.state ? { flex: flexes.state } : {}),
			valueFormatter: (param) => {
				const value = param;
				switch (value) {
					case "debt":
						return "Dluh";
					case "claim":
						return "Pohledávka";
					case "even":
						return "Vyrovnáno";
					default:
						return "Neznámý stav";
				}
			},
		},
		{
			field: "toName",
			headerName: "Vůči komu",
			headerClassName: "column-header",
			...(widths.name ? { width: widths.name } : {}),
			...(flexes.name ? { flex: flexes.name } : {}),
		},
		{
			field: "amount",
			headerName: "Částka",
			align: "right",
			headerClassName: "column-header",
			...(widths.total ? { width: widths.total } : {}),
			...(flexes.total ? { flex: flexes.total } : {}),
			valueFormatter: (param) => {
				const value = param < 0 ? -param : param; // Ensure positive value for formatting

				if (value === 0) {
					return "Vyrovnáno";
				}

				return `${(value / 100).toLocaleString("cs-CZ", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})} ${currencyFormat}`;
			},
		},
		{
			field: "pay",
			headerName: "Detail",
			headerClassName: "column-header",
			...(widths.pay ? { width: widths.pay } : {}),
			...(flexes.pay ? { flex: flexes.pay } : {}),
			renderCell: (params) => {
				const row = params.row;
				return (
					<GenericColumnButton
						onClick={() => handleShowDetail(row)}
						buttonContent={<PaymentIcon color="action" />}
					/>
				);
			},
		},
	];
}

export default getCommitmentColumns;
