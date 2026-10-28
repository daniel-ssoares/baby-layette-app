import { useState } from 'react'
import { Button, Divider, FormControlLabel, ListItemIcon, ListItemText, Menu, MenuItem, Switch } from '@mui/material'
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined'
import TableChartIcon from '@mui/icons-material/TableChartOutlined'

/** T4: baixa a lista de compras (só o que falta) ou a lista completa, em PDF ou Excel. */
export default function ExportarMenu() {
  const [ancora, setAncora] = useState<HTMLElement | null>(null)
  const [completa, setCompleta] = useState(false)
  const url = (formato: 'pdf' | 'xlsx') => `/api/exportar/compras.${formato}${completa ? '?todos=true' : ''}`

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={e => setAncora(e.currentTarget)}
        sx={{ bgcolor: '#fff' }}>
        Exportar
      </Button>
      <Menu anchorEl={ancora} open={!!ancora} onClose={() => setAncora(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem component="a" href={url('pdf')} download onClick={() => setAncora(null)}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="PDF" secondary="Para imprimir e levar às compras" />
        </MenuItem>
        <MenuItem component="a" href={url('xlsx')} download onClick={() => setAncora(null)}>
          <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Excel" secondary="Planilha com filtros e totais" />
        </MenuItem>
        <Divider />
        <MenuItem disableRipple sx={{ '&:hover': { bgcolor: 'transparent' } }}>
          <FormControlLabel control={<Switch size="small" checked={completa} onChange={e => setCompleta(e.target.checked)} />}
            label="Incluir itens já comprados" slotProps={{ typography: { variant: 'body2' } }} />
        </MenuItem>
      </Menu>
    </>
  )
}
