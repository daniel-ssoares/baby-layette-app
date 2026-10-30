import { Box, ButtonBase, Typography, useTheme } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { TemaVisual } from '../api/types'
import Motivo from '../temas/Motivo'
import { temas } from '../temas/paletas'

/** Cartões com o desenho e as cores de cada tema (no modo atual). */
export default function SeletorTema({ opcoes, valor, onChange, disabled }: {
  opcoes: TemaVisual[]; valor: TemaVisual; onChange: (t: TemaVisual) => void; disabled?: boolean
}) {
  const modo = useTheme().palette.tema.modo
  return (
    <Box role="radiogroup" aria-label="Tema" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 1 }}>
      {opcoes.map(id => {
        const p = temas[id][modo]
        const sel = id === valor
        return (
          <ButtonBase key={id} role="radio" aria-checked={sel} aria-label={temas[id].nome} disabled={disabled}
            onClick={() => onChange(id)} sx={{
              position: 'relative', flexDirection: 'column', gap: 0.5, p: 1, pb: 1.25, borderRadius: '14px',
              bgcolor: p.fundo, color: p.texto, border: '2px solid', borderColor: sel ? p.principal : 'divider',
              boxShadow: sel ? `0 0 0 3px ${p.suave}` : 'none', transition: 'border-color .2s, box-shadow .2s, transform .15s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}>
            {sel && <CheckCircleIcon sx={{ position: 'absolute', top: 4, right: 4, fontSize: 18, color: p.principal }} />}
            <Motivo tema={id} tamanho={56} cores={p} />
            <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{temas[id].nome}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[p.principal, p.acento, p.detalhe].map(c => <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />)}
            </Box>
          </ButtonBase>
        )
      })}
    </Box>
  )
}
