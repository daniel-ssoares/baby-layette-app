// Gera supabase/02-lista-padrao.sql a partir de src/web/src/demo/dados.json (fonte da lista-padrão).
// Uso: node scripts/gerar-lista-padrao-sql.mjs   — depois rodar o .sql no SQL Editor do Supabase.
import { readFileSync, writeFileSync } from 'node:fs'

const raiz = new URL('..', import.meta.url)
const { padrao } = JSON.parse(readFileSync(new URL('src/web/src/demo/dados.json', raiz), 'utf8'))
const txt = v => (v == null ? 'null' : `'${String(v).replaceAll("'", "''")}'`)
const num = v => (v == null ? 'null' : String(v))

const categorias = padrao.categorias.map(c => `  (${c.ordem}, ${txt(c.nome)})`).join(',\n')
const itens = padrao.itens.map((i, k) =>
  `  (${k + 1}, ${padrao.categorias[i.categoria].ordem}, ${txt(i.nome)}, ${txt(i.tamanho)}, ${i.qtdDesejada}, ` +
  `${txt(i.prioridade)}, ${txt(i.clima)}, ${num(i.precoUnitarioEstimado)}, ${txt(i.observacoes)})`).join(',\n')

writeFileSync(new URL('supabase/02-lista-padrao.sql', raiz), `-- Lista-padrão copiada para cada enxoval novo (garantir_enxoval). GERADO por scripts/gerar-lista-padrao-sql.mjs
-- a partir de src/web/src/demo/dados.json: mudar a lista lá, gerar de novo e rodar no SQL Editor.
-- Só afeta enxovais criados depois; os existentes mantêm os itens que já têm.
begin;
delete from public.lista_padrao_itens;
delete from public.lista_padrao_categorias;
insert into public.lista_padrao_categorias (ordem, nome) values
${categorias};
insert into public.lista_padrao_itens (id, categoria_ordem, nome, tamanho, qtd_desejada, prioridade, clima, preco_unitario_estimado, observacoes) values
${itens};
commit;
`)
console.log(`${padrao.categorias.length} categorias, ${padrao.itens.length} itens`)
