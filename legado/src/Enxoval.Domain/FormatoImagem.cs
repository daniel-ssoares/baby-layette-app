namespace Enxoval.Domain;

public record TipoImagem(string Extensao, string ContentType);

/// <summary>T3: identifica a imagem pelos bytes iniciais (não confia no nome/Content-Type enviados).</summary>
public static class FormatoImagem
{
    public const long TamanhoMaximo = 5 * 1024 * 1024;
    public const int BytesNecessarios = 12;

    public static readonly TipoImagem Jpeg = new("jpg", "image/jpeg");
    public static readonly TipoImagem Png = new("png", "image/png");
    public static readonly TipoImagem Webp = new("webp", "image/webp");

    public static TipoImagem? Detectar(ReadOnlySpan<byte> b)
    {
        if (b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) return Jpeg;
        if (b.Length >= 8 && b[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })) return Png;
        if (b.Length >= 12 && b[..4].SequenceEqual("RIFF"u8) && b[8..12].SequenceEqual("WEBP"u8)) return Webp;
        return null;
    }

    public static TipoImagem? PorExtensao(string arquivo) => Path.GetExtension(arquivo).ToLowerInvariant() switch
    {
        ".jpg" => Jpeg,
        ".png" => Png,
        ".webp" => Webp,
        _ => null,
    };
}
