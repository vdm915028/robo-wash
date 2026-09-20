using Microsoft.EntityFrameworkCore;

namespace RoboWash.Api.Data;

public class RoboWashDbContext(DbContextOptions<RoboWashDbContext> options) : DbContext(options)
{
    public DbSet<WashLocation> WashLocations => Set<WashLocation>();
    public DbSet<WashMode> WashModes => Set<WashMode>();
    public DbSet<WashSession> WashSessions => Set<WashSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Поколение оборудования хранится строкой, а не числом: значение читается глазами в psql, и его
        // сторожит check-ограничение, заданное в db/create-database.sql.
        modelBuilder.Entity<WashLocation>()
            .Property(washLocation => washLocation.RobotEquipmentGeneration)
            .HasConversion<string>();
    }
}
