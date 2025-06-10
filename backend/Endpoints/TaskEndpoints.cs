using backend.Models;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace backend.Endpoints;

public static class TaskEndpoints
{
    public static void MapTaskEndpoints(this WebApplication app)
    {
        var tasksApi = app.MapGroup("/api/tasks");
        // Get all tasks
        tasksApi.MapGet("/", async (PlannerDbContext db) =>
        {
            var payloadList = new List<TaskPayLoad>();
            await db.TaskList.ForEachAsync((task) =>
            {
                var payload = new TaskPayLoad(task.Id, task.Label, task.Completed, task.DueDate);
                payloadList.Add(payload);
            });
            return Results.Ok(payloadList);
        });
        // Add a task
        tasksApi.MapPost("/", async (PlannerDbContext db, TaskRequest request) =>
        {
            var orderIndex = (uint)await db.TaskList.CountAsync();
            var task = new Task(request.Label, request.Completed, request.DueDate, orderIndex);
            await db.AddAsync(task);
            await db.SaveChangesAsync();
            return Results.Created($"/api/tasks/{task.Id}", task);
        });
        //Get the Order of the tasks
        tasksApi.MapGet("/order", async (PlannerDbContext db) =>
        {
            var taskListOrder = await db.TaskList.Select(t => new { t.Id, t.OrderIndex }).ToListAsync();
            return Results.Ok(taskListOrder);
        });
        // Get a specific task
        tasksApi.MapGet("/{id:guid}", async (Guid id, PlannerDbContext db) =>
            await db.TaskList.FindAsync(id)
                is { } task
                ? Results.Ok(new TaskPayLoad(task.Id, task.Label, task.Completed, task.DueDate))
                : Results.NotFound()
        );
        // Update a task
        tasksApi.MapPatch("/{id:guid}", async (PlannerDbContext db, TaskPayLoad taskUpload) =>
        {
            var oldTask = await db.TaskList.FindAsync(taskUpload.Id);
            if (oldTask == null) return Results.NotFound();
            //TODO: validate this properly
            oldTask.Completed = taskUpload.Completed;
            oldTask.DueDate = taskUpload.DueDate;
            oldTask.Label = taskUpload.Label;
            db.TaskList.Update(oldTask);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
        // Delete a task
        tasksApi.MapDelete("/{id:guid}", async (Guid id, PlannerDbContext db) =>
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
        tasksApi.MapDelete("/clear", async (PlannerDbContext db) =>
        {
            var tasksToDelete = await db.TaskList.Where(t => t.Completed).ToListAsync();
            if (tasksToDelete.Count == 0) return Results.Ok();
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
            }
            return Results.Ok();
        });

        // Move a tasks position
        tasksApi.MapPatch("/move/{id1:guid}/{id2:guid}",
            async (Guid id1, Guid id2, MoveTaskRequest request, PlannerDbContext db) =>
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
    }
}