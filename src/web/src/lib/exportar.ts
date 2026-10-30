// T4: PDF e Excel da lista de compras, gerados no navegador (carregado só ao exportar: jsPDF e ExcelJS são grandes).
import { darken } from '@mui/material'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import type { TemaVisual } from '../api/types'
import { temas } from '../temas/paletas'
import { moeda, rotuloPrioridade } from './format'
import { nomeComTamanho, rotuloStatusLinha, type ListaDeCompras } from './listaCompras'

/** Cores do papel: versão clara do tema, com a principal um pouco mais escura para leitura impressa. */
function coresPapel(tema: TemaVisual) {
  const p = temas[tema].claro
  return { principal: darken(p.principal, 0.1), suave: p.suave, texto: p.texto, textoSuave: p.textoSuave, linha: darken(p.suave, 0.05) }
}

const rgb = (hex: string): [number, number, number] => {
  const h = hex.startsWith('rgb') ? hex.match(/\d+/g)!.map(Number) : [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return [h[0], h[1], h[2]]
}
const hexArgb = (cor: string) => 'FF' + rgb(cor).map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase()
const dataBR = (d: Date) => d.toLocaleDateString('pt-BR')

export function gerarPdf(lista: ListaDeCompras, titulo: string, tema: TemaVisual, hoje = new Date()): Blob {
  const c = coresPapel(tema)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const largura = doc.internal.pageSize.getWidth()
  const margem = 36

  // Cabeçalho: título à esquerda, data/itens/total à direita, linha na cor do tema.
  doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(...rgb(c.principal)).text(titulo, margem, 56)
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(...rgb(c.textoSuave))
    .text(lista.completa ? 'Lista completa do enxoval' : 'Lista de compras — o que falta comprar', margem, 74)
  doc.setFontSize(10).text([dataBR(hoje), `${lista.totalLinhas} itens`], largura - margem, 46, { align: 'right' })
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...rgb(c.texto)).text(`Falta: ${moeda(lista.total)}`, largura - margem, 74, { align: 'right' })
  doc.setDrawColor(...rgb(c.principal)).setLineWidth(1.5).line(margem, 84, largura - margem, 84)

  let y = 108
  if (lista.grupos.length === 0) {
    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(...rgb(c.textoSuave)).text('Nada faltando por aqui.', margem, y)
  }
  const colunas = ['', 'Item', 'Falta', 'Prior.', 'Preço un.', 'A gastar', ...(lista.completa ? ['Status'] : [])]
  for (const g of lista.grupos) {
    if (y > doc.internal.pageSize.getHeight() - 90) { doc.addPage(); y = 50 }
    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...rgb(c.principal)).text(g.categoria, margem, y)
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...rgb(c.textoSuave)).text(moeda(g.subtotal), largura - margem, y, { align: 'right' })
    autoTable(doc, {
      startY: y + 6,
      margin: { left: margem, right: margem, bottom: 40 },
      head: [colunas],
      body: g.linhas.map(l => ['', nomeComTamanho(l), String(l.falta), rotuloPrioridade[l.prioridade], moeda(l.precoUnitario),
        moeda(l.subtotal), ...(lista.completa ? [rotuloStatusLinha(l)] : [])]),
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9.5, textColor: rgb(c.texto), cellPadding: { top: 5, bottom: 5, left: 3, right: 3 }, lineColor: rgb(c.linha) },
      headStyles: { fillColor: rgb(c.suave), textColor: rgb(c.textoSuave), fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { lineWidth: { bottom: 0.5 } },
      columnStyles: { 0: { cellWidth: 18 }, 2: { halign: 'right', cellWidth: 40 }, 3: { cellWidth: 46 }, 4: { halign: 'right', cellWidth: 66 }, 5: { halign: 'right', cellWidth: 70 } },
      didParseCell: d => {
        const l = g.linhas[d.row.index]
        if (d.section === 'body' && d.column.index === 3) d.cell.styles.textColor = rgb(l.prioridade === 'Alta' ? c.principal : c.textoSuave)
        if (d.section === 'body' && d.column.index === 6) d.cell.styles.textColor = rgb(c.textoSuave)
      },
      didDrawCell: d => {
        if (d.section !== 'body' || d.column.index !== 0) return
        const lado = 9
        const x = d.cell.x + 4, yy = d.cell.y + (d.cell.height - lado) / 2
        doc.setDrawColor(...rgb(c.textoSuave)).setLineWidth(0.8)
        if (g.linhas[d.row.index].status === 'Concluido') doc.setFillColor(...rgb(c.principal)).rect(x, yy, lado, lado, 'FD') // já comprado
        else doc.rect(x, yy, lado, lado)
      },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26
  }

  const paginas = doc.getNumberOfPages()
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...rgb(c.textoSuave))
      .text(`Preços estimados · página ${p} de ${paginas}`, largura / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' })
  }
  return doc.output('blob')
}

export async function gerarExcel(lista: ListaDeCompras, tema: TemaVisual): Promise<Blob> {
  const c = coresPapel(tema)
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Lista de compras', { views: [{ state: 'frozen', ySplit: 1 }] })
  ws.columns = [
    { header: 'Categoria', width: 20 }, { header: 'Item', width: 44 }, { header: 'Tamanho', width: 10 },
    { header: 'Quero', width: 8 }, { header: 'Tenho', width: 8 }, { header: 'Falta', width: 8 }, { header: 'Prioridade', width: 11 },
    { header: 'Preço unitário', width: 15 }, { header: 'A gastar', width: 13 }, { header: 'Status', width: 16 },
  ]
  for (const g of lista.grupos)
    for (const l of g.linhas)
      ws.addRow([g.categoria, l.nome, l.tamanho ?? '', l.desejada, l.adquirida, l.falta, rotuloPrioridade[l.prioridade],
        l.precoUnitario, l.subtotal, rotuloStatusLinha(l)])

  const ultima = ws.rowCount
  const total = ws.addRow([])
  total.getCell(8).value = 'Total'
  total.getCell(9).value = { formula: `SUM(I2:I${Math.max(ultima, 2)})`, result: lista.total }
  total.font = { bold: true }

  const cab = ws.getRow(1)
  cab.font = { bold: true, color: { argb: hexArgb(c.principal) } }
  cab.eachCell(cel => { cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexArgb(c.suave) } } })
  if (ultima >= 2) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ultima, column: 10 } }
  for (const col of [8, 9]) ws.getColumn(col).numFmt = '"R$" #,##0.00'

  const bytes = await wb.xlsx.writeBuffer()
  return new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/** Dispara o download de um arquivo gerado no navegador. */
export function baixar(arquivo: Blob, nome: string) {
  const url = URL.createObjectURL(arquivo)
  const a = Object.assign(document.createElement('a'), { href: url, download: nome })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
