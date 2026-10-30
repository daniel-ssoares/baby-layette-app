import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Divider, FormControlLabel, ListItemIcon, ListItemText, Menu, MenuItem, Switch } from '@mui/material'
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined'
import TableChartIcon from '@mui/icons-material/TableChartOutlined'
import { api } from '../api/client'
import { keys } from '../api/hooks'
import { avisarErro } from '../lib/avisos'
import { montarListaCompras, tituloLista } from '../lib/listaCompras'

/** T4: baixa a lista de compras (só o que falta) ou a lista completa, em PDF ou Excel, gerada no navegador. */
export default function ExportarMenu() {
  const qc = useQueryClient()
  const [ancora, setAncora] = useState<HTMLElement | null>(null)
  const [completa, setCompleta] = useState(false)
  const [gerando, setGerando] = useState<'pdf' | 'xlsx' | null>(null)

  const exportar = async (formato: 'pdf' | 'xlsx') => {
    setGerando(formato)
    try {
      const [enxoval, categorias, itens, gerador] = await Promise.all([
        qc.fetchQuery({ queryKey: keys.enxoval, queryFn: api.enxoval }),
        qc.fetchQuery({ queryKey: keys.categorias, queryFn: api.categorias }),
        qc.fetchQuery({ queryKey: keys.itens, queryFn: api.itens }),
        import('../lib/exportar'),
      ])
      const lista = montarListaCompras(categorias, itens, completa)
      const hoje = new Date()
      const nome = `lista-de-compras-${hoje.toISOString().slice(0, 10)}.${formato}`
      const arquivo = formato === 'pdf'
        ? gerador.gerarPdf(lista, tituloLista(enxoval.nomeBebe, enxoval.sexo), enxoval.tema, hoje)
        : await gerador.gerarExcel(lista, enxoval.tema)
      gerador.baixar(arquivo, nome)
      setAncora(null)
    } catch (e) {
      avisarErro((e as Error).message || 'Não foi possível gerar o arquivo.')
    } finally {
      setGerando(null)
    }
  }

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={e => setAncora(e.currentTarget)}
        sx={{ bgcolor: 'background.paper' }}>
        Exportar
      </Button>
      <Menu anchorEl={ancora} open={!!ancora} onClose={() => !gerando && setAncora(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => exportar('pdf')} disabled={!!gerando}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={gerando === 'pdf' ? 'Gerando PDF…' : 'PDF'} secondary="Para imprimir e levar às compras" />
        </MenuItem>
        <MenuItem onClick={() => exportar('xlsx')} disabled={!!gerando}>
          <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={gerando === 'xlsx' ? 'Gerando planilha…' : 'Excel'} secondary="Planilha com filtros e totais" />
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
