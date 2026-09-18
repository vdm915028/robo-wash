using Microsoft.EntityFrameworkCore;
using RoboWash.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<RoboWashDbContext>(options => options
    .UseNpgsql(builder.Configuration.GetConnectionString("RoboWash"))
    .UseSnakeCaseNamingConvention());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/", () => "service is up");

app.MapControllers();

app.Run();
