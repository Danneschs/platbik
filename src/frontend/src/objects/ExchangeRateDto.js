export default class ExchangeRateDto {
	constructor(dateString, rateDecimal) {
		this.dateString = dateString;
		this.rateDecimal = rateDecimal;
		this.date = new Date(dateString);
		this.rate = parseFloat(rateDecimal).toFixed(2);
	}
}
