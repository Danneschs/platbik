using backend.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.DTOs;

public class RawPurchaseDto
{
	public int Id { get; set; }

	public string Name { get; set; } = default!;

	public int PriceInCents { get; set; } // in cents

	public bool BuyerPays { get; set; }

	public DateTimeOffset Timestamp { get; set; }
	public string Shop { get; set; } = default!;


	// Foreign key to User
	public int BuyerId { get; set; }

	// Navigation properties
	public virtual User Buyer { get; set; } = default!;
	public virtual ICollection<Item> Items { get; set; } = new List<Item>();

	// Many-to-many relationship with User through CoPayer
	public virtual ICollection<CoPayer> CoPayers { get; set; } = new List<CoPayer>();
	public Purchase PurchaseReference { get; set; } = default!;
	public List<User> CoPayerUsers => CoPayers.Select(cp => cp.User).ToList();
}
