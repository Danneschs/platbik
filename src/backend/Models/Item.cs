using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Item
{
	public int Id { get; set; }
	public string Name { get; set; } = default!;
	public int Quantity { get; set; }
	public int PricePerPiece { get; set; }

	public int PurchaseId { get; set; }
	public Purchase Purchase { get; set; } = default!;
}

