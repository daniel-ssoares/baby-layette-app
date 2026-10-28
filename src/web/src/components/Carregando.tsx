import { Alert, Box, CircularProgress } from '@mui/material'

/** Estado padrão de carregamento/erro das páginas. */
export default function Carregando({ erro }: { erro?: Error | null }) {
  if (erro) return <Alert severity="error">Não foi possível carregar: {erro.message}. A API está rodando?</Alert>
  return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
}
