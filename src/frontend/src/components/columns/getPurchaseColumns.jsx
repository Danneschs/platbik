import { getPurchaseColumnWidths } from "@columns/widths/ColumnWidths.js";
import { GenericColumnButton } from "@danneschs/libnik-ui";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { ConfigContext } from "@config/ConfigContext";

/**
 * Gets columns for purchase table
 * @param {*} handleActionButtonClick function for showing purchase detail for onClick event on the button in the last row
 * @param {*} actionColName name of the last column (action column)
 * @param {*} currencyFormat currency format from config (e.g. Kč, €)
 * @returns {Array} columns
 */
function getPurchaseColumns(handleActionButtonClick, actionColName, currencyFormat) {
	const widths = getPurchaseColumnWidths(); // Flexes are used instead of widths
	const flexes = {};

	return [
		{
			field: "name",
			headerName: "Název",
			...(flexes.name ? { flex: flexes.name } : {}),
			...(widths.name ? { width: widths.name } : {}),
			headerClassName: "column-header",
			valueFormatter: (param) => {
				return param ? param : "Není uveden";
			},
		},
		{
			field: "buyerName",
			headerName: "Kupující",
			headerClassName: "column-header",
			...(flexes.buyer ? { flex: flexes.buyer } : {}),
			...(widths.buyer ? { width: widths.buyer } : {}),
			valueFormatter: (param) => {
				const buyer = param;
				if (!buyer) return "Není uveden";
				return buyer;
			},
		},
		{
			field: "coPayers",
			headerName: "Spoluplatitelé",
			headerClassName: "column-header",
			...(flexes.buyer ? { flex: flexes.buyer } : {}),
			...(widths.buyer ? { width: widths.buyer } : {}),
			valueFormatter: (param) => {
				const coPayers = param;
				if (!coPayers || coPayers.length === 0) return "Žádní spoluplatitelé";
				return coPayers
					.map((coPayer) => {
						const user = coPayer;
						if (!user || !user.name || !user.surname) return "Není uveden";
						return `${user.name} ${user.surname}`;
					})
					.join(", ");
			},
		},
		{
			field: "timestamp",
			headerName: "Datum",
			headerClassName: "column-header",
			...(flexes.date ? { flex: flexes.date } : {}),
			...(widths.date ? { width: widths.date } : {}),
			valueFormatter: (param) => {
				const timestamp = param;
				if (!timestamp) return "";
				const date = new Date(timestamp);
				if (isNaN(date.getTime())) return "Neplatné datum";
				return date.toLocaleDateString("cs-CZ", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				});
			},
		},
		{
			field: "shopName",
			headerName: "Obchod",
			...(flexes.shop ? { flex: flexes.shop } : {}),
			...(widths.shop ? { width: widths.shop } : {}),
			headerClassName: "column-header",
			valueFormatter: (param) => {
				return param ? param : "---";
			},
		},
		{
			field: "priceInCents",
			headerName: "Cena nákupu",
			align: "right",
			headerClassName: "column-header",
			...(flexes.price ? { flex: flexes.price } : {}),
			...(widths.price ? { width: widths.price } : {}),
			valueFormatter: (param) => {
				if (!param) return "---";
				const priceInCents = Number(param);
				const price = priceInCents / 100; // Convert cents to currency
				return price
					? `${price.toLocaleString("cs-CZ", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
					  })} ${currencyFormat}`
					: "---";
			},
		},
		{
			field: "action",
			headerName: actionColName ? actionColName : "Detail",
			headerClassName: "column-header",
			...(flexes.isPaid ? { flex: flexes.isPaid } : {}),
			...(widths.isPaid ? { width: widths.isPaid } : {}),
			renderCell: (param) => {
				if (actionColName === "Upravit") {
					return (
						<GenericColumnButton
							onClick={() => handleActionButtonClick(param.row)}
							buttonContent={<ModeEditIcon color="action" />}
						/>
					);
				} else {
					return (
						<GenericColumnButton
							onClick={() => handleActionButtonClick(param.row)}
							buttonContent={<MoreHorizIcon color="action" />}
						/>
					);
				}
			},
		},
	];
}

export default getPurchaseColumns;
