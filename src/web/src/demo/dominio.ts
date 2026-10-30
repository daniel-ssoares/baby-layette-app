// Modo demonstração: cópia em TypeScript das regras do Enxoval.Domain (Entities.cs, Painel.cs, AnaliseClima.cs).
// Ao mudar uma regra no Domain, mudar aqui também.
import type { Categoria, Clima, Estacao, Item, OrigemItem, Painel, PerfilClima, Prioridade, SexoBebe, TemaVisual } from '../api/types'

export interface ItemSalvo {
  id: number
  categoriaId: number
  nome: string
  tamanho: string | null
  qtdDesejada: number
  qtdAdquirida: number
  prioridade: Prioridade
  clima: Clima
  precoUnitarioEstimado: number | null
  valorPago: number | null
  origem: OrigemItem | null
  lojaLink: string | null
  observacoes: string | null
  fotoUrl: string | null // data URL da foto, guardada no navegador
  atualizadoEm: string
}

export interface EnxovalSalvo {
  boasVindasConcluidas: boolean
  nomeBebe: string | null
  sexo: SexoBebe
  dataPrevistaParto: string | null
  orcamento: number | null
  cidade: string | null
  latitude: number | null
  longitude: number | null
  /** Ausente em dados salvos antes dos temas: vale Oliveira. */
  tema?: TemaVisual
}

export type CategoriaSalva = Omit<Categoria, 'totalItens'>

export const status = (i: ItemSalvo) =>
  i.qtdAdquirida <= 0 ? 'Pendente' : i.qtdAdquirida < i.qtdDesejada ? 'Parcial' : 'Concluido'

const valorEstimado = (i: ItemSalvo) => (i.precoUnitarioEstimado ?? 0) * i.qtdDesejada
const valorGasto = (i: ItemSalvo) => (i.origem === 'Comprado' ? i.valorPago ?? 0 : 0)

export function foraDaEstacao(i: ItemSalvo, clima: PerfilClima | null) {
  if (!clima) return false
  return i.clima === 'Frio' ? !clima.precisaFrio : i.clima === 'Calor' ? !clima.precisaCalor : false
}

export const paraDto = (i: ItemSalvo, clima: PerfilClima | null): Item => ({
  ...i, status: status(i), valorEstimado: valorEstimado(i), foraDaEstacao: foraDaEstacao(i, clima),
})

/** Item.RegistrarCompra. */
export function registrarCompra(i: ItemSalvo, quantidade: number, origem: OrigemItem, valor: number | null) {
  i.qtdAdquirida += quantidade
  if (origem === 'Comprado') {
    i.valorPago = (i.origem === 'Comprado' ? i.valorPago ?? 0 : 0) + (valor ?? 0)
    i.origem = 'Comprado'
  } else i.origem ??= 'Ganhado'
}

const percentual = (parte: number, total: number) => (total === 0 ? 0 : Math.round((parte * 1000) / total) / 10)
const diaNumero = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86_400_000)

export function gestacao(dataPrevista: string | null, hoje: string) {
  if (!dataPrevista) return null
  const diasParaParto = diaNumero(dataPrevista) - diaNumero(hoje)
  const dias = Math.max(280 - diasParaParto, 0)
  return { semanas: Math.floor(dias / 7), dias: dias % 7, diasParaParto: Math.max(diasParaParto, 0) }
}

/** Painel.Calcular + pendentes de alta prioridade (Endpoints.ObterPainel). */
export function painel(e: EnxovalSalvo, categorias: CategoriaSalva[], itens: ItemSalvo[], hoje: string,
  clima: PerfilClima | null): Painel {
  const considerados = itens.filter(i => !foraDaEstacao(i, clima))
  const concluidos = considerados.filter(i => status(i) === 'Concluido').length
  const gasto = itens.reduce((s, i) => s + valorGasto(i), 0)
  const ordenadas = [...categorias].sort((a, b) => a.ordem - b.ordem)
  const ordem = new Map(ordenadas.map((c, k) => [c.id, k]))
  return {
    resumo: {
      totalItens: considerados.length,
      concluidos,
      percentualGeral: percentual(concluidos, considerados.length),
      totalEstimado: considerados.reduce((s, i) => s + valorEstimado(i), 0),
      totalEstimadoEssencial: considerados.filter(i => i.prioridade === 'Alta').reduce((s, i) => s + valorEstimado(i), 0),
      totalGasto: gasto,
      saldo: e.orcamento == null ? null : e.orcamento - gasto,
      foraDaEstacao: itens.length - considerados.length,
      gestacao: gestacao(e.dataPrevistaParto, hoje),
      categorias: ordenadas.map(c => {
        const grupo = considerados.filter(i => i.categoriaId === c.id)
        const ok = grupo.filter(i => status(i) === 'Concluido').length
        return { categoriaId: c.id, nome: c.nome, totalItens: grupo.length, concluidos: ok, percentual: percentual(ok, grupo.length) }
      }),
    },
    clima,
    pendentesAltaPrioridade: considerados
      .filter(i => i.prioridade === 'Alta' && status(i) !== 'Concluido')
      .sort((a, b) => (ordem.get(a.categoriaId) ?? 0) - (ordem.get(b.categoriaId) ?? 0) || a.id - b.id)
      .map(i => paraDto(i, clima)),
  }
}

/** AnaliseClima.EstacaoEm. */
export function estacaoEm(iso: string, latitude: number): Estacao {
  const [, m, d] = iso.split('-').map(Number)
  const md = m * 100 + d
  const sul: Estacao = md >= 321 && md < 621 ? 'Outono' : md >= 621 && md < 923 ? 'Inverno' : md >= 923 && md < 1222 ? 'Primavera' : 'Verao'
  if (latitude < 0) return sul
  return ({ Outono: 'Primavera', Primavera: 'Outono', Inverno: 'Verao', Verao: 'Inverno' } as const)[sul]
}

export interface TemperaturaDiaria { dia: string; media: number; minima: number }

/** AnaliseClima.Analisar: mês do parto + 3, média histórica; < 21 °C pede frio, > 23 °C pede calor. */
export function analisarClima(cidade: string | null, latitude: number, parto: string, historico: TemperaturaDiaria[]): PerfilClima {
  const porMes = new Map<number, { media: number; minima: number; n: number }>()
  for (const t of historico) {
    const mes = Number(t.dia.slice(5, 7))
    const acc = porMes.get(mes) ?? { media: 0, minima: 0, n: 0 }
    porMes.set(mes, { media: acc.media + t.media, minima: acc.minima + t.minima, n: acc.n + 1 })
  }
  const [ano, mesParto] = parto.split('-').map(Number)
  const meses = [0, 1, 2, 3]
    .map(k => ({ ano: ano + Math.floor((mesParto - 1 + k) / 12), mes: ((mesParto - 1 + k) % 12) + 1 }))
    .filter(m => porMes.has(m.mes))
    .map(m => {
      const p = porMes.get(m.mes)!
      return { ...m, tempMedia: Math.round((p.media / p.n) * 10) / 10, tempMinima: Math.round((p.minima / p.n) * 10) / 10 }
    })
  let precisaFrio = meses.some(m => m.tempMedia < 21)
  let precisaCalor = meses.some(m => m.tempMedia > 23)
  if (!precisaFrio && !precisaCalor) precisaFrio = precisaCalor = true
  return { cidade, estacaoNascimento: estacaoEm(parto, latitude), meses, precisaFrio, precisaCalor }
}
