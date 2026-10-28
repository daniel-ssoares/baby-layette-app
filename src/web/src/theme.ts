import { alpha, createTheme } from '@mui/material'
import '@fontsource-variable/nunito'
import '@fontsource-variable/dancing-script'

// Identidade "oliveira": ramo de oliveira (paz, crescimento) como motivo, sem ligação com um bebê específico.
// Verde-oliva como cor principal, rosa antigo como acento, fundo creme.
export const cores = {
  oliva: '#6F7D45',
  olivaEscura: '#56622F',
  olivaClara: '#ECEFDD',
  folha: '#9AA66B',
  azeitona: '#4F5A2A',
  rosa: '#C98B95',
  rosaClaro: '#F7E6E8',
  salvia: '#7FA087',
  salviaClara: '#E3EDE5',
  creme: '#FBF8F1',
  areia: '#F2ECDF',
  texto: '#3F4232',
  textoSuave: '#7E8070',
}

/** Fonte cursiva usada apenas no nome do bebê. */
export const fonteNome = '"Dancing Script Variable", "Dancing Script", cursive'

export const theme = createTheme({
  palette: {
    primary: { main: cores.oliva, dark: cores.olivaEscura, contrastText: '#fff' },
    secondary: { main: cores.rosa, contrastText: '#fff' },
    success: { main: cores.salvia },
    warning: { main: '#D9A066' },
    background: { default: cores.creme, paper: '#FFFFFF' },
    text: { primary: cores.texto, secondary: cores.textoSuave },
    divider: alpha(cores.texto, 0.08),
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Nunito Variable", "Nunito", system-ui, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${alpha(cores.texto, 0.06)}`,
          boxShadow: `0 4px 20px ${alpha(cores.oliva, 0.08)}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 18 } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 700, borderRadius: 999 } } },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 999, backgroundColor: alpha(cores.texto, 0.07) },
        bar: { borderRadius: 999 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 14, backgroundColor: '#fff' },
        notchedOutline: { borderColor: alpha(cores.texto, 0.12) },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24 } } },
    MuiFab: { styleOverrides: { root: { boxShadow: `0 8px 24px ${alpha(cores.oliva, 0.4)}` } } },
  },
})
