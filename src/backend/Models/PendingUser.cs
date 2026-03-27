namespace backend.Models;

public class PendingUser
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Surname { get; set; } = default!;
    public string AccountNumber { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public bool IsRead { get; set; } = false;
    public DateTimeOffset RequestedAt { get; set; }
}