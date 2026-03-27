import ExchangeRateDto from "@objects/ExchangeRateDto.js";

export async function getCurrentRate(token) {
	const currentRate = await fetch("/api/exchangeRate/current-rate", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	if (!currentRate.ok) {
		if (currentRate.status === 404) {
			// Not found
			throw new Error("Nenalezena žádná data pro tento měsíc.");
		}
		throw new Error("Neznámá chyba při načítání aktuálního kurzu do CZK. Bude použit kurz 1.");
	}

	const data = await currentRate.json();
	return new ExchangeRateDto(data.date, data.rate);
}
