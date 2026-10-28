# Tarefas — fase 2

Ordem de implementação: T1 → T2 → T3 → T4. Cada tarefa só é dada como pronta após a validação descrita.

| # | Tarefa | Status |
|---|---|---|
| T1 | Login da conta do casal | ✅ |
| T2 | Boas-vindas: nome da criança (opcional) | ✅ |
| T3 | Foto dos itens | ✅ |
| T4 | Exportar lista de compras (PDF e Excel) | ✅ |

Validação executada (27/10/2026): 32 testes xUnit, 9 Vitest, build/lint limpos e smoke tests HTTP numa cópia do
banco real — T1 14/14, T2 5/5, T3 9/9, T4 7/7 — além de screenshots das telas e render do PDF.
Reproduzir: `scripts/teste-api.ps1` e `scripts/render-pdf.cs`.

---

## T1 — Login da conta do casal (RF01–RF04)
**Objetivo:** proteger o app com e-mail e senha. Uma conta compartilhada pelo casal; cada conta tem um enxoval.

**Critérios de aceite**
- Criar conta (e-mail + senha ≥ 8 caracteres) e entrar; sessão por cookie, válida em vários dispositivos.
- Sem login, toda rota `/api/*` (exceto autenticação) responde 401; o front mostra a tela de entrada.
- Sair (logout) e trocar a senha.
- O enxoval existente (criado antes do login) passa a pertencer à **primeira** conta que entrar; contas seguintes
  recebem um enxoval novo com a lista-padrão.
- Mensagens de erro em português (senha curta, e-mail já usado, credenciais inválidas).

**Plano**
- API: ASP.NET Core Identity (`AddIdentityApiEndpoints` + `MapIdentityApi` em `/api/auth`, cookie), `AppDbContext`
  herda `IdentityDbContext`; `EnxovalBebe.UsuarioId`; `/api/auth/sair`, `/api/auth/eu`, `/api/auth/senha`.
  Cookie devolve 401/403 em vez de redirecionar. Grupo `/api` com `RequireAuthorization()`.
- `EnxovalIdAsync` passa a resolver o enxoval do usuário logado: existente → órfão (dados antigos) → novo (seed).
  O seed sai do startup; `ListaPadrao.Criar()` deixa de fixar nome/data (exceto nos dados já existentes).
- Migration de esquema (Identity + `UsuarioId`, `BoasVindasConcluidas`).
- Front: `pages/EntrarPage.tsx` (entrar/criar conta), guarda de rota via `useEu()`, botão Sair; troca de senha na aba do bebê.

**Validação:** testes de domínio; smoke test HTTP numa cópia do banco: 401 sem login, cadastro, login, enxoval
antigo reivindicado pela 1ª conta, 2ª conta recebe enxoval novo, logout → 401.

## T2 — Boas-vindas: nome da criança (opcional)
**Objetivo:** após o primeiro login, pedir o nome da criança (pode pular) e a data prevista do parto (opcional).

**Critérios de aceite**
- Enquanto `BoasVindasConcluidas = false`, o app abre a tela de boas-vindas.
- "Ainda não escolhemos" conclui sem nome; o nome pode ser preenchido depois na aba do bebê.
- O enxoval antigo (já tem nome) não mostra a tela.

**Plano:** campo `BoasVindasConcluidas` no enxoval (vem no `EnxovalDto`); `POST /api/enxoval/boas-vindas`
com `{ nomeBebe?, dataPrevistaParto? }`; `pages/BoasVindasPage.tsx` com o visual do ramo de oliveira.

**Validação:** smoke test HTTP (conta nova → flag false → POST → true, nome nulo aceito) e build do front.

## T3 — Foto dos itens
**Objetivo:** anexar uma foto a cada item (tirar com a câmera no celular ou escolher arquivo).

**Critérios de aceite**
- JPEG, PNG ou WebP até 5 MB; outros formatos/tamanhos → erro 400 claro.
- Miniatura na lista de itens; foto ampliada e botões trocar/remover no formulário do item.
- Excluir o item remove o arquivo; a foto só é servida para a conta dona do item.

