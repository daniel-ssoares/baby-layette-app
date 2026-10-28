import { useMemo, useState } from 'react'
import { Box, ButtonBase, Card, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useCategorias, useItens } from '../api/hooks'
import type { Item } from '../api/types'
import { falta, montarLoja } from '../lib/loja'
import { moeda } from '../lib/format'
import IconeCategoria from '../components/IconeCategoria'
import RegistrarCompraDialog from '../components/RegistrarCompraDialog'
import RamoOliveira from '../components/RamoOliveira'
import Carregando from '../components/Carregando'
import { cores } from '../theme'

/** RF26: checklist para usar na loja — só o que falta, toque no item para registrar a compra. */
export default function LojaPage() {
  const itens = useItens()
  const categorias = useCategorias()
  const [busca, setBusca] = useState('')
  const [soEssenciais, setSoEssenciais] = useState(false)
  const [compra, setCompra] = useState<Item | null>(null)

  const loja = useMemo(
    () => montarLoja(itens.data ?? [], categorias.data ?? [], busca, soEssenciais),
    [itens.data, categorias.data, busca, soEssenciais])

  if (!itens.data || !categorias.data) return <Carregando erro={itens.error ?? categorias.error} />
  const filtrando = busca.trim() !== '' || soEssenciais

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 2.5, bgcolor: cores.olivaClara, position: 'relative', overflow: 'hidden' }}>
        <RamoOliveira tamanho={110} sx={{ position: 'absolute', right: -14, bottom: -18, opacity: 0.35 }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
          Falta comprar{soEssenciais ? ' (essenciais)' : ''}
        </Typography>
        <Typography sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, color: 'primary.dark' }}>
          ≈ {moeda(loja.valor)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loja.unidades} {loja.unidades === 1 ? 'unidade' : 'unidades'} · toque no item para registrar
        </Typography>
      </Card>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField size="small" fullWidth placeholder="Buscar item…" value={busca} onChange={e => setBusca(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon color="disabled" /></InputAdornment> } }} />
        <Chip label="Essenciais" onClick={() => setSoEssenciais(v => !v)}
          color={soEssenciais ? 'primary' : 'default'} variant={soEssenciais ? 'filled' : 'outlined'}
          sx={{ flexShrink: 0, height: 40, bgcolor: soEssenciais ? undefined : '#fff' }} />
      </Stack>

      {loja.grupos.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
          {filtrando ? 'Nenhum item encontrado.' : 'Tudo comprado! 🎉'}
        </Typography>
      )}

      {loja.grupos.map(({ categoria, itens }) => (
        <Card key={categoria.id}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2, py: 1.5 }}>
            <IconeCategoria nome={categoria.nome} />
            <Typography variant="subtitle1" sx={{ flex: 1 }}>{categoria.nome}</Typography>
            <Typography variant="body2" color="text.secondary">{itens.length}</Typography>
          </Stack>
          {itens.map(i => <LinhaLoja key={i.id} item={i} onClick={() => setCompra(i)} />)}
        </Card>
      ))}

      <RegistrarCompraDialog key={compra?.id ?? 'fechado'} item={compra} onClose={() => setCompra(null)} />
    </Stack>
  )
}

function LinhaLoja({ item: i, onClick }: { item: Item; onClick: () => void }) {
  const detalhes = [i.tamanho && i.tamanho !== 'Único' ? i.tamanho : null,
    i.precoUnitarioEstimado != null ? `≈ ${moeda(i.precoUnitarioEstimado)} cada` : null].filter(Boolean)
  return (
    <ButtonBase onClick={onClick} sx={{
      width: '100%', textAlign: 'left', display: 'flex', gap: 1.5, alignItems: 'center',
      px: 2, py: 1.5, minHeight: 64, borderTop: '1px solid', borderColor: 'divider',
    }}>
      {i.fotoUrl && (
        <Box component="img" src={i.fotoUrl} alt="" loading="lazy"
          sx={{ width: 44, height: 44, borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          {i.prioridade === 'Alta' && (
            <Box title="Essencial" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
          )}
          <Typography sx={{ fontWeight: 600 }} noWrap>{i.nome}</Typography>
        </Stack>
        {detalhes.length > 0 && <Typography variant="body2" color="text.secondary" noWrap>{detalhes.join(' · ')}</Typography>}
      </Box>
      <Chip size="small" label={falta(i) === 1 ? 'falta 1' : `faltam ${falta(i)}`}
        sx={{ bgcolor: i.status === 'Parcial' ? '#F8EBDC' : cores.areia, fontWeight: 700, flexShrink: 0 }} />
      <AddShoppingCartIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
    </ButtonBase>
  )
}
