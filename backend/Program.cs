using System.Text.Json.Serialization;
using backend;
using Microsoft.AspNetCore.Http.HttpResults;
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
    app.MapPost("/api/tasks", async (PlannerDbContext db, TaskRequest request) =>
    {
        var orderIndex = (uint)await db.TaskList.CountAsync();
        var task = new Task(request.Label, request.Completed, request.DueDate, orderIndex);
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
    // Update a task
    app.MapPatch("/api/tasks/{id:guid}", async (PlannerDbContext db, Task taskUpload) =>
    {
        var oldTask = await db.TaskList.FindAsync(taskUpload.Id);
        if (oldTask == null) return Results.NotFound();
        //TODO: validate this properly
        oldTask.OrderIndex = taskUpload.OrderIndex;
        oldTask.Completed = taskUpload.Completed;
        oldTask.DueDate = taskUpload.DueDate;
        oldTask.Label = taskUpload.Label;
        db.TaskList.Update(oldTask);
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
    // clear completed
    app.MapDelete("/api/tasks/clear", async (PlannerDbContext db) =>
    {
        var tasksToDelete = await db.TaskList.Where(t => t.Completed).ToListAsync();
        if (tasksToDelete.Count != 0)
        {
            
            db.TaskList.RemoveRange(tasksToDelete);
            var remainingTasks = await db.TaskList
                .Where(t => !t.Completed) 
                .OrderBy(t => t.OrderIndex) 
                .ToListAsync();
            uint count = 0;
            foreach (var task in remainingTasks) 
            {
                task.OrderIndex = count;
                count++;
            }

            await db.SaveChangesAsync();
            return Results.Ok();
        }

        return Results.NotFound();
    });
    // swap task orders
    app.MapPatch("/api/tasks/swap/{id1:guid}/{id2:guid}", async (Guid id1, Guid id2, PlannerDbContext db) =>
    {
        var task1 = await db.TaskList.FindAsync(id1);
        var task2 = await db.TaskList.FindAsync(id2);

        if (task1 == null || task2 == null)
        {
            return Results.NotFound();
        }
        (task1.OrderIndex, task2.OrderIndex) = (task2.OrderIndex, task1.OrderIndex);
        db.UpdateRange([task1, task2]);
        
        await db.SaveChangesAsync();

        return Results.Ok();
    });
    // Move a tasks position
    app.MapPatch("/api/tasks/move/{id1:guid}/{id2:guid}", async (Guid id1, Guid id2,MoveTaskRequest request, PlannerDbContext db) =>
    {
        if (id1 == id2)
        {
            return Results.Ok();
        }
        var task1 = await db.TaskList.FindAsync(id1);
        var task2 = await db.TaskList.FindAsync(id2);
        if (task1 == null || task2 == null)
        {
            return Results.NotFound();
        }
        var taskList = await db.TaskList.ToListAsync();
        taskList.Sort((a, b) => (int)a.OrderIndex - (int)b.OrderIndex);
        var taskLinkedList = new LinkedList<Task>(taskList);
        //re index orderIndex
        taskLinkedList.Remove(task1);
        var posTaskNode = taskLinkedList.Find(task2);
        if (posTaskNode == null)
        {
            return Results.NotFound();
        }
        switch (request.Pos)
        {
            case "After":
                taskLinkedList.AddAfter(posTaskNode, task1);
                break;
            case "Before":
                taskLinkedList.AddBefore(posTaskNode, task1);
                break;
        }
        uint count = 0;
        foreach (var t in taskLinkedList)
        {
            t.OrderIndex = count;
            count++;
        }

        await db.SaveChangesAsync();
        //case 4 task is only one in the list (probably wont be able to be moved)
        return Results.Ok();

    });
    app.Run();
}

Main();



