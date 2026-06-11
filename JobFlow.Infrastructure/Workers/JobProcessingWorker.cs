using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using JobFlow.Infrastructure.Persistence;
using JobFlow.Domain.Entities;

namespace JobFlow.Infrastructure.Workers;

public class JobProcessingWorker : BackgroundService
{
    private readonly ILogger<JobProcessingWorker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public JobProcessingWorker(ILogger<JobProcessingWorker> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("JobProcessingWorker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var job = await db.Jobs
                    .Where(j => j.Status == "Pending")
                    .OrderBy(j => j.CreatedAt)
                    .FirstOrDefaultAsync(stoppingToken);

                if (job != null)
                {
                    _logger.LogInformation("Picked job {JobId} (user {UserId})", job.Id, job.UserId);

                    job.Status = "Running";
                    await db.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation("Job {JobId} status set to Running", job.Id);

                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

                    job.Status = "Completed";
                    await db.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation("Job {JobId} completed", job.Id);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // graceful shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in JobProcessingWorker loop");
            }

            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}
