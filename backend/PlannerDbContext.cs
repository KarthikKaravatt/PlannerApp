using backend.Models;
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
}