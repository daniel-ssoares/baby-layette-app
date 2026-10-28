import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { Conta } from './types'

export const keys = {
  eu: ['eu'],
  enxoval: ['enxoval'],
  categorias: ['categorias'],
  itens: ['itens'],
  painel: ['painel'],
}

/** Conta logada; `null` quando não há sessão. */
export const useEu = () => useQuery({ queryKey: keys.eu, queryFn: api.eu, retry: false, staleTime: Infinity })
export const useEnxoval =() => useQuery({ queryKey: keys.enxoval, queryFn: api.enxoval })
export const useCategorias = () => useQuery({ queryKey: keys.categorias, queryFn: api.categorias })
export const useItens = () => useQuery({ queryKey: keys.itens, queryFn: api.itens })
export const usePainel = () => useQuery({ queryKey: keys.painel, queryFn: api.painel })

/**
 * Login/logout: descarta os dados da conta anterior e avisa a guarda de sessão (`useEu`).
 * Não usar `qc.clear()`: ele remove também a query da sessão que o App observa, e a tela não muda.
 */
export function trocarSessao(qc: QueryClient, conta: Conta | null) {
  qc.removeQueries({ predicate: q => q.queryKey[0] !== keys.eu[0] })
  qc.setQueryData(keys.eu, conta)
}

/**
 * Mutação que, ao terminar, invalida todas as queries (o volume de dados é pequeno,
 * então recarregar tudo é mais simples que invalidar seletivamente).
 */
export function useAcao<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSettled: () => qc.invalidateQueries() })
}
