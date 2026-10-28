import type { Clima, Estacao, OrigemItem, Prioridade, SexoBebe, StatusItem } from '../api/types'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const moeda = (v: number | null | undefined) => (v == null ? '—' : brl.format(v))

/** "2027-05-10" → "10/05/2027" (sem passar por Date para evitar fuso). */
export const dataBR = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '—')

export const rotuloPrioridade: Record<Prioridade, string> = { Alta: 'Alta', Media: 'Média', Baixa: 'Baixa' }
export const rotuloStatus: Record<StatusItem, string> = { Pendente: 'Pendente', Parcial: 'Parcial', Concluido: 'Concluído' }
export const rotuloOrigem: Record<OrigemItem, string> = { Comprado: 'Comprado', Ganhado: 'Ganhado' }
export const rotuloSexo: Record<SexoBebe, string> = { NaoInformado: 'Não informado', Feminino: 'Feminino', Masculino: 'Masculino' }

export const rotuloClima: Record<Clima, string> = { Todos: 'Qualquer clima', Frio: 'Frio', Calor: 'Calor' }
export const rotuloEstacao: Record<Estacao, string> = { Verao: 'verão', Outono: 'outono', Inverno: 'inverno', Primavera: 'primavera' }

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export const nomeMes = (mes: number) => meses[mes - 1]

export const corStatus: Record<StatusItem, 'default' | 'warning' | 'success'> = {
  Pendente: 'default', Parcial: 'warning', Concluido: 'success',
}

// Tratamento do bebê pelo sexo informado (o app serve a qualquer casal; sem sexo, linguagem neutra).
const feminino = (s: SexoBebe | undefined) => s === 'Feminino'

/** Preposição antes do nome: "da" Alice, "do" Theo, "de" Sam; sem nome: "do"/"da" bebê. */
export const preposicaoBebe = (nome: string | null | undefined, sexo?: SexoBebe) =>
  feminino(sexo) ? 'da' : sexo === 'Masculino' || !nome ? 'do' : 'de'

/** "a Alice", "o Theo", "Sam"; sem nome: "o bebê"/"a bebê". */
export const oBebe = (nome: string | null | undefined, sexo?: SexoBebe) =>
  nome ? (feminino(sexo) ? `a ${nome}` : sexo === 'Masculino' ? `o ${nome}` : nome) : feminino(sexo) ? 'a bebê' : 'o bebê'

export const nossoBebe = (sexo?: SexoBebe) => (feminino(sexo) ? 'Nossa bebê' : 'Nosso bebê')

export const tamanhosSugeridos = ['RN', 'P', 'M', 'G', 'GG', 'Único']
