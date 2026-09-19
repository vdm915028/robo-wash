namespace RoboWash.Api.Contracts;

public record WashModeResponse(
    int Id,
    string Name,
    int PriceRub,
    int DurationMinutes,
    string Description,
    IReadOnlyList<string> Steps);
