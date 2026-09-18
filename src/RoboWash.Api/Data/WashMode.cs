namespace RoboWash.Api.Data;

public class WashMode
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int PriceRub { get; set; }
    public int DurationMinutes { get; set; }
    public string[] Steps { get; set; } = [];
    public bool RequiresModernEquipment { get; set; }
}
