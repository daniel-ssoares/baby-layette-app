import { useForm } from 'react-hook-form'
import { Box, Button, Card, Stack, TextField, Typography } from '@mui/material'
import { api } from '../api/client'
import { useAcao } from '../api/hooks'
import { cores, fonteNome } from '../theme'
import RamoOliveira from '../components/RamoOliveira'

interface Campos { nomeBebe: string; dataPrevistaParto: string }

/** T2: primeira tela após criar a conta. O nome da criança é opcional. */
export default function BoasVindasPage() {
  const concluir = useAcao(api.concluirBoasVindas)
  const { register, handleSubmit } = useForm<Campos>({ defaultValues: { nomeBebe: '', dataPrevistaParto: '' } })

  const enviar = (semNome: boolean) => handleSubmit(d => concluir.mutate({
    nomeBebe: semNome ? null : d.nomeBebe.trim() || null,
    dataPrevistaParto: d.dataPrevistaParto || null,
  }))

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      background: `linear-gradient(160deg, ${cores.olivaClara} 0%, ${cores.creme} 50%, ${cores.rosaClaro} 100%)`,
    }}>
      <Card sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 4 } }}>
        <Stack component="form" spacing={2.5} onSubmit={enviar(false)} noValidate>
          <Stack sx={{ alignItems: 'center', textAlign: 'center' }}>
            <RamoOliveira tamanho={90} />
            <Typography sx={{ fontFamily: fonteNome, fontSize: 38, fontWeight: 700, color: 'primary.main', lineHeight: 1.15 }}>
              Que bom ter vocês aqui!
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Já montamos uma lista de enxoval para começar. Antes, contem um pouco sobre o bebê.
            </Typography>
          </Stack>

          <TextField label="Qual o nome do bebê?" placeholder="Opcional" autoFocus
            slotProps={{ inputLabel: { shrink: true } }} {...register('nomeBebe')} />
          <TextField label="Data prevista do parto" type="date" helperText="Opcional — usamos para a contagem e o clima."
            slotProps={{ inputLabel: { shrink: true } }} {...register('dataPrevistaParto')} />

          <Button type="submit" variant="contained" size="large" loading={concluir.isPending}>Continuar</Button>
          <Button color="inherit" onClick={enviar(true)} disabled={concluir.isPending}>
            Ainda não escolhemos o nome
          </Button>
          <Typography variant="caption" color="text.secondary" align="center">
            Dá para mudar tudo depois, na aba do bebê.
          </Typography>
        </Stack>
      </Card>
    </Box>
  )
}
