import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  Badge, Box, Button, Card, Chip, Collapse, Fab, IconButton, InputAdornment, LinearProgress, MenuItem,
  Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import { api } from '../api/client'
import { useAcao, useCategorias, useItens } from '../api/hooks'
import type { AlteracaoFoto, Item, SalvarItem } from '../api/types'
import { filtrarItens, filtrosVazios, type Filtros } from '../lib/filtros'
import { rotuloPrioridade, rotuloStatus, tamanhosSugeridos } from '../lib/format'
import { visualCategoria } from '../lib/categorias'
import ItemFormDialog from '../components/ItemFormDialog'
import ExportarMenu from '../components/ExportarMenu'
import ItemLinha from '../components/ItemLinha'
import RegistrarCompraDialog from '../components/RegistrarCompraDialog'
import IconeCategoria from '../components/IconeCategoria'
import Carregando from '../components/Carregando'

/** Filtros iniciais vindos do painel (?categoria=3, ?prioridade=Alta). */
function filtrosDaUrl(params: URLSearchParams): Filtros {
  const categoria = Number(params.get('categoria'))
  const prioridade = params.get('prioridade')
  return {
    ...filtrosVazios,
    categoriaId: categoria || '',
    prioridade: prioridade && prioridade in rotuloPrioridade ? (prioridade as Filtros['prioridade']) : '',
  }
}

