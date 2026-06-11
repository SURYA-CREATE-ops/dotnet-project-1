using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace JobFlow.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    [JsonIgnore]
    public string? PasswordHash { get; set; }

    public ICollection<Job> Jobs { get; set; } = new List<Job>();

    public DateTime CreatedAt { get; set; }
}
