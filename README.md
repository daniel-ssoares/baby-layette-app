# Enxoval

Aplicativo web para casais planejarem e acompanharem o enxoval do bebê: o que precisa, o que já foi comprado ou
ganhado, quanto custou e quanto falta.

**Demonstração:** https://baby-layette-app.vercel.app — clique em "Entrar na demonstração" (os dados ficam só no
seu navegador).

<p align="center">
  <img src="docs/imagens/painel.png" alt="Painel" width="260" />
  <img src="docs/imagens/itens.png" alt="Lista de itens" width="260" />
  <img src="docs/imagens/loja.png" alt="Modo loja" width="260" />
</p>

## Funcionalidades

- **Conta do casal:** uma conta compartilhada, com acesso em vários dispositivos.
- **Lista pronta para começar:** cerca de 85 itens em 9 categorias (Quarto, Roupas, Banho, Higiene, Farmácia,
  Amamentação, Passeio, Mala da Maternidade e Acessórios), com quantidades, tamanhos e preços estimados, tudo editável.
- **Painel:** progresso geral e por categoria, semanas de gestação, contagem até o parto, valor estimado, gasto e saldo
  do orçamento.
- **Clima do nascimento:** a partir da cidade e da data prevista, o app usa a média histórica de temperatura para
  indicar se vão precisar de itens de frio ou de calor.
- **Modo loja:** checklist só com o que falta comprar, para usar no celular durante as compras.
- **Registro de compras:** quantidade, valor pago e se o item foi comprado ou ganhado de presente.
- **Fotos dos itens:** tire pela câmera do celular ou escolha da galeria.
- **Exportação:** lista de compras em PDF ou Excel.

## Tecnologias

- **Back-end:** .NET 10, ASP.NET Core (Minimal APIs), Entity Framework Core, SQLite, ASP.NET Core Identity
- **Front-end:** React 19, TypeScript, Vite, Material UI, TanStack Query, React Hook Form
- **Testes:** xUnit, Vitest e Testing Library

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 24 ou mais recente

## Como executar

Clone o repositório e instale as dependências do front-end:

```bash
git clone https://github.com/daniel-ssoares/baby-layette-app.git
cd baby-layette-app
npm --prefix src/web install
```

Em dois terminais, na raiz do projeto:

```bash
# Terminal 1: API (http://localhost:5111)
dotnet run --project src/Enxoval.Api

# Terminal 2: front-end (http://localhost:5173)
npm --prefix src/web run dev
```

Acesse **http://localhost:5173** e crie a conta do casal. O banco de dados é criado automaticamente na primeira
execução.

### Conta de demonstração

Em ambiente de desenvolvimento, uma conta com dados fictícios é criada automaticamente:

| E-mail | Senha |
|---|---|
| `demo@enxoval.local` | `demo1234` |

### Usar no celular

Para abrir o app no celular, na mesma rede Wi-Fi, inicie o front-end com:

```bash
npm --prefix src/web run dev:celular
```

Depois acesse `http://<ip-do-computador>:5173` no celular. No menu do navegador, a opção "Adicionar à tela inicial"
cria um atalho com o ícone do app.

## Testes

```bash
dotnet test Enxoval.slnx          # back-end
npm --prefix src/web test         # front-end
```

## Estrutura do projeto

```
src/
  Enxoval.Domain/     Entidades e regras de negócio
  Enxoval.Api/        API REST, banco de dados e exportação PDF/Excel
  web/                Front-end React
tests/
  Enxoval.UnitTests/  Testes das regras de negócio
docs/                 Requisitos e lista-padrão do enxoval
```

A documentação da API (OpenAPI/Scalar) fica em http://localhost:5111/scalar durante o desenvolvimento.
