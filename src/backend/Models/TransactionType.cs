using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class TransactionType
{
	public int Id { get; set; }

	[MaxLength(64)]
	public string Code { get; set; } = default!;   // napø. "add_purchase"

	[MaxLength(128)]
	public string DisplayName { get; set; } = default!; // napø. "Add Purchase"

	// Navigace zpìt na logy (volitelné; pro dotazování se hodí)
	public ICollection<TransactionLog> TransactionLogs { get; set; } = new List<TransactionLog>();
}
