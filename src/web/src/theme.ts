import { alpha, createTheme, darken, lighten } from '@mui/material'
import '@fontsource-variable/nunito'
import '@fontsource-variable/dancing-script'
import type { TemaVisual } from './api/types'
import { temas, type Paleta } from './temas/paletas'

export type ModoCor = 'claro' | 'escuro'

/** Cores do tema atual além das do MUI; nos componentes: `sx={{ bgcolor: 'tema.suave' }}` ou `theme.palette.tema`. */
export interface CoresTema extends Paleta {
  id: TemaVisual
  modo: ModoCor
  principalEscura: string
  acentoSuave: string
  detalheSuave: string
  sucessoSuave: string
  parcialSuave: string
  /** Fundo de chips/áreas neutras (antigo "areia"). */
  afundado: string
  hover: string
  /** Cabeçalho translúcido. */
  vidro: string
  sombra: string
  frio: { cor: string; fundo: string }
  calor: { cor: string; fundo: string }
}

declare module '@mui/material/styles' {
  interface Palette { tema: CoresTema }
  interface PaletteOptions { tema?: CoresTema }
}

/** Fonte cursiva usada apenas no nome do bebê. */
export const fonteNome = '"Dancing Script Variable", "Dancing Script", cursive'

function coresTema(id: TemaVisual, modo: ModoCor): CoresTema {
  const p = temas[id][modo]
  const escuro = modo === 'escuro'
  const sucesso = escuro ? '#8FC79B' : '#5E9A6B'
  const parcial = escuro ? '#E8B57E' : '#D9A066'
  return {
    ...p, id, modo,
    principalEscura: escuro ? lighten(p.principal, 0.15) : darken(p.principal, 0.18),
    acentoSuave: escuro ? alpha(p.acento, 0.18) : lighten(p.acento, 0.86),
    detalheSuave: escuro ? alpha(p.detalhe, 0.18) : lighten(p.detalhe, 0.8),
    sucessoSuave: alpha(sucesso, escuro ? 0.2 : 0.16),
    parcialSuave: alpha(parcial, escuro ? 0.2 : 0.2),
    afundado: alpha(p.texto, escuro ? 0.08 : 0.06),
    hover: alpha(p.principal, escuro ? 0.08 : 0.04),
    vidro: alpha(p.fundo, 0.86),
    sombra: escuro ? 'rgba(0, 0, 0, 0.35)' : alpha(p.principal, 0.1),
    frio: escuro ? { cor: '#8DBDEB', fundo: alpha('#8DBDEB', 0.16) } : { cor: '#4A84C0', fundo: '#E3EEF7' },
    calor: escuro ? { cor: '#F2AE72', fundo: alpha('#F2AE72', 0.16) } : { cor: '#D9823C', fundo: '#FBEBDD' },
  }
}

// Animações dos desenhos (temas/Motivo.tsx): leves e desligadas para quem pede menos movimento.
const animacoes = {
  '@keyframes motivo-flutua': { '0%, 100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-6px) rotate(6deg)' } },
  '@keyframes motivo-asa': { '0%, 100%': { transform: 'scaleX(1)' }, '50%': { transform: 'scaleX(0.55)' } },
  '@keyframes motivo-pisca': { '0%, 100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.45, transform: 'scale(0.8)' } },
  '@keyframes motivo-balanca': { '0%, 100%': { transform: 'rotate(-2.5deg)' }, '50%': { transform: 'rotate(2.5deg)' } },
  '@keyframes motivo-sobe': { '0%': { transform: 'translateY(4px)', opacity: 0 }, '30%': { opacity: 1 }, '100%': { transform: 'translateY(-10px)', opacity: 0 } },
  '.motivo-animado .m-asa': { transformBox: 'fill-box', transformOrigin: 'center', animation: 'motivo-asa .9s ease-in-out infinite' },
  '.motivo-animado .m-pisca': { transformBox: 'fill-box', transformOrigin: 'center', animation: 'motivo-pisca 3.2s ease-in-out infinite' },
  '.motivo-animado .m-balanca': { transformBox: 'fill-box', transformOrigin: 'bottom center', animation: 'motivo-balanca 5s ease-in-out infinite' },
  '.motivo-animado .m-sobe': { animation: 'motivo-sobe 3s ease-out infinite' },
  '.motivo-animado .m-voa': { transformBox: 'fill-box', transformOrigin: 'center', animation: 'motivo-flutua 4s ease-in-out infinite' },
  '.confete-animado': { animation: 'motivo-flutua 7s ease-in-out infinite' },
  '@media (prefers-reduced-motion: reduce)': {
    '.motivo-animado *, .confete-animado': { animation: 'none !important' },
  },
}

export function criarTema(id: TemaVisual, modo: ModoCor) {
  const t = coresTema(id, modo)
  const escuro = modo === 'escuro'
  return createTheme({
    palette: {
      mode: escuro ? 'dark' : 'light',
      primary: { main: t.principal, dark: t.principalEscura, contrastText: escuro ? t.fundo : '#fff' },
      secondary: { main: t.acento, contrastText: escuro ? t.fundo : '#fff' },
      success: { main: escuro ? '#8FC79B' : '#5E9A6B' },
      warning: { main: escuro ? '#E8B57E' : '#D9A066' },
      background: { default: t.fundo, paper: t.superficie },
      text: { primary: t.texto, secondary: t.textoSuave },
      divider: alpha(t.texto, escuro ? 0.12 : 0.08),
      tema: t,
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Nunito Variable", "Nunito", system-ui, sans-serif',
      h4: { fontWeight: 800 },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { transition: 'background-color .25s' }, ...animacoes } },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${alpha(t.texto, escuro ? 0.1 : 0.06)}`,
            boxShadow: `0 4px 20px ${t.sombra}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 999, paddingInline: 18 } },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 700, borderRadius: 999 } } },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 8, borderRadius: 999, backgroundColor: alpha(t.texto, escuro ? 0.12 : 0.07) },
          bar: { borderRadius: 999 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 14, backgroundColor: t.superficie },
          notchedOutline: { borderColor: alpha(t.texto, escuro ? 0.2 : 0.12) },
        },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 24 } } },
      MuiFab: { styleOverrides: { root: { boxShadow: `0 8px 24px ${alpha(t.principal, 0.4)}` } } },
      MuiBottomNavigation: { styleOverrides: { root: { backgroundColor: t.superficie } } },
    },
  })
}
