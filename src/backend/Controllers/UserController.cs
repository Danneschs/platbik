namespace backend.Controllers;

using backend.Data;
using backend.Models;
using backend.DTOs;
using backend.Mappers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Extensions;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("all")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var userIdClaim = User.GetUserId();

        return await _db.Users
            .Include(u => u.Role)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Surname = u.Surname,
                AccountNumber = u.AccountNumber,
                Email = u.Email,
                RoleCode = u.Role.Code
            })
            .ToListAsync();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrent()
    {
        var userId = User.GetUserId();

        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return NotFound();

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            AccountNumber = user.AccountNumber,
            Email = user.Email,
            RoleCode = user.Role.Code
        };
    }

    [HttpPost("register-{id}")]
    public async Task<IActionResult> Register(int id)
    {
        // Creates user from pending user with given id 

        var pendingUser = await _db.PendingUsers.FindAsync(id);
        var userRole = await _db.Roles.FirstOrDefaultAsync(r => r.Code == Config.RoleCodes.USER);
        

        if (pendingUser == null)
        {
            return NotFound("Pending user not found.");
        }
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == pendingUser.Email);

        if (existingUser != null)
        {
            return Conflict("User with this email already exists.");
        }

        if (userRole == null)
        {
            return NotFound("User role not found.");
        }

        return await CreateUser(pendingUser, userRole);
    }

    private async Task<IActionResult> CreateUser(PendingUser pendingUser, Role role)
    {
        var newUser = new User
        {
            Name = pendingUser.Name,
            Surname = pendingUser.Surname,
            AccountNumber = pendingUser.AccountNumber,
            Email = pendingUser.Email,
            PasswordHash = pendingUser.PasswordHash,
            Role = role
        };

        _db.Users.Add(newUser);
        _db.PendingUsers.Remove(pendingUser);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registration request submitted successfully", id = newUser.Id });
    }

    [HttpPost("request-registration")]
    public async Task<IActionResult> RequestRegistration([FromBody] RegisterUserDto userDto)
    {
        // Creates a pending user registration request
        var errors = UserValidator.ValidateRegisterForm(userDto);
        if (errors.Count > 0)
            return BadRequest(errors);
        
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == userDto.Email);
        if (existingUser != null)
            return Conflict("User with this email already exists.");
        

        var existingPendingUser = await _db.PendingUsers.FirstOrDefaultAsync(u => u.Email == userDto.Email);
        if (existingPendingUser != null)
            return Conflict("A registration request with this email already exists.");
        

        var newUser = new PendingUser
        {
            Name = userDto.Name,
            Surname = userDto.Surname,
            AccountNumber = userDto.AccountNumber,
            Email = userDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
            RequestedAt = DateTimeOffset.UtcNow
        };

        _db.PendingUsers.Add(newUser);
        await _db.SaveChangesAsync();


        // For the first user registration request, create admin user directly
        var userCount = await _db.Users.CountAsync();
        var pendingUserCount = await _db.PendingUsers.CountAsync();
        
        if (userCount == 0 && pendingUserCount == 1)
        {   
            var adminRole = await _db.Roles.FirstOrDefaultAsync(r => r.Code == Config.RoleCodes.ADMIN);
            if (adminRole == null)
                return NotFound("Admin role not found.");
            
            return await CreateUser(newUser, adminRole);
        }

        return Ok(new { message = "Registration request submitted successfully", id = newUser.Id });
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var userId = User.GetUserId();
        
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return NotFound();
        
        var role = await _db.Roles.FindAsync(user.RoleId);
        if (role == null)
            return NotFound();

        return Ok(UserMapper.ToDto(user, role.Code));
    }

}
