using backend.Models;

namespace backend.DTOs;

public class GetTransactionLogDto
{
	public int Id { get; set; }
	public DateTimeOffset Date { get; set; }
	public string Type { get; set; } = default!;
	public string FromName { get; set; } = default!;
	public string ToName { get; set; } = default!;
	public int Amount { get; set; } // in cents
	public string? Description { get; set; }
}
