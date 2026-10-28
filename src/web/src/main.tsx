import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from './api/client'
import { keys } from './api/hooks'
import { CssBaseline, ThemeProvider } from '@mui/material'
import App from './App'
import { avisarErro } from './lib/avisos'
import { theme } from './theme'

// Sessão expirada (401) em qualquer chamada: volta para a tela de entrada.
const tratarErro = (e: Error) => {
  if (e instanceof ApiError && e.status === 401) queryClient.setQueryData(keys.eu, null)
  else return true
}

const queryClient: QueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: (n, e) => !(e instanceof ApiError && e.status === 401) && n < 1 } },
  queryCache: new QueryCache({ onError: tratarErro }),
  mutationCache: new MutationCache({ onError: e => { if (tratarErro(e)) avisarErro(e.message) } }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
