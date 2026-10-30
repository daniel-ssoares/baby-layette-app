using Enxoval.Domain;

namespace Enxoval.Api;

/// <summary>Validação simples dos requests; retorna null quando válido.</summary>
public static class Validacao
{
    public static IResult? Validar(SalvarItemRequest r)
    {
        var erros = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(r.Nome)) erros["nome"] = ["Informe o nome."];
        if (r.QtdDesejada < 1) erros["qtdDesejada"] = ["Deve ser pelo menos 1."];
        if (r.QtdAdquirida < 0) erros["qtdAdquirida"] = ["Não pode ser negativa."];
        if (r.PrecoUnitarioEstimado < 0) erros["precoUnitarioEstimado"] = ["Não pode ser negativo."];
        if (r.ValorPago < 0) erros["valorPago"] = ["Não pode ser negativo."];
        return Resultado(erros);
    }

    public static IResult? Validar(RegistrarCompraRequest r)
    {
        var erros = new Dictionary<string, string[]>();
        if (r.Quantidade < 1) erros["quantidade"] = ["Deve ser pelo menos 1."];
        if (r.Valor < 0) erros["valor"] = ["Não pode ser negativo."];
        return Resultado(erros);
    }

    public static IResult? Validar(SalvarCategoriaRequest r)
    {
        var erros = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(r.Nome)) erros["nome"] = ["Informe o nome."];
        return Resultado(erros);
    }

    public static IResult? Validar(AtualizarEnxovalRequest r)
    {
        var erros = new Dictionary<string, string[]>();
        if (r.Orcamento < 0) erros["orcamento"] = ["Não pode ser negativo."];
        if (r.Latitude is null != r.Longitude is null) erros["latitude"] = ["Informe latitude e longitude juntas."];
        if (r.Latitude is < -90 or > 90) erros["latitude"] = ["Latitude inválida."];
        if (r.Longitude is < -180 or > 180) erros["longitude"] = ["Longitude inválida."];
        return Resultado(erros);
    }

    public static IResult? Validar(TrocarTemaRequest r) =>
        Enum.IsDefined(r.Tema) ? null : Results.ValidationProblem(new Dictionary<string, string[]> { ["tema"] = ["Tema inválido."] });

    public static IResult? Validar(BoasVindasRequest r)
    {
        var erros = new Dictionary<string, string[]>();
        if (r.Tema is { } tema && !Temas.DisponiveisPara(r.Sexo ?? SexoBebe.NaoInformado).Contains(tema))
            erros["tema"] = ["Escolha um dos temas oferecidos para o sexo informado."];
        return Resultado(erros);
    }

    private static IResult? Resultado(Dictionary<string, string[]> erros) =>
        erros.Count == 0 ? null : Results.ValidationProblem(erros);
}
