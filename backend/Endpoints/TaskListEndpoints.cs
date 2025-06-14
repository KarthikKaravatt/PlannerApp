using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class TaskListEndpoints
{
    public static void MapTaskListEndpoints(this WebApplication app)
    {
        var taskListApi = app.MapGroup("/api/taskLists");
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
            Console.WriteLine("GET /api/taskLists/ endpoint hit!"); // Add this
            return (await db.TaskLists.OrderBy((list)=>list.OrderIndex).ToListAsync());
        });
        // remove a task list
        taskListApi.MapDelete("/{id:guid}", async (PlannerDbContext db, Guid id) =>
        {
            var listToRemove = await db.TaskLists.FindAsync(id);
            if (listToRemove == null) return Results.NotFound();
            db.TaskLists.Remove(listToRemove);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }
}