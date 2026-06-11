using System;
using System.ComponentModel.DataAnnotations;
using JobFlow.Domain.Entities;

namespace JobFlow.API.Models;

public class JwtSettings
{
    public string SecretKey { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
}

public record RegisterRequest(
    [Required] string Name,
    [Required][EmailAddress] string Email,
    [Required] string Password);

public record LoginRequest(
    [Required][EmailAddress] string Email,
    [Required] string Password);

public record AuthResponse(string Token);

public record AuthUserResponse(Guid Id, string Name, string Email, DateTime CreatedAt)
{
    public AuthUserResponse(User user)
        : this(user.Id, user.Name, user.Email, user.CreatedAt)
    {
    }
}
