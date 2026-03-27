namespace backend.Controllers;

using backend.Data;
using backend.DTOs;
using backend.Extensions;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class PendingUserController : ControllerBase
{
    private readonly AppDbContext _db;

    public PendingUserController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("all")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<PendingUserRequestDto>>> GetAll()
    {
        var userId = User.GetUserId();

        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();
        
        if (user.Role.Code != Config.RoleCodes.ADMIN)
            return Forbid();

        var pendingUsers = await _db.PendingUsers
            .Select(u => new PendingUserRequestDto
            {
                Id = u.Id,
                Name = u.Name,
                Surname = u.Surname,
                AccountNumber = u.AccountNumber,
                Email = u.Email,
                RequestedAt = u.RequestedAt,
                IsRead = u.IsRead
            })
            //.OrderByDescending(u => u.RequestedAt)
            .ToListAsync();

        return Ok(pendingUsers);
    }

    [HttpPost("mark-as-read/{id}")]
    [Authorize]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var currentUserId = User.GetUserId();

        var currentUser = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == currentUserId);
        if (currentUser == null)
            return Unauthorized("User not found.");

        if (currentUser.Role == null || currentUser.Role.Code != Config.RoleCodes.ADMIN)
            return Forbid();

        var pendingUser = await _db.PendingUsers.FirstOrDefaultAsync(tl => tl.Id == id);
        if (pendingUser == null)
            return NotFound("Pending user not found.");

        pendingUser.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok();
    }
}
