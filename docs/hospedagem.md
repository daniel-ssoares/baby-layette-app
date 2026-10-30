# Hospedagem (API online para o casal usar de qualquer lugar)

Arquitetura: **front na Vercel** (como hoje) + **API num container** com volume persistente. A Vercel repassa
`/api/*` para a API (rewrite), então tudo fica no mesmo domínio: o cookie de login funciona sem CORS e o PWA continua
instalável pelo endereço da Vercel.

```
celular ──HTTPS──▶ baby-layette-app.vercel.app ──/api/*──▶ enxoval-api.fly.dev (Docker, volume /dados)
                    (front + service worker)                   enxoval.db · fotos/ · chaves/
```

O `Dockerfile` (raiz) serve para qualquer host com Docker e volume. Tudo que precisa sobreviver a deploys fica em
`/dados`: banco SQLite, fotos e as chaves que cifram o cookie (sem elas, cada deploy deslogaria todo mundo).
Fora do Development: cookie só em HTTPS, sem Scalar, sem conta demo.

## Fly.io (recomendado: `fly.toml` pronto, região São Paulo)

Custo: uma máquina pequena que desliga sozinha quando ninguém usa + volume de 1 GB ≈ poucos dólares/mês ou menos
(pede cartão). O primeiro acesso depois de parada leva alguns segundos.

1. Instalar o `flyctl` (PowerShell): `iwr https://fly.io/install.ps1 -useb | iex` e entrar: `fly auth login`.
2. Na raiz do repo, criar o app sem fazer deploy (aceite usar o `fly.toml` existente; se o nome `enxoval-api` já
   existir, escolha outro — ele fica gravado no `fly.toml`):
   `fly launch --no-deploy --copy-config`
3. Criar o volume (uma vez): `fly volumes create dados --size 1 --region gru`
4. Publicar (a imagem é compilada nos servidores do Fly, não precisa de Docker local): `fly deploy`
5. Testar: `curl https://<nome>.fly.dev/api/auth/manage/info` deve responder **401** (API viva, pedindo login).

Atualizar a API depois: `fly deploy`. Ver logs: `fly logs`. Backup do banco: `fly ssh sftp get /dados/enxoval.db`.

## Ligar o front à API (sai do modo demonstração)

1. `src/web/vercel.json`: adicionar, **antes** do fallback do SPA, o rewrite
   `{ "source": "/api/:caminho*", "destination": "https://<nome>.fly.dev/api/:caminho*" }`.
2. `src/web/.env.production`: `VITE_DEMO=false`.
3. Commit + deploy na Vercel. Cada um cria a conta em "Criar conta" (o casal usa a mesma conta).

Isso substitui a demonstração pública. Para manter as duas, criar um segundo projeto na Vercel com a variável de
ambiente `VITE_DEMO=true` (variável do ambiente tem precedência sobre o `.env.production`).

## Outros hosts

Render, Railway etc.: apontar para o `Dockerfile`, porta **8080**, disco persistente montado em **/dados**, uma
instância só (SQLite não é compartilhado entre instâncias). O resto do passo "Ligar o front" é igual.
