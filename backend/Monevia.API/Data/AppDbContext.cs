using Monevia.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Monevia.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<MetodoPago> MetodosPago => Set<MetodoPago>();
    public DbSet<Movimiento> Movimientos => Set<Movimiento>();
    public DbSet<Presupuesto> Presupuestos => Set<Presupuesto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>(u =>
        {
            u.HasIndex(x => x.Email).IsUnique();
            u.Property(x => x.Email).IsRequired().HasMaxLength(150);
            u.Property(x => x.Nombre).IsRequired().HasMaxLength(100);
            u.Property(x => x.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Categoria>(c =>
        {
            c.Property(x => x.Nombre).IsRequired().HasMaxLength(60);
            c.HasIndex(x => new { x.Nombre, x.Tipo, x.UsuarioId }).IsUnique();
            c.HasOne(x => x.Usuario)
                .WithMany()
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MetodoPago>(m =>
        {
            m.Property(x => x.Nombre).IsRequired().HasMaxLength(50);
            m.HasIndex(x => new { x.Nombre, x.UsuarioId }).IsUnique();
            m.HasOne(x => x.Usuario)
                .WithMany()
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Movimiento>(mo =>
        {
            mo.Property(x => x.Monto).HasPrecision(18, 2);
            mo.Property(x => x.Descripcion).HasMaxLength(250);
            mo.HasIndex(x => new { x.UsuarioId, x.Fecha });
            mo.HasIndex(x => new { x.UsuarioId, x.CategoriaId });
            mo.HasOne(x => x.Usuario)
                .WithMany(u => u.Movimientos)
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
            mo.HasOne(x => x.Categoria)
                .WithMany(c => c.Movimientos)
                .HasForeignKey(x => x.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);
            mo.HasOne(x => x.MetodoPago)
                .WithMany(m => m.Movimientos)
                .HasForeignKey(x => x.MetodoPagoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Presupuesto>(p =>
        {
            p.Property(x => x.Monto).HasPrecision(18, 2);
            p.HasIndex(x => new { x.UsuarioId, x.CategoriaId, x.Periodo }).IsUnique();
            p.HasOne(x => x.Usuario)
                .WithMany(u => u.Presupuestos)
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
            p.HasOne(x => x.Categoria)
                .WithMany()
                .HasForeignKey(x => x.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Categoria>().HasData(
            new Categoria { Id = 1, Nombre = "Sueldo", Tipo = TipoCategoria.Ingreso },
            new Categoria { Id = 2, Nombre = "Freelance", Tipo = TipoCategoria.Ingreso },
            new Categoria { Id = 3, Nombre = "Venta", Tipo = TipoCategoria.Ingreso },
            new Categoria { Id = 4, Nombre = "Otros ingresos", Tipo = TipoCategoria.Ingreso },
            new Categoria { Id = 5, Nombre = "Alimentación", Tipo = TipoCategoria.Gasto },
            new Categoria { Id = 6, Nombre = "Transporte", Tipo = TipoCategoria.Gasto },
            new Categoria { Id = 7, Nombre = "Estudios", Tipo = TipoCategoria.Gasto },
            new Categoria { Id = 8, Nombre = "Entretenimiento", Tipo = TipoCategoria.Gasto },
            new Categoria { Id = 9, Nombre = "Salud", Tipo = TipoCategoria.Gasto },
            new Categoria { Id = 10, Nombre = "Compras", Tipo = TipoCategoria.Gasto },
            new Categoria { Id = 11, Nombre = "Servicios", Tipo = TipoCategoria.Gasto },
            new Categoria { Id = 12, Nombre = "Otros", Tipo = TipoCategoria.Gasto }
        );

        modelBuilder.Entity<MetodoPago>().HasData(
            new MetodoPago { Id = 1, Nombre = "Efectivo" },
            new MetodoPago { Id = 2, Nombre = "Tarjeta de débito" },
            new MetodoPago { Id = 3, Nombre = "Tarjeta de crédito" },
            new MetodoPago { Id = 4, Nombre = "Transferencia" },
            new MetodoPago { Id = 5, Nombre = "Yape" },
            new MetodoPago { Id = 6, Nombre = "Plin" }
        );
    }
}