**Plano:** arquivos em `src/Enxoval.Api/dados/fotos/{guid}.{ext}` (fora do banco, ignorado no git);
`Item.FotoArquivo`; `FormatoImagem.Detectar` (assinatura dos bytes) no Domain com teste;
`PUT/GET/DELETE /api/itens/{id}/foto`.

**Validação:** teste de `FormatoImagem`; smoke test: upload PNG ok, upload de texto → 400, GET devolve a imagem,
DELETE remove, excluir item apaga o arquivo.

## T4 — Exportar lista de compras (PDF e Excel)
**Objetivo:** baixar a lista do que falta comprar, agrupada por categoria, para levar às compras.

**Critérios de aceite**
- Por padrão: itens não concluídos e dentro da estação, com a quantidade que **falta**, tamanho, prioridade,
  preço unitário estimado e subtotal; total geral no fim. Opção de incluir todos os itens (com status).
- PDF com o visual do app (título com o nome do bebê, data); Excel com colunas tipadas (números/moeda) e filtro.

**Plano:** `ListaCompras.Montar(...)` no Domain (com teste); QuestPDF (licença Community) e ClosedXML na API;
`GET /api/exportar/compras.pdf` e `compras.xlsx` (`?todos=true`); botão "Exportar" na aba Itens.

**Validação:** teste do `ListaCompras`; smoke test baixando os dois arquivos (assinatura `%PDF` e zip `PK`) e
conferência visual do PDF.

---

# Fase 3 — experiência no celular e nas compras

Ordem: T5 → T6 → T7 (o modo loja usa o registro de compra da T6).

| # | Tarefa | Status |
|---|---|---|
| T5 | Abrir pelo celular na rede de casa + atalho na tela inicial | ✅ |
| T6 | Registrar compra (quantidade, valor, comprado/ganhado) num toque | ✅ |
| T7 | Modo loja: checklist do que falta, botões grandes | ✅ |

Validação executada (27/10/2026): 37 testes xUnit, 17 Vitest (inclui teste de componente do diálogo de compra),
build/lint limpos; T5: app acessado pelo IP da rede (`dev:celular`), manifest e ícones servidos; T6: smoke test HTTP 7/7;
T7: screenshot da aba Loja.

## T5 — Celular na rede de casa (RF24)
**Critérios:** `npm run dev:celular` deixa o app acessível em `http://<ip-do-pc>:5173` (só a porta do front; a API
continua em localhost, atrás do proxy do Vite). Ícone/tema do app ao "Adicionar à tela inicial" (Android/iOS).
O padrão (`npm run dev`) continua só em localhost.

**Plano:** script `dev:celular` (`vite --host`); `manifest.webmanifest`, `theme-color`, meta tags Apple, ícones PNG
(192/512/180) gerados do ramo de oliveira; favicon trocado (era o do Vite). Sem service worker: exige HTTPS fora de
localhost, então não há modo offline.

**Validação:** build; Vite responde pelo IP da rede local; manifest e ícones servidos.

## T6 — Registrar compra (RF25)
**Critérios:** informar quantas unidades, se foi comprado ou ganhado e o valor pago (total da compra), somando ao que
já havia. Ganhado não soma valor. Valor sugerido = preço estimado × quantidade. Quantidade ≥ 1, valor ≥ 0.

**Plano:** `Item.RegistrarCompra(qtd, origem, valor)` no Domain (com teste); `POST /api/itens/{id}/compra`;
`RegistrarCompraDialog`; menu do item ganha "Registrar compra".

**Validação:** testes de domínio; smoke test (compra soma qtd e valor, ganho não soma valor, 400 para qtd 0).

## T7 — Modo loja (RF26)
**Critérios:** aba "Loja": só itens que faltam e estão na estação, agrupados por categoria, com quanto falta
(unidades e R$) no topo; busca e filtro "só essenciais"; tocar no item abre o registro de compra (T6).

**Plano:** `lib/loja.ts` (montar grupos + total, com teste Vitest); `pages/LojaPage.tsx`; quinta aba na navegação.

**Validação:** Vitest; screenshot no tamanho de celular da lista e do diálogo.
