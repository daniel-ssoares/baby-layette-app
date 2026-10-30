using Enxoval.Domain;

namespace Enxoval.Api;

/// <summary>
/// T3: fotos dos itens em disco (config "Fotos:Pasta"; padrão &lt;app&gt;/dados/fotos).
/// O nome do arquivo é um GUID gerado aqui — nunca vem do cliente.
/// </summary>
public class ArmazenamentoFotos(IConfiguration config, IWebHostEnvironment env)
{
    private readonly string _pasta = Directory.CreateDirectory(
        config["Fotos:Pasta"] ?? Path.Combine(env.ContentRootPath, "dados", "fotos")).FullName;

    public async Task<string> SalvarAsync(Stream conteudo, TipoImagem tipo)
    {
        var nome = $"{Guid.NewGuid():N}.{tipo.Extensao}";
        await using var arquivo = File.Create(Caminho(nome));
        await conteudo.CopyToAsync(arquivo);
        return nome;
    }

    public string? Abrir(string nome) => File.Exists(Caminho(nome)) ? Caminho(nome) : null;

    public void Excluir(string? nome)
    {
        if (nome is not null && File.Exists(Caminho(nome))) File.Delete(Caminho(nome));
    }

    private string Caminho(string nome) => Path.Combine(_pasta, Path.GetFileName(nome));
}
