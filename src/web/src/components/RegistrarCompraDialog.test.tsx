import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Item } from '../api/types'
import { api } from '../api/client'
import RegistrarCompraDialog from './RegistrarCompraDialog'

const item: Item = {
  id: 7, categoriaId: 1, nome: 'Body', tamanho: 'P', qtdDesejada: 6, qtdAdquirida: 2,
  prioridade: 'Alta', clima: 'Todos', foraDaEstacao: false, fotoUrl: null, precoUnitarioEstimado: 20, valorPago: null, origem: null,
  lojaLink: null, observacoes: null, status: 'Parcial', valorEstimado: 120, atualizadoEm: '',
}

function abrir() {
  const onClose = vi.fn()
  const registrar = vi.spyOn(api, 'registrarCompra').mockResolvedValue(item)
  render(<QueryClientProvider client={new QueryClient()}><RegistrarCompraDialog item={item} onClose={onClose} /></QueryClientProvider>)
  return { onClose, registrar }
}
const valor = () => screen.getByLabelText(/Quanto pagou/) as HTMLInputElement

describe('RegistrarCompraDialog', () => {
  it('sugere o que falta e o valor estimado, que acompanha a quantidade', () => {
    abrir()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(valor().value).toBe('80')
    fireEvent.click(screen.getByLabelText('Menos uma unidade'))
    expect(valor().value).toBe('60')
  })

  it('envia o valor digitado e fecha', async () => {
    const { onClose, registrar } = abrir()
    fireEvent.change(valor(), { target: { value: '55.9' } })
    fireEvent.click(screen.getByLabelText('Mais uma unidade'))
    expect(valor().value).toBe('55.9')
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(registrar.mock.calls[0][0]).toEqual({ id: 7, quantidade: 5, origem: 'Comprado', valor: 55.9 })
  })

  it('ganho não pede nem envia valor', async () => {
    const { registrar } = abrir()
    fireEvent.click(screen.getByRole('button', { name: /Ganhei/ }))
    expect(screen.queryByLabelText(/Quanto pagou/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))
    await waitFor(() => expect(registrar).toHaveBeenCalled())
    expect(registrar.mock.calls[0][0]).toMatchObject({ origem: 'Ganhado', valor: null })
  })
})
