import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Box, Button, Card, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { api } from '../api/client'
import { keys } from '../api/hooks'
import { cores, fonteNome } from '../theme'
import RamoOliveira from '../components/RamoOliveira'

interface Campos { email: string; senha: string; confirmacao: string }

/** T1: entrar ou criar a conta do casal (uma conta compartilhada). */
export default function EntrarPage() {
  const qc = useQueryClient()
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [erro, setErro] = useState<string | null>(null)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Campos>()

  const enviar = async ({ email, senha }: Campos) => {
    setErro(null)
    try {
      if (modo === 'criar') await api.cadastrar(email, senha)
      await api.entrar(email, senha)
      qc.clear()
      qc.setQueryData(keys.eu, await api.eu())
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      background: `linear-gradient(160deg, ${cores.olivaClara} 0%, ${cores.creme} 50%, ${cores.rosaClaro} 100%)`,
    }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: { xs: 3, sm: 4 } }}>
        <Stack sx={{ alignItems: 'center', mb: 2 }}>
          <RamoOliveira tamanho={96} />
          <Typography sx={{ fontFamily: fonteNome, fontSize: 40, fontWeight: 700, color: 'primary.main', lineHeight: 1.1 }}>
            Enxoval
          </Typography>
          <Typography color="text.secondary" align="center">A lista do bebê, organizada a dois.</Typography>
        </Stack>

        <Tabs value={modo} onChange={(_, v) => { setModo(v); setErro(null) }} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab value="entrar" label="Entrar" />
          <Tab value="criar" label="Criar conta" />
        </Tabs>

        <form onSubmit={handleSubmit(enviar)} noValidate>
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
