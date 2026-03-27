namespace backend.DTOs;

public class NotificationDto
{
	public int Id { get; set; }
	public string Type { get; set; } = default!;
	public string Header { get; set; } = default!;
	public string Text { get; set; } = default!;
	public DateTimeOffset Timestamp { get; set; }
	public bool IsRead { get; set; } = false;
}
