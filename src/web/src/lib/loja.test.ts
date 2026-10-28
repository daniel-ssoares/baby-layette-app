import { describe, expect, it } from 'vitest'
import type { Categoria, Item } from '../api/types'
import { falta, montarLoja, valorSugerido } from './loja'

const item = (p: Partial<Item>): Item => ({
  id: 1, categoriaId: 1, nome: 'Item', tamanho: null, qtdDesejada: 1, qtdAdquirida: 0,
  prioridade: 'Media', clima: 'Todos', foraDaEstacao: false, fotoUrl: null, precoUnitarioEstimado: null, valorPago: null, origem: null,
  lojaLink: null, observacoes: null, status: 'Pendente', valorEstimado: 0, atualizadoEm: '', ...p,
})
const categorias: Categoria[] = [
  { id: 2, nome: 'Roupas', ordem: 2, totalItens: 0 },
  { id: 1, nome: 'Quarto', ordem: 1, totalItens: 0 },
]

describe('valorSugerido', () => {
  it('multiplica o preço pela quantidade, arredondando centavos', () => {
    expect(valorSugerido(item({ precoUnitarioEstimado: 19.9 }), 3)).toBe(59.7)
  })
  it('sem preço estimado não sugere', () => {
    expect(valorSugerido(item({}), 2)).toBeNull()
  })
})

describe('montarLoja', () => {
  const itens = [
    item({ id: 1, categoriaId: 2, nome: 'Body', qtdDesejada: 6, qtdAdquirida: 2, status: 'Parcial', precoUnitarioEstimado: 20 }),
    item({ id: 2, categoriaId: 2, nome: 'Macacão', prioridade: 'Alta', precoUnitarioEstimado: 50 }),
    item({ id: 3, categoriaId: 1, nome: 'Berço', status: 'Concluido', qtdAdquirida: 1 }),
    item({ id: 4, categoriaId: 1, nome: 'Ventilador', foraDaEstacao: true }),
    item({ id: 5, categoriaId: 1, nome: 'Móbile', qtdDesejada: 2 }),
  ]

  it('mostra só o que falta e está na estação, na ordem das categorias e essenciais primeiro', () => {
    const loja = montarLoja(itens, categorias, '', false)
    expect(loja.grupos.map(g => g.categoria.nome)).toEqual(['Quarto', 'Roupas'])
    expect(loja.grupos[1].itens.map(i => i.id)).toEqual([2, 1])
    expect(loja.unidades).toBe(4 + 1 + 2)
    expect(loja.valor).toBe(4 * 20 + 50)
  })

  it('filtra por busca e por essenciais', () => {
    expect(montarLoja(itens, categorias, 'movel', false).unidades).toBe(0)
    expect(montarLoja(itens, categorias, 'mobile', false).grupos[0].itens.map(i => i.id)).toEqual([5])
    expect(montarLoja(itens, categorias, '', true).grupos.flatMap(g => g.itens.map(i => i.id))).toEqual([2])
  })

  it('falta nunca é negativo', () => {
    expect(falta(item({ qtdDesejada: 2, qtdAdquirida: 5 }))).toBe(0)
  })
})
