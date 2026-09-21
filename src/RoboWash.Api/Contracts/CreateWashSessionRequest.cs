namespace RoboWash.Api.Contracts;

public record CreateWashSessionRequest
{
    public int WashLocationId { get; init; }
    public int WashModeId { get; init; }
}
