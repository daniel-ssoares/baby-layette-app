import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

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
 * Mutação que, ao terminar, invalida todas as queries (o volume de dados é pequeno,
 * então recarregar tudo é mais simples que invalidar seletivamente).
 */
export function useAcao<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSettled: () => qc.invalidateQueries() })
}
