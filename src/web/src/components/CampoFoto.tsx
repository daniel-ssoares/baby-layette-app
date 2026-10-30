import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import AddAPhotoIcon from '@mui/icons-material/AddAPhotoOutlined'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import type { AlteracaoFoto } from '../api/types'
import { reduzirImagem } from '../lib/imagem'

interface Props {
  urlAtual: string | null
  alteracao: AlteracaoFoto
  onChange: (a: AlteracaoFoto) => void
}

/** T3: escolher/tirar foto do item (no celular o seletor oferece câmera ou galeria). */
export default function CampoFoto({ urlAtual, alteracao, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [reduzindo, setReduzindo] = useState(false)
  const previa = useMemo(() => (alteracao instanceof Blob ? URL.createObjectURL(alteracao) : null), [alteracao])
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa) }, [previa])

  const exibida = alteracao === 'remover' ? null : previa ?? urlAtual

  const escolher = async (arquivo: File | undefined) => {
    if (!arquivo) return
    setReduzindo(true)
    try { onChange(await reduzirImagem(arquivo)) } finally { setReduzindo(false) }
  }

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{
        width: 88, height: 88, borderRadius: '16px', overflow: 'hidden', flexShrink: 0, bgcolor: 'tema.suave',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main',
      }}>
        {reduzindo ? <CircularProgress size={24} />
          : exibida ? <Box component="img" src={exibida} alt="Foto do item" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <AddAPhotoIcon />}
      </Box>
      <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
        <Button size="small" variant="outlined" startIcon={<AddAPhotoIcon />} onClick={() => input.current?.click()} disabled={reduzindo}>
          {exibida ? 'Trocar foto' : 'Adicionar foto'}
        </Button>
        {exibida && (
          <Button size="small" color="inherit" startIcon={<DeleteIcon />}
            onClick={() => onChange(urlAtual ? 'remover' : null)}>
            Remover
          </Button>
        )}
        <Typography variant="caption" color="text.secondary">JPEG, PNG ou WebP</Typography>
      </Stack>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden
        onChange={e => { escolher(e.target.files?.[0]); e.target.value = '' }} />
    </Stack>
  )
}
