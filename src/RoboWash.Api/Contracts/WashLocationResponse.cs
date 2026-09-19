using RoboWash.Api.Data;

namespace RoboWash.Api.Contracts;

public record WashLocationResponse(
    int Id,
    string Address,
    double Longitude,
    double Latitude,
    RobotEquipmentGeneration RobotEquipmentGeneration,
    int CarsInQueue,
    IReadOnlyList<WashModeResponse> WashModes);
