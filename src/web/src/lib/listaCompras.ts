import type { Categoria, Item, Prioridade, StatusItem } from '../api/types'

export interface LinhaCompra {
  nome: string
  tamanho: string | null
  desejada: number
  adquirida: number
  falta: number
  prioridade: Prioridade
  precoUnitario: number | null
  subtotal: number
  status: StatusItem
  foraDaEstacao: boolean
}

export interface GrupoCompra { categoria: string; linhas: LinhaCompra[]; subtotal: number }

export interface ListaDeCompras { grupos: GrupoCompra[]; completa: boolean; totalLinhas: number; total: number }

const ordemPrioridade: Record<Prioridade, number> = { Alta: 1, Media: 2, Baixa: 3 }

/**
 * T4: o que falta comprar, agrupado por categoria, para exportar em PDF/Excel.
 * `completa = false`: só itens pendentes e dentro da estação; `true`: todos, com status.
 */
export function montarListaCompras(categorias: Pick<Categoria, 'id' | 'nome' | 'ordem'>[], itens: Item[], completa: boolean): ListaDeCompras {
  const grupos = [...categorias]
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'))
    .map(c => {
      const linhas = itens
        .filter(i => i.categoriaId === c.id && (completa || (i.status !== 'Concluido' && !i.foraDaEstacao)))
        .sort((a, b) => ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade] || a.id - b.id)
        .map((i): LinhaCompra => {
          const falta = Math.max(i.qtdDesejada - i.qtdAdquirida, 0)
          return {
            nome: i.nome, tamanho: i.tamanho, desejada: i.qtdDesejada, adquirida: i.qtdAdquirida, falta, prioridade: i.prioridade,
            precoUnitario: i.precoUnitarioEstimado, subtotal: (i.precoUnitarioEstimado ?? 0) * falta, status: i.status,
            foraDaEstacao: i.foraDaEstacao,
          }
        })
      return { categoria: c.nome, linhas, subtotal: linhas.reduce((s, l) => s + l.subtotal, 0) }
    })
    .filter(g => g.linhas.length > 0)
  return {
    grupos, completa,
    totalLinhas: grupos.reduce((s, g) => s + g.linhas.length, 0),
    total: grupos.reduce((s, g) => s + g.subtotal, 0),
  }
}

/** Título do arquivo exportado, conforme nome e sexo do bebê. */
export const tituloLista = (nome: string | null, sexo: string) =>
  nome ? `Enxoval ${sexo === 'Masculino' ? 'do' : sexo === 'Feminino' ? 'da' : 'de'} ${nome}` : 'Enxoval do bebê'

export const rotuloStatusLinha = (l: LinhaCompra) => l.foraDaEstacao ? 'Fora da estação'
  : l.status === 'Concluido' ? 'Concluído' : l.status === 'Parcial' ? 'Parcial' : 'Pendente'

export const nomeComTamanho = (l: LinhaCompra) => (!l.tamanho || l.tamanho === 'Único' ? l.nome : `${l.nome} (${l.tamanho})`)
