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
using JobFlow.Domain.Enums;

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
                    .OrderByDescending(j => j.Priority)
                    .ThenBy(j => j.CreatedAt)
                    .FirstOrDefaultAsync(stoppingToken);

                if (job != null)
                {
                    _logger.LogInformation("Picked job {JobId} (user {UserId})", job.Id, job.UserId);
                    _logger.LogInformation("Priority: {Priority}", job.Priority);

                    job.Status = "Running";
                    await db.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation("Job {JobId} status set to Running", job.Id);

                    try
                    {
                        if (job.Name.Contains("FAIL", StringComparison.OrdinalIgnoreCase))
                        {
                            throw new Exception("Simulated job failure");
                        }

                        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

                        job.Status = "Completed";
                        job.ErrorMessage = null;
                        await db.SaveChangesAsync(stoppingToken);

                        _logger.LogInformation("Job {JobId} completed", job.Id);
                        _logger.LogInformation("Priority: {Priority}", job.Priority);
                    }
                    catch (Exception jobEx)
                    {
                        job.RetryCount++;
                        job.ErrorMessage = jobEx.Message;

                        if (job.RetryCount < job.MaxRetries)
                        {
                            job.Status = "Pending";
                            _logger.LogWarning(jobEx, "Job {JobId} failed and will retry (attempt {RetryCount})", job.Id, job.RetryCount);
                        }
                        else
                        {
                            job.Status = "Failed";
                            _logger.LogError(jobEx, "Job {JobId} failed after {RetryCount} attempts and is marked Failed", job.Id, job.RetryCount);
                        }

                        await db.SaveChangesAsync(stoppingToken);
                    }
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
