import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { api } from '../api/client'
import { useAcao, useEu } from '../api/hooks'
import Captcha from './Captcha'
import { captchaAtivo } from '../lib/captcha'

interface Campos { atual: string; nova: string }

/** T1 (RF04): conta de quem está logado e troca de senha. */
export default function TrocarSenha() {
  const eu = useEu()
  const [captcha, setCaptcha] = useState<string | null>(null)
  const [versao, setVersao] = useState(0)
  const trocar = useAcao(({ atual, nova }: Campos) => api.trocarSenha(atual, nova, captcha).finally(() => setVersao(v => v + 1)))
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Campos>()

  return (
    <Stack component="form" spacing={2} noValidate
      onSubmit={handleSubmit(d => trocar.mutate(d, { onSuccess: () => reset({ atual: '', nova: '' }) }))}>
      <Typography variant="body2" color="text.secondary">Conta: <b>{eu.data?.email}</b></Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField label="Senha atual" type="password" autoComplete="current-password" fullWidth
          {...register('atual', { required: 'Informe a senha atual.' })}
          error={!!errors.atual} helperText={errors.atual?.message} />
        <TextField label="Nova senha" type="password" autoComplete="new-password" fullWidth
          {...register('nova', { required: 'Informe a nova senha.', minLength: { value: 8, message: 'Mínimo de 8 caracteres.' } })}
          error={!!errors.nova} helperText={errors.nova?.message} />
      </Stack>
      <Captcha onToken={setCaptcha} versao={versao} />
      {trocar.isSuccess && <Alert severity="success" sx={{ borderRadius: '12px' }}>Senha alterada.</Alert>}
      <Button type="submit" variant="outlined" loading={trocar.isPending} disabled={captchaAtivo && !captcha} sx={{ alignSelf: 'flex-start' }}>
        Trocar senha
      </Button>
    </Stack>
  )
}
