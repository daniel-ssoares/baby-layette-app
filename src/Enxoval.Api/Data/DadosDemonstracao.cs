using Enxoval.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Enxoval.Api.Data;

/// <summary>
/// Conta de demonstração com dados fictícios (config <c>Demo:Ativo</c>; ligada só em Development).
/// Criada no startup se ainda não existir; a data do parto é relativa a hoje para o painel sempre fazer sentido.
/// </summary>
public static class DadosDemonstracao
{
    public const string Email = "demo@enxoval.local";
    public const string Senha = "demo1234";

    public static async Task GarantirAsync(IServiceProvider sp)
    {
        var usuarios = sp.GetRequiredService<UserManager<IdentityUser>>();
        if (await usuarios.FindByEmailAsync(Email) is not null) return;

        var usuario = new IdentityUser { UserName = Email, Email = Email };
        var r = await usuarios.CreateAsync(usuario, Senha);
        if (!r.Succeeded) throw new InvalidOperationException(string.Join("; ", r.Errors.Select(e => e.Description)));

        var hoje = DateOnly.FromDateTime(sp.GetRequiredService<TimeProvider>().GetLocalNow().DateTime);
        var enxoval = ListaPadrao.Criar();
        enxoval.UsuarioId = usuario.Id;
        enxoval.BoasVindasConcluidas = true;
        enxoval.NomeBebe = "Theo";
        enxoval.Sexo = SexoBebe.Masculino;
        enxoval.DataPrevistaParto = hoje.AddDays(150);
        enxoval.Orcamento = 8000;
        enxoval.Cidade = "Curitiba, Paraná";
        (enxoval.Latitude, enxoval.Longitude) = (-25.43, -49.27);

        // Progresso fictício: essenciais quase todos comprados, alguns presentes e compras parciais.
        var n = 0;
        foreach (var item in enxoval.Itens)
        {
            n++;
            var preco = item.PrecoUnitarioEstimado ?? 0;
            if (item.Prioridade == Prioridade.Alta && n % 4 != 0)
                item.RegistrarCompra(item.QtdDesejada, OrigemItem.Comprado, Math.Round(preco * item.QtdDesejada * 0.9m));
            else if (n % 5 == 0)
                item.RegistrarCompra(1, OrigemItem.Ganhado, null);
            else if (n % 7 == 0 && item.QtdDesejada > 1)
                item.RegistrarCompra(item.QtdDesejada / 2, OrigemItem.Comprado, preco * (item.QtdDesejada / 2));
        }

        var db = sp.GetRequiredService<AppDbContext>();
        db.Enxovais.Add(enxoval);
        await db.SaveChangesAsync();
    }
}
