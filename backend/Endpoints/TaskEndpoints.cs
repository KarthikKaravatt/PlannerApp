using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class TaskEndpoints
{
    public static void MapTaskEndpoints(this WebApplication app)
    {
        var tasksApi = app.MapGroup("/api/taskLists/{listId:guid}/tasks");
        // Get all tasks
        tasksApi.MapGet("/", async (PlannerDbContext db, Guid listId) =>
        {
            var tasks = await db.Tasks
                .Where(t => t.TaskListId == listId)
                .Select(task => new TaskPayLoad(task.Id,task.Label, task.Completed, task.DueDate)).ToListAsync();
            return Results.Ok(tasks);
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
        //Get the Order of the tasks
        tasksApi.MapGet("/order", async (PlannerDbContext db, Guid listId) =>
        {
            var taskListOrder = await db.Tasks
                .Where(task => task.TaskListId == listId)
                .Select(task => new { task.Id, task.OrderIndex })
                .ToListAsync();
            return Results.Ok(taskListOrder);
        });
        // Update a task
        tasksApi.MapPatch("/{id:guid}", async (PlannerDbContext db, TaskPayLoad taskUpload, Guid id) =>
        {
            var oldTask = await db.Tasks.FindAsync(id);
            if (oldTask == null) return Results.NotFound();
            //TODO: validate this properly
            oldTask.Completed = taskUpload.Completed;
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
            if (task == null)
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
        // clear completed
        tasksApi.MapDelete("/clear", async (PlannerDbContext db) =>
        {
            var tasksToDelete = await db.Tasks.Where(t => t.Completed).ToListAsync();
            if (tasksToDelete.Count == 0) return Results.Ok();
            {
                db.Tasks.RemoveRange(tasksToDelete);
                var remainingTasks = await db.Tasks
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

                var task1 = await db.Tasks.FindAsync(id1);
                var task2 = await db.Tasks.FindAsync(id2);
                if (task1 == null || task2 == null)
                {
                    return Results.NotFound();
                }

                var taskList = await db.Tasks.ToListAsync();
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