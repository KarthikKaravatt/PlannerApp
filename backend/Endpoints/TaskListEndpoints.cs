using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
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
                Name =request.Name,
                OrderIndex = (uint)orderIndex
            };
            await db.TaskLists.AddAsync(list);
            await db.SaveChangesAsync();
            return Results.Ok(list);
        });
        // get all task lists
        taskListApi.MapGet("/", async (PlannerDbContext db) =>
        {
            return (await db.TaskLists.OrderBy((list)=>list.OrderIndex).Select((list)=> new TaskListPayload(list.Id, list.Name)).ToListAsync());
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
            var orderList = await db.TaskLists.Select(item => new { item.Id, item.OrderIndex }).ToListAsync();
            orderList.Sort(((x, y) => (int)x.OrderIndex-(int)y.OrderIndex));
            return Results.Ok(orderList);
        });
    }
}