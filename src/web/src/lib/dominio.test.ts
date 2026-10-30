import { describe, expect, it } from 'vitest'
import { analisarClima, estacaoEm, gestacao, painel, registrarCompra, type ItemSalvo } from './dominio'

// Mesmos casos dos testes xUnit do antigo Domain em C# (legado/).
const item = (p: Partial<ItemSalvo>): ItemSalvo => ({
  id: 1, categoriaId: 1, nome: 'Item', tamanho: null, qtdDesejada: 1, qtdAdquirida: 0, prioridade: 'Media', clima: 'Todos',
  precoUnitarioEstimado: null, valorPago: null, origem: null, lojaLink: null, observacoes: null, fotoUrl: null, atualizadoEm: '', ...p,
})

describe('regras portadas do Domain', () => {
  it('gestação em semanas e dias', () => {
    expect(gestacao('2027-04-28', '2026-10-26')).toEqual({ semanas: 13, dias: 5, diasParaParto: 184 })
    expect(gestacao('2026-10-20', '2026-10-26')).toEqual({ semanas: 40, dias: 6, diasParaParto: 0 })
  })

  it('registrar compra soma valor; ganho não soma nem muda origem comprada', () => {
    const i = item({ qtdDesejada: 6, qtdAdquirida: 2, valorPago: 40, origem: 'Comprado' })
    registrarCompra(i, 3, 'Comprado', 75)
    registrarCompra(i, 1, 'Ganhado', 999)
    expect(i).toMatchObject({ qtdAdquirida: 6, valorPago: 115, origem: 'Comprado' })
  })

  it('painel ignora fora da estação no progresso, mas conta o gasto', () => {
    const clima = { cidade: null, estacaoNascimento: 'Verao' as const, meses: [], precisaFrio: false, precisaCalor: true }
    const itens = [
      item({ id: 1, qtdAdquirida: 1, precoUnitarioEstimado: 10, prioridade: 'Alta' }),
      item({ id: 2, clima: 'Frio', qtdAdquirida: 1, valorPago: 50, origem: 'Comprado' }),
      item({ id: 3, precoUnitarioEstimado: 30 }),
    ]
    const r = painel({ boasVindasConcluidas: true, nomeBebe: null, sexo: 'NaoInformado', dataPrevistaParto: null, orcamento: 100,
      cidade: null, latitude: null, longitude: null }, [{ id: 1, nome: 'Quarto', ordem: 1 }], itens, '2026-10-26', clima).resumo
    expect(r).toMatchObject({ totalItens: 2, concluidos: 1, percentualGeral: 50, totalEstimado: 40, totalEstimadoEssencial: 10,
      totalGasto: 50, saldo: 50, foraDaEstacao: 1 })
  })

  it('clima: outono frio pede frio e dispensa calor; hemisfério norte inverte a estação', () => {
    const historico = Array.from({ length: 365 }, (_, d) => {
      const dia = new Date(Date.UTC(2024, 0, 1 + d)).toISOString().slice(0, 10)
      const m = Number(dia.slice(5, 7))
      const media = ({ 4: 22, 5: 19, 6: 17, 7: 17 } as Record<number, number>)[m] ?? 24
      return { dia, media, minima: media - 6 }
    })
    const p = analisarClima('São Paulo', -23.5, '2027-04-28', historico)
    expect(p.estacaoNascimento).toBe('Outono')
    expect(p.meses.map(m => m.mes)).toEqual([4, 5, 6, 7])
    expect(p.meses[2]).toMatchObject({ tempMedia: 17, tempMinima: 11 })
    expect([p.precisaFrio, p.precisaCalor]).toEqual([true, false])
    expect(estacaoEm('2027-04-28', 40.4)).toBe('Primavera')
  })
})
