using Enxoval.Domain;
using static Enxoval.Domain.Prioridade;

namespace Enxoval.Api.Data;

/// <summary>
/// Lista inicial de cada enxoval novo (criado no primeiro login da conta): pouco RN, a maior parte em P e
/// M com prioridade baixa (comprar depois do nascimento). Itens marcados com <see cref="Clima"/> Frio/Calor
/// são ativados ou ficam "fora da estação" conforme o clima da cidade (ver AnaliseClima).
/// Nome, data e cidade são pedidos ao usuário (boas-vindas / aba do bebê).
/// Preços: faixa econômica, em R$, editáveis. Fontes e critérios: docs/lista-enxoval.md
/// Mudou algo aqui? Enxovais existentes precisam de uma migration de dados (o seed só roda para enxovais novos).
/// </summary>
public static class ListaPadrao
{
    private record Sugestao(string Nome, string? Tamanho, int Qtd, Prioridade Prioridade, decimal? Preco,
        string? Obs = null, Clima Clima = Clima.Todos);

    private static readonly (string Categoria, Sugestao[] Itens)[] Itens =
    [
        ("Quarto",
        [
            new("Berço com certificação Inmetro", "Único", 1, Alta, 550),
            new("Colchão de berço certificado Inmetro (firme)", "Único", 1, Alta, 200, "Sono seguro: colchão firme e berço sem travesseiro, protetor lateral ou pelúcias."),
            new("Protetor de colchão impermeável", "Único", 2, Alta, 40),
            new("Lençol de berço com elástico", "Único", 4, Alta, 35),
            new("Manta leve (algodão/soft)", "Único", 2, Alta, 40),
            new("Manta/cobertor mais quente", "Único", 2, Alta, 60, Clima: Clima.Frio),
            new("Cueiro", "Único", 4, Media, 20),
            new("Cômoda com trocador", "Único", 1, Media, 550),
            new("Poltrona de amamentação", "Único", 1, Media, 600),
            new("Luz noturna / abajur", "Único", 1, Media, 50),
            new("Babá eletrônica", "Único", 1, Media, 200),
            new("Cesto para roupa suja", "Único", 1, Baixa, 40),
            new("Mosquiteiro para berço", "Único", 1, Baixa, 40, Clima: Clima.Calor),
            new("Ventilador silencioso (sem vento direto no bebê)", "Único", 1, Media, 180, Clima: Clima.Calor),
        ]),
        ("Roupas",
        [
            new("Body manga longa", "RN", 4, Alta, 20, "RN serve poucas semanas."),
            new("Body manga longa", "P", 8, Alta, 22),
            new("Body manga curta (para usar por baixo)", "RN", 2, Media, 15),
            new("Body manga curta (para usar por baixo)", "P", 4, Media, 17),
            new("Macacão com pezinho", "RN", 3, Alta, 35),
            new("Macacão com pezinho", "P", 6, Alta, 38),
            new("Mijão/culote com pé", "RN", 3, Alta, 15),
            new("Mijão/culote com pé", "P", 5, Alta, 17),
            new("Casaquinho (tricô ou plush)", "P", 3, Alta, 45, Clima: Clima.Frio),
            new("Macacão plush/soft", "P", 3, Alta, 45, Clima: Clima.Frio),
            new("Saco de dormir / cobertor de vestir", "P", 1, Media, 90, "Alternativa segura ao cobertor solto no berço.", Clima.Frio),
            new("Body regata ou manga curta", "P", 4, Alta, 18, Clima: Clima.Calor),
            new("Macaquinho curto de algodão", "P", 3, Media, 35, Clima: Clima.Calor),
            new("Meia", "Único", 8, Alta, 8),
            new("Touca", "Único", 3, Alta, 15),
            new("Luva", "Único", 2, Media, 10, Clima: Clima.Frio),
            new("Saída de maternidade", "RN", 1, Alta, 90, "Escolher o tecido conforme o clima previsto."),
            new("Body manga longa", "M", 4, Baixa, 24, "Comprar após o nascimento, conforme o crescimento."),
            new("Macacão com pezinho", "M", 3, Baixa, 40, "Comprar após o nascimento, conforme o crescimento."),
            new("Vestidinho com body", "P", 2, Baixa, 45),
            new("Faixa/laço de cabelo macio", "Único", 3, Baixa, 10),
            new("Sapatinho de tecido", "Único", 2, Baixa, 20),
        ]),
        ("Banho",
        [
            new("Banheira com suporte", "Único", 1, Alta, 150),
            new("Toalha com capuz", "Único", 3, Alta, 35),
            new("Termômetro de banho", "Único", 1, Media, 25, "Água por volta de 36–37 °C."),
            new("Saboneteira/organizador de banho", "Único", 1, Baixa, 25),
        ]),
        ("Higiene",
        [
            new("Fralda descartável (pacote)", "RN", 2, Alta, 45, "RN dura pouco; não estocar."),
            new("Fralda descartável (pacote)", "P", 8, Alta, 50),
            new("Fralda descartável (pacote)", "M", 6, Media, 55, "Comprar aos poucos para não perder tamanho."),
            new("Fralda de pano", "Único", 12, Alta, 6),
            new("Lenço umedecido (pacote)", "Único", 6, Alta, 12, "Nas primeiras semanas, algodão e água morna é o mais indicado."),
            new("Algodão (pacote)", "Único", 4, Alta, 10),
            new("Sabonete líquido infantil", "Único", 2, Alta, 22),
            new("Shampoo infantil", "Único", 1, Media, 22),
            new("Pomada preventiva de assadura", "Único", 2, Alta, 25),
            new("Hidratante infantil", "Único", 1, Baixa, 25),
            new("Escova de cabelo cerdas macias", "Único", 1, Media, 20),
            new("Cortador/tesoura de unha infantil", "Único", 1, Alta, 18),
            new("Lixeira com tampa para fraldas", "Único", 1, Media, 50),
        ]),
        ("Farmácia",
        [
            new("Termômetro clínico digital", "Único", 1, Alta, 35, "Mercúrio é proibido."),
            new("Aspirador nasal", "Único", 1, Alta, 30),
            new("Soro fisiológico 0,9% (flaconetes)", "Único", 2, Alta, 15),
            new("Álcool 70% (coto umbilical)", "Único", 1, Alta, 10, "Confirmar o cuidado do coto com o pediatra."),
            new("Gaze estéril (pacote)", "Único", 2, Alta, 10),
            new("Seringa dosadora / conta-gotas", "Único", 2, Media, 5),
            new("Antitérmico infantil", "Único", 1, Media, 20, "Somente com prescrição e dose do pediatra."),
            new("Caixa organizadora para farmacinha", "Único", 1, Baixa, 25),
        ]),
        ("Amamentação",
        [
            new("Sutiã de amamentação", "Único", 4, Alta, 40),
            new("Absorvente para seios (caixa)", "Único", 2, Alta, 30),
            new("Pomada de lanolina para mamilos", "Único", 1, Media, 40),
            new("Almofada de amamentação", "Único", 1, Media, 90),
            new("Bomba tira-leite", "Único", 1, Media, 120, "Pode ser manual; avaliar após o início da amamentação."),
            new("Saquinho para armazenar leite materno (caixa)", "Único", 1, Baixa, 35),
            new("Concha protetora de seios (par)", "Único", 1, Baixa, 40),
            new("Mamadeira", "Único", 2, Baixa, 35, "Só se necessário: aleitamento materno exclusivo é recomendado até os 6 meses."),
            new("Babador / paninho de boca", "Único", 6, Media, 8),
        ]),
        ("Passeio",
        [
            new("Bebê conforto (cadeirinha grupo 0+)", "Único", 1, Alta, 450, "Obrigatório no carro, já na saída da maternidade."),
            new("Carrinho de bebê", "Único", 1, Alta, 800, "Considerar travel system compatível com o bebê conforto."),
            new("Bolsa de maternidade / fraldas", "Único", 1, Alta, 120),
            new("Trocador portátil", "Único", 1, Media, 40),
            new("Base Isofix para bebê conforto", "Único", 1, Baixa, 350),
            new("Canguru ergonômico / sling", "Único", 1, Baixa, 150),
            new("Capa de chuva para carrinho", "Único", 1, Baixa, 40),
            new("Mosquiteiro para carrinho", "Único", 1, Media, 40, Clima: Clima.Calor),
        ]),
        ("Mala da Maternidade",
        [
            new("Documentos (RG, plano de saúde, cartão pré-natal, exames)", null, 1, Alta, null, "Separar até a 36ª semana."),
            new("Camisola/pijama com abertura frontal", "Único", 4, Alta, 60),
            new("Calcinha pós-parto (cintura alta)", "Único", 6, Alta, 15),
            new("Absorvente pós-parto noturno (pacote)", "Único", 2, Alta, 20),
            new("Chinelo para banho", "Único", 1, Alta, 30),
            new("Necessaire com itens de higiene da mãe", "Único", 1, Alta, null),
            new("Roupa confortável para a saída da mãe", "Único", 1, Media, null),
            new("Roupão", "Único", 1, Baixa, 80),
            new("Cinta pós-parto", "Único", 1, Baixa, 80, "Usar apenas com orientação médica."),
        ]),
        ("Acessórios",
        [
            new("Naninha", "Único", 1, Baixa, 30, "Não deixar no berço durante o sono no primeiro ano."),
            new("Móbile", "Único", 1, Baixa, 70),
            new("Chupeta (opcional)", "Único", 2, Baixa, 20, "Pode atrapalhar o início da amamentação; decidir com o pediatra."),
        ]),
    ];

    public static EnxovalBebe Criar()
    {
        var enxoval = new EnxovalBebe();
        var ordem = 0;
        foreach (var (nomeCategoria, sugestoes) in Itens)
        {
            var categoria = new Categoria { Nome = nomeCategoria, Ordem = ++ordem };
            enxoval.Categorias.Add(categoria);
            foreach (var s in sugestoes)
            {
                var item = new Item
                {
                    Nome = s.Nome, Tamanho = s.Tamanho, QtdDesejada = s.Qtd, Prioridade = s.Prioridade,
                    PrecoUnitarioEstimado = s.Preco, Observacoes = s.Obs, Clima = s.Clima, Categoria = categoria,
                };
                categoria.Itens.Add(item);
                enxoval.Itens.Add(item);
            }
        }
        return enxoval;
    }
}
