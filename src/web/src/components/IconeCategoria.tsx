import { Box } from '@mui/material'
import { visualCategoria } from '../lib/categorias'

/** Ícone redondo com o fundo pastel da categoria. */
export default function IconeCategoria({ nome, tamanho = 40 }: { nome: string; tamanho?: number }) {
  const { Icone, cor, fundo } = visualCategoria(nome)
  return (
    <Box sx={{
      width: tamanho, height: tamanho, borderRadius: '50%', bgcolor: fundo, color: cor, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icone sx={{ fontSize: tamanho * 0.55 }} />
    </Box>
  )
}
