using RoboWash.Api.Enums;

namespace RoboWash.Api.Data;

public class WashLocation
{
    public int Id { get; set; }
    public string Address { get; set; } = "";
    public double Longitude { get; set; }
    public double Latitude { get; set; }
    public RobotEquipmentGeneration RobotEquipmentGeneration { get; set; }

    // Длина очереди — не справочные данные, а состояние точки: в боевой системе её обновляет оборудование.
    public int CarsInQueue { get; set; }
}
