using Npgsql;
using Testcontainers.PostgreSql;

namespace RoboWash.xUnit.Infrastructure;

// Контейнер поднимается один раз на класс тестов: его старт стоит секунды, а разворачивание схемы —
// миллисекунды. Подменять Postgres in-memory провайдером нельзя: мимо проверки прошло бы ровно то, что
// и может сломаться, — snake_case, text[] и enum строкой.
public class RoboWashApiFixture : IAsyncLifetime
{
    // Версия та же, на которой проверялся db/create-database.sql: скрипт пишется под конкретный сервер.
    readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:17")
        .WithResourceMapping(new FileInfo(Path.Combine(AppContext.BaseDirectory, ScriptFile)), ScriptDirectory)
        .Build();

    RoboWashApiFactory? _api;

    const string ScriptFile = "create-database.sql";
    const string ScriptDirectory = "/tmp/";
    const string DatabaseName = "robowash";

    public HttpClient Client { get; private set; } = null!;

    public IServiceProvider Services => _api!.Services;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        await CreateDatabaseAsync();

        // Контейнер отдаёт строку подключения к служебной базе, а скрипт создаёт рядом свою и работает в ней.
        var connectionString = new NpgsqlConnectionStringBuilder(_postgres.GetConnectionString())
        {
            Database = DatabaseName
        }.ConnectionString;

        _api = new RoboWashApiFactory(connectionString);
        Client = _api.CreateClient();
    }

    public async Task DisposeAsync()
    {
        // Фабрики может и не быть — инициализация падает на старте контейнера или на скрипте. Контейнер
        // при этом гасим всегда, иначе брошенный Postgres переживёт прогон.
        if (_api is not null)
        {
            Client.Dispose();
            await _api.DisposeAsync();
        }

        await _postgres.DisposeAsync();
    }

    // Схему разворачивает тот же файл и та же команда, что описаны в README. Перестанет скрипт отрабатывать
    // на чистом сервере — это упадёт здесь, а не у человека, разворачивающего проект впервые.
    async Task CreateDatabaseAsync()
    {
        var result = await _postgres.ExecAsync(["psql", "-U", "postgres", "-f", ScriptDirectory + ScriptFile]);

        if (result.ExitCode != 0)
            throw new InvalidOperationException($"db/{ScriptFile} не отработал: {result.Stderr}");
    }
}
