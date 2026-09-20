using RoboWash.Api.Enums;

namespace RoboWash.Api.Contracts;

public record WashLocationResponse
{
    public int Id { get; init; }
    public string Address { get; init; } = "";
    public double Longitude { get; init; }
    public double Latitude { get; init; }
    public RobotEquipmentGeneration RobotEquipmentGeneration { get; init; }
    public int CarsInQueue { get; init; }
    public IReadOnlyList<WashModeResponse> WashModes { get; init; } = [];
}