import { useState } from 'react'
import { Box, Chip, IconButton, ListItemIcon, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import UncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagOutlined'
import type { Item } from '../api/types'
import { moeda } from '../lib/format'
import { cores } from '../theme'

interface Props {
  item: Item
  onMais: () => void
  onMenos: () => void
  onConcluir: () => void
  onRegistrarCompra: () => void
  onEditar: () => void
  onExcluir: () => void
}

export default function ItemLinha({ item: i, onMais, onMenos, onConcluir, onRegistrarCompra, onEditar, onExcluir }: Props) {
  const [menu, setMenu] = useState<HTMLElement | null>(null)
  const concluido = i.status === 'Concluido'

  const detalhes = [
    i.tamanho && i.tamanho !== 'Único' ? i.tamanho : null,
    i.origem === 'Ganhado' ? 'Ganhado 🎁' : i.valorPago ? `Pago ${moeda(i.valorPago)}` : i.valorEstimado ? `≈ ${moeda(i.valorEstimado)}` : null,
  ].filter(Boolean)

  return (
    <Stack direction="row" spacing={1} sx={{
      alignItems: 'center', px: { xs: 1, sm: 1.5 }, py: 1.25,
      borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: '#FDFCF6' },
      opacity: i.foraDaEstacao ? 0.55 : 1,
    }}>
      <Tooltip title={concluido ? 'Concluído' : 'Marcar como concluído'}>
        <span>
          <IconButton size="small" onClick={onConcluir} disabled={concluido}
            sx={{ color: concluido ? 'success.main' : 'text.disabled', '&.Mui-disabled': { color: 'success.main' } }}>
            {concluido ? <CheckCircleIcon /> : <UncheckedIcon />}
          </IconButton>
        </span>
      </Tooltip>

      {i.fotoUrl && (
        <Box component="img" src={i.fotoUrl} alt="" loading="lazy" onClick={onEditar}
          sx={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }} />
      )}
      <Box onClick={onEditar} sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          {i.prioridade === 'Alta' && !concluido && (
            <Box title="Prioridade alta" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
          )}
          <Typography sx={{
            fontWeight: 600, color: concluido ? 'text.secondary' : 'text.primary',
            textDecoration: concluido ? 'line-through' : 'none', textDecorationColor: 'rgba(0,0,0,.25)',
          }} noWrap>
            {i.nome}
          </Typography>
          {i.clima === 'Frio' && <Tooltip title="Item de frio"><AcUnitIcon sx={{ fontSize: 16, color: '#5B8DB8' }} /></Tooltip>}
          {i.clima === 'Calor' && <Tooltip title="Item de calor"><WbSunnyIcon sx={{ fontSize: 16, color: '#D98B4A' }} /></Tooltip>}
          {i.foraDaEstacao && <Chip size="small" label="fora da estação" sx={{ height: 20, fontSize: 11 }} />}
        </Stack>
        {(detalhes.length > 0 || i.observacoes) && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {detalhes.join(' · ')}{detalhes.length > 0 && i.observacoes ? ' · ' : ''}
            {i.observacoes && <Box component="span" sx={{ fontStyle: 'italic' }}>{i.observacoes}</Box>}
          </Typography>
        )}
      </Box>

      <Stack direction="row" sx={{
        alignItems: 'center', flexShrink: 0, borderRadius: 999,
        bgcolor: concluido ? cores.salviaClara : i.status === 'Parcial' ? '#F8EBDC' : cores.areia,
      }}>
        <IconButton size="small" onClick={onMenos} disabled={i.qtdAdquirida === 0} aria-label="Remover um">
          <RemoveIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 34, textAlign: 'center' }}>
          {i.qtdAdquirida}/{i.qtdDesejada}
        </Typography>
        <IconButton size="small" onClick={onMais} aria-label="Adicionar um">
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      <IconButton size="small" onClick={e => setMenu(e.currentTarget)} aria-label="Mais ações">
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem onClick={() => { setMenu(null); onRegistrarCompra() }}>
          <ListItemIcon><ShoppingBagIcon fontSize="small" /></ListItemIcon>Registrar compra
        </MenuItem>
        <MenuItem onClick={() => { setMenu(null); onEditar() }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Editar
        </MenuItem>
        <MenuItem onClick={() => { setMenu(null); onExcluir() }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>Excluir
        </MenuItem>
      </Menu>
    </Stack>
  )
}
