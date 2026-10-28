import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import {
  Alert, BottomNavigation, BottomNavigationAction, Box, Button, Container, IconButton, Paper, Snackbar, Stack,
  Tooltip, Typography,
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
import { ouvirErros } from './lib/avisos'
import { api } from './api/client'
import { trocarSessao, useEnxoval, useEu } from './api/hooks'
import RamoOliveira from './components/RamoOliveira'
import Carregando from './components/Carregando'
import { cores, fonteNome } from './theme'
import { preposicaoBebe } from './lib/format'
import { modoDemo } from './demo/modo'

/** Guarda de sessão: sem conta logada, mostra a tela de entrada. */
export default function App() {
  const eu = useEu()
  const [erro, setErro] = useState<string | null>(null)
  useEffect(() => ouvirErros(setErro), [])

  return (
    <>
      {eu.isPending ? <Carregando /> : eu.data ? <AppLogado /> : <EntrarPage />}
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
    <Box sx={{ minHeight: '100vh', pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', sm: 4 } }}>
      <Box component="header" sx={{
        position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)',
        bgcolor: 'rgba(251, 248, 241, 0.88)', borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <RamoOliveira tamanho={44} />
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
                  bgcolor: abaAtual === path ? cores.olivaClara : 'transparent',
                }}>
                {label}
              </Button>
            ))}
          </Stack>
          <Tooltip title="Sair">
            <IconButton onClick={sair} aria-label="Sair" sx={{ color: 'text.secondary' }}><LogoutIcon /></IconButton>
          </Tooltip>
        </Container>
      </Box>

      {modoDemo && (
        <Typography variant="caption" component="p" align="center" sx={{ bgcolor: cores.olivaClara, color: 'primary.dark', py: 0.5, px: 2 }}>
          Demonstração: as alterações ficam salvas só neste navegador.
        </Typography>
      )}
      <Container maxWidth="md" sx={{ py: 3 }}>
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

      <Paper elevation={0} sx={{
        display: { xs: 'block', sm: 'none' }, position: 'fixed', left: 12, right: 12, bottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 10,
        borderRadius: 999, overflow: 'hidden', boxShadow: '0 8px 30px rgba(74, 63, 68, 0.12)',
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
