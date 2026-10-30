// Desenhos (SVG) de cada tema, como texto para caber num único <svg>. Classes m-* animam (ver `animacoes` em theme.ts):
// m-balanca (balança devagar), m-voa (flutua), m-asa (bate asas), m-pisca (estrela/sol), m-sobe (bolhas).
import type { TemaVisual } from '../api/types'
import type { CoresTema } from '../theme'
import type { Paleta } from './paletas'

/** Cores de um desenho. Sobre degradê usa-se tudo branco. */
export type CoresDesenho = Pick<Paleta, 'principal' | 'acento' | 'detalhe' | 'texto'>

const atraso = (s: number) => `style="animation-delay:${s}s"`

const flor5 = (x: number, y: number, r: number, cor: string, miolo: string, extra = '') =>
  `<g transform="translate(${x} ${y})" ${extra}>${[0, 72, 144, 216, 288].map(a =>
    `<ellipse cx="0" cy="${-r}" rx="${r * 0.72}" ry="${r}" transform="rotate(${a})" fill="${cor}"/>`).join('')}<circle r="${r * 0.45}" fill="${miolo}"/></g>`

const borboleta = (x: number, y: number, s: number, a: string, b: string, corpo: string, rot = 0, delay = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><g class="m-voa" ${atraso(delay)}><g class="m-asa" ${atraso(delay)}>
  <ellipse cx="-6" cy="-4" rx="7" ry="5.5" transform="rotate(-25 -6 -4)" fill="${a}"/><ellipse cx="6" cy="-4" rx="7" ry="5.5" transform="rotate(25 6 -4)" fill="${a}"/>
  <ellipse cx="-4.5" cy="4" rx="4.5" ry="3.6" transform="rotate(20 -4.5 4)" fill="${b}"/><ellipse cx="4.5" cy="4" rx="4.5" ry="3.6" transform="rotate(-20 4.5 4)" fill="${b}"/>
  <circle cx="-6" cy="-4" r="1.8" fill="#fff" opacity=".7"/><circle cx="6" cy="-4" r="1.8" fill="#fff" opacity=".7"/></g>
  <rect x="-1" y="-8" width="2" height="15" rx="1" fill="${corpo}"/><path d="M-1 -8q-2-5-5-6M1 -8q2-5 5-6" stroke="${corpo}" stroke-width="1" fill="none" stroke-linecap="round"/></g></g>`

const estrela = (x: number, y: number, r: number, cor: string, extra = '') =>
  `<path ${extra} d="M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}Z" fill="${cor}"/>`

/** Desenho principal (viewBox 0 0 100 80). */
export const desenhos: Record<TemaVisual, (c: CoresDesenho) => string> = {
  Oliveira: c => `<g class="m-balanca"><path d="M8 74C35 58 62 38 94 10" fill="none" stroke="${c.texto}" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>
    ${[[20, 66, -55], [30, 56, 35], [40, 50, -45], [50, 40, 30], [60, 34, -40], [70, 25, 30], [80, 20, -35], [88, 12, 25]].map(([x, y, r], i) =>
      `<ellipse cx="${x}" cy="${y}" rx="10" ry="3.8" transform="rotate(${r} ${x} ${y})" fill="${i % 2 ? c.detalhe : c.principal}"/>`).join('')}
    ${[[36, 58], [58, 42], [76, 28]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="4" ry="5" fill="${c.acento}"/><ellipse cx="${x - 1.2}" cy="${y - 2}" rx="1.1" ry="1.6" fill="#fff" opacity=".5"/>`).join('')}</g>`,

  Cerejeira: c => `<g class="m-balanca"><path d="M4 70C30 58 55 42 96 16M44 48C50 36 58 30 68 28M70 31c4-8 10-12 18-12" fill="none" stroke="${c.acento}" stroke-width="2.6" stroke-linecap="round"/>
    ${flor5(24, 58, 6, c.principal, c.detalhe)}${flor5(56, 36, 7, c.principal, c.detalhe)}${flor5(84, 20, 5.5, c.detalhe, c.principal)}${flor5(40, 48, 4.5, c.detalhe, c.principal)}${flor5(70, 30, 4, c.principal, c.detalhe)}</g>
    ${[[14, 40, 20, 0], [30, 26, -30, -1.5], [62, 62, 50, -3], [90, 46, 10, -4.5]].map(([x, y, r, d]) =>
      `<g class="m-voa" ${atraso(d)}><ellipse cx="${x}" cy="${y}" rx="2.4" ry="3.6" transform="rotate(${r} ${x} ${y})" fill="${c.principal}" opacity=".6"/></g>`).join('')}`,

  Lavanda: c => [[34, -14, 0], [50, 0, -1.6], [66, 14, -3.2]].map(([x, r, d]) =>
    `<g transform="rotate(${r} 50 78)"><g class="m-balanca" ${atraso(d)}><path d="M${x} 78V18" stroke="${c.acento}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M${x} 62c-8-2-12-8-12-12 6 1 10 5 12 12zM${x} 56c8-2 12-8 12-12-6 1-10 5-12 12z" fill="${c.acento}" opacity=".7"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i =>
      `<ellipse cx="${x - 3 + (i % 2) * 6}" cy="${12 + i * 5.4}" rx="3.4" ry="4.4" fill="${i % 3 === 0 ? c.detalhe : c.principal}" opacity="${0.75 + i * 0.035}"/>`).join('')}</g></g>`).join('')
    + `<path d="M38 66q12 8 24 0" stroke="${c.detalhe}" stroke-width="3" fill="none" stroke-linecap="round"/>`,

  Pessego: c => `<g class="m-pisca"><circle cx="80" cy="18" r="10" fill="${c.acento}"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a =>
      `<rect x="79" y="2" width="2" height="5" rx="1" fill="${c.acento}" transform="rotate(${a} 80 18)"/>`).join('')}</g>
    <g class="m-balanca"><path d="M40 78V44" stroke="${c.detalhe}" stroke-width="2.4" stroke-linecap="round"/><path d="M40 66c-8-1-13-6-14-11 7 0 12 4 14 11z" fill="${c.detalhe}"/>
    <g transform="translate(40 34)">${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a =>
      `<ellipse cx="0" cy="-12" rx="3.6" ry="9" transform="rotate(${a})" fill="${c.principal}"/>`).join('')}<circle r="6.5" fill="${c.acento}"/></g></g>
    <g class="m-balanca" ${atraso(-2)}><path d="M62 78V56" stroke="${c.detalhe}" stroke-width="2.4" stroke-linecap="round"/><path d="M62 70c7-2 11-6 12-11-6 1-10 4-12 11z" fill="${c.detalhe}"/>
    <g transform="translate(62 50)">${[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(a =>
      `<ellipse cx="0" cy="-7.5" rx="2.6" ry="6" transform="rotate(${a})" fill="#fff" opacity=".95"/>`).join('')}<circle r="4" fill="${c.acento}"/></g></g>`,

  Jardim: c => `<g class="m-balanca"><path d="M22 78V46" stroke="${c.principal}" stroke-width="2.4" stroke-linecap="round"/><path d="M22 64c-8-1-12-6-13-11 7 0 11 4 13 11z" fill="${c.principal}" opacity=".85"/>${flor5(22, 42, 6, c.acento, c.detalhe)}</g>
    <g class="m-balanca" ${atraso(-1.5)}><path d="M46 78V36" stroke="${c.principal}" stroke-width="2.4" stroke-linecap="round"/><path d="M46 60c8-2 12-7 13-12-7 1-11 5-13 12z" fill="${c.principal}" opacity=".85"/>${flor5(46, 30, 8, c.detalhe, c.acento)}</g>
    <g class="m-balanca" ${atraso(-3)}><path d="M74 78V50" stroke="${c.principal}" stroke-width="2.4" stroke-linecap="round"/><path d="M74 66c-7-1-11-5-12-10 6 0 10 4 12 10z" fill="${c.principal}" opacity=".85"/>${flor5(74, 46, 6, c.acento, c.detalhe)}</g>
    ${borboleta(80, 18, 1.05, c.acento, c.detalhe, c.texto, 15)}${borboleta(14, 18, 0.7, c.detalhe, c.acento, c.texto, -20, -1.3)}`,

  Ceu: c => `<path d="M74 8a14 14 0 1 0 14 22 11 11 0 1 1-14-22z" fill="${c.acento}"/>
    <path d="M14 66h50a13 13 0 0 0 0-26 19 19 0 0 0-36 4 11 11 0 0 0-14 22z" fill="${c.principal}"/>
    <g class="m-voa"><path d="M46 72h34a9 9 0 0 0 0-18 13 13 0 0 0-25 3 8 8 0 0 0-9 15z" fill="${c.detalhe}"/></g>
    ${estrela(18, 16, 5, c.acento, `class="m-pisca"`)}${estrela(40, 10, 3.5, c.acento, `class="m-pisca" ${atraso(-1)}`)}${estrela(92, 48, 4, c.acento, `class="m-pisca" ${atraso(-2)}`)}${estrela(8, 40, 2.6, c.acento, `class="m-pisca" ${atraso(-0.5)}`)}`,

  Oceano: c => `<g class="m-voa"><path d="M18 48c0-14 14-22 32-22 16 0 28 8 30 20l10-8c2 6 0 12-6 14 4 4 4 8 2 10l-8-6c-6 6-16 8-28 8-18 0-32-4-32-16z" fill="${c.principal}"/>
    <path d="M22 52c6 6 18 8 30 8" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="34" cy="40" r="2.6" fill="${c.texto}"/>
    <path d="M44 24c-2-6-6-8-10-8M44 24c2-6 6-9 11-9M44 24v-10" stroke="${c.detalhe}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
    ${[[66, 14, 3.5, 0], [74, 8, 2.4, -1], [86, 18, 2, -2]].map(([x, y, r, d]) =>
      `<circle class="m-sobe" ${atraso(d)} cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c.principal}" stroke-width="1.6"/>`).join('')}
    <path d="M2 74q8-7 16 0t16 0 16 0 16 0 16 0 16 0" fill="none" stroke="${c.acento}" stroke-width="3" stroke-linecap="round"/>`,

  Ursinho: c => `<g class="m-balanca"><path d="M74 36c0 12 -6 26 -2 42" stroke="${c.texto}" stroke-opacity=".5" stroke-width="1.2" fill="none"/>
    <ellipse cx="76" cy="22" rx="12" ry="14" fill="${c.acento}"/><path d="M73 36l3 4 3-4z" fill="${c.acento}"/><ellipse cx="72" cy="16" rx="3" ry="4.5" fill="#fff" opacity=".35"/></g>
    <g class="m-balanca" ${atraso(-2.5)}><path d="M88 49c-2 10 2 18-6 29" stroke="${c.texto}" stroke-opacity=".5" stroke-width="1.2" fill="none"/><ellipse cx="88" cy="40" rx="7" ry="8.5" fill="${c.detalhe}"/></g>
    <circle cx="20" cy="28" r="9" fill="${c.principal}"/><circle cx="54" cy="28" r="9" fill="${c.principal}"/><circle cx="20" cy="28" r="4.5" fill="${c.detalhe}" opacity=".7"/><circle cx="54" cy="28" r="4.5" fill="${c.detalhe}" opacity=".7"/>
    <ellipse cx="37" cy="48" rx="24" ry="22" fill="${c.principal}"/><ellipse cx="37" cy="56" rx="11" ry="8.5" fill="#fff" opacity=".6"/>
    <circle cx="28" cy="44" r="2.8" fill="${c.texto}"/><circle cx="46" cy="44" r="2.8" fill="${c.texto}"/><ellipse cx="37" cy="53" rx="3.6" ry="2.6" fill="${c.texto}"/>
    <circle cx="23" cy="52" r="3" fill="${c.detalhe}" opacity=".6"/><circle cx="51" cy="52" r="3" fill="${c.detalhe}" opacity=".6"/>`,
}

/** Elemento solto de cada tema (confete e padrão de fundo), viewBox 0 0 20 20. */
export const soltos: Record<TemaVisual, (c: CoresDesenho) => string> = {
  Oliveira: c => `<ellipse cx="10" cy="10" rx="8" ry="3.2" transform="rotate(-35 10 10)" fill="${c.principal}"/>`,
  Cerejeira: c => `<ellipse cx="10" cy="10" rx="4.5" ry="7" transform="rotate(30 10 10)" fill="${c.detalhe}"/>`,
  Lavanda: c => `<ellipse cx="7" cy="8" rx="3.2" ry="4.4" fill="${c.principal}"/><ellipse cx="13" cy="12" rx="3.2" ry="4.4" fill="${c.detalhe}"/>`,
  Pessego: c => `${[0, 60, 120, 180, 240, 300].map(a =>
    `<ellipse cx="10" cy="4.5" rx="2.6" ry="4.5" transform="rotate(${a} 10 10)" fill="${c.principal}"/>`).join('')}<circle cx="10" cy="10" r="2.6" fill="${c.acento}"/>`,
  Jardim: c => borboleta(10, 10, 0.7, c.acento, c.detalhe, c.texto),
  Ceu: c => estrela(10, 10, 8, c.acento),
  Oceano: c => `<circle cx="10" cy="10" r="7" fill="none" stroke="${c.principal}" stroke-width="2"/><circle cx="7.5" cy="7.5" r="1.6" fill="${c.principal}"/>`,
  Ursinho: c => `<ellipse cx="10" cy="8" rx="6" ry="7" fill="${c.acento}"/><path d="M10 15v5" stroke="${c.texto}" stroke-width="1"/>`,
}

/** `background-image` com o elemento solto repetido bem de leve (cabeçalho, boas-vindas). */
export const padraoFundo = (tema: TemaVisual, c: CoresDesenho, opacidade = 0.14) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g opacity="${opacidade}">` +
    `<g transform="translate(4 4) scale(.6)">${soltos[tema](c)}</g>` +
    `<g transform="translate(24 22) scale(.5) rotate(25 10 10)">${soltos[tema](c)}</g></g></svg>`)}")`

/** Fundo das telas cheias (entrar, boas-vindas): degradê suave do tema com o padrão por cima. */
export const fundoDecorado = (t: CoresTema) =>
  `${padraoFundo(t.id, t, 0.16)}, linear-gradient(160deg, ${t.suave} 0%, ${t.fundo} 50%, ${t.acentoSuave} 100%)`
