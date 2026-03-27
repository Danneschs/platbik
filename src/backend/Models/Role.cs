namespace backend.Models;

public class Role
{
    public int Id { get; set; }
    public string Code { get; set; } = default!;
    public string DisplayName { get; set; } = default!;

    // Navigation to User entities
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}