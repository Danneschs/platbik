using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Purchase
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

	// Computed property to get list of co-payer users
	[NotMapped]
	public List<User> CoPayerUsers => CoPayers.Select(cp => cp.User).ToList();
}