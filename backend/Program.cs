using backend;
using Microsoft.EntityFrameworkCore;
using Task = backend.Task;

void Main()
{
    var builder = WebApplication.CreateBuilder(args);
    builder.Services.AddDbContext<PlannerDbContext>(opt => opt.UseSqlite("Data Source=planner.db"));
    builder.Services.AddDatabaseDeveloperPageExceptionFilter();
    builder.Services.AddCors((options =>
    {
        options.AddDefaultPolicy(policyBuilder =>
        {
            // For development without Cors errors
            policyBuilder.WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    }));
    var app = builder.Build();
    app.UseCors();
    // Get all tasks
    app.MapGet("/api/tasks", async (PlannerDbContext db) => await db.TaskList.ToListAsync());
    // Add a task
    app.MapPost("/api/tasks", async (PlannerDbContext db, Task task) =>
    {
        await db.AddAsync(task);
        await db.SaveChangesAsync();
        return Results.Created($"/api/tasks/{task.Id}", task);
    });
    // Get a specific task
    app.MapGet("/api/tasks/{id:guid}", async (Guid id, PlannerDbContext db) =>
        await db.TaskList.FindAsync(id)
            is { } task
            ? Results.Ok(task)
            : Results.NotFound()
    );
    // Change a task
    app.MapPut("/api/tasks/{id:guid}", async (PlannerDbContext db, TaskRequest request, Guid id) =>
    {
        var oldTask = await db.TaskList.FindAsync(id);
        if (oldTask == null) return Results.NotFound();
        var task = new Task(request.Label, request.Completed, request.DueDate, oldTask.OrderIndex, id);
        db.Remove(oldTask);
        await db.AddAsync(task);
        await db.SaveChangesAsync();
        return Results.Ok();
    });
    // Delete a task
    app.MapDelete("/api/tasks/{id:guid}", async (Guid id, PlannerDbContext db) =>
    {
        var task = await db.TaskList.FindAsync(id);
        Console.WriteLine(id);
        if (task == null)
        {
            return Results.NotFound();
        }

        db.Remove(task);
        await db.TaskList
            .Where(t => t.OrderIndex > task.OrderIndex)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(t => t.OrderIndex, t => t.OrderIndex - 1));
        await db.SaveChangesAsync();
        return Results.Ok();

    });
    // swap task orders
    app.MapPut("/api/tasks/{id1:guid}/{id2:guid}", async (Guid id1, Guid id2, PlannerDbContext db) =>
    {
        var task1 = await db.TaskList.FindAsync(id1);
        var task2 = await db.TaskList.FindAsync(id2);

        if (task1 == null || task2 == null)
        {
            return Results.NotFound();
        }
        
        var newTask1 = task1 with { OrderIndex = task2.OrderIndex };
        var newTask2 = task2 with { OrderIndex = task1.OrderIndex };

        db.Entry(task1).CurrentValues.SetValues(newTask1);
        db.Entry(task2).CurrentValues.SetValues(newTask2);
        
        await db.SaveChangesAsync();

        return Results.Ok();
    });
    app.Run();
}

Main();



