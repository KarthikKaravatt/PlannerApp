using backend.Models;
using Microsoft.EntityFrameworkCore;
using Task = backend.Models.Task;

namespace backend.Endpoints;

public static class TaskEndpoints
{
    public static void MapTaskEndpoints(this WebApplication app)
    {
        var tasksApi = app.MapGroup("/api/taskLists/{listId:guid}/tasks");
        // Get all tasks (incomplete)
        tasksApi.MapGet("/incomplete", async (PlannerDbContext db, Guid listId) =>
        {
            var tasks = await db.Tasks
                .Where(t => t.TaskListId == listId && t.Completed == false)
                .Select(task => new TaskPayLoad(task.Id,task.Label, task.Completed, task.DueDate)).ToListAsync();
            return Results.Ok(tasks);
        });
        //get all tasks
        tasksApi.MapGet("/complete", async (PlannerDbContext db, Guid listId) =>
        {
            var tasks = await db.Tasks
                .Where(t => t.TaskListId == listId && t.Completed == true)
                .Select(task => new TaskPayLoad(task.Id,task.Label, task.Completed, task.DueDate)).ToListAsync();
            return Results.Ok(tasks);
        });
        //Get the Order of the tasks(incomplete)
        tasksApi.MapGet("/incomplete/order", async (PlannerDbContext db, Guid listId) =>
        {
            var taskListOrder = await db.Tasks
                .Where(task => task.TaskListId == listId && task.Completed == false)
                .Select(task => new { task.Id, task.OrderIndex })
                .OrderBy(t=> t.OrderIndex)
                .ToListAsync();
            return Results.Ok(taskListOrder);
        });
        //Get the Order of the complete tasks
        tasksApi.MapGet("/complete/order", async (PlannerDbContext db, Guid listId) =>
        {
            var taskListOrder = await db.Tasks
                .Where(task => task.TaskListId == listId && task.Completed == true)
                .Select(task => new { task.Id, task.OrderIndex })
                .OrderBy(t=> t.OrderIndex)
                .ToListAsync();
            return Results.Ok(taskListOrder);
        });
        // Add a task
        tasksApi.MapPost("/", async (PlannerDbContext db, TaskRequest request, Guid listId) =>
        {
            var orderIndex = (uint)await db.Tasks.Where(t => t.TaskListId == listId).CountAsync();
            var task = new Task(request.Label, request.Completed, request.DueDate, orderIndex,listId );
            await db.AddAsync(task);
            await db.SaveChangesAsync();
            return Results.Created($"/api/tasks/{task.Id}", task);
        });

        //complete a task
        tasksApi.MapPatch("/{id:guid}/toggle-completion", async (PlannerDbContext db, Guid id, Guid listId) =>
        {
            var task = await db.Tasks.FindAsync(id);
            var tasks = db.Tasks.Where(t => t.TaskListId == listId);
            if (task is null) return Results.NotFound();

            if (task.Completed)
            {
                var newIndex = (uint) await tasks
                    .Where(t => !t.Completed).CountAsync() - 1;
                task.OrderIndex = newIndex;
            }
            else
            { 
                var newIndex = (uint) await tasks
                    .Where(t => t.Completed).CountAsync() - 1;
                task.OrderIndex = newIndex;
            }
            task.Completed = !task.Completed;
            await db.SaveChangesAsync();
            return Results.Ok();
        });
        tasksApi.MapPatch("/{id:guid}", async (PlannerDbContext db, UpdateTaskPayLoad taskUpload, Guid id) =>
        {
            var oldTask = await db.Tasks.FindAsync(id);
            if (oldTask is null) return Results.NotFound();
            //TODO: validate this properly
            oldTask.DueDate = taskUpload.DueDate;
            oldTask.Label = taskUpload.Label;
            db.Tasks.Update(oldTask);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
        // Delete a task
        tasksApi.MapDelete("/{id:guid}", async (Guid id, PlannerDbContext db, Guid listId) =>
        {
            var task = await db.Tasks.FindAsync(id);
            Console.WriteLine(id);
            if (task is null)
            {
                return Results.NotFound();
            }
            db.Remove(task);
            await db.Tasks
                .Where(t => t.OrderIndex > task.OrderIndex && t.TaskListId == listId)
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(t => t.OrderIndex, t => t.OrderIndex - 1));
            await db.SaveChangesAsync();
            return Results.Ok();
        });
        

        // Move a tasks position
        tasksApi.MapPatch("/move/{movedTaskId:guid}/",
            async (PlannerDbContext db,Guid listId, Guid movedTaskId, MoveTaskRequest request) =>
            {
                // moving a task to its current position will nothing
                if (movedTaskId == request.TargetTaskId)
                {
                    return Results.Ok();
                }

                if (request.Pos is not ("Before" or "After"))
                {
                    return Results.BadRequest("Invalid positional arguments");
                }

                var movedTask = await db.Tasks.FindAsync(movedTaskId);
                var targetTask = await db.Tasks.FindAsync(request.TargetTaskId);
                if (movedTask is null || targetTask is null)
                {
                    return Results.NotFound();
                }
                var taskLinkedList = new LinkedList<Task>(
                     await db.Tasks
                        .Where(task => task.TaskListId == listId)
                        .OrderBy(task => task.OrderIndex)
                        .ToListAsync()
                );
                taskLinkedList.Remove(movedTask);
                var posTaskNode = taskLinkedList.Find(targetTask);
                if (posTaskNode is null)
                {
                    return Results.NotFound();
                }

                switch (request.Pos)
                {
                    case "After":
                        taskLinkedList.AddAfter(posTaskNode, movedTask);
                        break;
                    case "Before":
                        taskLinkedList.AddBefore(posTaskNode, movedTask);
                        break;
                }

                uint count = 0;
                foreach (var t in taskLinkedList)
                {
                    t.OrderIndex = count;
                    count++;
                }

                await db.SaveChangesAsync();
                return Results.Ok();
            });
    }
}