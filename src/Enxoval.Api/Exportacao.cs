using System.Globalization;
using ClosedXML.Excel;
using Enxoval.Domain;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Enxoval.Api;

/// <summary>T4: lista de compras em PDF (QuestPDF, licença Community) e Excel (ClosedXML).</summary>
public static class Exportacao
{
    private static readonly CultureInfo PtBr = CultureInfo.GetCultureInfo("pt-BR");
    // Paleta oliva (mesma de src/web/src/theme.ts)
    private const string Oliva = "#6F7D45", OlivaClara = "#ECEFDD", Texto = "#3F4232", TextoSuave = "#7E8070", Linha = "#E4E2D8";

    static Exportacao() => QuestPDF.Settings.License = LicenseType.Community;

    public static string Titulo(EnxovalBebe e) => e.NomeBebe is null ? "Enxoval do bebê"
        : $"Enxoval {(e.Sexo == SexoBebe.Masculino ? "do" : e.Sexo == SexoBebe.Feminino ? "da" : "de")} {e.NomeBebe}";

    private static string Moeda(decimal? v) => v is null ? "—" : v.Value.ToString("C", PtBr);
    private static string Prioridade(Prioridade p) => p switch { Domain.Prioridade.Alta => "Alta", Domain.Prioridade.Media => "Média", _ => "Baixa" };
    private static string Status(LinhaCompra l) => l.ForaDaEstacao ? "Fora da estação"
        : l.Status switch { StatusItem.Concluido => "Concluído", StatusItem.Parcial => "Parcial", _ => "Pendente" };
    private static string NomeComTamanho(LinhaCompra l) =>
        l.Tamanho is null or "Único" ? l.Nome : $"{l.Nome} ({l.Tamanho})";

    public static byte[] Pdf(ListaDeCompras lista, string titulo, DateOnly hoje) => DocumentoPdf(lista, titulo, hoje).GeneratePdf();

