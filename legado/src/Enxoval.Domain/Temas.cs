namespace Enxoval.Domain;

/// <summary>Quais temas aparecem para cada sexo do bebê. A Oliveira (neutra) está sempre disponível.</summary>
public static class Temas
{
    public static readonly TemaVisual[] Femininos = [TemaVisual.Cerejeira, TemaVisual.Lavanda, TemaVisual.Pessego, TemaVisual.Jardim];
    public static readonly TemaVisual[] Masculinos = [TemaVisual.Ceu, TemaVisual.Oceano, TemaVisual.Ursinho];

    /// <summary>Temas oferecidos nas boas-vindas: os do sexo informado + Oliveira; sem sexo, todos.</summary>
    public static IReadOnlyList<TemaVisual> DisponiveisPara(SexoBebe sexo) => sexo switch
    {
        SexoBebe.Feminino => [.. Femininos, TemaVisual.Oliveira],
        SexoBebe.Masculino => [.. Masculinos, TemaVisual.Oliveira],
        _ => Enum.GetValues<TemaVisual>(),
    };
}
