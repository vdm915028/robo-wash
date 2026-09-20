using RoboWash.Api.Data;

namespace RoboWash.Api.Services.Models;

public record WashLocationWithModes
{
    public required WashLocation Location { get; init; }
    public required IReadOnlyList<WashMode> AvailableModes { get; init; }
}