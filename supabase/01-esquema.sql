-- Enxoval no Supabase: tabelas, regras de acesso (RLS), convites e fotos.
-- Rodar uma vez no SQL Editor do projeto (depois, 02-lista-padrao.sql). Pode rodar de novo: recria funções e políticas.
--
-- Modelo: cada pessoa tem o próprio login (Supabase Auth) e participa de UM enxoval (tabela membros).
-- O casal compartilha o enxoval por convite (código de uso único, válido por 7 dias).
-- Toda tabela tem RLS: o banco só devolve e só aceita linhas do enxoval de quem está logado (meu_enxoval()).

-- ============ Tabelas ============

create table if not exists public.enxovais (
  id bigint generated always as identity primary key,
  nome_bebe text check (char_length(nome_bebe) <= 100),
  sexo text not null default 'NaoInformado' check (sexo in ('NaoInformado', 'Feminino', 'Masculino')),
  data_prevista_parto date,
  orcamento numeric(12, 2) check (orcamento >= 0),
  cidade text check (char_length(cidade) <= 150),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  tema text not null default 'Oliveira'
    check (tema in ('Oliveira', 'Cerejeira', 'Lavanda', 'Pessego', 'Jardim', 'Ceu', 'Oceano', 'Ursinho')),
  boas_vindas_concluidas boolean not null default false,
  criado_em timestamptz not null default now()
);

-- Uma linha por pessoa: a chave é o usuário, então ninguém participa de dois enxovais.
create table if not exists public.membros (
  usuario_id uuid primary key references auth.users on delete cascade,
  enxoval_id bigint not null references public.enxovais on delete cascade,
  email text not null,
  entrou_em timestamptz not null default now()
);
create index if not exists membros_enxoval on public.membros (enxoval_id);

create table if not exists public.convites (
  codigo text primary key,
  enxoval_id bigint not null references public.enxovais on delete cascade,
  criado_por uuid not null references auth.users on delete cascade,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default now() + interval '7 days',
  usado_por uuid references auth.users on delete set null
);

create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  enxoval_id bigint not null references public.enxovais on delete cascade,
  nome text not null check (char_length(btrim(nome)) between 1 and 60),
  ordem int not null default 0,
  unique (enxoval_id, nome),
  unique (id, enxoval_id) -- alvo da chave composta de itens
);

create table if not exists public.itens (
  id bigint generated always as identity primary key,
  enxoval_id bigint not null references public.enxovais on delete cascade,
  categoria_id bigint not null,
  nome text not null check (char_length(btrim(nome)) between 1 and 200),
  tamanho text check (char_length(tamanho) <= 20),
  qtd_desejada int not null check (qtd_desejada >= 1),
  qtd_adquirida int not null default 0 check (qtd_adquirida >= 0),
  prioridade text not null default 'Media' check (prioridade in ('Alta', 'Media', 'Baixa')),
  clima text not null default 'Todos' check (clima in ('Todos', 'Frio', 'Calor')),
  preco_unitario_estimado numeric(12, 2) check (preco_unitario_estimado >= 0),
  valor_pago numeric(12, 2) check (valor_pago >= 0),
  origem text check (origem in ('Comprado', 'Ganhado')),
  loja_link text check (char_length(loja_link) <= 500),
  observacoes text check (char_length(observacoes) <= 500),
  foto text, -- caminho no bucket "fotos": {enxoval_id}/{arquivo}
  atualizado_em timestamptz not null default now(),
  -- O item só pode apontar para categoria do mesmo enxoval; categoria com itens não pode ser excluída.
  -- "no action" (padrão), não "restrict": é conferido no fim do comando, então apagar o enxoval inteiro
  -- (cascata em categorias e itens, ex.: aceitar convite) funciona.
  foreign key (categoria_id, enxoval_id) references public.categorias (id, enxoval_id)
);
create index if not exists itens_enxoval on public.itens (enxoval_id);
create index if not exists itens_categoria on public.itens (categoria_id, enxoval_id);

-- Lista-padrão copiada para cada enxoval novo (dados em 02-lista-padrao.sql).
create table if not exists public.lista_padrao_categorias (
  ordem int primary key,
  nome text not null
);
create table if not exists public.lista_padrao_itens (
  id int primary key,
  categoria_ordem int not null references public.lista_padrao_categorias,
  nome text not null,
  tamanho text,
  qtd_desejada int not null,
  prioridade text not null,
  clima text not null,
  preco_unitario_estimado numeric(12, 2),
  observacoes text
);

create or replace function public.tocar_item() returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end $$;
drop trigger if exists itens_atualizado_em on public.itens;
create trigger itens_atualizado_em before update on public.itens for each row execute function public.tocar_item();

-- ============ Funções ============

-- Enxoval de quem está logado (null se ainda não tem). Base de todas as políticas.
create or replace function public.meu_enxoval() returns bigint
language sql stable security definer set search_path = '' as $$
  select enxoval_id from public.membros where usuario_id = auth.uid()
$$;

-- Primeiro acesso: cria o enxoval com a lista-padrão. Se já existe, só devolve o id.
create or replace function public.garantir_enxoval() returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  eid bigint;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta.' using errcode = '28000'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text)); -- duas abas abrindo ao mesmo tempo
  eid := public.meu_enxoval();
  if eid is not null then return eid; end if;

  insert into public.enxovais default values returning id into eid;
  insert into public.membros (usuario_id, enxoval_id, email) values (auth.uid(), eid, coalesce(auth.jwt() ->> 'email', ''));
  insert into public.categorias (enxoval_id, nome, ordem)
    select eid, nome, ordem from public.lista_padrao_categorias;
  insert into public.itens (enxoval_id, categoria_id, nome, tamanho, qtd_desejada, prioridade, clima,
                            preco_unitario_estimado, observacoes)
    select eid, c.id, p.nome, p.tamanho, p.qtd_desejada, p.prioridade, p.clima, p.preco_unitario_estimado, p.observacoes
    from public.lista_padrao_itens p
    join public.lista_padrao_categorias pc on pc.ordem = p.categoria_ordem
    join public.categorias c on c.enxoval_id = eid and c.nome = pc.nome
    order by p.id;
  return eid;
