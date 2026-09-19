using Microsoft.EntityFrameworkCore;
using RoboWash.Api.Data;

namespace RoboWash.Api.Services;

public record WashLocationWithModes(WashLocation Location, IReadOnlyList<WashMode> AvailableModes);

public class WashLocationService(RoboWashDbContext db)
{
    public async Task<List<WashLocationWithModes>> GetLocationsWithAvailableModesAsync(CancellationToken cancellationToken)
    {
        var locations = await db.WashLocations.OrderBy(location => location.Id).ToListAsync(cancellationToken);
        var allModes = await db.WashModes.OrderBy(mode => mode.Id).ToListAsync(cancellationToken);

        return locations
            .Select(location => new WashLocationWithModes(location, SelectAvailableModes(location, allModes)))
            .ToList();
    }

    // Режимов на всю сеть единицы, поэтому подбираем в памяти: запрос на каждую точку дал бы N+1 ради трёх строк.
    static List<WashMode> SelectAvailableModes(WashLocation location, List<WashMode> allModes)
    {
        var hasModernRobots = location.RobotEquipmentGeneration == RobotEquipmentGeneration.Modern;

        return allModes.Where(mode => hasModernRobots || !mode.RequiresModernEquipment).ToList();
    }
}
