import type { ModoCor } from '../theme'

/** Escolha do aparelho: seguir o sistema, ou forçar claro/escuro. Fica no localStorage (cada celular escolhe o seu). */
export type PreferenciaModo = 'automatico' | 'claro' | 'escuro'

const CHAVE = 'enxoval-modo-cor'
const validas: PreferenciaModo[] = ['automatico', 'claro', 'escuro']

export function lerPreferencia(armazenamento: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): PreferenciaModo {
  try {
    const v = armazenamento?.getItem(CHAVE)
    return validas.includes(v as PreferenciaModo) ? v as PreferenciaModo : 'automatico'
  } catch { return 'automatico' }
}

export function salvarPreferencia(p: PreferenciaModo, armazenamento: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage) {
  try { armazenamento?.setItem(CHAVE, p) } catch { /* modo privado: vale só nesta visita */ }
}

export const resolverModo = (p: PreferenciaModo, sistemaEscuro: boolean): ModoCor =>
  p === 'automatico' ? (sistemaEscuro ? 'escuro' : 'claro') : p

/** Ordem do botão do cabeçalho: automático → claro → escuro → automático. */
export const proximaPreferencia = (p: PreferenciaModo): PreferenciaModo => validas[(validas.indexOf(p) + 1) % validas.length]

export const rotuloPreferencia: Record<PreferenciaModo, string> = { automatico: 'Automático', claro: 'Claro', escuro: 'Escuro' }