end $$;

-- Gera um código de convite para o enxoval de quem está logado.
create or replace function public.criar_convite() returns text
language plpgsql security definer set search_path = '' as $$
declare
  eid bigint := public.meu_enxoval();
  cod text;
begin
  if eid is null then raise exception 'Entre na sua conta.' using errcode = '28000'; end if;
  -- 10 caracteres sem 0/O/1/I para ditar sem confusão.
  cod := translate(upper(left(replace(gen_random_uuid()::text, '-', ''), 10)), '01', '89');
  insert into public.convites (codigo, enxoval_id, criado_por) values (cod, eid, auth.uid());
  return cod;
end $$;

-- Entra no enxoval do convite. Quem já tinha um enxoval só seu (sem outra pessoa) o perde: a tela avisa antes.
create or replace function public.aceitar_convite(p_codigo text) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  c public.convites;
  atual bigint := public.meu_enxoval();
begin
  if auth.uid() is null then raise exception 'Entre na sua conta.' using errcode = '28000'; end if;
  select * into c from public.convites where codigo = upper(btrim(p_codigo)) for update;
  if c is null or c.usado_por is not null or c.expira_em < now() then
    raise exception 'Convite inválido, já usado ou vencido. Peça um novo código.' using errcode = 'P0001';
  end if;
  if atual = c.enxoval_id then return atual; end if;
  if atual is not null then
    if exists (select 1 from public.membros where enxoval_id = atual and usuario_id <> auth.uid()) then
      raise exception 'Você já participa de um enxoval com outra pessoa.' using errcode = 'P0001';
    end if;
    delete from public.enxovais where id = atual; -- membros/categorias/itens em cascata
  end if;
  insert into public.membros (usuario_id, enxoval_id, email) values (auth.uid(), c.enxoval_id, coalesce(auth.jwt() ->> 'email', ''));
  update public.convites set usado_por = auth.uid() where codigo = c.codigo;
  return c.enxoval_id;
end $$;

revoke execute on function public.meu_enxoval(), public.garantir_enxoval(), public.criar_convite(), public.aceitar_convite(text)
  from public, anon;
grant execute on function public.meu_enxoval(), public.garantir_enxoval(), public.criar_convite(), public.aceitar_convite(text)
  to authenticated;

-- ============ Regras de acesso (RLS) ============

alter table public.enxovais enable row level security;
alter table public.membros enable row level security;
alter table public.convites enable row level security;
alter table public.categorias enable row level security;
alter table public.itens enable row level security;
alter table public.lista_padrao_categorias enable row level security;
alter table public.lista_padrao_itens enable row level security;

drop policy if exists "ver o próprio enxoval" on public.enxovais;
create policy "ver o próprio enxoval" on public.enxovais for select to authenticated using (id = public.meu_enxoval());
drop policy if exists "alterar o próprio enxoval" on public.enxovais;
create policy "alterar o próprio enxoval" on public.enxovais for update to authenticated
  using (id = public.meu_enxoval()) with check (id = public.meu_enxoval());

drop policy if exists "ver quem participa" on public.membros;
create policy "ver quem participa" on public.membros for select to authenticated using (enxoval_id = public.meu_enxoval());

drop policy if exists "ver convites do enxoval" on public.convites;
create policy "ver convites do enxoval" on public.convites for select to authenticated using (enxoval_id = public.meu_enxoval());
drop policy if exists "cancelar convites do enxoval" on public.convites;
create policy "cancelar convites do enxoval" on public.convites for delete to authenticated using (enxoval_id = public.meu_enxoval());

drop policy if exists "categorias do enxoval" on public.categorias;
create policy "categorias do enxoval" on public.categorias for all to authenticated
  using (enxoval_id = public.meu_enxoval()) with check (enxoval_id = public.meu_enxoval());

drop policy if exists "itens do enxoval" on public.itens;
create policy "itens do enxoval" on public.itens for all to authenticated
  using (enxoval_id = public.meu_enxoval()) with check (enxoval_id = public.meu_enxoval());

drop policy if exists "ler lista-padrão" on public.lista_padrao_categorias;
create policy "ler lista-padrão" on public.lista_padrao_categorias for select to authenticated using (true);
drop policy if exists "ler lista-padrão" on public.lista_padrao_itens;
create policy "ler lista-padrão" on public.lista_padrao_itens for select to authenticated using (true);

-- ============ Fotos (Storage) ============
-- Bucket privado; cada arquivo fica numa pasta com o id do enxoval e só os membros dele acessam.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fotos do enxoval: ver" on storage.objects;
create policy "fotos do enxoval: ver" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.meu_enxoval()::text);
drop policy if exists "fotos do enxoval: enviar" on storage.objects;
create policy "fotos do enxoval: enviar" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.meu_enxoval()::text);
drop policy if exists "fotos do enxoval: trocar" on storage.objects;
create policy "fotos do enxoval: trocar" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.meu_enxoval()::text);
drop policy if exists "fotos do enxoval: apagar" on storage.objects;
create policy "fotos do enxoval: apagar" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = public.meu_enxoval()::text);
