// Formato dos dados trocados com o back-end (Supabase em nuvem/api.ts; demonstração em demo/servidor.ts).

export type Prioridade = 'Alta' | 'Media' | 'Baixa'
export type StatusItem = 'Pendente' | 'Parcial' | 'Concluido'
export type OrigemItem = 'Comprado' | 'Ganhado'
export type SexoBebe = 'NaoInformado' | 'Feminino' | 'Masculino'
export type Clima = 'Todos' | 'Frio' | 'Calor'
export type Estacao = 'Verao' | 'Outono' | 'Inverno' | 'Primavera'
export type TemaVisual = 'Oliveira' | 'Cerejeira' | 'Lavanda' | 'Pessego' | 'Jardim' | 'Ceu' | 'Oceano' | 'Ursinho'

export interface Conta {
  email: string
}

/** Pessoa que participa do enxoval (o casal entra por convite). */
export interface Membro {
  email: string
  entrouEm: string
  eu: boolean
}

export interface Enxoval {
  id: number
  boasVindasConcluidas: boolean
  nomeBebe: string | null
  sexo: SexoBebe
  dataPrevistaParto: string | null // yyyy-MM-dd
  orcamento: number | null
  cidade: string | null
  latitude: number | null
  longitude: number | null
  tema: TemaVisual
}

export interface Local {
  nome: string
  estado: string | null
  pais: string | null
  latitude: number
  longitude: number
}

export interface PerfilClima {
  cidade: string | null
  estacaoNascimento: Estacao
  meses: { ano: number; mes: number; tempMedia: number; tempMinima: number }[]
  precisaFrio: boolean
  precisaCalor: boolean
}
export type AtualizarEnxoval = Omit<Enxoval, 'id' | 'boasVindasConcluidas' | 'tema'>
export interface BoasVindas {
  nomeBebe: string | null
  dataPrevistaParto: string | null
  sexo?: SexoBebe
  tema?: TemaVisual
}

export interface Categoria {
  id: number
  nome: string
  ordem: number
  totalItens: number
}
export interface SalvarCategoria {
  nome: string
  ordem: number
}

export interface Item {
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
  status: StatusItem
  valorEstimado: number
  foraDaEstacao: boolean // item de frio/calor que não combina com o clima previsto
  fotoUrl: string | null
  atualizadoEm: string
}
export type SalvarItem = Omit<Item, 'id' | 'status' | 'valorEstimado' | 'foraDaEstacao' | 'fotoUrl' | 'atualizadoEm'>

/** RF25: valor = total pago pela compra (não o unitário). */
export interface RegistrarCompra {
  quantidade: number
  origem: OrigemItem
  valor: number | null
}

/** Alteração de foto feita no formulário: nova imagem, remover, ou nada. */
export type AlteracaoFoto = Blob | 'remover' | null

export interface ResumoCategoria {
  categoriaId: number
  nome: string
  totalItens: number
  concluidos: number
  percentual: number
}

export interface Painel {
  resumo: {
    totalItens: number
    concluidos: number
    percentualGeral: number
    totalEstimado: number
    totalEstimadoEssencial: number // só prioridade Alta
    totalGasto: number
    saldo: number | null
    foraDaEstacao: number
    gestacao: { semanas: number; dias: number; diasParaParto: number } | null
    categorias: ResumoCategoria[]
  }
  clima: PerfilClima | null
  pendentesAltaPrioridade: Item[]
}
