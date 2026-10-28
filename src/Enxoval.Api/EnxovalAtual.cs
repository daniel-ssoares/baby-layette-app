using System.Security.Claims;
using Enxoval.Api.Data;
using Enxoval.Domain;
using Microsoft.EntityFrameworkCore;

namespace Enxoval.Api;

/// <summary>
/// Resolve o enxoval da conta logada (uma vez por requisição). Na primeira vez:
/// reivindica o enxoval criado antes do login existir, ou cria um novo com a lista-padrão.
/// </summary>
public class EnxovalAtual(AppDbContext db, IHttpContextAccessor http)
{
    private int? _id;

    public async Task<int> IdAsync()
    {
        if (_id is { } id) return id;
        var usuarioId = http.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Endpoint sem autenticação.");

        _id = await BuscarAsync(usuarioId) ?? await CriarAsync(usuarioId);
        return _id.Value;
    }

    private Task<int?> BuscarAsync(string usuarioId) =>
        db.Enxovais.Where(e => e.UsuarioId == usuarioId).Select(e => (int?)e.Id).FirstOrDefaultAsync();

    private async Task<int> CriarAsync(string usuarioId)
    {
        var enxoval = await db.Enxovais.Where(e => e.UsuarioId == null).OrderBy(e => e.Id).FirstOrDefaultAsync();
        if (enxoval is not null)
        {
            // Dados anteriores ao login: já têm nome, então não precisam das boas-vindas.
            enxoval.BoasVindasConcluidas = enxoval.NomeBebe is not null;
        }
        else
        {
            enxoval = ListaPadrao.Criar();
            db.Enxovais.Add(enxoval);
        }
        enxoval.UsuarioId = usuarioId;

        try
        {
            await db.SaveChangesAsync();
            return enxoval.Id;
        }
        catch (DbUpdateException)
        {
            // Duas requisições simultâneas da mesma conta nova: o índice único garante um só enxoval.
            db.ChangeTracker.Clear();
            return await BuscarAsync(usuarioId) ?? throw new InvalidOperationException("Falha ao criar o enxoval.");
        }
    }
}
