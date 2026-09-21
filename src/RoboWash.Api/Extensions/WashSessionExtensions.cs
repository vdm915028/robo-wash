using RoboWash.Api.Contracts;
using RoboWash.Api.Data;

namespace RoboWash.Api.Extensions;

public static class WashSessionExtensions
{
    public static WashSessionResponse ToResponse(this WashSession washSession) => new()
    {
        Id = washSession.Id,
        LocationAddress = washSession.LocationAddress,
        WashModeName = washSession.WashModeName,
        PriceRub = washSession.PriceRub,
        WashedAt = washSession.WashedAt,
    };
}
