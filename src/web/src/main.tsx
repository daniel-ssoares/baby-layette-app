import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from './api/client'
import { keys } from './api/hooks'
import { CssBaseline } from '@mui/material'
import App from './App'
import { avisarErro } from './lib/avisos'
import TemaProvider from './temas/TemaProvider'
import { modoDemo } from './demo/modo'
import { capturarConviteDaUrl } from './nuvem/convite'
import { supabase } from './nuvem/supabase'

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

const renderizar = () => createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TemaProvider>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TemaProvider>
    </QueryClientProvider>
  </StrictMode>,
)

// Demonstração: a "API" roda no navegador (carregada só nesse modo).
if (modoDemo) import('./demo/servidor').then(m => { m.instalar(); renderizar() })
else {
  capturarConviteDaUrl()
  // Sessão encerrada fora do app (senha trocada em outro aparelho, token vencido): volta para a entrada.
  try { supabase().auth.onAuthStateChange(evento => { if (evento === 'SIGNED_OUT') queryClient.setQueryData(keys.eu, null) }) }
  catch (e) { console.error(e) }
  renderizar()
}

// App instalável (PWA): só no build publicado e em HTTPS/localhost (exigência do navegador).
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext)
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined))
