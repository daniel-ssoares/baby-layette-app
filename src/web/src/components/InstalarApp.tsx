import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Paper, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InstallMobileIcon from '@mui/icons-material/InstallMobile'
import IosShareIcon from '@mui/icons-material/IosShare'
import { abertoComoApp, comoInstalar, ehIos, type PedidoInstalacao } from '../lib/instalacao'

const CHAVE_DISPENSADO = 'enxoval:instalar-dispensado'

// O Chrome dispara o pedido logo após carregar: guardado aqui (fora do React) para não perdê-lo.
let pedido: PedidoInstalacao | null = null
const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach(f => f())
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  pedido = e as PedidoInstalacao
  avisar()
})
window.addEventListener('appinstalled', () => { pedido = null; avisar() })

const lerDispensado = () => { try { return localStorage.getItem(CHAVE_DISPENSADO) === '1' } catch { return false } }

/** Faixa "Instalar o app": botão no Android (Chrome) e instrução de Compartilhar no iPhone/iPad. */
export default function InstalarApp() {
  const [, atualizar] = useState(0)
  const [dispensado, setDispensado] = useState(lerDispensado)
  useEffect(() => {
    const f = () => atualizar(n => n + 1)
    ouvintes.add(f)
    return () => { ouvintes.delete(f) }
  }, [])

  const modo = comoInstalar({
    instalado: abertoComoApp(), temPedido: !!pedido, ios: ehIos(navigator.userAgent, navigator.maxTouchPoints ?? 0),
  })
  if (!modo || dispensado) return null

  const dispensar = () => {
    try { localStorage.setItem(CHAVE_DISPENSADO, '1') } catch { /* sem armazenamento: só some nesta visita */ }
    setDispensado(true)
  }
  const instalar = async () => {
    if (!pedido) return
    await pedido.prompt()
    const { outcome } = await pedido.userChoice
    pedido = null
    if (outcome === 'accepted') setDispensado(true)
    avisar()
  }

  return (
    <Paper elevation={0} role="region" aria-label="Instalar o app" sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 2, bgcolor: 'tema.suave', borderRadius: '12px',
    }}>
      <InstallMobileIcon sx={{ color: 'primary.main' }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Use como app no celular</Typography>
        {modo === 'ios' ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Toque em <IosShareIcon fontSize="inherit" sx={{ verticalAlign: '-2px' }} aria-label="Compartilhar" /> e
            depois em <b>Adicionar à Tela de Início</b>.
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Abre direto da tela inicial, em tela cheia.</Typography>
        )}
      </Box>
      {modo === 'botao' && <Button variant="contained" size="small" onClick={instalar}>Instalar</Button>}
      <IconButton size="small" aria-label="Agora não" onClick={dispensar}><CloseIcon fontSize="small" /></IconButton>
    </Paper>
  )
}
