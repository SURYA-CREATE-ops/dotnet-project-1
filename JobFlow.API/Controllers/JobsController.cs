using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobFlow.Domain.Entities;
using JobFlow.Domain.Enums;
using JobFlow.Infrastructure.Persistence;

namespace JobFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JobsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public JobsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        // Rule 1: Name length 3–100
        var name = request.Name?.Trim() ?? string.Empty;
        if (name.Length < 3 || name.Length > 100)
            return BadRequest(new { message = "Job name must be between 3 and 100 characters." });

        // Rule 2: Unique name per user
        var nameExists = await _dbContext.Jobs
            .AnyAsync(j => j.UserId == userId && j.Name == name);
        if (nameExists)
            return BadRequest(new { message = "A job with this name already exists." });

        var scheduledAt = request.ScheduledAt ?? DateTime.UtcNow;
        var now = DateTime.UtcNow;

        // Rule 3: ScheduledAt cannot be in the past (allow 1-minute grace)
        if (scheduledAt < now.AddMinutes(-1))
            return BadRequest(new { message = "Scheduled date cannot be in the past." });

        // Rule 4: ScheduledAt cannot be more than 1 year ahead
        if (scheduledAt > now.AddYears(1))
            return BadRequest(new { message = "Scheduled date cannot be more than 1 year in the future." });

        var priority = request.Priority ?? JobPriority.Medium;

        // Rule 5: MaxRetries 1–10
        var maxRetries = request.MaxRetries ?? 3;
        if (maxRetries < 1 || maxRetries > 10)
            return BadRequest(new { message = "MaxRetries must be between 1 and 10." });

        // Rule 6: Max 5 active High Priority jobs per user
        if (priority == JobPriority.High)
        {
            var activeHighCount = await _dbContext.Jobs.CountAsync(j =>
                j.UserId == userId &&
                j.Priority == JobPriority.High &&
                (j.Status == "Pending" || j.Status == "Running"));
            if (activeHighCount >= 5)
                return BadRequest(new { message = "Maximum 5 active high-priority jobs allowed." });
        }

        var job = new Job
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = request.Description?.Trim(),
            Status = "Pending",
            Type = request.Type ?? JobType.Report,
            Priority = priority,
            ScheduledAt = scheduledAt,
            MaxRetries = maxRetries,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _dbContext.Jobs.Add(job);
        await _dbContext.SaveChangesAsync();

        _dbContext.JobExecutionLogs.Add(new JobExecutionLog
        {
            Id = Guid.NewGuid(),
            JobId = job.Id,
            Message = "Job created.",
            CreatedAt = DateTime.UtcNow
        });
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, job);
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var jobs = await _dbContext.Jobs.Where(j => j.UserId == userId).ToListAsync();
        return Ok(jobs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
        if (job == null)
            return NotFound();

        return Ok(job);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateJob(Guid id, [FromBody] UpdateJobRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
        if (job == null)
            return NotFound();

        // Rule 1: Name length 3–100
        if (request.Name != null)
        {
            var name = request.Name.Trim();
            if (name.Length < 3 || name.Length > 100)
                return BadRequest(new { message = "Job name must be between 3 and 100 characters." });

            // Rule 2: Unique name per user (exclude current job)
            var nameExists = await _dbContext.Jobs
                .AnyAsync(j => j.UserId == userId && j.Name == name && j.Id != id);
            if (nameExists)
                return BadRequest(new { message = "A job with this name already exists." });

            job.Name = name;
        }

        if (request.Description != null)
            job.Description = request.Description.Trim();

        if (request.ScheduledAt.HasValue)
        {
            var scheduledAt = request.ScheduledAt.Value;
            var now = DateTime.UtcNow;

            // Rule 3: ScheduledAt cannot be in the past
            if (scheduledAt < now.AddMinutes(-1))
                return BadRequest(new { message = "Scheduled date cannot be in the past." });

            // Rule 4: ScheduledAt cannot be more than 1 year ahead
            if (scheduledAt > now.AddYears(1))
                return BadRequest(new { message = "Scheduled date cannot be more than 1 year in the future." });

            job.ScheduledAt = scheduledAt;
        }

        if (request.Priority.HasValue)
        {
            // Rule 6: Max 5 active High Priority jobs per user (exclude current job)
            if (request.Priority.Value == JobPriority.High && job.Priority != JobPriority.High)
            {
                var activeHighCount = await _dbContext.Jobs.CountAsync(j =>
                    j.UserId == userId &&
                    j.Priority == JobPriority.High &&
                    (j.Status == "Pending" || j.Status == "Running") &&
                    j.Id != id);
                if (activeHighCount >= 5)
                    return BadRequest(new { message = "Maximum 5 active high-priority jobs allowed." });
            }
            job.Priority = request.Priority.Value;
        }

        if (request.Type.HasValue)
            job.Type = request.Type.Value;

        if (request.MaxRetries.HasValue)
        {
            // Rule 5: MaxRetries 1–10
            if (request.MaxRetries.Value < 1 || request.MaxRetries.Value > 10)
                return BadRequest(new { message = "MaxRetries must be between 1 and 10." });
            job.MaxRetries = request.MaxRetries.Value;
        }

        _dbContext.Jobs.Update(job);
        await _dbContext.SaveChangesAsync();

        return Ok(job);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
        if (job == null)
            return NotFound();

        _dbContext.Jobs.Remove(job);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id:guid}/logs")]
    public async Task<IActionResult> GetJobLogs(Guid id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var jobExists = await _dbContext.Jobs.AnyAsync(j => j.Id == id && j.UserId == userId);
        if (!jobExists)
            return NotFound();

        var logs = await _dbContext.JobExecutionLogs
            .Where(l => l.JobId == id)
            .OrderBy(l => l.CreatedAt)
            .ToListAsync();

        return Ok(logs);
    }

    public record CreateJobRequest(
        string Name,
        string? Description,
        JobType? Type,
        JobPriority? Priority,
        DateTime? ScheduledAt,
        int? MaxRetries);

    public record UpdateJobRequest(
        string? Name,
        string? Description,
        JobType? Type,
        JobPriority? Priority,
        DateTime? ScheduledAt,
        int? MaxRetries);
}
