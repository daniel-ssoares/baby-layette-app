import { describe, expect, it } from 'vitest'
import type { Item } from '../api/types'
import { filtrarItens, filtrosVazios } from './filtros'

const item = (p: Partial<Item>): Item => ({
  id: 1, categoriaId: 1, nome: 'Item', tamanho: null, qtdDesejada: 1, qtdAdquirida: 0,
  prioridade: 'Media', clima: 'Todos', foraDaEstacao: false, fotoUrl: null, precoUnitarioEstimado: null, valorPago: null, origem: null,
  lojaLink: null, observacoes: null, status: 'Pendente', valorEstimado: 0, atualizadoEm: '', ...p,
})

const itens = [
  item({ id: 1, nome: 'Berço', categoriaId: 1, prioridade: 'Alta' }),
  item({ id: 2, nome: 'Body manga longa', categoriaId: 2, tamanho: 'P', status: 'Concluido' }),
  item({ id: 3, nome: 'Body manga curta', categoriaId: 2, tamanho: 'RN' }),
]

describe('filtrarItens', () => {
  it('sem filtros retorna tudo', () => {
    expect(filtrarItens(itens, filtrosVazios)).toHaveLength(3)
  })

  it('busca ignora acentos e caixa', () => {
    expect(filtrarItens(itens, { ...filtrosVazios, busca: 'BERCO' }).map(i => i.id)).toEqual([1])
  })

  it('combina filtros', () => {
    const r = filtrarItens(itens, { ...filtrosVazios, busca: 'body', categoriaId: 2, tamanho: 'RN' })
    expect(r.map(i => i.id)).toEqual([3])
  })

  it('filtra por status e prioridade', () => {
    expect(filtrarItens(itens, { ...filtrosVazios, status: 'Concluido' }).map(i => i.id)).toEqual([2])
    expect(filtrarItens(itens, { ...filtrosVazios, prioridade: 'Alta' }).map(i => i.id)).toEqual([1])
  })
})
