using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using RoboWash.Api.Contracts;
using RoboWash.Api.Enums;
using RoboWash.xUnit.Infrastructure;

namespace RoboWash.xUnit;

public class WashLocationsEndpointTests(RoboWashApiFixture fixture) : IClassFixture<RoboWashApiFixture>
{
    const string WashLocationsUrl = "api/wash-locations";

    // Читаем ответ так же, как его прочитал бы клиент: camelCase и поколение оборудования строкой.
    static readonly JsonSerializerOptions ClientOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    [Fact]
    public async Task Returns_the_reference_data_the_script_seeded()
    {
        var locations = await GetLocationsAsync();

        Assert.Equal(7, locations.Count);

        var nevsky = locations[0];
        Assert.Equal("Невский пр., 100", nevsky.Address);
        Assert.Equal(30.3608, nevsky.Longitude);
        Assert.Equal(59.9319, nevsky.Latitude);
        Assert.Equal(RobotEquipmentGeneration.Modern, nevsky.RobotEquipmentGeneration);
        Assert.Equal(2, nevsky.CarsInQueue);

        // Шаги лежат в text[]: пустой список означал бы, что маппинг массива отвалился.
        Assert.All(nevsky.WashModes, m => Assert.NotEmpty(m.Steps));
    }

    [Fact]
    public async Task Location_offers_only_the_modes_its_robots_can_run()
    {
        var locations = await GetLocationsAsync();

        var legacy = locations.Where(l => l.RobotEquipmentGeneration == RobotEquipmentGeneration.Legacy).ToList();
        var modern = locations.Where(l => l.RobotEquipmentGeneration == RobotEquipmentGeneration.Modern).ToList();

        Assert.NotEmpty(legacy);
        Assert.NotEmpty(modern);

        // «Люкс» — единственный режим с requires_modern_equipment в db/create-database.sql.
        Assert.All(modern, l => Assert.Contains(l.WashModes, m => m.Name == "Люкс"));
        Assert.All(legacy, l => Assert.DoesNotContain(l.WashModes, m => m.Name == "Люкс"));
    }

    [Fact]
    public async Task Response_matches_the_shape_the_client_expects()
    {
        using var response = JsonDocument.Parse(await fixture.Client.GetStringAsync(WashLocationsUrl));

        var location = response.RootElement[0];
        Assert.Equal(["id", "address", "longitude", "latitude", "robotEquipmentGeneration", "carsInQueue",
            "washModes"], location.EnumerateObject().Select(p => p.Name));

        // Клиент ждёт 'Legacy' | 'Modern' строкой. По типизированной модели это не поймать:
        // JsonStringEnumConverter на нашей стороне разберёт и число, а TypeScript — нет.
        Assert.Equal(JsonValueKind.String, location.GetProperty("robotEquipmentGeneration").ValueKind);

        Assert.Equal(["id", "name", "priceRub", "durationMinutes", "description", "steps"],
            location.GetProperty("washModes")[0].EnumerateObject().Select(p => p.Name));
    }

    async Task<IReadOnlyList<WashLocationResponse>> GetLocationsAsync()
    {
        using var response = await fixture.Client.GetAsync(WashLocationsUrl);
        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<List<WashLocationResponse>>(ClientOptions))!;
    }
}
