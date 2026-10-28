import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
} from '@mui/material'
import type { AlteracaoFoto, Categoria, Item, SalvarItem } from '../api/types'
import { rotuloClima, rotuloOrigem, rotuloPrioridade, tamanhosSugeridos } from '../lib/format'
import CampoFoto from './CampoFoto'

interface Props {
  open: boolean
  item: Item | null // null = novo
  categorias: Categoria[]
  categoriaPadrao?: number
  salvando: boolean
  onClose: () => void
  onSalvar: (dados: SalvarItem, foto: AlteracaoFoto) => void
}

/** "" → null, demais → número (campos numéricos opcionais). */
const numeroOuNulo = (v: unknown) => (v === '' || v == null ? null : Number(v))

const vazio = (categoriaId: number): SalvarItem => ({
  categoriaId, nome: '', tamanho: null, qtdDesejada: 1, qtdAdquirida: 0, prioridade: 'Media', clima: 'Todos',
  precoUnitarioEstimado: null, valorPago: null, origem: null, lojaLink: null, observacoes: null,
})

export default function ItemFormDialog({ open, item, categorias, categoriaPadrao, salvando, onClose, onSalvar }: Props) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<SalvarItem>()
  const [foto, setFoto] = useState<AlteracaoFoto>(null)

  // A foto (estado local) zera porque ItensPage remonta o diálogo via `key` a cada abertura.
  useEffect(() => {
    if (open) reset(item ?? vazio(categoriaPadrao ?? categorias[0]?.id ?? 0))
  }, [open, item, categoriaPadrao, categorias, reset])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(dados => onSalvar(dados, foto))} noValidate>
        <DialogTitle>{item ? 'Editar item' : 'Novo item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <CampoFoto urlAtual={item?.fotoUrl ?? null} alteracao={foto} onChange={setFoto} />
            <TextField label="Nome" required autoFocus {...register('nome', { required: 'Informe o nome.' })}
              error={!!errors.nome} helperText={errors.nome?.message} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="categoriaId" control={control} render={({ field }) => (
                <TextField select label="Categoria" fullWidth {...field}>
                  {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="tamanho" control={control} render={({ field }) => (
                <Autocomplete freeSolo fullWidth options={tamanhosSugeridos} value={field.value ?? ''}
                  onChange={(_, v) => field.onChange(v || null)}
                  onInputChange={(_, v) => field.onChange(v || null)}
                  renderInput={p => <TextField {...p} label="Tamanho" />} />
              )} />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField label="Qtd. desejada" type="number" fullWidth
                {...register('qtdDesejada', { valueAsNumber: true, min: { value: 1, message: 'Mínimo 1.' } })}
                error={!!errors.qtdDesejada} helperText={errors.qtdDesejada?.message} />
              <TextField label="Qtd. adquirida" type="number" fullWidth
                {...register('qtdAdquirida', { valueAsNumber: true, min: { value: 0, message: 'Mínimo 0.' } })}
                error={!!errors.qtdAdquirida} helperText={errors.qtdAdquirida?.message} />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Controller name="prioridade" control={control} render={({ field }) => (
                <TextField select label="Prioridade" fullWidth {...field}>
                  {Object.entries(rotuloPrioridade).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="clima" control={control} render={({ field }) => (
                <TextField select label="Clima" fullWidth {...field}>
                  {Object.entries(rotuloClima).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
              )} />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Controller name="origem" control={control} render={({ field }) => (
                <TextField select label="Origem" fullWidth value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value || null)}>
                  <MenuItem value="">—</MenuItem>
                  {Object.entries(rotuloOrigem).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
              )} />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField label="Preço unit. estimado (R$)" type="number" fullWidth
                slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                {...register('precoUnitarioEstimado', { setValueAs: numeroOuNulo })} />
              <TextField label="Valor total pago (R$)" type="number" fullWidth
                slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                {...register('valorPago', { setValueAs: numeroOuNulo })} />
            </Stack>

            <TextField label="Loja / link" {...register('lojaLink')} />
            <TextField label="Observações" multiline minRows={2} {...register('observacoes')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" loading={salvando}>Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
