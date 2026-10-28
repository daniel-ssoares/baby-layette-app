// Uso: abrir o Edge com --headless=new --remote-debugging-port=9333 --user-data-dir=<pasta temp>, depois
// node scripts/clicar.mjs <url> "<texto do botão>"   (relata texto da página antes/depois, sessão e erros do console)
// Abre a URL num Edge headless (porta 9333), clica no botão pelo texto e relata console/erros/estado.
const [url, texto] = process.argv.slice(2)
const alvo = await (await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json()
const ws = new WebSocket(alvo.webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r, { once: true }))
let id = 0; const pend = new Map(); const log = []
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data)
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id) }
  if (m.method === 'Runtime.consoleAPICalled') log.push(`console.${m.params.type}: ${m.params.args.map(a => a.value ?? a.description).join(' ')}`)
  if (m.method === 'Runtime.exceptionThrown') log.push(`EXCEÇÃO: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`)
})
const cdp = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const avaliar = async expr => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.value
await cdp('Runtime.enable')
await new Promise(r => setTimeout(r, 6000))
console.log('antes:', await avaliar(`document.body.innerText.slice(0, 150)`))
console.log('clicou:', await avaliar(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.innerText.includes(${JSON.stringify(texto)})); if (!b) return 'botão não achado'; b.click(); return 'ok' })()`))
await new Promise(r => setTimeout(r, 4000))
console.log('depois:', await avaliar(`location.pathname + ' :: ' + document.body.innerText.slice(0, 250)`))
console.log('localStorage:', await avaliar(`'logado=' + JSON.parse(localStorage.getItem('enxoval-demo-v1') ?? '{}').logado`))
console.log(log.join('\n') || '(sem mensagens no console)')
ws.close()
