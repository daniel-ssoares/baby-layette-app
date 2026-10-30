// Clima previsto e busca de cidades direto da Open-Meteo (gratuita, aceita chamadas do navegador).
// Histórico de 5 anos por coordenada, guardado em memória enquanto a página está aberta.
import type { Local, PerfilClima } from '../api/types'
import { analisarClima, type TemperaturaDiaria } from './dominio'

/** Dados do enxoval usados no clima. */
type Localizacao = { cidade: string | null; latitude: number | null; longitude: number | null; dataPrevistaParto: string | null }

const historicos = new Map<string, Promise<TemperaturaDiaria[] | null>>()

function historico(lat: number, lon: number) {
  const chave = `${lat.toFixed(2)}:${lon.toFixed(2)}`
  if (!historicos.has(chave)) {
    const ultimoAno = new Date().getFullYear() - 1
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
      `&start_date=${ultimoAno - 4}-01-01&end_date=${ultimoAno}-12-31&daily=temperature_2m_mean,temperature_2m_min&timezone=auto`
    historicos.set(chave, fetch(url).then(r => (r.ok ? r.json() : null)).then(j => {
      const d = j?.daily
      if (!d) return null
      return (d.time as string[]).map((dia, k) => ({ dia, media: d.temperature_2m_mean[k], minima: d.temperature_2m_min[k] }))
        .filter(t => t.media != null && t.minima != null)
    }).catch(() => null))
  }
  return historicos.get(chave)!
}

export async function perfilClima(e: Localizacao): Promise<PerfilClima | null> {
  if (e.latitude == null || e.longitude == null || !e.dataPrevistaParto) return null
  const h = await historico(e.latitude, e.longitude)
  return h?.length ? analisarClima(e.cidade, e.latitude, e.dataPrevistaParto, h) : null
}

export async function buscarLocais(q: string): Promise<Local[]> {
  if (q.trim().length < 2) return []
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=pt&format=json&name=${encodeURIComponent(q.trim())}`)
    const j = await r.json()
    return (j.results ?? []).map((l: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) =>
      ({ nome: l.name, estado: l.admin1 ?? null, pais: l.country ?? null, latitude: l.latitude, longitude: l.longitude }))
  } catch { return [] }
}
