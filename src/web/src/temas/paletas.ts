import type { SexoBebe, TemaVisual } from '../api/types'

/** Cores-base de um tema num modo (claro ou escuro). O resto é derivado em `criarTema`. */
export interface Paleta {
  fundo: string
  superficie: string
  principal: string
  /** Segunda cor do tema (botões secundários, degradê, chips). */
  acento: string
  /** Terceira cor, só dos desenhos e elementos soltos. */
  detalhe: string
  suave: string
  texto: string
  textoSuave: string
}

export type GrupoTema = 'Feminino' | 'Masculino' | 'Neutro'

export interface InfoTema {
  nome: string
  descricao: string
  grupo: GrupoTema
  claro: Paleta
  escuro: Paleta
}

// Mesmas cores claras de src/Enxoval.Api/Exportacao.cs (PDF). Escuro: "noite" tingida, nunca preto puro.
export const temas: Record<TemaVisual, InfoTema> = {
  Cerejeira: {
    nome: 'Cerejeira', descricao: 'Rosa-cereja, ameixa e pétalas', grupo: 'Feminino',
    claro: { fundo: '#FFF5F7', superficie: '#FFFFFF', principal: '#D9587A', acento: '#8E3B6E', detalhe: '#F7B3C5', suave: '#FCE1E8', texto: '#3F2431', textoSuave: '#8C6676' },
    escuro: { fundo: '#1F1219', superficie: '#2B1A23', principal: '#FF8FAB', acento: '#D78BC4', detalhe: '#FFC6D5', suave: '#44222F', texto: '#FBE9EF', textoSuave: '#C29AAA' },
  },
  Lavanda: {
    nome: 'Lavanda', descricao: 'Lilás, sálvia e mel', grupo: 'Feminino',
    claro: { fundo: '#FAF7FF', superficie: '#FFFFFF', principal: '#8A63D2', acento: '#4FA37A', detalhe: '#F2C14E', suave: '#EEE6FB', texto: '#2E2546', textoSuave: '#776E92' },
    escuro: { fundo: '#17132A', superficie: '#221C38', principal: '#B79CFF', acento: '#7FD4A6', detalhe: '#FFD46B', suave: '#33295A', texto: '#EFEAFF', textoSuave: '#ABA2CC' },
  },
  Pessego: {
    nome: 'Pêssego', descricao: 'Pêssego, mel e margaridas', grupo: 'Feminino',
    claro: { fundo: '#FFF7F1', superficie: '#FFFFFF', principal: '#E0663F', acento: '#E8A923', detalhe: '#6FB07F', suave: '#FFE6DA', texto: '#43281D', textoSuave: '#91705F' },
    escuro: { fundo: '#22140F', superficie: '#301D16', principal: '#FF9C7A', acento: '#FFCB52', detalhe: '#8FD19F', suave: '#4A2A1E', texto: '#FFEEE6', textoSuave: '#C9A496' },
  },
  Jardim: {
    nome: 'Jardim', descricao: 'Borboletas e flores', grupo: 'Feminino',
    claro: { fundo: '#F5FBF4', superficie: '#FFFFFF', principal: '#3E9B6A', acento: '#E86A9B', detalhe: '#F2C14E', suave: '#DDF2E3', texto: '#1F3A2A', textoSuave: '#62806D' },
    escuro: { fundo: '#0F1C15', superficie: '#172A20', principal: '#6FD39C', acento: '#FF8DB8', detalhe: '#FFD46B', suave: '#1F3C2C', texto: '#E6F6EC', textoSuave: '#94B8A2' },
  },
  Ceu: {
    nome: 'Céu', descricao: 'Nuvens, lua e estrelas', grupo: 'Masculino',
    claro: { fundo: '#F3F8FF', superficie: '#FFFFFF', principal: '#3D8BD9', acento: '#F2B630', detalhe: '#B9D8FA', suave: '#DCEBFC', texto: '#1C3350', textoSuave: '#647D9D' },
    escuro: { fundo: '#0E1630', superficie: '#17213F', principal: '#7DB8FF', acento: '#FFD15C', detalhe: '#3E5A92', suave: '#233562', texto: '#E7F0FF', textoSuave: '#9AAED0' },
  },
  Oceano: {
    nome: 'Oceano', descricao: 'Petróleo, coral e baleia', grupo: 'Masculino',
    claro: { fundo: '#F0FAF9', superficie: '#FFFFFF', principal: '#138A94', acento: '#F07B5C', detalhe: '#F6C96A', suave: '#D3F0EE', texto: '#123A3E', textoSuave: '#5A8285' },
    escuro: { fundo: '#0A1C1F', superficie: '#10292D', principal: '#4FD1D9', acento: '#FF9478', detalhe: '#FFD98A', suave: '#154047', texto: '#DFF6F5', textoSuave: '#8DB7B9' },
  },
  Ursinho: {
    nome: 'Ursinho', descricao: 'Caramelo, marinho e balões', grupo: 'Masculino',
    claro: { fundo: '#FCF6EE', superficie: '#FFFFFF', principal: '#B5733C', acento: '#2F5E96', detalhe: '#E8705A', suave: '#F5E3CF', texto: '#36261A', textoSuave: '#86705C' },
    escuro: { fundo: '#1C140D', superficie: '#281D14', principal: '#E9A66B', acento: '#8FB7EB', detalhe: '#FF8E78', suave: '#3F2D1D', texto: '#F8ECDF', textoSuave: '#BCA48E' },
  },
  Oliveira: {
    nome: 'Oliveira', descricao: 'Verde-oliva e rosa antigo', grupo: 'Neutro',
    claro: { fundo: '#FAF8EF', superficie: '#FFFFFF', principal: '#708A3A', acento: '#D27D8E', detalhe: '#A9BD6E', suave: '#E8EED6', texto: '#33381F', textoSuave: '#737960' },
    escuro: { fundo: '#13170E', superficie: '#1D2316', principal: '#B5CF6E', acento: '#F0A3B2', detalhe: '#7F9A45', suave: '#2C3620', texto: '#EDF0E0', textoSuave: '#A3AA8D' },
  },
}

export const temasFemininos: TemaVisual[] = ['Cerejeira', 'Lavanda', 'Pessego', 'Jardim']
export const temasMasculinos: TemaVisual[] = ['Ceu', 'Oceano', 'Ursinho']
export const todosOsTemas: TemaVisual[] = [...temasFemininos, ...temasMasculinos, 'Oliveira']

/** Espelho de Temas.DisponiveisPara (Domain): os do sexo informado + Oliveira; sem sexo, todos. */
export const temasDisponiveis = (sexo: SexoBebe): TemaVisual[] =>
  sexo === 'Feminino' ? [...temasFemininos, 'Oliveira']
    : sexo === 'Masculino' ? [...temasMasculinos, 'Oliveira']
      : todosOsTemas
