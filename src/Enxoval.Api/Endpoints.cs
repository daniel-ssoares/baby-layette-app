using Enxoval.Api.Data;
using Enxoval.Domain;
using Microsoft.EntityFrameworkCore;

namespace Enxoval.Api;

public static class Endpoints
{
    /// <summary>Tudo exige login; cada conta só enxerga o próprio enxoval (via <see cref="EnxovalAtual"/>).</summary>
    public static void MapEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api").RequireAuthorization();
        MapEnxoval(api.MapGroup("/enxoval").WithTags("Enxoval"));
        MapCategorias(api.MapGroup("/categorias").WithTags("Categorias"));
        MapItens(api.MapGroup("/itens").WithTags("Itens"));
        api.MapGet("/painel", ObterPainel).WithTags("Painel");

        api.MapGet("/clima", async (AppDbContext db, ClimaService clima, EnxovalAtual atual) =>
        {
            var perfil = await PerfilClimaAsync(db, clima, await atual.IdAsync());
            return perfil is null ? Results.NoContent() : Results.Ok(perfil);
        }).WithTags("Clima");

        // T4: ?todos=true exporta a lista completa (com status); padrão = só o que falta comprar.
        api.MapGet("/exportar/compras.{formato}", async (string formato, bool? todos, AppDbContext db,
            EnxovalAtual atual, ClimaService clima, TimeProvider clock) =>
        {
            if (formato is not ("pdf" or "xlsx")) return Results.NotFound();
            var enxovalId = await atual.IdAsync();
            var enxoval = (await db.Enxovais.FindAsync(enxovalId))!;
            var lista = ListaCompras.Montar(
                await db.Categorias.Where(c => c.EnxovalId == enxovalId).ToListAsync(),
                await db.Itens.Where(i => i.EnxovalId == enxovalId).ToListAsync(),
                await clima.ObterPerfilAsync(enxoval), todos == true);
            var hoje = DateOnly.FromDateTime(clock.GetLocalNow().DateTime);
            var titulo = Exportacao.Titulo(enxoval);
            var nome = $"lista-de-compras-{hoje:yyyy-MM-dd}.{formato}";
            return formato == "pdf"
                ? Results.File(Exportacao.Pdf(lista, titulo, hoje), "application/pdf", nome)
                : Results.File(Exportacao.Excel(lista, titulo),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nome);
        }).WithTags("Exportar");

