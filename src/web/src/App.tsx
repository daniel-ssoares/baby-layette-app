import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import {
  Alert, BottomNavigation, BottomNavigationAction, Box, Button, Container, IconButton, Paper, Snackbar, Stack,
  Tooltip, Typography, useTheme,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/DashboardOutlined'
import ListIcon from '@mui/icons-material/FormatListBulleted'
import CategoryIcon from '@mui/icons-material/CategoryOutlined'
import FavoriteIcon from '@mui/icons-material/FavoriteBorder'
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined'
import PainelPage from './pages/PainelPage'
import ItensPage from './pages/ItensPage'
import LojaPage from './pages/LojaPage'
import CategoriasPage from './pages/CategoriasPage'
import EnxovalPage from './pages/EnxovalPage'
import LogoutIcon from '@mui/icons-material/Logout'
import { useQueryClient } from '@tanstack/react-query'
import EntrarPage from './pages/EntrarPage'
import BoasVindasPage from './pages/BoasVindasPage'
import RedefinirSenhaPage from './pages/RedefinirSenhaPage'
import AceitarConvite from './components/AceitarConvite'
import { esquecerConvite, lerConvite } from './nuvem/convite'
import { ouvirErros } from './lib/avisos'
import { api } from './api/client'
import { trocarSessao, useEnxoval, useEu } from './api/hooks'
import Motivo from './temas/Motivo'
import { padraoFundo } from './temas/desenhos'
import BotaoModoCor from './components/BotaoModoCor'
import Carregando from './components/Carregando'
import InstalarApp from './components/InstalarApp'
import { fonteNome } from './theme'
import { preposicaoBebe } from './lib/format'
import { demoFixa, modoDemo, sairDaDemo } from './demo/modo'

/** Guarda de sessão: sem conta logada, mostra a tela de entrada. */
export default function App() {
  const eu = useEu()
  const { pathname } = useLocation()
  const [erro, setErro] = useState<string | null>(null)
  useEffect(() => ouvirErros(setErro), [])

  return (
    <>
      {pathname === '/redefinir-senha' && !modoDemo ? <RedefinirSenhaPage />
        : eu.isPending ? <Carregando /> : eu.data ? <AppLogado /> : <EntrarPage />}
      <Snackbar open={!!erro} autoHideDuration={5000} onClose={() => setErro(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setErro(null)}>{erro}</Alert>
      </Snackbar>
    </>
  )
}

function AppLogado() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const enxoval = useEnxoval()
  const t = useTheme().palette.tema
  // Convite aberto por quem já tinha enxoval nesta conta: pergunta antes de trocar. Conta nova aceita sozinha ao
  // carregar o enxoval (nuvem/api.ts), por isso só se lê o convite depois que o enxoval chegou.
  const [conviteFechado, setConviteFechado] = useState(false)
  const convite = enxoval.data && !modoDemo && !conviteFechado ? lerConvite() : null
  const nome = enxoval.data?.nomeBebe

  const sair = async () => {
    await api.sair().catch(() => undefined)
    trocarSessao(qc, null)
  }

  if (!enxoval.data) return <Carregando erro={enxoval.error} />
  if (!enxoval.data.boasVindasConcluidas) return <BoasVindasPage />

  const abas = [
    { path: '/painel', label: 'Painel', Icone: DashboardIcon },
    { path: '/itens', label: 'Itens', Icone: ListIcon },
    { path: '/loja', label: 'Loja', Icone: StorefrontIcon },
    { path: '/categorias', label: 'Categorias', Icone: CategoryIcon },
    { path: '/enxoval', label: nome || 'Bebê', Icone: FavoriteIcon },
  ]
  const abaAtual = abas.find(a => pathname.startsWith(a.path))?.path ?? false

  return (
    <Box sx={{
      minHeight: '100vh', pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', sm: 4 },
      pl: 'env(safe-area-inset-left)', pr: 'env(safe-area-inset-right)',
    }}>
      <Box component="header" sx={{
        position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)', pt: 'env(safe-area-inset-top)',
        bgcolor: 'tema.vidro', backgroundImage: padraoFundo(t.id, t, 0.12), backgroundSize: '56px',
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <Motivo tamanho={44} />
          <Typography variant="h6" component="h1" sx={{ flex: 1, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Box component="span" sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>Enxoval {preposicaoBebe(nome, enxoval.data.sexo)}</Box>
            <Box component="span" sx={{ fontFamily: fonteNome, fontSize: 30, fontWeight: 700, color: 'primary.main' }}>
              {nome || 'bebê'}
            </Box>
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {abas.map(({ path, label, Icone }) => (
              <Button key={path} onClick={() => navigate(path)} startIcon={<Icone />}
                color={abaAtual === path ? 'primary' : 'inherit'}
                sx={{
                  color: abaAtual === path ? 'primary.main' : 'text.secondary',
                  bgcolor: abaAtual === path ? 'tema.suave' : 'transparent',
                }}>
                {label}
              </Button>
            ))}
          </Stack>
          <BotaoModoCor />
          <Tooltip title="Sair">
            <IconButton onClick={sair} aria-label="Sair" sx={{ color: 'text.secondary' }}><LogoutIcon /></IconButton>
          </Tooltip>
        </Container>
      </Box>

      {modoDemo && (
        <Typography variant="caption" component="p" align="center" sx={{ bgcolor: 'tema.suave', color: 'primary.dark', py: 0.5, px: 2 }}>
          Demonstração: as alterações ficam salvas só neste navegador.
          {!demoFixa && <> · <Box component="button" onClick={sairDaDemo} sx={{
            all: 'unset', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700,
          }}>Usar conta de verdade</Box></>}
        </Typography>
      )}
      <Container maxWidth="md" sx={{ py: 3 }}>
        <InstalarApp />
        <Routes>
          <Route path="/" element={<Navigate to="/painel" replace />} />
          <Route path="/painel" element={<PainelPage />} />
          <Route path="/itens" element={<ItensPage />} />
          <Route path="/loja" element={<LojaPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/enxoval" element={<EnxovalPage />} />
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
      </Container>

      <AceitarConvite codigo={enxoval.data.boasVindasConcluidas ? convite : null}
        onFechar={() => { esquecerConvite(); setConviteFechado(true) }} />

      <Paper elevation={0} sx={{
        display: { xs: 'block', sm: 'none' }, position: 'fixed', left: 12, right: 12, bottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 10,
        borderRadius: 999, overflow: 'hidden', boxShadow: `0 8px 30px ${t.sombra}`,
      }}>
        <BottomNavigation showLabels value={abaAtual} onChange={(_, v) => navigate(v)}>
          {abas.map(({ path, label, Icone }) => (
            <BottomNavigationAction key={path} value={path} label={label} icon={<Icone />}
              sx={{ minWidth: 0, px: 0.5, '& .MuiBottomNavigationAction-label': { whiteSpace: 'nowrap' } }} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
