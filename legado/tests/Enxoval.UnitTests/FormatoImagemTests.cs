using Enxoval.Domain;

namespace Enxoval.UnitTests;

public class FormatoImagemTests
{
    [Fact]
    public void Detecta_jpeg_png_e_webp_pela_assinatura()
    {
        Assert.Equal(FormatoImagem.Jpeg, FormatoImagem.Detectar([0xFF, 0xD8, 0xFF, 0xE0, 0, 0x10]));
        Assert.Equal(FormatoImagem.Png, FormatoImagem.Detectar([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D]));
        Assert.Equal(FormatoImagem.Webp, FormatoImagem.Detectar("RIFF$\0\0\0WEBPVP8 "u8));
    }

    [Theory]
    [InlineData("texto qualquer")]
    [InlineData("GIF89a......")]
    [InlineData("")]
    public void Rejeita_outros_conteudos(string conteudo) =>
        Assert.Null(FormatoImagem.Detectar(System.Text.Encoding.ASCII.GetBytes(conteudo)));

    [Fact]
    public void Riff_que_nao_e_webp_e_rejeitado() =>
        Assert.Null(FormatoImagem.Detectar("RIFF$\0\0\0WAVEfmt "u8));

    [Theory]
    [InlineData("abc.JPG", "image/jpeg")]
    [InlineData("abc.webp", "image/webp")]
    public void Content_type_pela_extensao(string arquivo, string esperado) =>
        Assert.Equal(esperado, FormatoImagem.PorExtensao(arquivo)!.ContentType);
}
