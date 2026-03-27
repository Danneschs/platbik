namespace backend.DTOs;

public class ExchangeRateDto
{
    public required string Date { get; set; }
    public required decimal Rate { get; set; }
}