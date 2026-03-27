import { Box, CircularProgress, useTheme } from "@mui/material";

/**
 * Spinner that covers the full page for loading states
 * @param {*} variant -- "determinate" | "indeterminate"
 * @param {*} value -- number between 0-100 for determinate variant
 * @returns
 */
function FullPageSpinner({ variant = "indeterminate", value }) {
	const theme = useTheme();
	return (
		<Box
			sx={{
				height: "100vh",
				width: "100vw",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.palette.background.default,
				color: theme.palette.text.primary,
				gap: 2,
			}}
		>
			<CircularProgress
				size={150}
				thickness={6}
				style={{ color: theme.palette.primary.main }}
				variant={variant}
				value={value ? value : null}
				sx={{
					"& .MuiCircularProgress-circle": {
						animationDuration: "2.8s",
					},
				}}
			/>
		</Box>
	);
}

export default FullPageSpinner;
