import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Box, Button, Card, Stack, Tab, Tabs, TextField, Typography, useTheme } from '@mui/material'
import { api, ApiError } from '../api/client'
import { trocarSessao } from '../api/hooks'
import { fonteNome } from '../theme'
import Motivo, { Confetes } from '../temas/Motivo'
import { fundoDecorado } from '../temas/desenhos'
import { contaDemo, demoFixa, entrarNaDemo, modoDemo, sairDaDemo } from '../demo/modo'
import { lerConvite } from '../nuvem/convite'

interface Campos { email: string; senha: string; confirmacao: string }

/** T1: entrar, criar a conta (cada pessoa tem a sua) ou pedir o link para uma nova senha. */
export default function EntrarPage() {
  const qc = useQueryClient()
  const t = useTheme().palette.tema
  const convite = !modoDemo && lerConvite()
  const [modo, setModo] = useState<'entrar' | 'criar' | 'esqueci'>(convite ? 'criar' : 'entrar')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Campos>()

  const trocarModo = (m: typeof modo) => { setModo(m); setErro(null); setAviso(null) }

  const enviar = async ({ email, senha }: Pick<Campos, 'email' | 'senha'>, acao = modo) => {
    setErro(null)
    setAviso(null)
    try {
      if (acao === 'esqueci') {
        await api.esqueciSenha(email)
        setAviso(`Se existir uma conta com ${email}, enviamos um link para criar uma nova senha. Confira também o spam.`)
        return
      }
      if (acao === 'criar') await api.cadastrar(email, senha)
      await api.entrar(email, senha)
      trocarSessao(qc, await api.eu())
    } catch (e) {
      if (acao === 'criar' && e instanceof ApiError && e.codigos.includes('email_not_confirmed'))
        setAviso(`Conta criada! Enviamos um link de confirmação para ${email}. Depois de confirmar, entre aqui.`)
      else setErro((e as Error).message)
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
            <Button fullWidth variant="contained" onClick={() => enviar(contaDemo, 'entrar')}>Entrar na demonstração</Button>
            {!demoFixa && <Button fullWidth size="small" color="inherit" onClick={sairDaDemo} sx={{ mt: 1 }}>Usar conta de verdade</Button>}
          </Alert>
        )}
        {convite && (
          <Alert severity="success" icon={false} sx={{ mb: 2, borderRadius: '12px' }}>
            <b>Você recebeu um convite</b> para montar um enxoval junto. Crie sua conta (ou entre, se já tiver) para participar.
          </Alert>
        )}

        <Tabs value={modo === 'esqueci' ? 'entrar' : modo} onChange={(_, v) => trocarModo(v)} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab value="entrar" label="Entrar" />
          <Tab value="criar" label="Criar conta" />
        </Tabs>

        <form onSubmit={handleSubmit(d => enviar(d))} noValidate>
          <Stack spacing={2}>
            <TextField label="E-mail" type="email" autoComplete="email" autoFocus
              {...register('email', { required: 'Informe o e-mail.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'E-mail inválido.' } })}
              error={!!errors.email} helperText={errors.email?.message} />
            {modo === 'esqueci' && (
              <Typography variant="body2" color="text.secondary">
                Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
              </Typography>
            )}
            {modo !== 'esqueci' && <TextField label="Senha" type="password" autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
              {...register('senha', {
                required: 'Informe a senha.',
                minLength: modo === 'criar' ? { value: 8, message: 'Use pelo menos 8 caracteres.' } : undefined,
              })}
              error={!!errors.senha} helperText={errors.senha?.message ?? (modo === 'criar' ? 'Mínimo de 8 caracteres.' : undefined)} />}
            {modo === 'criar' && (
              <TextField label="Confirmar senha" type="password" autoComplete="new-password"
                {...register('confirmacao', { validate: v => v === getValues('senha') || 'As senhas não conferem.' })}
                error={!!errors.confirmacao} helperText={errors.confirmacao?.message} />
            )}
            {erro && <Alert severity="error" sx={{ borderRadius: '12px' }}>{erro}</Alert>}
            {aviso && <Alert severity="success" sx={{ borderRadius: '12px' }}>{aviso}</Alert>}
            <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
              {{ entrar: 'Entrar', criar: 'Criar conta', esqueci: 'Enviar link' }[modo]}
            </Button>
            {modo === 'entrar' && !modoDemo && (
              <Button size="small" color="inherit" onClick={() => trocarModo('esqueci')}>Esqueci minha senha</Button>
            )}
            {modo === 'esqueci' && <Button size="small" color="inherit" onClick={() => trocarModo('entrar')}>Voltar</Button>}
            {modo === 'criar' && (
              <Typography variant="caption" color="text.secondary" align="center">
                Cada pessoa tem a própria conta. Depois, convide quem vai montar o enxoval com você, na aba do bebê.
              </Typography>
            )}
          </Stack>
        </form>
        {!modoDemo && (
          <Button fullWidth size="small" color="inherit" onClick={entrarNaDemo} sx={{ mt: 2, color: 'text.secondary' }}>
            Só quero conhecer: ver a demonstração
          </Button>
        )}
      </Card>
    </Box>
  )
}
