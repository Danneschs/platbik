import { Tooltip } from "@mui/material";

/**
 * EditCellWithTooltip component
 * @description This component is used to display a cell with a tooltip for error messages.
 * It wraps the cell value in a tooltip that shows the error message when there is an error.
 * @param {*} error - Boolean indicating if there is an error
 * @param {*} helperText - The error message to be displayed in the tooltip
 * @param {*} value - The value to be displayed in the cell
 * @returns
 */
const EditCellWithTooltip = ({ error, helperText, value }) => {
	return (
		<Tooltip title={error ? helperText : ""} arrow>
			{value}
		</Tooltip>
	);
};

export default EditCellWithTooltip;
