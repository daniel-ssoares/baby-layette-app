import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// URL e chave publicável do projeto (públicas por natureza: quem protege os dados é o RLS de supabase/01-esquema.sql).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const chave = import.meta.env.VITE_SUPABASE_KEY as string | undefined

let cliente: SupabaseClient | null = null

/** Cliente criado só no primeiro uso (a demonstração e os testes não precisam de Supabase). */
export function supabase(): SupabaseClient {
  if (!url || !chave) throw new Error('Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_KEY em src/web/.env.')
  cliente ??= createClient(url, chave, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  return cliente
}
