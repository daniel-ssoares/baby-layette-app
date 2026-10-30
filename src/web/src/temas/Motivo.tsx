import { Box, type SxProps, useTheme } from '@mui/material'
import type { TemaVisual } from '../api/types'
import { desenhos, soltos, type CoresDesenho } from './desenhos'
import { temas } from './paletas'

const branco: CoresDesenho = { principal: '#fff', acento: '#fff', detalhe: '#fff', texto: '#fff' }

/** Cores do desenho: do tema atual, de outro tema (seletor) ou tudo branco (sobre degradê). */
function useCores(tema?: TemaVisual, cores?: CoresDesenho | 'branco') {
  const t = useTheme().palette.tema
  if (cores === 'branco') return branco
  if (cores) return cores
  return tema && tema !== t.id ? temas[tema][t.modo] : t
}

/** Desenho do tema (ramo de oliveira, cerejeira, borboletas...). `animado` liga os movimentos leves. */
export default function Motivo({ tamanho = 120, tema, cores, animado = false, sx }: {
  tamanho?: number; tema?: TemaVisual; cores?: CoresDesenho | 'branco'; animado?: boolean; sx?: SxProps
}) {
  const atual = useTheme().palette.tema.id
  const c = useCores(tema, cores)
  return (
    <Box component="svg" viewBox="0 0 100 80" aria-hidden className={animado ? 'motivo-animado' : undefined}
      sx={{ width: tamanho, height: tamanho * 0.8, flexShrink: 0, overflow: 'visible', ...sx }}
      dangerouslySetInnerHTML={{ __html: desenhos[tema ?? atual](c) }} />
  )
}

// Posições [esquerda %, topo %, rotação, tamanho px, atraso s] dos elementos soltos.
const posicoes: [number, number, number, number, number][] = [
  [6, 12, -15, 18, 0], [84, 6, 20, 16, -2], [90, 58, 0, 14, -4], [4, 70, 30, 12, -1], [48, 4, 10, 10, -3], [62, 82, -20, 12, -5],
]

/** Elementos soltos do tema flutuando devagar atrás do conteúdo (posição absoluta no pai). */
export function Confetes({ quantidade = 4, cores, opacidade = 0.8 }: {
  quantidade?: number; cores?: CoresDesenho | 'branco'; opacidade?: number
}) {
  const id = useTheme().palette.tema.id
  const c = useCores(undefined, cores)
  return posicoes.slice(0, quantidade).map(([x, y, r, s, d], i) => (
    <Box key={i} aria-hidden className="confete-animado" sx={{
      position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: opacidade,
      pointerEvents: 'none', animationDelay: `${d}s`,
    }}>
      <Box component="svg" viewBox="0 0 20 20" sx={{ width: '100%', height: '100%', transform: `rotate(${r}deg)`, overflow: 'visible' }}
        dangerouslySetInnerHTML={{ __html: soltos[id](c) }} />
    </Box>
  ))
}
