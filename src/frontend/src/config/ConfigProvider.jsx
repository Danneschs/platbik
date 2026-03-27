import { useState, useEffect } from "react";
import { ConfigContext } from "@config/ConfigContext";

import { getCurrencyFormatService } from "@api/configs";

function ConfigProvider({ children }) {
	const [currencyFormat, setCurrencyFormat] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCurrencyFormat = async () => {
			const currencyFormat = await getCurrencyFormatService();
			setCurrencyFormat(currencyFormat);
			setLoading(false);
		};
		fetchCurrencyFormat();
	}, []);

	return (
		<ConfigContext.Provider
			value={{
				loading,
				currencyFormat,
				isDefaultCurrency: currencyFormat === "Kč",
			}}
		>
			{children}
		</ConfigContext.Provider>
	);
}

export default ConfigProvider;
