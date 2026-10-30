import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { api } from '../api/client'
import { useAcao } from '../api/hooks'

/**
 * Confirma a entrada no enxoval de quem convidou. Quem já tem um enxoval nesta conta perde o atual
 * (o banco só permite um enxoval por pessoa), por isso a pergunta.
 */
export default function AceitarConvite({ codigo, onFechar }: { codigo: string | null; onFechar: (aceito: boolean) => void }) {
  const aceitar = useAcao(api.aceitarConvite)
  return (
    <Dialog open={!!codigo} onClose={() => !aceitar.isPending && onFechar(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Participar de outro enxoval?</DialogTitle>
      <DialogContent>
        <Typography>
          Você vai montar o enxoval junto com quem enviou o convite <b>{codigo}</b>.
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, borderRadius: '12px' }}>
          O enxoval que está hoje na sua conta (itens, compras e fotos) será apagado.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={() => onFechar(false)} disabled={aceitar.isPending}>Agora não</Button>
        <Button variant="contained" loading={aceitar.isPending}
          onClick={() => codigo && aceitar.mutate(codigo, { onSuccess: () => onFechar(true) })}>
          Participar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
