import { useState } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { api } from '../api/client'
import { useAcao } from '../api/hooks'
import type { Item, OrigemItem } from '../api/types'
import { falta, valorSugerido } from '../lib/loja'
import { moeda } from '../lib/format'

interface Props {
  item: Item | null
  onClose: () => void
}

/** RF25: registra unidades compradas/ganhas com o valor pago. Remontar (key) ao trocar de item. */
export default function RegistrarCompraDialog({ item, onClose }: Props) {
  const inicial = item ? Math.max(falta(item), 1) : 1
  const [quantidade, setQuantidade] = useState(inicial)
  const [origem, setOrigem] = useState<OrigemItem>('Comprado')
  // Enquanto o valor não for digitado, acompanha a sugestão (preço estimado × quantidade).
  const [valorDigitado, setValorDigitado] = useState<string | null>(null)
  const registrar = useAcao(api.registrarCompra)

  if (!item) return null
  const sugerido = valorSugerido(item, quantidade)
  const valor = valorDigitado ?? (sugerido == null ? '' : String(sugerido))
  const valorInvalido = valor !== '' && Number(valor) < 0

  const confirmar = () => registrar.mutate(
    { id: item.id, quantidade, origem, valor: origem === 'Ganhado' || valor === '' ? null : Number(valor) },
    { onSuccess: onClose })

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 0.5 }}>{item.nome}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {[item.tamanho, `Tenho ${item.qtdAdquirida} de ${item.qtdDesejada}`,
            item.precoUnitarioEstimado != null ? `≈ ${moeda(item.precoUnitarioEstimado)} cada` : null].filter(Boolean).join(' · ')}
        </Typography>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <IconButton aria-label="Menos uma unidade" onClick={() => setQuantidade(q => Math.max(q - 1, 1))}
              disabled={quantidade <= 1} sx={{ border: '1px solid', borderColor: 'divider', width: 52, height: 52 }}>
              <RemoveIcon />
            </IconButton>
            <Stack sx={{ alignItems: 'center', minWidth: 72 }}>
              <Typography sx={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{quantidade}</Typography>
              <Typography variant="caption" color="text.secondary">{quantidade === 1 ? 'unidade' : 'unidades'}</Typography>
            </Stack>
            <IconButton aria-label="Mais uma unidade" onClick={() => setQuantidade(q => q + 1)}
              sx={{ border: '1px solid', borderColor: 'divider', width: 52, height: 52 }}>
              <AddIcon />
            </IconButton>
          </Stack>

          <ToggleButtonGroup exclusive fullWidth value={origem} onChange={(_, v: OrigemItem | null) => v && setOrigem(v)}>
            <ToggleButton value="Comprado" sx={{ py: 1.25 }}>Comprei</ToggleButton>
            <ToggleButton value="Ganhado" sx={{ py: 1.25 }}>Ganhei 🎁</ToggleButton>
          </ToggleButtonGroup>

          {origem === 'Comprado' && (
            <TextField label="Quanto pagou (total)" type="number" value={valor} autoComplete="off"
              onChange={e => setValorDigitado(e.target.value)} error={valorInvalido}
              helperText={valorInvalido ? 'Não pode ser negativo.' : valorDigitado == null && sugerido != null ? 'Sugestão pelo preço estimado' : ' '}
              slotProps={{
                htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
                input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> },
              }} />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" size="large" onClick={confirmar} loading={registrar.isPending} disabled={valorInvalido}>
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
