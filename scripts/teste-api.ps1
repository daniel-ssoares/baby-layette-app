# Testes manuais/smoke da API e screenshots, sem mexer no banco real nem na API que estiver aberta.
# Uso (PowerShell, na raiz do repo; o arquivo tem BOM para o PS 5.1 ler UTF-8):
#   dotnet build src/Enxoval.Api -c Release
#   . .\scripts\teste-api.ps1; Iniciar-Api; $s = Entrar ...; Req GET '/api/itens' $null $s; Parar-Api
# Sobe a API (build Release) numa cópia do banco real, na porta 5211; o front de teste fica na 5273.
$Scratch = Join-Path $env:TEMP 'enxoval-teste'; New-Item -ItemType Directory -Force $Scratch | Out-Null
$Base = 'http://localhost:5211'

function Iniciar-Api {
  # Um copia.db-wal de execução interrompida seria reaplicado sobre a cópia nova.
  Get-ChildItem $Scratch -Filter 'copia.db*' | ForEach-Object { [IO.File]::Delete($_.FullName) }
  Copy-Item C:\dev\baby-layette-app\src\Enxoval.Api\enxoval.db "$Scratch\copia.db" -Force
  $env:ConnectionStrings__Enxoval = "Data Source=$Scratch\copia.db"; $env:ASPNETCORE_URLS = $Base; $env:ASPNETCORE_ENVIRONMENT = 'Development'
  $bin = 'C:\dev\baby-layette-app\src\Enxoval.Api\bin\Release\net10.0'
  $script:ApiProc = Start-Process "$bin\Enxoval.Api.exe" -WorkingDirectory $bin -PassThru -WindowStyle Hidden -RedirectStandardError "$Scratch\api.err" -RedirectStandardOutput "$Scratch\api.log"
  for ($i = 0; $i -lt 30; $i++) { try { Invoke-WebRequest "$Base/openapi/v1.json" -UseBasicParsing -ErrorAction Stop | Out-Null; return } catch { Start-Sleep 1 } }
  Get-Content "$Scratch\api.err" -Tail 20; throw 'API não subiu'
}
function Parar-Api { Stop-Process -Id $script:ApiProc.Id -Force -ErrorAction SilentlyContinue; Start-Sleep 1; Remove-Item "$Scratch\copia.db*" -ErrorAction SilentlyContinue }

# Requisição JSON que devolve status + corpo sem lançar exceção.
function Req($metodo, $caminho, $corpo = $null, $sessao = $null) {
  $p = @{ Method = $metodo; Uri = "$Base$caminho"; UseBasicParsing = $true; ErrorAction = 'Stop' }
  if ($sessao) { $p.WebSession = $sessao }
  if ($null -ne $corpo) { $p.ContentType = 'application/json; charset=utf-8'; $p.Body = [Text.Encoding]::UTF8.GetBytes(($corpo | ConvertTo-Json -Depth 5)) }
  try { $r = Invoke-WebRequest @p; [pscustomobject]@{ Status = [int]$r.StatusCode; Corpo = $r.Content } }
  catch { $resp = $_.Exception.Response; $txt = if ($resp) { (New-Object IO.StreamReader($resp.GetResponseStream())).ReadToEnd() } else { $_.Exception.Message }
          [pscustomobject]@{ Status = if ($resp) { [int]$resp.StatusCode } else { 0 }; Corpo = $txt } }
}
function Entrar($email, $senha) {
  $s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $r = Req POST '/api/auth/login?useCookies=true' @{ email = $email; password = $senha } $s
  if ($r.Status -ne 200) { throw "login $email -> $($r.Status) $($r.Corpo)" }
  $s
}
function Iniciar-Web {
  $env:API_URL = $Base
  $script:WebProc = Start-Process npm.cmd -ArgumentList 'run','dev','--','--port','5273','--strictPort' -WorkingDirectory C:\dev\baby-layette-app\src\web -PassThru -WindowStyle Hidden -RedirectStandardOutput "$Scratch\web.log" -RedirectStandardError "$Scratch\web.err"
  for ($i = 0; $i -lt 40; $i++) { try { Invoke-WebRequest 'http://localhost:5273/' -UseBasicParsing -ErrorAction Stop | Out-Null; return } catch { Start-Sleep 1 } }
}
function Parar-Web {
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object CommandLine -match '5273' | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
  Stop-Process -Id $script:WebProc.Id -Force -ErrorAction SilentlyContinue
}
# Screenshot headless; $cookie (opcional) = valor do cookie enxoval.auth para páginas logadas.
function Foto($caminho, $arquivo, $tamanho = '520,1000', $cookie = $null) {
  $url = "http://localhost:5273$caminho"
  $dir = "$Scratch\edge-$([guid]::NewGuid().ToString('N').Substring(0,6))"
  $pagina = 'C:\dev\baby-layette-app\src\web\public\__teste-login.html'
  if ($cookie) {
    # Página temporária na mesma origem grava o cookie e redireciona (removida em seguida).
    [IO.File]::WriteAllText($pagina, "<script>document.cookie='enxoval.auth=$cookie; path=/';location.replace('$caminho')</script>")
    $url = 'http://localhost:5273/__teste-login.html'
  }
  $edgeArgs = @('--headless=new','--disable-gpu','--hide-scrollbars','--virtual-time-budget=12000',"--window-size=$tamanho","--screenshot=$Scratch\$arquivo","--user-data-dir=$dir", $url)
  try {
    $p = Start-Process 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList $edgeArgs -PassThru -WindowStyle Hidden
    $p.WaitForExit(60000) | Out-Null
  } finally { Remove-Item $pagina -ErrorAction SilentlyContinue }
}
function CookieDe($sessao) { $sessao.Cookies.GetCookies([uri]$Base)['enxoval.auth'].Value }
function Afirmar($cond, $msg) { if ($cond) { "  OK   $msg" } else { "  FALHA $msg" } }
