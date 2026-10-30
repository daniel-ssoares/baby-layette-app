# Supabase — configuração (uma vez)

O app guarda tudo no Supabase (plano gratuito): login (Auth), dados (Postgres com RLS) e fotos (Storage).
Projeto: `https://mbnwieqgowwgaughignf.supabase.co`.

## 1. Banco
No painel do projeto: **SQL Editor → New query**, colar e rodar, nesta ordem:
1. `01-esquema.sql` — tabelas, regras de acesso (RLS), funções de enxoval/convite e o bucket de fotos.
2. `02-lista-padrao.sql` — a lista-padrão copiada para cada enxoval novo.

Os dois podem ser rodados de novo sem perder dados (recriam funções e políticas; a lista-padrão é substituída).
Sempre que o `01-esquema.sql` mudar no repositório, rodar de novo.
Mudou a lista em `src/web/src/demo/dados.json`? `node scripts/gerar-lista-padrao-sql.mjs` e rodar o 02 de novo.

## 2. Login (Authentication)
- **Sign In / Providers → Email:** ligado. Em **Minimum password length**, 8.
- **Confirm email:** recomendado **desligar** por enquanto: o envio de e-mail do plano gratuito é limitado a poucos
  por hora, e com a confirmação ligada cada cadastro gasta um e-mail. Ligado, quem se cadastra precisa clicar no
  link antes de entrar (a tela avisa).
- **URL Configuration:** *Site URL* = endereço do site na Vercel; em *Redirect URLs* adicionar o mesmo endereço com
  `/**` e `http://localhost:5173/**` (os links de "Esqueci minha senha" voltam para `/redefinir-senha`).
- Mais e-mails (recuperação de senha de muita gente): **Authentication → Emails → SMTP** com um serviço gratuito
  (Resend, Brevo).

## 3. CAPTCHA no cadastro e login (contra contas falsas em massa)
1. Em https://dash.cloudflare.com (conta grátis) → **Turnstile → Add widget**: nome "Enxoval", domínios
   `baby-layette-app.vercel.app` e `localhost`, modo **Managed**. Copie a **Site Key** e a **Secret Key**.
2. Supabase → **Authentication → Attack Protection** → **Enable Captcha protection** → provedor **Turnstile** →
   colar a **Secret Key** → Save.
3. Em `src/web/.env`, `VITE_TURNSTILE_SITE_KEY=<Site Key>` (pública). Sem ela o app não mostra o CAPTCHA — e,
   se a proteção estiver ligada no Supabase, ninguém consegue entrar. Ligar os dois juntos.

## 4. Chave no front
**Project Settings → API Keys**: copiar a *Publishable key* (`sb_publishable_...`) ou, na aba *Legacy*, a `anon`
para `VITE_SUPABASE_KEY` em `src/web/.env`. É pública (vai no site). **Nunca** usar a `secret`/`service_role` no front.

## Plano gratuito: cuidados
- **Pausa por inatividade:** o projeto pausa depois de ~7 dias sem acesso (dados preservados; reativar no painel).
- **Backup:** o plano gratuito não faz backup automático. Exportar de vez em quando em **Database → Backups** ou
  com `supabase db dump`.
- **Limites:** ~500 MB de banco, 1 GB de arquivos — sobra para muitos enxovais (as fotos são reduzidas antes do envio).

## Limites contra abuso (no 01-esquema.sql)
Por enxoval: 1000 itens, 100 categorias, 10 convites em aberto, 200 fotos / 150 MB (cada foto até 3 MB; o app reduz
antes de enviar). Mensagens de erro em português, vindas do próprio banco.

## Como os dados ficam separados
Cada pessoa tem uma linha em `membros` (usuário → enxoval). Todas as tabelas usam RLS com `meu_enxoval()`: o banco
só devolve e só aceita linhas do enxoval de quem está logado, mesmo que alguém chame a API do Supabase direto com a
chave pública. Fotos ficam em `fotos/{id do enxoval}/...` com a mesma regra.
