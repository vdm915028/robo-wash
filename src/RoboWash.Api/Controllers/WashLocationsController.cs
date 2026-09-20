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

        return locations.Select(l => new WashLocationResponse
        {
            Id = l.Location.Id,
            Address = l.Location.Address,
            Longitude = l.Location.Longitude,
            Latitude = l.Location.Latitude,
            RobotEquipmentGeneration = l.Location.RobotEquipmentGeneration,
            CarsInQueue = l.Location.CarsInQueue,
            WashModes = l.AvailableModes.Select(m => new WashModeResponse
            {
                Id = m.Id,
                Name = m.Name,
                PriceRub = m.PriceRub,
                DurationMinutes = m.DurationMinutes,
                Description = m.Description,
                Steps = m.Steps
            }).ToList()
        }).ToList();
    }
}