    /// <summary>Documento QuestPDF (também permite gerar imagens das páginas para conferência).</summary>
    public static IDocument DocumentoPdf(ListaDeCompras lista, string titulo, DateOnly hoje) => Document.Create(doc => doc.Page(page =>
    {
        page.Size(PageSizes.A4);
        page.Margin(36);
        page.DefaultTextStyle(t => t.FontSize(10).FontColor(Texto));

        page.Header().PaddingBottom(12).BorderBottom(1.5f).BorderColor(Oliva).Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text(titulo).FontSize(22).Bold().FontColor(Oliva);
                c.Item().Text(lista.Completa ? "Lista completa do enxoval" : "Lista de compras — o que falta comprar")
                    .FontSize(11).FontColor(TextoSuave);
            });
            row.ConstantItem(150).AlignRight().Column(c =>
            {
                c.Item().AlignRight().Text(hoje.ToString("dd/MM/yyyy", PtBr)).FontColor(TextoSuave);
                c.Item().AlignRight().Text($"{lista.TotalLinhas} itens").FontColor(TextoSuave);
                c.Item().AlignRight().Text(t =>
                {
                    t.Span("Falta: ").FontColor(TextoSuave);
                    t.Span(Moeda(lista.Total)).FontSize(13).Bold();
                });
            });
        });

        page.Content().PaddingTop(8).Column(col =>
        {
            if (lista.Grupos.Count == 0)
                col.Item().PaddingTop(40).AlignCenter().Text("Nada pendente — tudo comprado! 🎉").FontSize(14);

            foreach (var grupo in lista.Grupos)
            {
                col.Item().PaddingTop(14).PaddingBottom(4).Row(r =>
                {
                    r.RelativeItem().Text(grupo.Categoria).FontSize(13).Bold().FontColor(Oliva);
                    r.AutoItem().AlignBottom().Text(Moeda(grupo.Subtotal)).FontColor(TextoSuave);
                });
                col.Item().Table(t =>
                {
                    t.ColumnsDefinition(c =>
                    {
                        c.ConstantColumn(18);   // caixinha para marcar na loja
                        c.RelativeColumn(5);    // item
                        c.ConstantColumn(lista.Completa ? 62 : 38);
                        c.ConstantColumn(44);
                        c.ConstantColumn(62);
                        c.ConstantColumn(66);
                        if (lista.Completa) c.ConstantColumn(78);
                    });
                    t.Header(h =>
                    {
                        string[] cab = ["", "Item", lista.Completa ? "Tenho/Quero" : "Falta", "Prior.", "Preço un.", "A gastar"];
                        foreach (var texto in lista.Completa ? [.. cab, "Status"] : cab)
                            h.Cell().Background(OlivaClara).PaddingVertical(4).PaddingHorizontal(3)
                                .Text(texto).FontSize(8.5f).Bold().FontColor(TextoSuave);
                    });
                    foreach (var l in grupo.Linhas)
                    {
                        IContainer Celula() => t.Cell().BorderBottom(0.5f).BorderColor(Linha).PaddingVertical(5).PaddingHorizontal(3);
                        var caixa = Celula().AlignMiddle().Width(10).Height(10).Border(0.8f).BorderColor(TextoSuave);
                        if (l.Status == StatusItem.Concluido) caixa.Background(Oliva); // já comprado: caixinha marcada
                        Celula().Text(NomeComTamanho(l));
                        Celula().AlignCenter().Text(lista.Completa ? $"{l.Adquirida}/{l.Desejada}" : l.Falta.ToString(PtBr)).Bold();
                        Celula().Text(Prioridade(l.Prioridade)).FontColor(l.Prioridade == Domain.Prioridade.Alta ? Oliva : TextoSuave);
                        Celula().AlignRight().Text(Moeda(l.PrecoUnitario));
                        Celula().AlignRight().Text(Moeda(l.Subtotal));
                        if (lista.Completa) Celula().Text(Status(l)).FontSize(8.5f).FontColor(TextoSuave);
                    }
                });
            }
        });

        page.Footer().AlignCenter().Text(t =>
        {
            t.DefaultTextStyle(s => s.FontSize(8).FontColor(TextoSuave));
            t.Span("Preços estimados · página ");
            t.CurrentPageNumber();
            t.Span(" de ");
            t.TotalPages();
        });
    }));

    public static byte[] Excel(ListaDeCompras lista, string titulo)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Lista de compras");
        string[] cabecalho = ["Categoria", "Item", "Tamanho", "Quero", "Tenho", "Falta", "Prioridade", "Preço unitário", "A gastar", "Status"];
        for (var c = 0; c < cabecalho.Length; c++) ws.Cell(1, c + 1).Value = cabecalho[c];

        var r = 2;
        foreach (var g in lista.Grupos)
            foreach (var l in g.Linhas)
            {
                ws.Cell(r, 1).Value = g.Categoria;
                ws.Cell(r, 2).Value = l.Nome;
                ws.Cell(r, 3).Value = l.Tamanho ?? "";
                ws.Cell(r, 4).Value = l.Desejada;
                ws.Cell(r, 5).Value = l.Adquirida;
                ws.Cell(r, 6).Value = l.Falta;
                ws.Cell(r, 7).Value = Prioridade(l.Prioridade);
                if (l.PrecoUnitario is { } p) ws.Cell(r, 8).Value = p;
                ws.Cell(r, 9).Value = l.Subtotal;
                ws.Cell(r, 10).Value = Status(l);
                r++;
            }

        var ultima = r - 1;
        ws.Cell(r, 8).Value = "Total";
        ws.Cell(r, 9).FormulaA1 = $"SUM(I2:I{Math.Max(ultima, 2)})";
        ws.Row(r).Style.Font.Bold = true;

        var cab = ws.Range(1, 1, 1, cabecalho.Length);
        cab.Style.Font.Bold = true;
        cab.Style.Font.FontColor = XLColor.FromHtml(Oliva);
        cab.Style.Fill.BackgroundColor = XLColor.FromHtml(OlivaClara);
        if (ultima >= 2) ws.Range(1, 1, ultima, cabecalho.Length).SetAutoFilter();
        ws.Range(2, 8, r, 9).Style.NumberFormat.Format = "\"R$\" #,##0.00";
        ws.SheetView.FreezeRows(1);
        ws.Columns().AdjustToContents();
        wb.Properties.Title = titulo;

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }
}
