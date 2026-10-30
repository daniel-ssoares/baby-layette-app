import { useState } from 'react'
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined'
import { api } from '../api/client'
import { useMembros } from '../api/hooks'
import { useMutation } from '@tanstack/react-query'
import { linkDeConvite, normalizarConvite } from '../nuvem/convite'
import AceitarConvite from './AceitarConvite'

/** Quem participa do enxoval; gerar convite para a outra pessoa ou entrar no enxoval de quem convidou. */
export default function Casal() {
  const membros = useMembros()
  const convidar = useMutation({ mutationFn: api.criarConvite })
  const [copiado, setCopiado] = useState(false)
  const [codigoDigitado, setCodigoDigitado] = useState('')
  const [confirmar, setConfirmar] = useState<string | null>(null)
  const codigo = convidar.data
  const link = codigo ? linkDeConvite(codigo) : ''

  const copiar = async () => {
    try { await navigator.clipboard.writeText(link); setCopiado(true) } catch { setCopiado(false) }
  }
  const compartilhar = () => navigator.share?.({ title: 'Enxoval', text: 'Vamos montar o enxoval juntos? Entre por este link:', url: link })
    .catch(() => undefined)

  return (
    <Stack spacing={2}>
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
        {membros.data?.map(m => (
          <Chip key={m.email} label={m.eu ? `${m.email} (você)` : m.email} color={m.eu ? 'default' : 'primary'} variant={m.eu ? 'outlined' : 'filled'} />
        ))}
      </Stack>
      {membros.data?.length === 1 && (
        <Typography variant="body2" color="text.secondary">
          Por enquanto só você. Convide quem vai montar o enxoval com você: cada um entra com o próprio e-mail e senha.
        </Typography>
      )}

      {!codigo ? (
        <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={() => convidar.mutate()} loading={convidar.isPending}
          sx={{ alignSelf: 'flex-start' }}>
          Convidar alguém
        </Button>
      ) : (
        <Alert severity="success" icon={false} sx={{ borderRadius: '12px', '& .MuiAlert-message': { width: '100%' } }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Envie o link abaixo (vale por 7 dias, uma vez só). Ou peça para digitarem o código <b>{codigo}</b> na aba do bebê.
          </Typography>
          <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'background.paper', fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all', userSelect: 'all' }}>
            {link}
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={copiar}>{copiado ? 'Copiado!' : 'Copiar link'}</Button>
            {'share' in navigator && <Button size="small" onClick={compartilhar}>Compartilhar</Button>}
          </Stack>
        </Alert>
      )}

      <Box component="form" onSubmit={e => { e.preventDefault(); if (codigoDigitado) setConfirmar(normalizarConvite(codigoDigitado)) }}
        sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField size="small" label="Recebeu um código de convite?" value={codigoDigitado}
          onChange={e => setCodigoDigitado(e.target.value)} slotProps={{ htmlInput: { maxLength: 14 } }} sx={{ flex: 1 }} />
        <Button type="submit" variant="text" disabled={!normalizarConvite(codigoDigitado)}>Participar</Button>
      </Box>

      <AceitarConvite codigo={confirmar} onFechar={aceito => { setConfirmar(null); if (aceito) setCodigoDigitado('') }} />
    </Stack>
  )
}
