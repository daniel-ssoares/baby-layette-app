using Enxoval.Domain;

namespace Enxoval.UnitTests;

public class TemasTests
{
    [Fact]
    public void Menina_ve_os_quatro_femininos_e_a_oliveira() =>
        Assert.Equal([TemaVisual.Cerejeira, TemaVisual.Lavanda, TemaVisual.Pessego, TemaVisual.Jardim, TemaVisual.Oliveira],
            Temas.DisponiveisPara(SexoBebe.Feminino));

    [Fact]
    public void Menino_ve_os_tres_masculinos_e_a_oliveira() =>
        Assert.Equal([TemaVisual.Ceu, TemaVisual.Oceano, TemaVisual.Ursinho, TemaVisual.Oliveira],
            Temas.DisponiveisPara(SexoBebe.Masculino));

    [Fact]
    public void Sem_sexo_informado_ve_todos() =>
        Assert.Equal(Enum.GetValues<TemaVisual>(), Temas.DisponiveisPara(SexoBebe.NaoInformado));

    [Fact]
    public void Todo_tema_pertence_a_um_grupo_ou_e_a_oliveira() =>
        Assert.All(Enum.GetValues<TemaVisual>(), t =>
            Assert.True(t == TemaVisual.Oliveira || Temas.Femininos.Contains(t) || Temas.Masculinos.Contains(t)));
}
