#:project ../src/Enxoval.Api/Enxoval.Api.csproj
// Uso: dotnet run scripts/render-pdf.cs -- saida.png [todos] [Tema]
// Renderiza a 1ª página do PDF da lista de compras (lista-padrão, alguns itens comprados) em PNG.
using Enxoval.Api;
using Enxoval.Api.Data;
using Enxoval.Domain;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

var e = ListaPadrao.Criar();
e.NomeBebe = "Theo"; e.Sexo = SexoBebe.Masculino;
int id = 0, cat = 0;
foreach (var c in e.Categorias) { c.Id = ++cat; foreach (var i in c.Itens) { i.Id = ++id; i.CategoriaId = c.Id; } }
foreach (var i in e.Itens.Take(6)) i.QtdAdquirida = i.QtdDesejada;
e.Itens[7].QtdAdquirida = 3;

var lista = ListaCompras.Montar(e.Categorias, e.Itens, null, completa: args.Contains("todos"));
var tema = args.Skip(1).Select(a => Enum.TryParse<TemaVisual>(a, out var t) ? t : (TemaVisual?)null).FirstOrDefault(t => t is not null) ?? TemaVisual.Oliveira;
var imagens = Exportacao.DocumentoPdf(lista, Exportacao.Titulo(e), new DateOnly(2026, 10, 27), tema)
    .GenerateImages(new ImageGenerationSettings { RasterDpi = 110 });
File.WriteAllBytes(args[0], imagens.First());
Console.WriteLine($"{lista.TotalLinhas} linhas, total {lista.Total:C}");
