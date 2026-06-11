using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobFlow.Domain.Entities;
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

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var job = new Job
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _dbContext.Jobs.Add(job);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, job);
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var jobs = await _dbContext.Jobs.Where(j => j.UserId == userId).ToListAsync();
        return Ok(jobs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
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

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
        if (job == null)
            return NotFound();

        job.Name = request.Name ?? job.Name;
        job.Description = request.Description ?? job.Description;

        _dbContext.Jobs.Update(job);
        await _dbContext.SaveChangesAsync();

        return Ok(job);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var job = await _dbContext.Jobs.FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);
        if (job == null)
            return NotFound();

        _dbContext.Jobs.Remove(job);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    public record CreateJobRequest(string Name, string? Description);
    public record UpdateJobRequest(string? Name, string? Description);
}
