using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using RoboWash.Api.Data;
using RoboWash.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    // Поколение оборудования уезжает на клиент строкой, как и записано в контракте: «Legacy» или «Modern».
    // По умолчанию System.Text.Json отдал бы порядковый номер, и клиент бы его не понял.
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddOpenApi();

builder.Services.AddDbContext<RoboWashDbContext>(options => options
    .UseNpgsql(builder.Configuration.GetConnectionString("RoboWash"))
    .UseSnakeCaseNamingConvention());

builder.Services.AddScoped<WashLocationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();
