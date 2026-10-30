import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Box, Button, Card, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material'
import { api } from '../api/client'
import { useAcao } from '../api/hooks'
import type { SexoBebe, TemaVisual } from '../api/types'
import { fonteNome } from '../theme'
import Motivo, { Confetes } from '../temas/Motivo'
import { fundoDecorado } from '../temas/desenhos'
import { temasDisponiveis } from '../temas/paletas'
import { useTemaApp } from '../temas/contexto'
import SeletorTema from '../components/SeletorTema'

interface Campos { nomeBebe: string; dataPrevistaParto: string; sexo: SexoBebe; tema: TemaVisual }

/** T2: primeira tela após criar a conta. Nome, data e sexo são opcionais; o tema muda a tela na hora. */
export default function BoasVindasPage() {
  const concluir = useAcao(api.concluirBoasVindas)
  const { definirPrevia } = useTemaApp()
  const t = useTheme().palette.tema
  const { register, control, handleSubmit, setValue, getValues } = useForm<Campos>({
    defaultValues: { nomeBebe: '', dataPrevistaParto: '', sexo: 'NaoInformado', tema: 'Oliveira' },
  })
  const [sexo, tema] = useWatch({ control, name: ['sexo', 'tema'] })
  const opcoes = temasDisponiveis(sexo)

  useEffect(() => { definirPrevia(tema) }, [tema, definirPrevia])
  useEffect(() => () => definirPrevia(null), [definirPrevia])

  const trocarSexo = (novo: SexoBebe) => {
    setValue('sexo', novo)
    const disponiveis = temasDisponiveis(novo)
    if (!disponiveis.includes(getValues('tema'))) setValue('tema', disponiveis[0])
  }

  const enviar = (semNome: boolean) => handleSubmit(d => concluir.mutate({
    nomeBebe: semNome ? null : d.nomeBebe.trim() || null,
    dataPrevistaParto: d.dataPrevistaParto || null,
    sexo: d.sexo,
    tema: d.tema,
  }))

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      background: fundoDecorado(t), backgroundSize: '64px, auto', position: 'relative', overflow: 'hidden',
      transition: 'background .3s',
    }}>
      <Confetes quantidade={6} />
      <Card sx={{ position: 'relative', width: '100%', maxWidth: 480, p: { xs: 3, sm: 4 } }}>
        <Stack component="form" spacing={2.5} onSubmit={enviar(false)} noValidate>
          <Stack sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Motivo tamanho={120} animado />
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

          <Controller name="sexo" control={control} render={({ field }) => (
            <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={field.value} aria-label="Sexo do bebê"
              onChange={(_, v: SexoBebe | null) => v && trocarSexo(v)}
              sx={{ '& .MuiToggleButton-root': { fontWeight: 700, textTransform: 'none', borderRadius: '999px !important', border: 'none' },
                bgcolor: 'tema.afundado', borderRadius: 999, p: 0.5, gap: 0.5 }}>
              <ToggleButton value="Feminino">Menina</ToggleButton>
              <ToggleButton value="Masculino">Menino</ToggleButton>
              <ToggleButton value="NaoInformado">Ainda não sabemos</ToggleButton>
            </ToggleButtonGroup>
          )} />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Escolham o tema</Typography>
            <Controller name="tema" control={control} render={({ field }) => (
              <SeletorTema opcoes={opcoes} valor={field.value} onChange={field.onChange} />
            )} />
          </Box>

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
