import { GridActionsCellItem } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";

import { getItemColumnWidths } from "@columns/widths/ColumnWidths.js";
import { inputSx } from "@danneschs/libnik-ui";

/**
 * Gets columns for item table
 * @param {*} handleDelete -- reference to the function that handles delete action
 * @param {*} editable -- if the table is editable (optional)
 * @param {*} currencyFormat -- currency format from config (e.g. Kč, €)
 * @returns columns for item table
 */
function getItemColumns(handleDelete, isEditable, currencyFormat, errorColor) {
	let widths = getItemColumnWidths(); // Flexes are used instead of widths
	const flexes = {};
	if (widths) {
		widths.delete;

		widths = Object.fromEntries(Object.entries(widths).map(([key, value]) => [key, value * 0.75]));
	}

	/**
	 * Renders a number input cell for editing
	 * @param {Object} params - The parameters for the cell
	 * @returns {JSX.Element} - The rendered number input cell
	 */
	const numberEditCell = (params) => {
		const minValue = 1;
		const step = 1;
		return (
			<input
				type="number"
				value={params.value ?? ""}
				min={minValue}
				step={step}
				onChange={(e) => {
					const newValue = e.target.value;
					params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue }, e);
				}}
				style={!params.error ? inputSx : { ...inputSx, color: errorColor }}
				autoFocus
			/>
		);
	};

	const validatePrice = (value) => {
		const val = Number(value);
		return isNaN(val) || val < 1 || !/^\d+(\.\d{1,2})?$/.test(value) || val > 999_999;
	};

	const validateAmount = (value) => {
		const val = Number(value);
		return isNaN(val) || val < 1 || !/^\d+$/.test(value) || val > 999;
	};

	const columns = [
		{
			field: "name",
			headerName: "Položka",
			...(widths.name ? { width: widths.name } : {}),
			...(flexes.name ? { flex: flexes.name } : {}),
			headerClassName: "column-header",
			editable: isEditable,
		},
		{
			field: "quantity",
			type: "number",
			inputProps: { min: 1 },
			headerName: "Množství",
			...(widths.amount ? { width: widths.amount } : {}),
			...(flexes.amount ? { flex: flexes.amount } : {}),
			headerClassName: "column-header",
			valueFormatter: (param) => {
				return param
					? `${param.toLocaleString("cs-CZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ks`
					: param;
			},
			preProcessEditCellProps: (params) => {
				const isError = validateAmount(params.props.value);
				return { ...params.props, error: isError };
			},
			renderEditCell: (params) => {
				return numberEditCell(params);
			},
			editable: isEditable,
		},
		{
			field: "priceInCrowns",
			type: "number",
			headerName: "Cena za kus",
			...(widths.priceInCents ? { width: widths.priceInCents } : {}),
			...(flexes.priceInCents ? { flex: flexes.priceInCents } : {}),
			headerClassName: "column-header",
			editable: isEditable,
			valueFormatter: (param) =>
				param
					? `${param.toLocaleString("cs-CZ", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
					  })} ${currencyFormat}`
					: param,
			preProcessEditCellProps: (params) => {
				const isError = validatePrice(params.props.value);
				return { ...params.props, error: isError };
			},
			renderEditCell: (params) => {
				return numberEditCell(params);
			},
		},
		{
			field: "delete",
			type: "actions",
			headerName: "",
			headerClassName: "column-header",
			...(widths.delete ? { width: widths.delete } : {}),
			...(flexes.delete ? { flex: flexes.delete } : {}),
			cellClassName: "actions",
			getActions: ({ id }) => {
				return [
					<GridActionsCellItem
						icon={<DeleteIcon />}
						label="Delete"
						onClick={() => {
							handleDelete(id);
						}}
						color="inherit"
					/>,
				];
			},
			editable: false,
		},
	];

	return isEditable ? columns : columns.filter((col) => col.field !== "delete");
}

export default getItemColumns;
