namespace backend.Controllers;

using backend.DTOs;
using backend.Data;

using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IJwtKeyProvider _jwtKeyProvider;
    private readonly int _tokenExpireTime = 10; // hours

    private readonly AppDbContext _db;

    public AuthController(AppDbContext db, IJwtKeyProvider jwtKeyProvider)
    {
        _db = db;
        _jwtKeyProvider = jwtKeyProvider;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        //Console.WriteLine($"Login called with Email: {model?.Email}");

        if (model == null)
            return BadRequest("Model is required");

        if (!IsValidEmail(model.Email) || string.IsNullOrEmpty(model.Password))
            return BadRequest("Email and password are required");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

        if (user == null)
        {
            //Console.WriteLine("User not found");
            return Unauthorized("Invalid credentials");
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
        {
            //Console.WriteLine("Invalid password");
            return Unauthorized("Invalid credentials");
        }

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtKeyProvider.Key);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim("email", user.Email)
            }),
                Expires = DateTime.UtcNow.AddHours(_tokenExpireTime),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            //Console.WriteLine($"Token created: {tokenString.Substring(0, Math.Min(50, tokenString.Length))}...");

            return Ok(new
            {
                Token = tokenString,
                ExpiresAt = DateTime.UtcNow.AddHours(_tokenExpireTime),
                Name = user.Name,
                Surname = user.Surname
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating token: {ex.Message}");
            return StatusCode(500, $"Error creating token: {ex.Message}");
        }
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
