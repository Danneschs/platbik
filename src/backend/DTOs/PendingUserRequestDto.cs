namespace backend.DTOs;

public class PendingUserRequestDto
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Surname { get; set; }
    public required string AccountNumber { get; set; }
    public required string Email { get; set; }
    public required bool IsRead { get; set; }
    public required DateTimeOffset RequestedAt { get; set; }
}