import { Box, type SxProps } from '@mui/material'
import { cores } from '../theme'

// Folhas ao longo do galho: [x, y, rotação]
const folhas: [number, number, number][] = [
  [30, 88, -60], [44, 74, 40], [58, 66, -50], [72, 52, 35], [86, 46, -45], [100, 32, 30], [112, 26, -35],
]
const azeitonas: [number, number][] = [[52, 82], [80, 62], [104, 44]]

/** Ramo de oliveira em SVG — motivo visual do app (paz, crescimento). */
export default function RamoOliveira({ tamanho = 120, sx }: { tamanho?: number; sx?: SxProps }) {
  return (
    <Box component="svg" viewBox="0 0 140 110" sx={{ width: tamanho, height: tamanho * 110 / 140, ...sx }} aria-hidden>
      <path d="M14 100 C 50 80, 90 50, 128 18" fill="none" stroke={cores.olivaEscura} strokeWidth="2.5" strokeLinecap="round" />
      {folhas.map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="13" ry="5" transform={`rotate(${r} ${x} ${y})`}
          fill={i % 2 ? cores.folha : cores.oliva} opacity={0.9} />
      ))}
      {azeitonas.map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="5" ry="6.5" fill={cores.azeitona} />
          <ellipse cx={x - 1.5} cy={y - 2.5} rx="1.4" ry="2" fill="#fff" opacity={0.35} />
        </g>
      ))}
    </Box>
  )
}
