import { createContext, useContext } from 'react'
import type { TemaVisual } from '../api/types'
import type { PreferenciaModo } from '../lib/modoCor'

export interface ContextoTema {
  preferencia: PreferenciaModo
  definirPreferencia: (p: PreferenciaModo) => void
  /** Boas-vindas: mostra um tema antes de salvar (null volta ao do enxoval). */
  definirPrevia: (t: TemaVisual | null) => void
}

export const Contexto = createContext<ContextoTema>({ preferencia: 'automatico', definirPreferencia: () => {}, definirPrevia: () => {} })
/** Modo claro/escuro deste aparelho e prévia de tema (fornecidos por TemaProvider). */
export const useTemaApp = () => useContext(Contexto)
