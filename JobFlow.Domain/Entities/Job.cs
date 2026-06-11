using System;
using System.ComponentModel.DataAnnotations;
using JobFlow.Domain.Enums;

namespace JobFlow.Domain.Entities;

public class Job
{
    public Guid Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string Status { get; set; } = "Pending";

    public JobPriority Priority { get; set; } = JobPriority.Medium;

    public int RetryCount { get; set; }

    public int MaxRetries { get; set; } = 3;

    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid UserId { get; set; }
}
