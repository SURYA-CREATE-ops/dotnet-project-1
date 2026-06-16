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

        await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                if (!await db.Database.CanConnectAsync(stoppingToken))
                {
                    _logger.LogWarning("Database connection unavailable, will retry in 10 seconds");
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                    continue;
                }

                var currentUtc = DateTime.UtcNow;
                var job = await db.Jobs
                    .Where(j => j.Status == "Pending" && j.ScheduledAt <= currentUtc)
                    .OrderByDescending(j => j.Priority)
                    .ThenBy(j => j.CreatedAt)
                    .FirstOrDefaultAsync(stoppingToken);

                if (job != null)
                {
                    _logger.LogInformation("Picked job {JobId} (Priority: {Priority})", job.Id, job.Priority);

                    job.Status = "Running";
                    await db.SaveChangesAsync(stoppingToken);

                    await AddLog(db, job.Id, "Worker started processing.", stoppingToken);

                    try
                    {
                        if (job.Name.Contains("FAIL", StringComparison.OrdinalIgnoreCase))
                            throw new Exception("Simulated job failure");

                        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

                        job.Status = "Completed";
                        job.ErrorMessage = null;
                        await db.SaveChangesAsync(stoppingToken);

                        await AddLog(db, job.Id, "Job completed successfully.", stoppingToken);
                        _logger.LogInformation("Job {JobId} completed", job.Id);
                    }
                    catch (Exception jobEx)
                    {
                        job.RetryCount++;
                        job.ErrorMessage = jobEx.Message;

                        if (job.RetryCount < job.MaxRetries)
                        {
                            job.Status = "Pending";
                            await db.SaveChangesAsync(stoppingToken);
                            await AddLog(db, job.Id,
                                $"Retry attempt {job.RetryCount} of {job.MaxRetries}. Error: {jobEx.Message}",
                                stoppingToken);
                            _logger.LogWarning(jobEx, "Job {JobId} will retry (attempt {RetryCount})", job.Id, job.RetryCount);
                        }
                        else
                        {
                            job.Status = "Failed";
                            await db.SaveChangesAsync(stoppingToken);
                            await AddLog(db, job.Id,
                                $"Job failed after {job.RetryCount} attempt(s). Error: {jobEx.Message}",
                                stoppingToken);
                            _logger.LogError(jobEx, "Job {JobId} failed after {RetryCount} attempts", job.Id, job.RetryCount);
                        }
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

    private static async Task AddLog(ApplicationDbContext db, Guid jobId, string message, CancellationToken ct)
    {
        db.JobExecutionLogs.Add(new JobExecutionLog
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            Message = message,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync(ct);
    }
}
