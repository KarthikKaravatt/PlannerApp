using System.Text.Json;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints;

public static class TagEndpoints
{
    public static void MapTagEndpoints(this WebApplication app)
    {
        var tagApi = app.MapGroup("/api/tags");
        //Get all tags
        tagApi.MapGet("/", async (PlannerDbContext db) =>
        {
            var tags  = await db.Tags.ToListAsync();
            return Results.Ok(tags);
        });
        //Add a tag
        tagApi.MapPut("/", async (PlannerDbContext db, NewTagRequest request) =>
        {
            var tag = new Tag(request.Name, request.Colour);
            await db.Tags.AddAsync(tag);
            await db.SaveChangesAsync();
            return Results.Ok(tag.Id);
        });
        // remove a tag
        tagApi.MapDelete("/{tagId:guid}", async (PlannerDbContext db, Guid tagId) =>
        {
            var tag = await db.Tags.FindAsync(tagId);
            if (tag is null) return Results.NotFound();
            db.Tags.Remove(tag);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
        // change a tag
        tagApi.MapPatch("/{tagId:guid}", async (PlannerDbContext db, Guid tagId, NewTagRequest request) =>
        {
            var tag = await db.Tags.FindAsync(tagId);
            if (tag is null) return Results.NotFound();
            // check before doing db update (tags is indexed)
            if (!tag.Name.Equals(request.Name)) tag.Name = request.Name;

            if (!tag.Colour.Equals(request.Colour)) tag.Colour = request.Colour;
            await db.SaveChangesAsync();
            return Results.Ok();
        });
        //get all taskId's belonging to a tag (used for deleting a tag and removing it from all tasks)
    }
}