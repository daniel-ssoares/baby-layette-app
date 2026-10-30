// Service worker do app instalado (PWA). Registrado só no build de produção (main.tsx).
// - Páginas: rede primeiro; sem internet, a última versão salva (o app abre em vez de ficar em branco).
// - /assets/* (nome com hash, nunca muda): cache primeiro.
// - Ícones e manifest: cache, atualizado em segundo plano.
// - Dados (Supabase, outro domínio) e /api nunca passam por aqui: sempre do servidor.
const CACHE = 'enxoval-v3'
const MAX_ASSETS = 80

// Na instalação guarda a página e os /assets/ que ela referencia: a 1ª visita já carregou o JS antes
// de o service worker existir, então sem isso o app só abriria offline a partir da 2ª visita.
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const resp = await fetch('/', { cache: 'no-cache' })
    const html = await resp.clone().text()
    await cache.put('/', resp)
    const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m => m[1]))]
    await cache.addAll(assets)
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', e => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (req.mode === 'navigate') e.respondWith(redePrimeiro(req))
  else if (url.pathname.startsWith('/assets/')) e.respondWith(cachePrimeiro(req))
  else e.respondWith(atualizarEmSegundoPlano(req, e))
})

async function redePrimeiro(req) {
  const cache = await caches.open(CACHE)
  try {
    const resp = await fetch(req)
    // O SPA responde index.html em qualquer rota: guarda sempre como '/'.
    if (resp.ok) await cache.put('/', resp.clone())
    return resp
  } catch {
    return (await cache.match('/')) ?? Response.error()
  }
}

async function cachePrimeiro(req) {
  const cache = await caches.open(CACHE)
  const salvo = await cache.match(req)
  if (salvo) return salvo
  const resp = await fetch(req)
  if (resp.ok) {
    await cache.put(req, resp.clone())
    await limparAssets(cache)
  }
  return resp
}

async function atualizarEmSegundoPlano(req, e) {
  const cache = await caches.open(CACHE)
  const salvo = await cache.match(req)
  const buscar = fetch(req).then(async resp => {
    if (resp.ok) await cache.put(req, resp.clone())
    return resp
  })
  if (salvo) {
    e.waitUntil(buscar.catch(() => undefined))
    return salvo
  }
  return buscar
}

/** Cada deploy gera assets com hash novo: descarta os mais antigos para o cache não crescer sem limite. */
async function limparAssets(cache) {
  const assets = (await cache.keys()).filter(r => new URL(r.url).pathname.startsWith('/assets/'))
  await Promise.all(assets.slice(0, Math.max(0, assets.length - MAX_ASSETS)).map(r => cache.delete(r)))
}
