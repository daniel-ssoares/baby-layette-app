import type { Categoria, Item } from '../api/types'
import { filtrarItens, filtrosVazios } from './filtros'

/** Unidades que ainda faltam (nunca negativo). */
export const falta = (i: Item) => Math.max(i.qtdDesejada - i.qtdAdquirida, 0)

/** RF25: valor sugerido para a compra = preço estimado × quantidade (null sem preço). */
export const valorSugerido = (i: Item, quantidade: number) =>
  i.precoUnitarioEstimado == null ? null : Math.round(i.precoUnitarioEstimado * quantidade * 100) / 100

export interface GrupoLoja {
  categoria: Categoria
  itens: Item[]
}

export interface Loja {
  grupos: GrupoLoja[]
  unidades: number
  valor: number // estimativa do que falta gastar
}

/**
 * RF26: o que falta comprar (não concluído e dentro da estação), por categoria na ordem da lista,
 * essenciais primeiro dentro de cada categoria.
 */
export function montarLoja(itens: Item[], categorias: Categoria[], busca: string, soEssenciais: boolean): Loja {
  const pendentes = filtrarItens(itens, { ...filtrosVazios, busca, prioridade: soEssenciais ? 'Alta' : '' })
    .filter(i => i.status !== 'Concluido' && !i.foraDaEstacao)
  const peso = { Alta: 0, Media: 1, Baixa: 2 }
  const grupos = [...categorias].sort((a, b) => a.ordem - b.ordem)
    .map(categoria => ({
      categoria,
      itens: pendentes.filter(i => i.categoriaId === categoria.id).sort((a, b) => peso[a.prioridade] - peso[b.prioridade]),
    }))
    .filter(g => g.itens.length > 0)
  return {
    grupos,
    unidades: pendentes.reduce((s, i) => s + falta(i), 0),
    valor: pendentes.reduce((s, i) => s + (valorSugerido(i, falta(i)) ?? 0), 0),
  }
}
