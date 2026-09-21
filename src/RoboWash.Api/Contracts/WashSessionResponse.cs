namespace RoboWash.Api.Contracts;

public record WashSessionResponse
{
    public int Id { get; init; }
    public string LocationAddress { get; init; } = "";
    public string WashModeName { get; init; } = "";
    public int PriceRub { get; init; }
    public DateTimeOffset WashedAt { get; init; }
}