export default function ItensPage() {
  const itens = useItens()
  const categorias = useCategorias()
  const [params] = useSearchParams()
  const [filtros, setFiltros] = useState<Filtros>(() => filtrosDaUrl(params))
  const [maisFiltros, setMaisFiltros] = useState(() => filtros.prioridade !== '')
  const [dialogo, setDialogo] = useState<{ item: Item | null; categoriaId?: number } | null>(null)
  const [compra, setCompra] = useState<Item | null>(null)

  const salvar = useAcao(async ({ id, dados, foto }: { id?: number; dados: SalvarItem; foto: AlteracaoFoto }) => {
    const item = id ? await api.atualizarItem(id, dados) : await api.criarItem(dados)
    if (foto instanceof Blob) await api.enviarFoto(item.id, foto)
    else if (foto === 'remover') await api.removerFoto(item.id)
  })
  const adquirir = useAcao(api.adquirirItem)
  const remover = useAcao(api.removerItem)
  const concluir = useAcao(api.concluirItem)
  const excluir = useAcao(api.excluirItem)

  const [mostrarFora, setMostrarFora] = useState(false)
  const filtrados = useMemo(
    () => filtrarItens(itens.data ?? [], filtros).filter(i => mostrarFora || !i.foraDaEstacao),
    [itens.data, filtros, mostrarFora])

  if (!itens.data || !categorias.data) return <Carregando erro={itens.error ?? categorias.error} />

  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) => setFiltros(f => ({ ...f, [k]: v }))
  const naEstacao = itens.data.filter(i => !i.foraDaEstacao)
  const qtdFora = itens.data.length - naEstacao.length
  const extrasAtivos = [filtros.status, filtros.tamanho, filtros.prioridade].filter(Boolean).length
  const temFiltro = JSON.stringify(filtros) !== JSON.stringify(filtrosVazios)
  const grupos = categorias.data
    .map(c => ({ categoria: c, itens: filtrados.filter(i => i.categoriaId === c.id) }))
    .filter(g => g.itens.length > 0 || (!temFiltro && g.categoria.totalItens === 0))

  const confirmarExclusao = (i: Item) => {
    if (confirm(`Excluir "${i.nome}"?`)) excluir.mutate(i.id)
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography variant="h5">Itens</Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {naEstacao.filter(i => i.status === 'Concluido').length} de {naEstacao.length} prontos
          </Typography>
          <ExportarMenu />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1}>
        <TextField size="small" fullWidth placeholder="Buscar item…" value={filtros.busca}
          onChange={e => set('busca', e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon color="disabled" /></InputAdornment> } }} />
        <Tooltip title="Mais filtros">
          <IconButton onClick={() => setMaisFiltros(v => !v)}
            sx={{ bgcolor: maisFiltros ? 'primary.main' : '#fff', color: maisFiltros ? '#fff' : 'text.secondary',
              border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: maisFiltros ? 'primary.dark' : '#fff' } }}>
            <Badge badgeContent={extrasAtivos} color="secondary"><TuneIcon /></Badge>
          </IconButton>
        </Tooltip>
      </Stack>

      <Collapse in={maisFiltros}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
          <TextField select size="small" label="Status" value={filtros.status}
            onChange={e => set('status', e.target.value as Filtros['status'])}>
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(rotuloStatus).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Tamanho" value={filtros.tamanho}
            onChange={e => set('tamanho', e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {tamanhosSugeridos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Prioridade" value={filtros.prioridade}
            onChange={e => set('prioridade', e.target.value as Filtros['prioridade'])}>
            <MenuItem value="">Todas</MenuItem>
            {Object.entries(rotuloPrioridade).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
        </Box>
      </Collapse>

      <Stack direction="row" spacing={1} sx={{
        overflowX: 'auto', pb: 0.5, mx: -2, px: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}>
        <Chip label="Todas" onClick={() => set('categoriaId', '')}
          color={filtros.categoriaId === '' ? 'primary' : 'default'}
          variant={filtros.categoriaId === '' ? 'filled' : 'outlined'} sx={{ bgcolor: filtros.categoriaId === '' ? undefined : '#fff' }} />
        {categorias.data.map(c => {
          const ativo = filtros.categoriaId === c.id
          const { Icone, cor, fundo } = visualCategoria(c.nome)
          return (
            <Chip key={c.id} label={c.nome} icon={<Icone sx={{ fontSize: 18 }} />}
              onClick={() => set('categoriaId', ativo ? '' : c.id)} variant="outlined"
              sx={{
                flexShrink: 0, bgcolor: ativo ? fundo : '#fff', borderColor: ativo ? cor : 'divider',
                color: ativo ? cor : 'text.primary', '& .MuiChip-icon': { color: cor },
              }} />
          )
        })}
      </Stack>

      {temFiltro && (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: -1 }}>
          <Typography variant="body2" color="text.secondary">{filtrados.length} itens encontrados</Typography>
          <Button size="small" onClick={() => setFiltros(filtrosVazios)}>Limpar filtros</Button>
        </Stack>
      )}

      {qtdFora > 0 && (
        <Chip variant="outlined" onClick={() => setMostrarFora(v => !v)} sx={{ alignSelf: 'flex-start', bgcolor: '#fff', mt: -1 }}
          label={mostrarFora ? 'Ocultar itens fora da estação' : `Mostrar ${qtdFora} itens fora da estação`} />
      )}

      {grupos.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>Nenhum item encontrado.</Typography>
      )}

      {grupos.map(({ categoria, itens }) => {
        const contaveis = itens.filter(i => !i.foraDaEstacao)
        const prontos = contaveis.filter(i => i.status === 'Concluido').length
        const { cor } = visualCategoria(categoria.nome)
        return (
          <Card key={categoria.id}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 2 }}>
              <IconeCategoria nome={categoria.nome} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="subtitle1">{categoria.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">{prontos}/{contaveis.length}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={contaveis.length ? (prontos / contaveis.length) * 100 : 0}
                  sx={{ height: 5, mt: 0.5, '& .MuiLinearProgress-bar': { bgcolor: cor } }} />
              </Box>
              <Tooltip title={`Adicionar em ${categoria.nome}`}>
                <IconButton size="small" onClick={() => setDialogo({ item: null, categoriaId: categoria.id })}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            {itens.map(i => (
              <ItemLinha key={i.id} item={i}
                onMais={() => adquirir.mutate(i.id)}
                onMenos={() => remover.mutate(i.id)}
                onConcluir={() => concluir.mutate(i.id)}
                onRegistrarCompra={() => setCompra(i)}
                onEditar={() => setDialogo({ item: i })}
                onExcluir={() => confirmarExclusao(i)} />
            ))}
            {itens.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>Nenhum item ainda.</Typography>
            )}
          </Card>
        )
      })}

      <Fab color="primary" aria-label="Novo item" onClick={() => setDialogo({ item: null })}
        sx={{ position: 'fixed', bottom: { xs: 96, sm: 32 }, right: { xs: 20, sm: 32 } }}>
        <AddIcon />
      </Fab>

      <RegistrarCompraDialog key={compra?.id ?? 'fechado'} item={compra} onClose={() => setCompra(null)} />

      <ItemFormDialog key={dialogo ? `item-${dialogo.item?.id ?? 'novo'}` : 'fechado'} open={!!dialogo} item={dialogo?.item ?? null} categoriaPadrao={dialogo?.categoriaId}
        categorias={categorias.data} salvando={salvar.isPending} onClose={() => setDialogo(null)}
        onSalvar={(dados, foto) => salvar.mutate({ id: dialogo?.item?.id, dados, foto }, { onSuccess: () => setDialogo(null) })} />
    </Stack>
  )
}
