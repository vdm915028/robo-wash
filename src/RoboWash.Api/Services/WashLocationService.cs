using Microsoft.EntityFrameworkCore;
using RoboWash.Api.Data;
using RoboWash.Api.Enums;
using RoboWash.Api.Services.Models;

namespace RoboWash.Api.Services;

public class WashLocationService(RoboWashDbContext db)
{
    public async Task<IReadOnlyList<WashLocationWithModes>> GetLocationsWithAvailableModesAsync(CancellationToken cancellationToken)
    {
        var locations = await db.WashLocations.OrderBy(l => l.Id).ToListAsync(cancellationToken);
        var allModes = await db.WashModes.OrderBy(m => m.Id).ToListAsync(cancellationToken);

        return locations.Select(l => new WashLocationWithModes
        {
            Location = l,
            AvailableModes = l.RobotEquipmentGeneration == RobotEquipmentGeneration.Modern
                ? allModes
                : allModes.Where(m => !m.RequiresModernEquipment).ToList()
        }).ToList();
    }
}