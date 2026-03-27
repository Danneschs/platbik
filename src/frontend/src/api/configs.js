import { URL } from "@api/url.js";

export async function getCurrencyFormatService() {
	const response = await fetch(`${URL}/config/currency-format`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	try {
		const data = await response.json();
		// Handle the currency data
		if (data.currencyFormat == null && data.currencyFormat !== "Kč" && data.currencyFormat !== "€") {
			return "Kč"; // Default currency format
		}

		return data.currencyFormat;
	} catch (error) {
		console.error("Error fetching currency data (setting default):", error);
	}
}
