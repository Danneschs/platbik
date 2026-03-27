import { getTransactionColumnWidths } from "@columns/widths/ColumnWidths.js";

/**
 * Function to get columns for transaction table
 * @param {*} currencyFormat -- currency format from config (e.g. Kč, €)
 * @returns
 */
function getTransactionColumns(currencyFormat) {
	const widths = getTransactionColumnWidths();
	const flexes = {};

	return [
		{
			field: "date",
			headerName: "Datum",
			headerClassName: "column-header",
			...(widths.date ? { width: widths.date } : {}),
			...(flexes.date ? { flex: flexes.date } : {}),
			valueFormatter: (param) => {
				const timestamp = param;
				if (!timestamp) return "";
				const date = new Date(timestamp);
				if (isNaN(date.getTime())) return "Neplatné datum";
				return date.toLocaleDateString("cs-CZ", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
				});
			},
		},
		{
			field: "type",
			headerName: "Typ transakce",
			headerClassName: "column-header",
			...(widths.type ? { width: widths.type } : {}),
			...(flexes.type ? { flex: flexes.type } : {}),
			valueFormatter: (param) => {
				return param;
			},
		},
		{
			field: "fromName",
			headerName: "Od koho",
			headerClassName: "column-header",
			...(widths.from ? { width: widths.from } : {}),
			...(flexes.from ? { flex: flexes.from } : {}),
		},
		{
			field: "toName",
			headerName: "Komu",
			headerClassName: "column-header",
			...(widths.to ? { width: widths.to } : {}),
			...(flexes.to ? { flex: flexes.to } : {}),
		},
		{
			field: "amount",
			headerName: "Částka",
			headerClassName: "column-header",
			...(widths.price ? { width: widths.price } : {}),
			...(flexes.price ? { flex: flexes.price } : {}),
			valueFormatter: (param) => {
				const amount = param;
				const formattedAmount = amount.toLocaleString("cs-CZ", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				return `${formattedAmount} ${currencyFormat}`;
			},
		},
		{
			field: "description",
			headerName: "Popis",
			headerClassName: "column-header",
			...(widths.description ? { width: widths.description } : {}),
			...(flexes.description ? { flex: flexes.description } : {}),
		},
	];
}

export default getTransactionColumns;
