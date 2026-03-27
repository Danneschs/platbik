namespace backend.DTOs;

public class ItemDto
{
	public int Id { get; set; }
	public string Name { get; set; } = default!;
	public int Quantity { get; set; }
	public int PriceInCents { get; set; }
}
