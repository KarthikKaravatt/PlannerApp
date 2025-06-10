using System.Text.Json.Serialization;
using backend;
using backend.Endpoints;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Task = backend.Task;


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
app.MapTaskEndpoints();
app.Run();





