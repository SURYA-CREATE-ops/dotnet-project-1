using Microsoft.EntityFrameworkCore;
using JobFlow.Domain.Entities;

namespace JobFlow.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Job> Jobs { get; set; } = null!;
    public DbSet<JobExecutionLog> JobExecutionLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Job>(b =>
        {
            b.HasKey(j => j.Id);
            b.Property(j => j.Name).IsRequired();
            b.HasOne<User>()
                .WithMany(u => u.Jobs)
                .HasForeignKey(j => j.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<JobExecutionLog>(b =>
        {
            b.HasKey(l => l.Id);
            b.Property(l => l.Message).IsRequired();
            b.HasOne<Job>()
                .WithMany(j => j.Logs)
                .HasForeignKey(l => l.JobId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
