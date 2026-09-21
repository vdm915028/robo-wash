using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RoboWash.Api.Contracts;
using RoboWash.Api.Data;
using RoboWash.xUnit.Infrastructure;

namespace RoboWash.xUnit;

// База на класс одна, поэтому каждый тест заводит себе новое устройство: иначе мойки одного теста попадали бы
// в историю другого, и результат зависел бы от порядка запуска.
public class WashSessionsEndpointTests(RoboWashApiFixture fixture) : IClassFixture<RoboWashApiFixture>
{
    const string WashSessionsUrl = "api/wash-sessions";
    const string DeviceIdHeader = "X-Device-Id";

    // Идентификаторы справочника из db/create-database.sql: identity раздаёт их в порядке вставки.
    const int ModernLocationId = 1;
    const int LegacyLocationId = 2;
    const int ExpressModeId = 1;
    const int StandardModeId = 2;
    const int LuxuryModeId = 3;

    [Fact]
    public async Task Recorded_wash_is_a_snapshot_of_the_location_and_mode()
    {
        var before = DateTimeOffset.UtcNow;
        var washSession = await RecordWashAsync(NewDeviceId(), ModernLocationId, LuxuryModeId);
        var after = DateTimeOffset.UtcNow;

        Assert.Equal("Невский пр., 100", washSession.LocationAddress);
        Assert.Equal("Люкс", washSession.WashModeName);
        Assert.Equal(950, washSession.PriceRub);

        // Сервер обрезает время до секунды, поэтому оно может оказаться чуть раньше момента, когда ушёл запрос.
        Assert.InRange(washSession.WashedAt, before.AddSeconds(-1), after);
        Assert.Equal(0, washSession.WashedAt.Ticks % TimeSpan.TicksPerSecond);
    }

    [Theory]
    [InlineData(LegacyLocationId, LuxuryModeId)]
    [InlineData(999, ExpressModeId)]
    [InlineData(ModernLocationId, 999)]
    public async Task Wash_that_was_never_offered_is_rejected_and_not_recorded(int washLocationId, int washModeId)
    {
        var deviceId = NewDeviceId();

        using var response = await PostWashSessionAsync(deviceId, washLocationId, washModeId);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(await GetHistoryAsync(deviceId));
    }

    [Fact]
    public async Task Requests_without_a_device_id_are_rejected()
    {
        using var recordResponse = await fixture.Client.PostAsJsonAsync(WashSessionsUrl,
            new CreateWashSessionRequest { WashLocationId = ModernLocationId, WashModeId = ExpressModeId });
        using var historyResponse = await fixture.Client.GetAsync(WashSessionsUrl);

        Assert.Equal(HttpStatusCode.BadRequest, recordResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, historyResponse.StatusCode);
    }

    [Fact]
    public async Task History_holds_only_this_device_newest_first()
    {
        var deviceId = NewDeviceId();
        await RecordWashAsync(deviceId, LegacyLocationId, StandardModeId);
        await RecordWashAsync(NewDeviceId(), ModernLocationId, LuxuryModeId);

        // Эта мойка новее по id, но вчерашняя по времени: в конец истории её ставит только сортировка по времени.
        var yesterdaysWash = await RecordWashAsync(deviceId, ModernLocationId, ExpressModeId);
        await MoveToYesterdayAsync(yesterdaysWash.Id);

        var history = await GetHistoryAsync(deviceId);

        Assert.Equal(["Стандарт", "Экспресс"], history.Select(s => s.WashModeName));
    }

    [Fact]
    public async Task History_matches_the_shape_the_client_expects()
    {
        var deviceId = NewDeviceId();
        await RecordWashAsync(deviceId, ModernLocationId, ExpressModeId);

        using var request = new HttpRequestMessage(HttpMethod.Get, WashSessionsUrl);
        request.Headers.Add(DeviceIdHeader, deviceId);
        using var response = await fixture.Client.SendAsync(request);
        using var history = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        var washSession = history.RootElement[0];
        Assert.Equal(["id", "locationAddress", "washModeName", "priceRub", "washedAt"],
            washSession.EnumerateObject().Select(p => p.Name));

        // Разбирать дробную часть длиннее трёх знаков JavaScript не обязан, поэтому проверяем строку на проводе:
        // DateTimeOffset на нашей стороне проглотил бы и микросекунды.
        Assert.Matches(@"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$", washSession.GetProperty("washedAt").GetString());
    }

    static string NewDeviceId() => Guid.NewGuid().ToString();

    async Task<HttpResponseMessage> PostWashSessionAsync(string deviceId, int washLocationId, int washModeId)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, WashSessionsUrl)
        {
            Content = JsonContent.Create(new CreateWashSessionRequest
            {
                WashLocationId = washLocationId,
                WashModeId = washModeId,
            }),
        };
        request.Headers.Add(DeviceIdHeader, deviceId);

        return await fixture.Client.SendAsync(request);
    }

    async Task<WashSessionResponse> RecordWashAsync(string deviceId, int washLocationId, int washModeId)
    {
        using var response = await PostWashSessionAsync(deviceId, washLocationId, washModeId);
        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<WashSessionResponse>())!;
    }

    async Task MoveToYesterdayAsync(int washSessionId)
    {
        using var scope = fixture.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RoboWashDbContext>();

        var washSession = await db.WashSessions.SingleAsync(s => s.Id == washSessionId);
        washSession.WashedAt = washSession.WashedAt.AddDays(-1);
        await db.SaveChangesAsync();
    }

    async Task<IReadOnlyList<WashSessionResponse>> GetHistoryAsync(string deviceId)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, WashSessionsUrl);
        request.Headers.Add(DeviceIdHeader, deviceId);
        using var response = await fixture.Client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<List<WashSessionResponse>>())!;
    }
}
