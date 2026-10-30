import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Box, Button, Card, Stack, TextField, Typography, useTheme } from '@mui/material'
import { api } from '../api/client'
import { trocarSessao, useEu } from '../api/hooks'
import { fonteNome } from '../theme'
import Motivo from '../temas/Motivo'
import { fundoDecorado } from '../temas/desenhos'

interface Campos { nova: string; confirmacao: string }

/** Destino do link "Esqueci minha senha": o Supabase abre a sessão pelo link e aqui a pessoa escolhe a nova senha. */
export default function RedefinirSenhaPage() {
  const eu = useEu()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const t = useTheme().palette.tema
  const [erro, setErro] = useState<string | null>(null)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Campos>()

  const salvar = async ({ nova }: Campos) => {
    setErro(null)
    try {
      await api.redefinirSenha(nova)
      trocarSessao(qc, await api.eu())
      navigate('/', { replace: true })
    } catch (e) { setErro((e as Error).message) }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: fundoDecorado(t), backgroundSize: '64px, auto' }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: { xs: 3, sm: 4 } }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(salvar)} noValidate>
          <Stack sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Motivo tamanho={80} />
            <Typography sx={{ fontFamily: fonteNome, fontSize: 34, fontWeight: 700, color: 'primary.main' }}>Nova senha</Typography>
          </Stack>
          {eu.isPending ? null : !eu.data ? (
            <>
              <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                Este link expirou ou já foi usado. Peça outro em "Esqueci minha senha".
              </Alert>
              <Button variant="contained" onClick={() => navigate('/', { replace: true })}>Ir para a entrada</Button>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" align="center">Conta: <b>{eu.data.email}</b></Typography>
              <TextField label="Nova senha" type="password" autoComplete="new-password" autoFocus
                {...register('nova', { required: 'Informe a nova senha.', minLength: { value: 8, message: 'Use pelo menos 8 caracteres.' } })}
                error={!!errors.nova} helperText={errors.nova?.message ?? 'Mínimo de 8 caracteres.'} />
              <TextField label="Confirmar nova senha" type="password" autoComplete="new-password"
                {...register('confirmacao', { validate: v => v === getValues('nova') || 'As senhas não conferem.' })}
                error={!!errors.confirmacao} helperText={errors.confirmacao?.message} />
              {erro && <Alert severity="error" sx={{ borderRadius: '12px' }}>{erro}</Alert>}
              <Button type="submit" variant="contained" size="large" loading={isSubmitting}>Salvar e entrar</Button>
            </>
          )}
        </Stack>
      </Card>
    </Box>
  )
}
