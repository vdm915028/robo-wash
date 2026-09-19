using Microsoft.AspNetCore.Mvc;
using RoboWash.Api.Contracts;
using RoboWash.Api.Services;

namespace RoboWash.Api.Controllers;

[ApiController]
[Route("api/wash-locations")]
public class WashLocationsController(WashLocationService washLocationService) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<WashLocationResponse>> GetAll(CancellationToken cancellationToken)
    {
        var locations = await washLocationService.GetLocationsWithAvailableModesAsync(cancellationToken);

        return locations
            .Select(entry => new WashLocationResponse(
                entry.Location.Id,
                entry.Location.Address,
                entry.Location.Longitude,
                entry.Location.Latitude,
                entry.Location.RobotEquipmentGeneration,
                entry.Location.CarsInQueue,
                entry.AvailableModes
                    .Select(mode => new WashModeResponse(
                        mode.Id,
                        mode.Name,
                        mode.PriceRub,
                        mode.DurationMinutes,
                        mode.Description,
                        mode.Steps))
                    .ToList()))
            .ToList();
    }
}
