# Sistema de Gestão de Enxoval de Bebê — Requisitos

## 1. Visão geral

Aplicação web para um casal planejar e acompanhar o enxoval do bebê: o que precisa, o que já foi comprado ou ganho, quanto custou e quanto falta.

**Escopo atual:** cada casal com sua conta, apenas web, execução local. Sem lista de presentes para convidados.

O enxoval de cada conta nova já vem pré-carregado com a lista de [lista-enxoval.md](lista-enxoval.md).

## 2. Usuários

| Perfil | Descrição |
|---|---|
| Casal | Uma única conta compartilhada pelo casal, com acesso total ao enxoval. |

## 3. Requisitos funcionais — MVP

### Conta e acesso (fase 2 — ver `docs/tarefas.md`)
- **RF01** — Cadastro de uma conta com e-mail e senha (≥ 8 caracteres), compartilhada pelo casal.
- **RF02** — Login e logout; sessão por cookie (30 dias, renovável), em vários dispositivos ao mesmo tempo.
- **RF03** — No primeiro acesso da conta o enxoval é criado com a lista-padrão. O enxoval criado antes do login
  existir é atribuído à primeira conta.
- **RF04** — Alterar a senha da conta.
- **RF21** — Boas-vindas após o primeiro acesso: nome do bebê e data prevista, ambos opcionais ("Ainda não escolhemos o nome").

### Fotos e exportação (fase 2)
- **RF22** — Foto por item (JPEG/PNG/WebP, até 5 MB; o navegador reduz para ≤ 1600px antes de enviar), com
  miniatura na lista. Arquivos em `src/Enxoval.Api/dados/fotos/`, servidos só para a conta dona.
- **RF23** — Exportar a lista de compras (o que falta, dentro da estação) ou a lista completa, em PDF ou Excel.

### Celular e compras (fase 3)
- **RF24** — Acesso pelo celular na rede de casa (`npm run dev:celular`) e atalho na tela inicial com o ícone do app.
  Sem modo offline (service worker exige HTTPS fora de localhost).
- **RF25** — Registrar compra: quantidade, Comprei/Ganhei e valor total pago (sugestão = preço estimado × quantidade).
  Soma ao que já havia; ganho não soma valor nem muda uma origem "Comprado".
- **RF26** — Modo loja (aba Loja): só o que falta e está na estação, por categoria, essenciais primeiro, com total
  estimado do que falta; busca, filtro "Essenciais" e toque no item para registrar a compra (RF25).

### Enxoval
- **RF05** — Dados do enxoval: nome do bebê, sexo, data prevista do parto e orçamento total (todos opcionais).
  O painel mostra a idade gestacional (semanas + dias) e os dias até o parto.
- **RF06** — Editar os dados do enxoval.

### Categorias
- **RF07** — CRUD de categorias (nome, ordem de exibição).
- **RF08** — Categorias padrão criadas junto com o enxoval: Quarto, Roupas, Banho, Higiene, Farmácia, Amamentação, Passeio, Mala da Maternidade, Acessórios.
- **RF09** — Uma categoria com itens não pode ser excluída (o usuário move ou exclui os itens antes).

### Itens
- **RF10** — CRUD de itens com os campos:
  - Nome *(obrigatório)*
  - Categoria *(obrigatório)*
  - Tamanho (RN, P, M, G, GG, Único, ou texto livre)
  - Quantidade desejada *(obrigatório, ≥ 1)*
  - Quantidade adquirida (≥ 0)
  - Prioridade (Alta, Média, Baixa)
  - Preço unitário estimado
  - Valor total pago
  - Loja / link
  - Observações
- **RF11** — Status calculado automaticamente:
  - *Pendente*: adquirida = 0
  - *Parcial*: 0 < adquirida < desejada
  - *Concluído*: adquirida ≥ desejada
- **RF12** — Ação rápida de "+1 adquirido" e "marcar como concluído" na listagem.
- **RF13** — Indicar a origem do item adquirido: **Comprado** ou **Ganhado** (ganhados não entram no gasto).

