import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Box, Button, Card, Stack, Tab, Tabs, TextField, Typography, useTheme } from '@mui/material'
import { api } from '../api/client'
import { trocarSessao } from '../api/hooks'
import { fonteNome } from '../theme'
import Motivo, { Confetes } from '../temas/Motivo'
import { fundoDecorado } from '../temas/desenhos'
import { contaDemo, modoDemo } from '../demo/modo'

interface Campos { email: string; senha: string; confirmacao: string }

/** T1: entrar ou criar a conta do casal (uma conta compartilhada). */
export default function EntrarPage() {
  const qc = useQueryClient()
  const t = useTheme().palette.tema
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [erro, setErro] = useState<string | null>(null)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Campos>()

  const enviar = async ({ email, senha }: Pick<Campos, 'email' | 'senha'>, criar = modo === 'criar') => {
    setErro(null)
    try {
      if (criar) await api.cadastrar(email, senha)
      await api.entrar(email, senha)
      trocarSessao(qc, await api.eu())
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      background: fundoDecorado(t), backgroundSize: '64px, auto', position: 'relative', overflow: 'hidden',
    }}>
      <Confetes quantidade={6} />
      <Card sx={{ position: 'relative', width: '100%', maxWidth: 400, p: { xs: 3, sm: 4 } }}>
        <Stack sx={{ alignItems: 'center', mb: 2 }}>
          <Motivo tamanho={96} animado />
          <Typography sx={{ fontFamily: fonteNome, fontSize: 40, fontWeight: 700, color: 'primary.main', lineHeight: 1.1 }}>
            Enxoval
          </Typography>
          <Typography color="text.secondary" align="center">A lista do bebê, organizada a dois.</Typography>
        </Stack>

        {modoDemo && (
          <Alert severity="info" icon={false} sx={{ mb: 2, bgcolor: 'tema.suave', color: 'text.primary', '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <b>Versão de demonstração.</b> Os dados ficam só neste navegador. Entre na conta de exemplo ou crie a sua.
            </Typography>
            <Button fullWidth variant="contained" onClick={() => enviar(contaDemo, false)}>Entrar na demonstração</Button>
          </Alert>
        )}

        <Tabs value={modo} onChange={(_, v) => { setModo(v); setErro(null) }} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab value="entrar" label="Entrar" />
          <Tab value="criar" label="Criar conta" />
        </Tabs>

        <form onSubmit={handleSubmit(d => enviar(d))} noValidate>
          <Stack spacing={2}>
            <TextField label="E-mail" type="email" autoComplete="email" autoFocus
              {...register('email', { required: 'Informe o e-mail.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'E-mail inválido.' } })}
              error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Senha" type="password" autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
              {...register('senha', {
                required: 'Informe a senha.',
                minLength: modo === 'criar' ? { value: 8, message: 'Use pelo menos 8 caracteres.' } : undefined,
              })}
              error={!!errors.senha} helperText={errors.senha?.message ?? (modo === 'criar' ? 'Mínimo de 8 caracteres.' : undefined)} />
            {modo === 'criar' && (
              <TextField label="Confirmar senha" type="password" autoComplete="new-password"
                {...register('confirmacao', { validate: v => v === getValues('senha') || 'As senhas não conferem.' })}
                error={!!errors.confirmacao} helperText={errors.confirmacao?.message} />
            )}
            {erro && <Alert severity="error" sx={{ borderRadius: '12px' }}>{erro}</Alert>}
            <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
              {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
            </Button>
            {modo === 'criar' && (
              <Typography variant="caption" color="text.secondary" align="center">
                Uma conta só para o casal: compartilhem o e-mail e a senha.
              </Typography>
            )}
          </Stack>
        </form>
      </Card>
    </Box>
  )
}
