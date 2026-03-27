namespace backend.DTOs;

public class PostTransactionLogDto
{
	public int FromUserId { get; set; }
	public int ToUserId { get; set; }
	public int AmountInCents { get; set; } // in cents
}
