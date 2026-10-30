# API .NET (guardada)

Back-end original do Enxoval (ASP.NET Core 10 + EF Core/SQLite + Identity), substituído pelo **Supabase** em
outubro de 2026 para hospedar sem custo. Fica aqui para consulta ou para voltar a usar um dia; o app em `src/web`
não depende mais dele.

- `src/Enxoval.Domain` — regras em C# (hoje em `src/web/src/lib/dominio.ts` e `lib/listaCompras.ts`).
- `src/Enxoval.Api` — Minimal APIs, login por cookie, fotos em disco, PDF (QuestPDF) e Excel (ClosedXML).
- `tests/` — xUnit do Domain. `Dockerfile` + `fly.toml` + `docs/hospedagem.md` — hospedagem no Fly.io (paga).

```
dotnet build legado/Enxoval.slnx
dotnet test legado/Enxoval.slnx
dotnet run --project legado/src/Enxoval.Api     # http://localhost:5111
```
Para o front usar esta API de novo: `apiHttp` em `src/web/src/api/client.ts` já chama as rotas `/api/*` (hoje só a
demonstração responde a elas); bastaria trocar `api` para `apiHttp` e recolocar o proxy `/api` no `vite.config.ts`.
