using Enxoval.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Enxoval.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<EnxovalBebe> Enxovais => Set<EnxovalBebe>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Item> Itens => Set<Item>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b); // tabelas do Identity

        b.Entity<EnxovalBebe>(e =>
        {
            e.ToTable("Enxovais");
            e.HasIndex(x => x.UsuarioId).IsUnique();
            e.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.NomeBebe).HasMaxLength(100);
            e.Property(x => x.Sexo).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Tema).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Cidade).HasMaxLength(150);
            e.HasMany(x => x.Categorias).WithOne().HasForeignKey(x => x.EnxovalId);
            e.HasMany(x => x.Itens).WithOne().HasForeignKey(x => x.EnxovalId).OnDelete(DeleteBehavior.NoAction);
        });

        b.Entity<Categoria>(e =>
        {
            e.Property(x => x.Nome).HasMaxLength(60);
            e.HasIndex(x => new { x.EnxovalId, x.Nome }).IsUnique();
            // RF09: categoria com itens não pode ser excluída.
            e.HasMany(x => x.Itens).WithOne(x => x.Categoria).HasForeignKey(x => x.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Item>(e =>
        {
            e.Property(x => x.Nome).HasMaxLength(120);
            e.Property(x => x.Tamanho).HasMaxLength(20);
            e.Property(x => x.LojaLink).HasMaxLength(500);
            e.Property(x => x.Observacoes).HasMaxLength(1000);
            e.Property(x => x.FotoArquivo).HasMaxLength(64);
            e.Property(x => x.Prioridade).HasConversion<string>().HasMaxLength(10);
            e.Property(x => x.Origem).HasConversion<string>().HasMaxLength(10);
            e.Property(x => x.Clima).HasConversion<string>().HasMaxLength(10);
            e.Ignore(x => x.Status);
            e.Ignore(x => x.ValorEstimado);
            e.Ignore(x => x.ValorGasto);
        });
    }
}
