using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class CoPayer
{
	[Key, Column(Order = 0)]
	public int PurchaseId { get; set; }
	public Purchase Purchase { get; set; } = default!;

	[Key, Column(Order = 1)]
	public int UserId { get; set; }
	public User User { get; set; } = default!;
}


