namespace RoboWash.Api.Contracts;

public record WashModeResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public int PriceRub { get; init; }
    public int DurationMinutes { get; init; }
    public string Description { get; init; } = "";
    public IReadOnlyList<string> Steps { get; init; } = [];
}
