import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// O servidor da demonstração faz o papel da API; Open-Meteo "fora do ar".
vi.mock('./demo/modo', async orig => ({ ...(await orig<typeof import('./demo/modo')>()), modoDemo: true }))
beforeAll(async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })))
  ;(await import('./demo/servidor')).instalar()
})

describe('sessão (fluxo pela tela)', () => {
  it('entrar troca para o app e sair volta para a tela de entrada', async () => {
    const { default: App } = await import('./App')
    const { default: TemaProvider } = await import('./temas/TemaProvider')
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <TemaProvider><MemoryRouter initialEntries={['/painel']}><App /></MemoryRouter></TemaProvider>
      </QueryClientProvider>)

    fireEvent.click(await screen.findByRole('button', { name: 'Entrar na demonstração' }))
    expect(await screen.findByText('Enxoval do', {}, { timeout: 4000 })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(await screen.findByRole('button', { name: 'Entrar na demonstração' }, { timeout: 4000 })).toBeInTheDocument()
  })
})
