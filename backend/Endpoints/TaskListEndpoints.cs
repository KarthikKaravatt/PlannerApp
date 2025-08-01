using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class TaskListEndpoints
{
    public static void MapTaskListEndpoints(this WebApplication app)
    {
        var taskListApi = app.MapGroup("/api/taskLists");
        //add a task list
        taskListApi.MapPut("/", async (PlannerDbContext db, TaskListRequest request) =>
        {
            var orderIndex = await db.TaskLists.CountAsync();
            var list = new TaskList
            {
                Id = Guid.CreateVersion7(),
                Name = request.Name,
                OrderIndex = (uint)orderIndex
            };
            await db.TaskLists.AddAsync(list);
            await db.SaveChangesAsync();
            return Results.Ok(list);
        });
        // get all task lists
        taskListApi.MapGet("/",
            async (PlannerDbContext db) =>
            {
                return await db.TaskLists.OrderBy(list => list.OrderIndex)
                    .Select(list => new TaskListPayload(list.Id, list.Name)).ToListAsync();
            });
        // get a task list
        taskListApi.MapGet("/{id:guid}", async (PlannerDbContext db, Guid id) =>
        {
            var taskList = await db.TaskLists.FindAsync(id);
            return taskList != null ? Results.Ok(taskList) : Results.NotFound();
        });
        // remove a task list
        taskListApi.MapDelete("/{id:guid}", async (PlannerDbContext db, Guid id) =>
        {
            var listToRemove = await db.TaskLists.FindAsync(id);
            var tasksToRemove = db.Tasks.Where(task => task.TaskListId == id);
            if (listToRemove == null) return Results.NotFound();
            db.TaskLists.Remove(listToRemove);
            db.Tasks.RemoveRange(tasksToRemove);
            //reindex everything
            uint count = 0;
            foreach (var list in db.TaskLists.OrderBy(list => list.OrderIndex))
            {
                list.OrderIndex = count;
                count++;
            }

            await db.SaveChangesAsync();
            return Results.Ok();
        });
        // update a taskList
        taskListApi.MapPatch("/{id:guid}", async (PlannerDbContext db, Guid id, TaskListUpdateRequest update) =>
        {
            var list = await db.TaskLists.FindAsync(id);
            if (list == null) return Results.NotFound();
            list.Name = update.Name;
            await db.SaveChangesAsync();
            return Results.Ok();
        });
        // get the order of all the task lists
        taskListApi.Map("/order", async (PlannerDbContext db) =>
        {
            var orderList = await db.TaskLists.Select(item => new { item.Id, item.OrderIndex })
                .OrderBy(t => t.OrderIndex).ToListAsync();
            return Results.Ok(orderList);
        });
        // clear completed
        taskListApi.MapDelete("/{listId:guid}/clear", async (PlannerDbContext db, Guid listId) =>
        {
            var tasksToDelete = await db.Tasks.Where(t => t.Completed && t.TaskListId == listId).ToListAsync();
            if (tasksToDelete.Count == 0) return Results.Ok();
            {
                db.Tasks.RemoveRange(tasksToDelete);
                var remainingTasks = await db.Tasks
                    .Where(t => !t.Completed && t.TaskListId == listId)
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
        //change a task lists order
        taskListApi.MapPatch("/move/{moveId:guid}",
            async (PlannerDbContext db, Guid moveId, TaskListMoveRequest request) =>
            {
                if (request.Position is not ("Before" or "After"))
                    return Results.BadRequest($"Invalid positional argument of: {request.Position}");

                if (moveId == request.TargetId) return Results.Ok();
                LinkedList<TaskList?> taskLists =
                    new(await db.TaskLists.OrderBy(list => list.OrderIndex).ToListAsync());
                var moveListItem = await db.TaskLists.FindAsync(moveId);
                var targetListItem = await db.TaskLists.FindAsync(request.TargetId);
                if (moveListItem is null || targetListItem is null) return Results.NotFound("Items not found");
                var moveList = taskLists.Find(moveListItem);
                var targetList = taskLists.Find(targetListItem);
                if (moveList is null || targetList is null) return Results.NotFound("Node not found");
                taskLists.Remove(moveList);
                switch (request.Position)
                {
                    case "Before":
                    {
                        taskLists.AddBefore(targetList, moveListItem);
                        break;
                    }
                    case "After":
                    {
                        taskLists.AddAfter(targetList, moveListItem);
                        break;
                    }
                }

                uint count = 0;
                foreach (var list in taskLists.OfType<TaskList>())
                {
                    list.OrderIndex = count;
                    count++;
                }

                await db.SaveChangesAsync();
                return Results.Ok();
            });
    }
}