### Lista modelo
- **RF14** — Ao criar o enxoval, ele é populado com a lista-padrão (quantidades, tamanhos, prioridades e preços estimados), totalmente editável. Fonte: `src/Enxoval.Api/Data/ListaPadrao.cs`.

### Clima da época do nascimento
- **RF18** — Informar a cidade do nascimento (busca por nome ou localização do navegador).
- **RF19** — Com cidade e data prevista, calcular o clima dos 4 primeiros meses (mês do parto + 3) pela média
  histórica de 5 anos (Open-Meteo) e a estação do nascimento (considerando o hemisfério).
- **RF20** — Cada item tem um clima (Qualquer / Frio / Calor). Itens cujo clima não combina com o previsto ficam
  "fora da estação": aparecem esmaecidos (ocultos por padrão) e não contam no progresso nem nas estimativas.
- **RN07** — Média mensal < 21 °C ⇒ precisa de itens de frio; > 23 °C ⇒ de calor; se nenhum, meia-estação (ambos).
  Sem cidade/data ou sem acesso à Open-Meteo, nenhum item fica fora da estação.

### Consulta e acompanhamento
- **RF15** — Listagem de itens agrupada por categoria.
- **RF16** — Busca por nome e filtros por categoria, status, tamanho e prioridade.
- **RF17** — Painel (dashboard) com:
  - % geral de conclusão (itens concluídos / total de itens)
  - % de conclusão por categoria
  - Total estimado, total gasto e saldo do orçamento
  - Lista dos itens pendentes de prioridade alta

## 4. Fora do MVP (fases futuras)

- Lista de presentes pública (chá de bebê)
- Login com Google
- Deploy em nuvem

## 5. Regras de negócio

- **RN01** — Todo dado pertence a um enxoval; a conta só acessa o próprio enxoval.
- **RN02** — Cada conta tem exatamente um enxoval.
- **RN03** — Valor estimado do item = preço unitário estimado × quantidade desejada.
- **RN04** — Total gasto = soma do valor pago dos itens com origem *Comprado*.
- **RN05** — Saldo = orçamento total − total gasto (exibido apenas se houver orçamento).
- **RN06** — Valores monetários em R$ com 2 casas decimais; não podem ser negativos.

## 6. Requisitos não funcionais

- **RNF01** — Interface responsiva (uso no celular durante as compras).
- **RNF02** — Idioma pt-BR; datas em dd/MM/yyyy; moeda R$.
- **RNF03** — (fase 2) Senhas armazenadas com hash (ASP.NET Core Identity).
- **RNF04** — Toda consulta filtrada pelo enxoval (hoje o único; na fase 2, o do usuário logado).
- **RNF05** — Executável localmente com um comando para API e um para o front-end.
- **RNF06** — Banco criado e atualizado via migrations.
- **RNF07** — Testes automatizados das regras de negócio.

## 7. Stack

| Camada | Tecnologia |
|---|---|
| Back-end | ASP.NET Core Web API (.NET 10 LTS) |
| Persistência | EF Core + SQLite (local), trocável por PostgreSQL/SQL Server |
| Autenticação | (fase 2) ASP.NET Core Identity com cookie |
| Documentação da API | OpenAPI + Scalar |
| Front-end | React 19 + TypeScript + Vite |
| UI / estado | MUI 9, TanStack Query, React Hook Form, React Router 8 |
| Testes | xUnit (back-end), Vitest + Testing Library (front-end) |

Estrutura do projeto: ver [README](../README.md).

## 8. Modelo de domínio

```
Enxoval   : Id, NomeBebe?, Sexo, DataPrevistaParto?, Orcamento?   (fase 2: UsuarioId, 1:1)
Categoria : Id, EnxovalId, Nome, Ordem
Item      : Id, EnxovalId, CategoriaId, Nome, Tamanho?, QtdDesejada, QtdAdquirida,
            Prioridade, PrecoUnitarioEstimado?, ValorPago?, Origem?, LojaLink?,
            Observacoes?, CriadoEm, AtualizadoEm
```
