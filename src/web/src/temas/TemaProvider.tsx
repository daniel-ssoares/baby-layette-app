import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Contexto, type ContextoTema } from './contexto'
import { ThemeProvider, useMediaQuery } from '@mui/material'
import type { TemaVisual } from '../api/types'
import { useEnxoval, useEu } from '../api/hooks'
import { lerPreferencia, resolverModo, salvarPreferencia } from '../lib/modoCor'
import { criarTema } from '../theme'

/** Tema do enxoval logado (deslogado = Oliveira) no modo escolhido neste aparelho. */
export default function TemaProvider({ children }: { children: ReactNode }) {
  const eu = useEu()
  const enxoval = useEnxoval(!!eu.data)
  const sistemaEscuro = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true })
  const [preferencia, setPreferencia] = useState(lerPreferencia)
  const [previa, definirPrevia] = useState<TemaVisual | null>(null)

  const id = previa ?? (eu.data ? enxoval.data?.tema : undefined) ?? 'Oliveira'
  const modo = resolverModo(preferencia, sistemaEscuro)
  const theme = useMemo(() => criarTema(id, modo), [id, modo])

  // Barra do sistema (celular / app instalado) acompanha o fundo.
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.palette.background.default)
    document.documentElement.style.colorScheme = modo === 'escuro' ? 'dark' : 'light'
  }, [theme, modo])

  const contexto = useMemo<ContextoTema>(() => ({
    preferencia,
    definirPreferencia: p => { salvarPreferencia(p); setPreferencia(p) },
    definirPrevia,
  }), [preferencia])

  return (
    <Contexto.Provider value={contexto}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Contexto.Provider>
  )
}
