using Microsoft.AspNetCore.Mvc;
using PasswordManager.API.Data;
using PasswordManager.API.Models;


public class RegisterDto { public string Email { get; set; } public string Password { get; set; } }
public class LoginDto { public string Email { get; set; } public string Password { get; set; } }

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto request)
    {
        // Check if user already exists
        if (_context.Users.Any(u => u.Email == request.Email))
        {
            return BadRequest("User with this email already exists.");
        }

        // Hash the password using BCrypt
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("User registered successfully.");
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto request)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

        // Check if user exists and password is correct
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials.");
        }

        return Ok("Login successful.");
    }
}