namespace backend.DTOs;

public class CommitmentDto
{
	public required int FromUserId { get; set; }
	public required int ToUserId { get; set; }
	public required string ToName { get; set; } = default!;
	public required string State { get; set; }
	public required int TotalInCents { get; set; }
}
