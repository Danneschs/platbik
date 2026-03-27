namespace backend.DTOs;

public class PostPurchaseDto
{
	public int Id { get; set; }
	public string Name { get; set; } = default!;
	public int BuyerId { get; set; } = default!;
	public List<int> CoPayerIds { get; set; } = new List<int>(); // User ids
	public DateTimeOffset Timestamp { get; set; }
	public string ShopName { get; set; } = default!;
	public List<ItemDto> Items { get; set; } = new List<ItemDto>();
	public bool BuyerPays { get; set; } = true; // Default to true if not specified
}
