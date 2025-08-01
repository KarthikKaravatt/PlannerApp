using backend;
using backend.Endpoints;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<PlannerDbContext>(opt => opt.UseSqlite("Data Source=planner.db"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policyBuilder =>
    {
        // For development without Cors errors
        policyBuilder.WithOrigins("http://localhost:4173")
            .AllowAnyHeader()
            .AllowAnyMethod();
        policyBuilder.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
var app = builder.Build();
app.UseCors();
app.MapTaskListEndpoints();
app.MapTaskEndpoints();
app.MapTagEndpoints();
app.Run();