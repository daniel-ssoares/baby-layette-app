import type { Item, Prioridade, StatusItem } from '../api/types'

export interface Filtros {
  busca: string
  categoriaId: number | ''
  status: StatusItem | ''
  tamanho: string
  prioridade: Prioridade | ''
}

export const filtrosVazios: Filtros = { busca: '', categoriaId: '', status: '', tamanho: '', prioridade: '' }

/** Remove acentos e caixa para a busca ("Berço" casa com "berco"). */
const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// RF16
export function filtrarItens(itens: Item[], f: Filtros): Item[] {
  const busca = normalizar(f.busca.trim())
  return itens.filter(i =>
    (!busca || normalizar(i.nome).includes(busca)) &&
    (f.categoriaId === '' || i.categoriaId === f.categoriaId) &&
    (f.status === '' || i.status === f.status) &&
    (f.tamanho === '' || i.tamanho === f.tamanho) &&
    (f.prioridade === '' || i.prioridade === f.prioridade))
}
