using Microsoft.EntityFrameworkCore;
using RoboWash.Api.Data;
using RoboWash.Api.Extensions;

namespace RoboWash.Api.Services;

public class WashSessionService(RoboWashDbContext db)
{
    public async Task<WashSession?> RecordWashAsync(string deviceId, int washLocationId, int washModeId,
        CancellationToken cancellationToken)
    {
        var washLocation = await db.WashLocations.FirstOrDefaultAsync(l => l.Id == washLocationId, cancellationToken);
        var washMode = await db.WashModes.FirstOrDefaultAsync(m => m.Id == washModeId, cancellationToken);

        // Возвращает null, если локации или режима нет либо режим в этой точке не поддерживается: во всех трёх случаях
        // клиент прислал то, чего мы ему не предлагали, и различать их ему незачем.
        if (washLocation is null || washMode is null || !washLocation.IsModeAvailable(washMode))
            return null;

        var washSession = new WashSession
        {
            DeviceId = deviceId,
            WashLocationId = washLocation.Id,
            WashModeId = washMode.Id,
            LocationAddress = washLocation.Address,
            WashModeName = washMode.Name,
            PriceRub = washMode.PriceRub,
            // Время ставит сервер: часы устройства пользователь волен перевести куда угодно.
            WashedAt = DateTimeOffset.UtcNow,
        };

        db.WashSessions.Add(washSession);
        await db.SaveChangesAsync(cancellationToken);

        return washSession;
    }
}
