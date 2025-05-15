using Microsoft.EntityFrameworkCore;

namespace backend;

public class PlannerDbContext:DbContext
{
    public PlannerDbContext(DbContextOptions<PlannerDbContext> options): base(options) {}
    public DbSet<Task> TaskList { get; set; }
}