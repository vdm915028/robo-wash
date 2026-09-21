using RoboWash.Api.Data;
using RoboWash.Api.Enums;

namespace RoboWash.Api.Extensions;

public static class WashLocationExtensions
{
    public static bool IsModeAvailable(this WashLocation washLocation, WashMode washMode) =>
        !washMode.RequiresModernEquipment || washLocation.RobotEquipmentGeneration == RobotEquipmentGeneration.Modern;
}
