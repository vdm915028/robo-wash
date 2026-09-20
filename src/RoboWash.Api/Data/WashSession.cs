namespace RoboWash.Api.Data;

public class WashSession
{
    public int Id { get; set; }
    public string DeviceId { get; set; } = "";
    public int WashLocationId { get; set; }
    public int WashModeId { get; set; }

    // Адрес, название режима и цена продублированы снимком намеренно. История показывает, что человек купил:
    // переименуют точку или поднимут цену — прошлые записи обязаны остаться прежними. Ссылки рядом живут
    // для аналитики, снимок — для показа.
    public string LocationAddress { get; set; } = "";
    public string WashModeName { get; set; } = "";
    public int PriceRub { get; set; }

    public DateTimeOffset WashedAt { get; set; }
}