        api.MapGet("/localizacao", async (string q, ClimaService clima) =>
            string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2 ? [] : await clima.BuscarLocaisAsync(q.Trim()))
            .WithTags("Clima");
    }

    private static async Task<PerfilClima?> PerfilClimaAsync(AppDbContext db, ClimaService clima, int enxovalId) =>
        await clima.ObterPerfilAsync((await db.Enxovais.FindAsync(enxovalId))!);

    private static void MapEnxoval(RouteGroupBuilder g)
    {
        g.MapGet("/", async (AppDbContext db, EnxovalAtual atual) =>
        {
            var id = await atual.IdAsync();
            var e = await db.Enxovais.FindAsync(id);
            return new EnxovalDto(e!.Id, e.NomeBebe, e.Sexo, e.DataPrevistaParto, e.Orcamento, e.Cidade, e.Latitude, e.Longitude,
                e.BoasVindasConcluidas);
        });

        g.MapPut("/", async (AtualizarEnxovalRequest r, AppDbContext db, EnxovalAtual atual) =>
        {
            if (Validacao.Validar(r) is { } erro) return erro;
            var e = await db.Enxovais.FindAsync(await atual.IdAsync());
            e!.NomeBebe = string.IsNullOrWhiteSpace(r.NomeBebe) ? null : r.NomeBebe.Trim();
            e.Sexo = r.Sexo;
            e.DataPrevistaParto = r.DataPrevistaParto;
            e.Orcamento = r.Orcamento;
            e.Cidade = r.Latitude is null ? null : Limpar(r.Cidade);
            e.Latitude = r.Latitude;
            e.Longitude = r.Longitude;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        // T2: o nome é opcional ("ainda não escolhemos"); conclui as boas-vindas de qualquer forma.
        g.MapPost("/boas-vindas", async (BoasVindasRequest r, AppDbContext db, EnxovalAtual atual) =>
        {
            var e = await db.Enxovais.FindAsync(await atual.IdAsync());
            e!.NomeBebe = Limpar(r.NomeBebe) ?? e.NomeBebe;
            e.DataPrevistaParto = r.DataPrevistaParto ?? e.DataPrevistaParto;
            e.BoasVindasConcluidas = true;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private static void MapCategorias(RouteGroupBuilder g)
    {
        g.MapGet("/", async (AppDbContext db, EnxovalAtual atual) =>
        {
            var enxovalId = await atual.IdAsync();
            return await db.Categorias.Where(c => c.EnxovalId == enxovalId).OrderBy(c => c.Ordem)
                .Select(c => new CategoriaDto(c.Id, c.Nome, c.Ordem, c.Itens.Count)).ToListAsync();
        });

        g.MapPost("/", async (SalvarCategoriaRequest r, AppDbContext db, EnxovalAtual atual) =>
        {
            if (Validacao.Validar(r) is { } erro) return erro;
            var enxovalId = await atual.IdAsync();
            var nome = r.Nome.Trim();
            if (await db.Categorias.AnyAsync(c => c.EnxovalId == enxovalId && c.Nome == nome))
                return Conflito("Já existe uma categoria com esse nome.");
            var c = new Categoria { EnxovalId = enxovalId, Nome = nome, Ordem = r.Ordem };
            db.Categorias.Add(c);
            await db.SaveChangesAsync();
            return Results.Created($"/api/categorias/{c.Id}", new CategoriaDto(c.Id, c.Nome, c.Ordem, 0));
        });

        g.MapPut("/{id:int}", async (int id, SalvarCategoriaRequest r, AppDbContext db, EnxovalAtual atual) =>
        {
            if (Validacao.Validar(r) is { } erro) return erro;
            var enxovalId = await atual.IdAsync();
            var c = await db.Categorias.FirstOrDefaultAsync(c => c.Id == id && c.EnxovalId == enxovalId);
            if (c is null) return Results.NotFound();
            var nome = r.Nome.Trim();
            if (await db.Categorias.AnyAsync(x => x.EnxovalId == enxovalId && x.Nome == nome && x.Id != id))
                return Conflito("Já existe uma categoria com esse nome.");
            c.Nome = nome;
            c.Ordem = r.Ordem;
            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        g.MapDelete("/{id:int}", async (int id, AppDbContext db, EnxovalAtual atual) =>
        {
            var enxovalId = await atual.IdAsync();
            var c = await db.Categorias.FirstOrDefaultAsync(c => c.Id == id && c.EnxovalId == enxovalId);
            if (c is null) return Results.NotFound();
            if (await db.Itens.AnyAsync(i => i.CategoriaId == id))
                return Conflito("Mova ou exclua os itens desta categoria antes de excluí-la.");
            db.Categorias.Remove(c);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    private static void MapItens(RouteGroupBuilder g)
    {
        g.MapGet("/", async (AppDbContext db, ClimaService clima, EnxovalAtual atual) =>
        {
            var enxovalId = await atual.IdAsync();
            var perfil = await PerfilClimaAsync(db, clima, enxovalId);
            var itens = await db.Itens.Where(i => i.EnxovalId == enxovalId).OrderBy(i => i.Id).ToListAsync();
            return itens.Select(i => ItemDto.De(i, perfil));
        });

        g.MapPost("/", async (SalvarItemRequest r, AppDbContext db, EnxovalAtual atual) =>
        {
            if (Validacao.Validar(r) is { } erro) return erro;
            var enxovalId = await atual.IdAsync();
            if (!await CategoriaExiste(db, enxovalId, r.CategoriaId)) return CategoriaInvalida();
            var item = new Item { EnxovalId = enxovalId, Nome = r.Nome };
            Aplicar(item, r);
            db.Itens.Add(item);
            await db.SaveChangesAsync();
            return Results.Created($"/api/itens/{item.Id}", ItemDto.De(item));
        });

        g.MapPut("/{id:int}", async (int id, SalvarItemRequest r, AppDbContext db, EnxovalAtual atual) =>
        {
            if (Validacao.Validar(r) is { } erro) return erro;
            var enxovalId = await atual.IdAsync();
            var item = await db.Itens.FirstOrDefaultAsync(i => i.Id == id && i.EnxovalId == enxovalId);
            if (item is null) return Results.NotFound();
            if (!await CategoriaExiste(db, enxovalId, r.CategoriaId)) return CategoriaInvalida();
            Aplicar(item, r);
            await db.SaveChangesAsync();
            return Results.Ok(ItemDto.De(item));
        });

        // RF12: ações rápidas da listagem.
        g.MapPost("/{id:int}/adquirir", async (int id, AppDbContext db, EnxovalAtual atual) =>
            await AlterarQuantidade(db, atual, id, i => i.QtdAdquirida + 1));

        g.MapPost("/{id:int}/remover", async (int id, AppDbContext db, EnxovalAtual atual) =>
            await AlterarQuantidade(db, atual, id, i => Math.Max(i.QtdAdquirida - 1, 0)));

        g.MapPost("/{id:int}/concluir", async (int id, AppDbContext db, EnxovalAtual atual) =>
            await AlterarQuantidade(db, atual, id, i => Math.Max(i.QtdAdquirida, i.QtdDesejada)));

        // RF25: compra com quantidade, origem e valor.
        g.MapPost("/{id:int}/compra", async (int id, RegistrarCompraRequest r, AppDbContext db, EnxovalAtual atual) =>
        {
            if (Validacao.Validar(r) is { } erro) return erro;
            var item = await BuscarItem(db, atual, id);
            if (item is null) return Results.NotFound();
            item.RegistrarCompra(r.Quantidade, r.Origem, r.Valor);
            await db.SaveChangesAsync();
            return Results.Ok(ItemDto.De(item));
        });

        g.MapDelete("/{id:int}", async (int id, AppDbContext db, EnxovalAtual atual, ArmazenamentoFotos fotos) =>
        {
            var item = await BuscarItem(db, atual, id);
            if (item is null) return Results.NotFound();
            db.Itens.Remove(item);
            await db.SaveChangesAsync();
            fotos.Excluir(item.FotoArquivo);
            return Results.NoContent();
        });

        MapFoto(g);
    }

    /// <summary>T3: foto do item (JPEG/PNG/WebP até 5 MB), servida só para a conta dona.</summary>
    private static void MapFoto(RouteGroupBuilder g)
    {
        // Upload multipart: o cookie é SameSite=Lax (não vai em POST/PUT de outros sites), por isso sem antiforgery.
        g.MapPut("/{id:int}/foto", async (int id, IFormFile foto, AppDbContext db, EnxovalAtual atual, ArmazenamentoFotos fotos) =>
        {
            var item = await BuscarItem(db, atual, id);
            if (item is null) return Results.NotFound();
            if (foto.Length > FormatoImagem.TamanhoMaximo) return ErroFoto("A foto pode ter no máximo 5 MB.");

            await using var conteudo = foto.OpenReadStream();
            var cabecalho = new byte[FormatoImagem.BytesNecessarios];
            var lidos = await conteudo.ReadAtLeastAsync(cabecalho, cabecalho.Length, throwOnEndOfStream: false);
            if (FormatoImagem.Detectar(cabecalho.AsSpan(0, lidos)) is not { } tipo)
                return ErroFoto("Formato não suportado. Use JPEG, PNG ou WebP.");

            conteudo.Position = 0;
            var anterior = item.FotoArquivo;
            item.FotoArquivo = await fotos.SalvarAsync(conteudo, tipo);
            item.AtualizadoEm = DateTime.UtcNow;
            await db.SaveChangesAsync();
            fotos.Excluir(anterior);
            return Results.Ok(ItemDto.De(item));
        }).DisableAntiforgery();

        g.MapGet("/{id:int}/foto", async (int id, AppDbContext db, EnxovalAtual atual, ArmazenamentoFotos fotos) =>
        {
            var item = await BuscarItem(db, atual, id);
            if (item?.FotoArquivo is not { } nome || fotos.Abrir(nome) is not { } caminho) return Results.NotFound();
            // A URL muda a cada nova foto (?v=), então pode ficar em cache (privado: exige login).
            return Results.File(caminho, FormatoImagem.PorExtensao(nome)!.ContentType,
                lastModified: File.GetLastWriteTimeUtc(caminho), enableRangeProcessing: false);
        });

        g.MapDelete("/{id:int}/foto", async (int id, AppDbContext db, EnxovalAtual atual, ArmazenamentoFotos fotos) =>
        {
            var item = await BuscarItem(db, atual, id);
            if (item is null) return Results.NotFound();
            var anterior = item.FotoArquivo;
            item.FotoArquivo = null;
            item.AtualizadoEm = DateTime.UtcNow;
            await db.SaveChangesAsync();
            fotos.Excluir(anterior);
            return Results.NoContent();
        });
    }

    private static async Task<Item?> BuscarItem(AppDbContext db, EnxovalAtual atual, int id)
    {
        var enxovalId = await atual.IdAsync();
        return await db.Itens.FirstOrDefaultAsync(i => i.Id == id && i.EnxovalId == enxovalId);
    }

    private static IResult ErroFoto(string mensagem) =>
        Results.ValidationProblem(new Dictionary<string, string[]> { ["foto"] = [mensagem] });

    private static async Task<PainelDto> ObterPainel(AppDbContext db, TimeProvider clock, ClimaService clima, EnxovalAtual atual)
    {
        var enxovalId = await atual.IdAsync();
        var enxoval = await db.Enxovais.FindAsync(enxovalId);
        var perfil = await clima.ObterPerfilAsync(enxoval!);
        var categorias = await db.Categorias.Where(c => c.EnxovalId == enxovalId).ToListAsync();
        var itens = await db.Itens.Where(i => i.EnxovalId == enxovalId).ToListAsync();
        var hoje = DateOnly.FromDateTime(clock.GetLocalNow().DateTime);

        var pendentes = itens
            .Where(i => i.Prioridade == Prioridade.Alta && i.Status != StatusItem.Concluido && perfil?.ForaDaEstacao(i) != true)
            .OrderBy(i => categorias.First(c => c.Id == i.CategoriaId).Ordem).ThenBy(i => i.Id)
            .Select(i => ItemDto.De(i, perfil)).ToList();

        return new PainelDto(Painel.Calcular(enxoval!, categorias, itens, hoje, perfil), perfil, pendentes);
    }

    private static void Aplicar(Item item, SalvarItemRequest r)
    {
        item.CategoriaId = r.CategoriaId;
        item.Nome = r.Nome.Trim();
        item.Tamanho = Limpar(r.Tamanho);
        item.QtdDesejada = r.QtdDesejada;
        item.QtdAdquirida = r.QtdAdquirida;
        item.Prioridade = r.Prioridade;
        item.Clima = r.Clima;
        item.PrecoUnitarioEstimado = r.PrecoUnitarioEstimado;
        item.ValorPago = r.ValorPago;
        item.Origem = r.Origem;
        item.LojaLink = Limpar(r.LojaLink);
        item.Observacoes = Limpar(r.Observacoes);
        item.AtualizadoEm = DateTime.UtcNow;
    }

    private static async Task<IResult> AlterarQuantidade(AppDbContext db, EnxovalAtual atual, int id, Func<Item, int> novaQtd)
    {
        var enxovalId = await atual.IdAsync();
        var item = await db.Itens.FirstOrDefaultAsync(i => i.Id == id && i.EnxovalId == enxovalId);
        if (item is null) return Results.NotFound();
        item.QtdAdquirida = novaQtd(item);
        item.Origem ??= OrigemItem.Comprado;
        item.AtualizadoEm = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok(ItemDto.De(item));
    }

    private static Task<bool> CategoriaExiste(AppDbContext db, int enxovalId, int categoriaId) =>
        db.Categorias.AnyAsync(c => c.Id == categoriaId && c.EnxovalId == enxovalId);

    private static IResult CategoriaInvalida() =>
        Results.ValidationProblem(new Dictionary<string, string[]> { ["categoriaId"] = ["Categoria inválida."] });

    private static IResult Conflito(string mensagem) =>
        Results.Problem(mensagem, statusCode: StatusCodes.Status409Conflict);

    private static string? Limpar(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
}
