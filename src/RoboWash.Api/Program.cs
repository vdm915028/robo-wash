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

// Клиент развёрнут отдельным сервисом Cloud Run и приходит с чужого origin, поэтому браузер без
// разрешения не отдаст ему ответ. Мобильные клиенты этой проверки не делают — CORS живёт в браузере.
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services.AddDbContext<RoboWashDbContext>(options => options
    .UseNpgsql(builder.Configuration.GetConnectionString("RoboWash"))
    .UseSnakeCaseNamingConvention());

builder.Services.AddScoped<WashLocationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.MapControllers();

app.Run();

// WebApplicationFactory в интеграционных тестах поднимает приложение по типу точки входа, а у файла
// с операторами верхнего уровня класс Program генерируется internal. Объявление открывает его тестам.
public partial class Program;
