namespace backend.DTOs;
using backend.Models;

public class GetPurchaseDto
{
	public int Id { get; set; }
	public string Name { get; set; } = default!;
	public string BuyerName { get; set; } = default!;
	public List<UserDto> CoPayers { get; set; } = new List<UserDto>();
	public DateTimeOffset Timestamp { get; set; }
	public string ShopName { get; set; } = default!;
	public int PriceInCents { get; set; } // in cents
	public bool BuyerPays { get; set; } = true; // Default to true if not specified
}
