using Microsoft.AspNetCore.Mvc;
using RoboWash.Api.Contracts;
using RoboWash.Api.Services;

namespace RoboWash.Api.Controllers;

[ApiController]
[Route("api/wash-sessions")]
public class WashSessionsController(WashSessionService washSessionService) : ControllerBase
{
    // Идентификатор устройства едет заголовком, а не в адресе: в адресе он попал бы в логи каждого запроса.
    const string DeviceIdHeader = "X-Device-Id";

    [HttpPost]
    public async Task<ActionResult<WashSessionResponse>> Create([FromHeader(Name = DeviceIdHeader)] string deviceId,
        CreateWashSessionRequest request, CancellationToken cancellationToken)
    {
        var washSession = await washSessionService.RecordWashAsync(deviceId, request.WashLocationId,
            request.WashModeId, cancellationToken);

        if (washSession is null)
            return Problem("Такого режима мойки на этой локации нет.", statusCode: StatusCodes.Status400BadRequest);

        return new WashSessionResponse
        {
            Id = washSession.Id,
            LocationAddress = washSession.LocationAddress,
            WashModeName = washSession.WashModeName,
            PriceRub = washSession.PriceRub,
            WashedAt = washSession.WashedAt,
        };
    }
}
