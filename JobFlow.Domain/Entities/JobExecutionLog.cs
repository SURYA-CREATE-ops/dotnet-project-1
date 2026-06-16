using System;

namespace JobFlow.Domain.Entities;

public class JobExecutionLog
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
