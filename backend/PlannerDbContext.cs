using backend.Models;
using backend.Utilities;
using Microsoft.EntityFrameworkCore;
using Task = backend.Models.Task;

namespace backend;

public class PlannerDbContext : DbContext
{
    public PlannerDbContext(DbContextOptions<PlannerDbContext> options) : base(options)
    {
    }

    public DbSet<TaskList> TaskLists { get; set; }
    public DbSet<Task> Tasks { get; set; }
    public DbSet<Tag> Tags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tag>()
            .OwnsOne(tag => tag.Colour, colour =>
            {
                colour.Property(c => c.L).HasDefaultValue(100.0f);
                colour.Property(c => c.C).HasDefaultValue(0.0f);
                colour.Property(c => c.H).HasDefaultValue(0.0f);
            });
    }
}