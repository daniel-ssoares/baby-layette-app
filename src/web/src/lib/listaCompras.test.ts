import { describe, expect, it } from 'vitest'
import type { Item } from '../api/types'
import { montarListaCompras, tituloLista } from './listaCompras'

const categorias = [
  { id: 1, nome: 'Roupas', ordem: 2 },
  { id: 2, nome: 'Quarto', ordem: 1 },
  { id: 3, nome: 'Banho', ordem: 3 },
]
const item = (p: Partial<Item>): Item => ({
  id: 0, categoriaId: 1, nome: '', tamanho: null, qtdDesejada: 1, qtdAdquirida: 0, prioridade: 'Media', clima: 'Todos',
  precoUnitarioEstimado: null, valorPago: null, origem: null, lojaLink: null, observacoes: null, status: 'Pendente',
  valorEstimado: 0, foraDaEstacao: false, fotoUrl: null, atualizadoEm: '', ...p,
})
// Clima de calor: o casaquinho (frio) fica fora da estação.
const itens = [
  item({ id: 1, nome: 'Body', qtdDesejada: 6, qtdAdquirida: 2, precoUnitarioEstimado: 20, status: 'Parcial' }),
  item({ id: 2, nome: 'Meia', qtdDesejada: 4, qtdAdquirida: 4, precoUnitarioEstimado: 8, status: 'Concluido' }),
  item({ id: 3, nome: 'Casaquinho', qtdDesejada: 2, precoUnitarioEstimado: 45, clima: 'Frio', prioridade: 'Alta', foraDaEstacao: true }),
  item({ id: 4, categoriaId: 2, nome: 'Berço', precoUnitarioEstimado: 550, prioridade: 'Alta' }),
  item({ id: 5, categoriaId: 3, nome: 'Toalha', qtdDesejada: 3, qtdAdquirida: 3, status: 'Concluido' }),
]

describe('montarListaCompras', () => {
  it('lista de compras tem só o que falta, dentro da estação', () => {
    const lista = montarListaCompras(categorias, itens, false)
    expect(lista.grupos.map(g => g.categoria)).toEqual(['Quarto', 'Roupas']) // Banho sem pendências
    expect(lista.grupos[1].linhas).toHaveLength(1)
    expect(lista.grupos[1].linhas[0]).toMatchObject({ nome: 'Body', falta: 4, subtotal: 80 })
    expect(lista.total).toBe(630)
    expect(lista.totalLinhas).toBe(2)
  })

  it('lista completa inclui tudo, por prioridade', () => {
    const lista = montarListaCompras(categorias, itens, true)
    expect(lista.totalLinhas).toBe(5)
    expect(lista.grupos[1].linhas.map(l => l.nome)).toEqual(['Casaquinho', 'Body', 'Meia'])
    expect(lista.grupos[1].linhas[0].foraDaEstacao).toBe(true)
    expect(lista.grupos[1].linhas[2].falta).toBe(0)
  })

  it('título usa o nome e o sexo', () => {
    expect(tituloLista('Theo', 'Masculino')).toBe('Enxoval do Theo')
    expect(tituloLista('Alice', 'Feminino')).toBe('Enxoval da Alice')
    expect(tituloLista(null, 'NaoInformado')).toBe('Enxoval do bebê')
  })
})
