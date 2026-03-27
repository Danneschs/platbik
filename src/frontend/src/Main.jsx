import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "@main/App.jsx";
import "@styles/index.css";
import { theme } from "./theme";

import AuthProvider from "@auth/AuthProvider.jsx";
import ConfigProvider from "@config/ConfigProvider.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<ConfigProvider>
					<AuthProvider>
						<App />
					</AuthProvider>
				</ConfigProvider>
			</BrowserRouter>
		</ThemeProvider>
	</StrictMode>
);
