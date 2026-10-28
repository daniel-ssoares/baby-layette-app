import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Alert, Box, Button, Card, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { api } from '../api/client'
import { useAcao, useEnxoval } from '../api/hooks'
import type { AtualizarEnxoval } from '../api/types'
import { nossoBebe, oBebe, rotuloSexo } from '../lib/format'
import { cores, fonteNome } from '../theme'
import Carregando from '../components/Carregando'
import RamoOliveira from '../components/RamoOliveira'
import SeletorCidade from '../components/SeletorCidade'
import TrocarSenha from '../components/TrocarSenha'

export default function EnxovalPage() {
  const enxoval = useEnxoval()
  const salvar = useAcao(api.atualizarEnxoval)
  const { register, control, handleSubmit, reset, setValue } = useForm<AtualizarEnxoval>()
  const [nomeDigitado, sexoEscolhido, cidade, latitude, longitude] =
    useWatch({ control, name: ['nomeBebe', 'sexo', 'cidade', 'latitude', 'longitude'] })

  useEffect(() => { if (enxoval.data) reset(enxoval.data) }, [enxoval.data, reset])

  if (!enxoval.data) return <Carregando erro={enxoval.error} />
  const nome = nomeDigitado || enxoval.data.nomeBebe
  const sexo = sexoEscolhido ?? enxoval.data.sexo

  return (
    <Stack spacing={3} sx={{ maxWidth: 560, mx: 'auto' }}>
    <Card>
      <Box sx={{ p: 3, textAlign: 'center', background: `linear-gradient(180deg, ${cores.olivaClara}, #fff)` }}>
        <RamoOliveira tamanho={90} sx={{ mx: 'auto', display: 'block' }} />
        <Typography sx={{ fontFamily: fonteNome, fontSize: 48, fontWeight: 700, color: 'primary.main', lineHeight: 1.1 }}>
          {nome || nossoBebe(sexo)}
        </Typography>
        <Typography color="text.secondary">Dados usados no painel e na lista</Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit(d => salvar.mutate(d))} sx={{ p: 3, pt: 1 }}>
        <Stack spacing={2.5}>
          <TextField label="Nome do bebê" placeholder="Ainda escolhendo…" {...register('nomeBebe')}
            slotProps={{ inputLabel: { shrink: true } }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller name="sexo" control={control} defaultValue="NaoInformado" render={({ field }) => (
              <TextField select label="Sexo" fullWidth {...field}>
                {Object.entries(rotuloSexo).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
              </TextField>
            )} />
            <TextField label="Data prevista do parto" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
              {...register('dataPrevistaParto', { setValueAs: v => v || null })} />
          </Stack>
          <TextField label="Orçamento total (R$)" type="number" placeholder="Opcional"
            slotProps={{ htmlInput: { step: '0.01', min: 0 }, inputLabel: { shrink: true } }}
            {...register('orcamento', { setValueAs: v => (v === '' || v == null ? null : Number(v)) })} />

          <Divider />
          <Box>
            <Typography variant="subtitle1">Onde {oBebe(nome, sexo)} vai nascer?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Usamos a média histórica de temperatura da cidade nos primeiros meses para indicar itens de frio ou de calor.
            </Typography>
            <SeletorCidade
              valor={{ cidade: cidade ?? null, latitude: latitude ?? null, longitude: longitude ?? null }}
              onChange={v => {
                setValue('cidade', v.cidade, { shouldDirty: true })
                setValue('latitude', v.latitude, { shouldDirty: true })
                setValue('longitude', v.longitude, { shouldDirty: true })
              }} />
          </Box>

          {salvar.isSuccess && <Alert severity="success" sx={{ borderRadius: 3 }}>Dados salvos.</Alert>}
          <Button type="submit" variant="contained" size="large" loading={salvar.isPending}>Salvar</Button>
        </Stack>
      </Box>
    </Card>

    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Conta do casal</Typography>
      <TrocarSenha />
    </Card>
    </Stack>
  )
}
