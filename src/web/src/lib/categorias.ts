import type { SvgIconComponent } from '@mui/icons-material'
import BedIcon from '@mui/icons-material/Bed'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import BathtubIcon from '@mui/icons-material/Bathtub'
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import StrollerIcon from '@mui/icons-material/Stroller'
import LuggageIcon from '@mui/icons-material/Luggage'
import ToysIcon from '@mui/icons-material/Toys'
import CategoryIcon from '@mui/icons-material/CategoryOutlined'

export interface VisualCategoria { Icone: SvgIconComponent; cor: string; fundo: string }

// Cores pastel por categoria padrão; categorias novas usam o visual neutro.
const visuais: Record<string, VisualCategoria> = {
  'quarto': { Icone: BedIcon, cor: '#9C7BB5', fundo: '#EFE7F5' },
  'roupas': { Icone: CheckroomIcon, cor: '#C27C8A', fundo: '#F6E3E6' },
  'banho': { Icone: BathtubIcon, cor: '#6C9BBF', fundo: '#E2EDF5' },
  'higiene': { Icone: BabyChangingStationIcon, cor: '#5FA3A0', fundo: '#DFF0EE' },
  'farmacia': { Icone: LocalPharmacyIcon, cor: '#D17B6A', fundo: '#F7E4DF' },
  'amamentacao': { Icone: ChildCareIcon, cor: '#D9A066', fundo: '#F8EBDC' },
  'passeio': { Icone: StrollerIcon, cor: '#7FA087', fundo: '#E3EDE5' },
  'mala da maternidade': { Icone: LuggageIcon, cor: '#B58A6E', fundo: '#F2E8E0' },
  'acessorios': { Icone: ToysIcon, cor: '#C98BB0', fundo: '#F5E6EF' },
}
const neutro: VisualCategoria = { Icone: CategoryIcon, cor: '#8C7F84', fundo: '#F1E8DF' }

const chave = (nome: string) => nome.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export const visualCategoria = (nome: string): VisualCategoria => visuais[chave(nome)] ?? neutro
