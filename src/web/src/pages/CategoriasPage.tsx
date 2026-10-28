import { useState } from 'react'
import {
  Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import { api } from '../api/client'
import { useAcao, useCategorias } from '../api/hooks'
import type { Categoria, SalvarCategoria } from '../api/types'
import Carregando from '../components/Carregando'
import IconeCategoria from '../components/IconeCategoria'

export default function CategoriasPage() {
  const categorias = useCategorias()
  const [editando, setEditando] = useState<{ id?: number; dados: SalvarCategoria } | null>(null)

  const salvar = useAcao(({ id, dados }: { id?: number; dados: SalvarCategoria }) =>
    id ? api.atualizarCategoria(id, dados) : api.criarCategoria(dados))
  const excluir = useAcao(api.excluirCategoria)

  if (!categorias.data) return <Carregando erro={categorias.error} />

  const proximaOrdem = Math.max(0, ...categorias.data.map(c => c.ordem)) + 1
  const confirmarExclusao = (c: Categoria) => {
    if (confirm(`Excluir a categoria "${c.nome}"?`)) excluir.mutate(c.id)
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Categorias</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => setEditando({ dados: { nome: '', ordem: proximaOrdem } })}>
          Nova
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {categorias.data.map(c => (
          <Card key={c.id} sx={{ p: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <IconeCategoria nome={c.nome} tamanho={44} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>{c.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.totalItens} {c.totalItens === 1 ? 'item' : 'itens'}
                </Typography>
              </Box>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => setEditando({ id: c.id, dados: { nome: c.nome, ordem: c.ordem } })}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={c.totalItens > 0 ? 'Mova ou exclua os itens antes' : 'Excluir'}>
                <span>
                  <IconButton size="small" onClick={() => confirmarExclusao(c)} disabled={c.totalItens > 0}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Card>
        ))}
      </Box>

      <Dialog open={!!editando} onClose={() => setEditando(null)} fullWidth maxWidth="xs">
        {editando && (
          <form onSubmit={e => {
            e.preventDefault()
            salvar.mutate(editando, { onSuccess: () => setEditando(null) })
          }}>
            <DialogTitle>{editando.id ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField label="Nome" required autoFocus value={editando.dados.nome}
                  onChange={e => setEditando({ ...editando, dados: { ...editando.dados, nome: e.target.value } })} />
                <TextField label="Ordem de exibição" type="number" value={editando.dados.ordem}
                  onChange={e => setEditando({ ...editando, dados: { ...editando.dados, ordem: Number(e.target.value) } })} />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setEditando(null)} color="inherit">Cancelar</Button>
              <Button type="submit" variant="contained" loading={salvar.isPending}>Salvar</Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </Stack>
  )
}
