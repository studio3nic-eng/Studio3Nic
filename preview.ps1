# Servidor local de prueba (solo para tu computadora; no se usa en Cloudflare).
# Uso:  powershell -ExecutionPolicy Bypass -File .\preview.ps1   ->  http://localhost:3000
#       (o doble clic en preview.cmd). Otro puerto: .\preview.ps1 -Puerto 8080
# No necesita instalar nada. Aplica los encabezados del bloque /* de _headers para que
# puedas ver errores de Content-Security-Policy en la consola del navegador.
param([int]$Puerto = 3000, [switch]$NoAbrir)

$ErrorActionPreference = "Stop"
$raiz = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd("\") + "\"

# Regenera las páginas primero, para que siempre veas lo último de js/productos.js y plantillas/.
Write-Host "Generando páginas..."
$global:LASTEXITCODE = 0
try {
  & (Join-Path $raiz "generar.ps1")
} catch {
  Write-Host "Error al generar las páginas: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
if ($LASTEXITCODE -ne 0) { exit 1 }
$tipos = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"; ".svg" = "image/svg+xml"
  ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".webp" = "image/webp"
  ".ico" = "image/x-icon"; ".woff2" = "font/woff2"; ".txt" = "text/plain; charset=utf-8"
  ".xml" = "application/xml"; ".md" = "text/plain; charset=utf-8"
}

# Lee los encabezados globales (/*) de _headers.
$globales = @{}
$dentro = $false
foreach ($linea in Get-Content (Join-Path $raiz "_headers")) {
  if ($linea -match '^/') { $dentro = ($linea.Trim() -eq "/*"); continue }
  if ($dentro -and $linea -match '^\s+([^:]+):\s*(.+)$') { $globales[$Matches[1].Trim()] = $Matches[2].Trim() }
}
# Sin HTTPS en local, esta directiva impediría cargar los archivos.
if ($globales.ContainsKey("Content-Security-Policy")) {
  $globales["Content-Security-Policy"] = ($globales["Content-Security-Policy"] -replace ';\s*upgrade-insecure-requests', '')
}

$servidor = New-Object System.Net.HttpListener
$servidor.Prefixes.Add("http://localhost:$Puerto/")
try {
  $servidor.Start()
} catch {
  Write-Host "No se pudo usar el puerto $Puerto (probablemente ya está en uso)." -ForegroundColor Red
  Write-Host "Prueba con otro:  .\preview.ps1 -Puerto 3001"
  exit 1
}

$url = "http://localhost:$Puerto/"
Write-Host "Studio 3 en $url  (Ctrl+C para detener)" -ForegroundColor Green
if (-not $NoAbrir) { Start-Process $url }

try {
  while ($servidor.IsListening) {
    # Espera en intervalos cortos para que Ctrl+C funcione.
    $tarea = $servidor.GetContextAsync()
    while (-not $tarea.AsyncWaitHandle.WaitOne(250)) { }
    $ctx = $tarea.GetAwaiter().GetResult()

    try {
      $ruta = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
      if ($ruta -eq "" -or $ruta.EndsWith("/")) { $ruta += "index.html" }
      $archivo = [IO.Path]::GetFullPath((Join-Path $raiz $ruta))
      $estado = 200

      # En GitHub Pages el sitio vive en /Studio3Nic/…; aquí se acepta esa ruta quitando la primera carpeta.
      if (-not (Test-Path -LiteralPath $archivo -PathType Leaf) -and $ruta.Contains("/")) {
        $sinPrefijo = [IO.Path]::GetFullPath((Join-Path $raiz ($ruta.Substring($ruta.IndexOf("/") + 1))))
        if (Test-Path -LiteralPath $sinPrefijo -PathType Leaf) { $archivo = $sinPrefijo }
      }
      $dentroDeRaiz = $archivo.StartsWith($raiz, [StringComparison]::OrdinalIgnoreCase)
      if (-not $dentroDeRaiz -or -not (Test-Path -LiteralPath $archivo -PathType Leaf)) {
        $estado = 404
        $archivo = Join-Path $raiz "404.html"
      }

      $res = $ctx.Response
      foreach ($k in $globales.Keys) { $res.Headers[$k] = $globales[$k] }
      $res.Headers["Cache-Control"] = "no-store"   # así siempre ves tus últimos cambios
      $ext = [IO.Path]::GetExtension($archivo).ToLower()
      $res.ContentType = $(if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { "application/octet-stream" })
      $res.StatusCode = $estado
      $bytes = [IO.File]::ReadAllBytes($archivo)
      $res.ContentLength64 = $bytes.Length
      if ($ctx.Request.HttpMethod -ne "HEAD") { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
      Write-Host "$estado /$ruta"
    } catch {
      # Un error en una petición (p. ej. el navegador cerró la conexión) no detiene el servidor.
      Write-Host "Error en /$ruta : $($_.Exception.Message)" -ForegroundColor Yellow
    } finally {
      try { $ctx.Response.Close() } catch { }
    }
  }
} finally {
  $servidor.Stop()
  $servidor.Close()
}
