using System;
using System.ComponentModel.DataAnnotations;

namespace JobFlow.Domain.Entities;

public class Job
{
    public Guid Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; }

    public Guid UserId { get; set; }
}
