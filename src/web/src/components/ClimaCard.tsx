import { useNavigate } from 'react-router'
import { Box, Button, Card, Chip, Stack, Typography } from '@mui/material'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import PlaceIcon from '@mui/icons-material/Place'
import type { PerfilClima } from '../api/types'
import { nomeMes, rotuloEstacao } from '../lib/format'

// Mesmos limiares do back-end (AnaliseClima.cs).
const LIMITE_FRIO = 21
const LIMITE_CALOR = 23

function corTemperatura(t: number) {
  if (t < LIMITE_FRIO) return { cor: '#5B8DB8', fundo: '#E3EEF7' }
  if (t > LIMITE_CALOR) return { cor: '#D98B4A', fundo: '#FBEBDD' }
  return { cor: '#6F7D45', fundo: '#ECEFDD' }
}

/** Clima previsto para os primeiros meses de vida, a partir da cidade e da data do parto. */
export default function ClimaCard({ clima, foraDaEstacao }: { clima: PerfilClima | null; foraDaEstacao: number }) {
  const navigate = useNavigate()

  if (!clima) {
    return (
      <Card sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <PlaceIcon color="primary" />
          <Typography sx={{ flex: 1 }}>
            Informe a <b>cidade do nascimento</b> para ajustar a lista ao clima dos primeiros meses.
          </Typography>
          <Button variant="contained" size="small" onClick={() => navigate('/enxoval')}>Informar</Button>
        </Stack>
      </Card>
    )
  }

  const recomendacao = clima.precisaFrio && clima.precisaCalor
    ? 'Meia-estação: vale ter peças de frio e de calor.'
    : clima.precisaFrio ? 'Primeiros meses frios: priorize peças quentinhas.' : 'Primeiros meses quentes: priorize peças leves.'

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6">Clima previsto</Typography>
          <Typography variant="body2" color="text.secondary">
            Nasce no {rotuloEstacao[clima.estacaoNascimento]}{clima.cidade ? ` em ${clima.cidade}` : ''} · média histórica
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {clima.precisaFrio && <Chip size="small" icon={<AcUnitIcon />} label="Frio" sx={{ bgcolor: '#E3EEF7', color: '#5B8DB8', '& .MuiChip-icon': { color: '#5B8DB8' } }} />}
          {clima.precisaCalor && <Chip size="small" icon={<WbSunnyIcon />} label="Calor" sx={{ bgcolor: '#FBEBDD', color: '#D98B4A', '& .MuiChip-icon': { color: '#D98B4A' } }} />}
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${clima.meses.length}, 1fr)`, gap: 1, my: 2 }}>
        {clima.meses.map(m => {
          const { cor, fundo } = corTemperatura(m.tempMedia)
          return (
            <Box key={`${m.ano}-${m.mes}`} sx={{ bgcolor: fundo, borderRadius: '14px', py: 1.25, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: 'text.secondary' }}>
                {nomeMes(m.mes)}
              </Typography>
              <Typography variant="h6" sx={{ color: cor, lineHeight: 1.2 }}>{Math.round(m.tempMedia)}°</Typography>
              <Typography variant="caption" color="text.secondary">mín {Math.round(m.tempMinima)}°</Typography>
            </Box>
          )
        })}
      </Box>

      <Typography variant="body2">
        {recomendacao}
        {foraDaEstacao > 0 && (
          <Box component="span" sx={{ color: 'text.secondary' }}>
            {' '}{foraDaEstacao} {foraDaEstacao === 1 ? 'item ficou' : 'itens ficaram'} fora da estação e não {foraDaEstacao === 1 ? 'conta' : 'contam'} nos totais.
          </Box>
        )}
      </Typography>
    </Card>
  )
}
