using Microsoft.AspNetCore.Mvc;
using JobFlow.Infrastructure.Persistence;

namespace JobFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public DatabaseController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("ping")]
    public async Task<IActionResult> Ping()
    {
        try
        {
            await _dbContext.Database.CanConnectAsync();
            
            var response = new { database = "connected" };
            return Ok(response);
        }
        catch (Exception ex)
        {
            var response = new { database = "failed", error = ex.Message };
            return Ok(response);
        }
    }
}
