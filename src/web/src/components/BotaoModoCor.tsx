import { IconButton, Tooltip } from '@mui/material'
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAutoOutlined'
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import { proximaPreferencia, rotuloPreferencia } from '../lib/modoCor'
import { useTemaApp } from '../temas/contexto'

const icones = { automatico: BrightnessAutoIcon, claro: LightModeIcon, escuro: DarkModeIcon }

/** Cabeçalho: alterna Automático → Claro → Escuro (preferência deste aparelho). */
export default function BotaoModoCor() {
  const { preferencia, definirPreferencia } = useTemaApp()
  const Icone = icones[preferencia]
  const rotulo = `Aparência: ${rotuloPreferencia[preferencia]}`
  return (
    <Tooltip title={rotulo}>
      <IconButton onClick={() => definirPreferencia(proximaPreferencia(preferencia))} aria-label={rotulo} sx={{ color: 'text.secondary' }}>
        <Icone />
      </IconButton>
    </Tooltip>
  )
}
