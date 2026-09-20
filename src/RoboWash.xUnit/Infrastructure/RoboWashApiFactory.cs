using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace RoboWash.xUnit.Infrastructure;

public class RoboWashApiFactory(string connectionString) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Окружение намеренно не Development. Источник ниже и так сильнее appsettings.Development.json, но
        // стоит ошибиться в имени ключа — и приложение возьмёт из того файла локальную базу разработчика.
        // Данные в ней те же, что разворачивает скрипт, так что падать будет нечему: тесты позеленеют,
        // ничего не проверив. Без Development файл не читается вовсе, и та же опечатка оставит строку пустой.
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration(configuration => configuration.AddInMemoryCollection(
            new Dictionary<string, string?> { ["ConnectionStrings:RoboWash"] = connectionString }));
    }
}
