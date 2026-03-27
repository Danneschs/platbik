namespace backend.DTOs;

public class UserDto
{
	public int Id { get; set; }
	public string Name { get; set; } = default!;
	public string Surname { get; set; } = default!;
	public string AccountNumber { get; set; } = default!;
	public string Email { get; set; } = default!;
	public string RoleCode { get; set; } = default!;
	public string FullName => $"{Name} {Surname}";
}
