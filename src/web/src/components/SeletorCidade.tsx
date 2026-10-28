import { useEffect, useState } from 'react'
import { Autocomplete, Button, Stack, TextField, Typography } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import PlaceIcon from '@mui/icons-material/Place'
import { api } from '../api/client'
import type { Local } from '../api/types'

export interface LocalEscolhido { cidade: string | null; latitude: number | null; longitude: number | null }

const descrever = (l: Local) => [l.nome, l.estado, l.pais].filter(Boolean).join(', ')

/** Busca a cidade do nascimento (Open-Meteo via API) ou usa a localização do navegador. */
export default function SeletorCidade({ valor, onChange }: { valor: LocalEscolhido; onChange: (v: LocalEscolhido) => void }) {
  const [busca, setBusca] = useState('')
  const [opcoes, setOpcoes] = useState<Local[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroGps, setErroGps] = useState<string | null>(null)

  useEffect(() => {
    if (busca.trim().length < 2) return
    const t = setTimeout(async () => {
      setCarregando(true)
      try { setOpcoes(await api.buscarLocais(busca)) } finally { setCarregando(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [busca])

  const usarGps = () => {
    setErroGps(null)
    navigator.geolocation.getCurrentPosition(
      p => onChange({ cidade: 'Minha localização', latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => setErroGps('Não foi possível obter sua localização. Busque a cidade pelo nome.'),
      { timeout: 10000 })
  }

  return (
    <Stack spacing={1}>
      <Autocomplete<Local>
        options={opcoes} loading={carregando} filterOptions={x => x}
        getOptionLabel={descrever} noOptionsText={busca.length < 2 ? 'Digite o nome da cidade' : 'Nenhuma cidade encontrada'}
        onInputChange={(_, v, motivo) => { if (motivo === 'input') setBusca(v) }}
        onChange={(_, l) => l && onChange({ cidade: [l.nome, l.estado].filter(Boolean).join(' - '), latitude: l.latitude, longitude: l.longitude })}
        renderOption={(props, l) => (
          <li {...props} key={`${l.latitude},${l.longitude}`}>
            <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />{descrever(l)}
          </li>
        )}
        renderInput={p => <TextField {...p} label="Cidade do nascimento" placeholder={valor.cidade ?? 'Ex.: Campinas'} />} />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          {valor.cidade ? <>Selecionada: <b>{valor.cidade}</b></> : 'Nenhuma cidade selecionada'}
        </Typography>
        <Stack direction="row" spacing={1}>
          {valor.cidade && <Button size="small" color="inherit" onClick={() => onChange({ cidade: null, latitude: null, longitude: null })}>Limpar</Button>}
          <Button size="small" startIcon={<MyLocationIcon />} onClick={usarGps}>Usar minha localização</Button>
        </Stack>
      </Stack>
      {erroGps && <Typography variant="body2" color="error">{erroGps}</Typography>}
    </Stack>
  )
}
