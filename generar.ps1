# Genera todas las páginas .html del sitio a partir de plantillas/ y js/productos.js.
# Uso: doble clic en generar.cmd (preview.cmd también lo ejecuta antes de abrir el sitio).
# Ejecútalo cada vez que cambies js/productos.js o algo en plantillas/, y antes de subir a GitHub.
# NO edites a mano los .html de la raíz ni los de categoria/ y producto/: se sobrescriben.
param([switch]$Silencioso)

$ErrorActionPreference = "Stop"

# Dirección pública del sitio, sin "/" al final. Cámbiala cuando tengas dominio propio.
$SITIO = "https://studio3nic-eng.github.io/Studio3Nic"

$raiz = $PSScriptRoot
$u8 = New-Object System.Text.UTF8Encoding($false)
$inv = [Globalization.CultureInfo]::InvariantCulture
$rutaSitio = ([Uri]$SITIO).AbsolutePath.TrimEnd("/") + "/"   # p. ej. "/Studio3Nic/", para 404.html

function Leer([string]$ruta) { [IO.File]::ReadAllText((Join-Path $raiz $ruta), $u8) }
function Escribir([string]$ruta, [string]$texto) {
  $completo = Join-Path $raiz $ruta
  $carpeta = Split-Path $completo
  if (-not (Test-Path $carpeta)) { New-Item -ItemType Directory -Force $carpeta | Out-Null }
  [IO.File]::WriteAllText($completo, $texto.Replace("`r`n", "`n"), $u8)
}
# Escapa texto para HTML (deja las tildes y la ñ como están).
function Html($texto) {
  ([string]$texto).Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&#39;")
}
function Recortar([string]$texto, [int]$max) {
  if ($texto.Length -le $max) { return $texto }
  $corte = $texto.Substring(0, $max)
  $espacio = $corte.LastIndexOf(" ")
  if ($espacio -gt 40) { $corte = $corte.Substring(0, $espacio) }
  return $corte.TrimEnd(" ", ",", ".", ":") + "…"
}

# ---------- Configuración (js/config.js) ----------

$config = Leer "js/config.js"
function DeConfig([string]$clave) {
  $m = [regex]::Match($config, "$clave\s*:\s*`"([^`"]*)`"")
  if ($m.Success) { $m.Groups[1].Value } else { "" }
}
$WA = DeConfig "whatsapp"
$MONEDA = DeConfig "moneda"
$REDES = @((DeConfig "instagram"), (DeConfig "tiktok"), (DeConfig "facebook")) | Where-Object { $_ -like "https://*" }
function Precio($n) { "$MONEDA " + ([double]$n).ToString("#,0", $inv) }
# Precio con "C$" más pequeño y suave (igual que ponerPrecio en js/app.js).
function PrecioHtml($n) { "<span class=`"moneda`">$MONEDA</span> " + ([double]$n).ToString("#,0", $inv) }
# Envío gratis fuera de Masaya desde este total; vacío si es null.
$mUmbral = [regex]::Match($config, 'envioGratisDesde\s*:\s*(\d+)')
$UMBRAL = if ($mUmbral.Success) { [double]$mUmbral.Groups[1].Value } else { 0 }
$AVISO = if ($UMBRAL -gt 0) { "Entrega gratis en Masaya · Envío gratis desde $(Precio $UMBRAL)" } else { "Entrega gratis en Masaya · Envíos a todo Nicaragua" }

# ---------- Datos (js/productos.js) ----------

$datos = Leer "js/productos.js"
function Extraer([string]$nombre) {
  $m = [regex]::Match($datos, "(?ms)^const\s+$nombre\s*=\s*(.*?^[\]\}]);")
  if (-not $m.Success) { throw "No encontré 'const $nombre = ...' en js/productos.js." }
  $json = ($m.Groups[1].Value -split "`n" | Where-Object { $_.TrimStart() -notlike "//*" }) -join "`n"
  # En PowerShell 5.1, ConvertFrom-Json devuelve la lista entera como un solo objeto: se desenvuelve aquí.
  try { $r = ConvertFrom-Json -InputObject $json; foreach ($x in $r) { $x } }
  catch { throw "js/productos.js tiene un error de formato en $nombre (revisa comillas dobles y comas). Detalle: $($_.Exception.Message)" }
}

$CATS = @(Extraer "CATEGORIAS")
$PRODS = @(Extraer "PRODUCTOS")
$null = Extraer "COMPLEMENTOS"

$errores = New-Object Collections.Generic.List[string]
$idValido = '^[a-z0-9]+(-[a-z0-9]+)*$'
$catPorId = [ordered]@{}
foreach ($c in $CATS) {
  $id = [string]$c.id
  if ($id -notmatch $idValido) { $errores.Add("Categoría con id inválido: '$id' (usa minúsculas, números y guiones)."); continue }
  if ($catPorId.Contains($id)) { $errores.Add("Categoría repetida: $id"); continue }
  if (-not $c.nombre) { $errores.Add("La categoría $id no tiene nombre.") }
  $catPorId[$id] = $c
}
$porId = [ordered]@{}
foreach ($p in $PRODS) {
  $id = [string]$p.id
  if ($id -notmatch $idValido) { $errores.Add("Producto con id inválido: '$id' (usa minúsculas, números y guiones)."); continue }
  if ($porId.Contains($id)) { $errores.Add("Producto repetido: $id"); continue }
  $porId[$id] = $p
  if (-not $p.nombre) { $errores.Add("El producto $id no tiene nombre.") }
  if (-not $catPorId.Contains([string]$p.categoria)) { $errores.Add("El producto $id usa una categoría que no existe: '$($p.categoria)'.") }
  if (-not ($p.precio -is [int] -or $p.precio -is [long] -or $p.precio -is [double] -or $p.precio -is [decimal]) -or $p.precio -le 0) {
    $errores.Add("El producto $id tiene un precio inválido: '$($p.precio)' (escribe solo el número, sin comillas).")
  }
  if (-not ($p.disponible -is [bool]) -or -not ($p.destacado -is [bool])) {
    $errores.Add("El producto ${id}: 'disponible' y 'destacado' deben ser true o false (sin comillas).")
  }
  $img = [string]$p.imagen
  if ($img -notmatch '^img/[A-Za-z0-9/_.-]+$' -or $img -match '\.\.') {
    $errores.Add("El producto ${id}: la imagen debe estar dentro de img/ (ej. img/productos/$id.webp).")
  } elseif (-not (Test-Path -LiteralPath (Join-Path $raiz $img) -PathType Leaf)) {
    $errores.Add("El producto ${id}: no encuentro la foto '$img'.")
  }
  # Opcionales: fotos extra, características y etiqueta sobre la foto.
  foreach ($extra in @($p.imagenes)) {
    if ($null -eq $extra) { continue }
    $e = [string]$extra
    if ($e -notmatch '^img/[A-Za-z0-9/_.-]+$' -or $e -match '\.\.') {
      $errores.Add("El producto ${id}: la foto extra '$e' debe estar dentro de img/.")
    } elseif (-not (Test-Path -LiteralPath (Join-Path $raiz $e) -PathType Leaf)) {
      $errores.Add("El producto ${id}: no encuentro la foto extra '$e'.")
    }
  }
  foreach ($c in @($p.caracteristicas)) {
    if ($null -ne $c -and -not ([string]$c).Trim()) { $errores.Add("El producto ${id} tiene una característica vacía.") }
  }
  foreach ($col in @($p.colores)) {
    if ($null -ne $col -and -not ([string]$col -match '^(blanco|negro|gris|plateado|dorado|azul|rojo|verde|rosado|morado|amarillo|naranja|camuflaje|durazno|beige)$')) {
      $errores.Add("El producto ${id}: color no permitido '$col' (usa: blanco, negro, gris, plateado, dorado, azul, rojo, verde, rosado, morado, amarillo, naranja, camuflaje, durazno, beige).")
    }
  }
  if ($null -ne $p.etiqueta -and ([string]$p.etiqueta).Length -gt 20) {
    $errores.Add("El producto ${id}: 'etiqueta' es demasiado larga (máximo 20 caracteres, ej. Nuevo).")
  }
}
foreach ($p in $PRODS) {
  foreach ($i in @($p.incluye)) {
    if ($null -ne $i -and -not $porId.Contains([string]$i)) { $errores.Add("El combo $($p.id) incluye un producto que no existe: '$i'.") }
  }
}
if ($errores.Count -gt 0) {
  Write-Host "No se generaron las páginas. Corrige esto en js/productos.js:" -ForegroundColor Red
  $errores | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
  exit 1
}

# ---------- Ayudantes de productos ----------

# Colores permitidos en "colores" (igual que COLORES en js/app.js; las clases .color-<id> están en estilos.css).
$COLORES = [ordered]@{
  blanco = "Blanco"; negro = "Negro"; gris = "Gris"; plateado = "Plateado"; dorado = "Dorado"; azul = "Azul"
  rojo = "Rojo"; verde = "Verde"; rosado = "Rosado"; morado = "Morado"; amarillo = "Amarillo"; naranja = "Naranja"; camuflaje = "Camuflaje"; durazno = "Durazno"; beige = "Beige"
}
# "Colores Disponibles" + circulitos; cadena vacía si el producto no tiene colores.
function BloqueColores($p, [string]$sangria) {
  $lista = @(@($p.colores) | Where-Object { $null -ne $_ -and $COLORES.Contains([string]$_) })
  if ($lista.Count -eq 0) { return "" }
  $puntos = ($lista | ForEach-Object { "<li class=`"color-punto color-$_`" title=`"$($COLORES[[string]$_])`"><span class=`"sr-only`">$($COLORES[[string]$_])</span></li>" }) -join ""
  "$sangria<div class=`"colores-bloque`"><span class=`"colores-etiqueta`">Colores Disponibles</span><ul class=`"colores`">$puntos</ul></div>`n"
}

function Incluidos($p) { @(foreach ($i in @($p.incluye)) { if ($null -ne $i) { $porId[[string]$i] } }) }
function Ahorro($p) {
  $partes = Incluidos $p
  if ($partes.Count -eq 0) { return 0 }
  $suma = 0; foreach ($x in $partes) { $suma += $x.precio }
  return [math]::Max(0, $suma - $p.precio)
}
function DeCategoria([string]$id) { @($PRODS | Where-Object { $_.categoria -eq $id }) }
$DESTACADOS = @($PRODS | Where-Object { $_.destacado -eq $true } | Select-Object -First 8)
# Misma lógica que listaProductos("relacionados") en js/app.js.
function Relacionados($p) {
  $lista = New-Object Collections.ArrayList
  foreach ($x in $PRODS) { if ($x.categoria -eq $p.categoria -and $x.id -ne $p.id) { [void]$lista.Add($x) } }
  foreach ($x in $PRODS) { if ($x.destacado -eq $true -and $x.id -ne $p.id -and -not $lista.Contains($x)) { [void]$lista.Add($x) } }
  @($lista | Select-Object -First 4)
}
function ImagenAbsoluta([string]$img) { "$SITIO/$img" }

# Tarjeta estática (la misma que dibuja tarjetaProducto en js/app.js).
function Tarjeta($p, [string]$pre) {
  $url = "${pre}producto/$($p.id).html"
  $nombre = Html $p.nombre
  $extra = ""
  $partes = Incluidos $p
  if ($partes.Count -gt 0) {
    $extra += "    <p class=`"tarjeta-incluye`">Incluye: " + (($partes | ForEach-Object { Html $_.nombre }) -join " + ") + "</p>`n"
  }
  # Etiqueta sobre la foto: Agotado > Ahorras (combos) > "etiqueta" opcional (igual que insigniaProducto en js/app.js).
  $insignia = ""
  if (-not $p.disponible) { $insignia = "<span class=`"insignia insignia-agotado`">Agotado</span>" }
  elseif ((Ahorro $p) -gt 0) { $insignia = "<span class=`"insignia insignia-ahorro`">Ahorras $(Precio (Ahorro $p))</span>" }
  elseif ($p.etiqueta -and ([string]$p.etiqueta).Trim()) { $insignia = "<span class=`"insignia`">$(Html ([string]$p.etiqueta).Trim())</span>" }
  $claseTarjeta = if ($p.disponible) { "tarjeta-producto" } else { "tarjeta-producto agotado" }
  $iconoCarrito = "<svg class=`"icono-linea`" viewBox=`"0 0 24 24`" aria-hidden=`"true`"><path d=`"M6 7h12l1 13H5zM9 7a3 3 0 016 0`"/></svg>"
  if ($p.disponible) { $boton = "<button type=`"button`" class=`"btn btn-primario btn-bloque`" data-agregar=`"$($p.id)`">$iconoCarrito<span class=`"btn-txt`">Agregar<span class=`"btn-extra`"> al carrito</span></span></button>" }
  else { $boton = "<button type=`"button`" class=`"btn btn-primario btn-bloque`" disabled>Agotado</button>" }
  @"
<article class="$claseTarjeta">
  <div class="tarjeta-media">
    <a class="tarjeta-enlace-img" href="$url" tabindex="-1" aria-hidden="true"><img class="tarjeta-img" src="$pre$(Html $p.imagen)" alt="$nombre" width="400" height="400" loading="lazy" decoding="async"></a>
    $insignia
  </div>
  <div class="tarjeta-cuerpo">
    <h3 class="tarjeta-nombre"><a href="$url">$nombre</a></h3>
$extra    <p class="tarjeta-desc">$(Html $p.descripcion)</p>
    <p class="tarjeta-precio">$(PrecioHtml $p.precio)</p>
$(BloqueColores $p "    ")    $boton
  </div>
</article>
"@
}
function Tarjetas($lista, [string]$pre) { (@($lista) | ForEach-Object { Tarjeta $_ $pre }) -join "`n" }

$ICONOS = @{
  "power-banks"  = "M9 2h6v2h2a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1h2zM12 8l-2.5 4H14l-2.5 4"
  "parlantes"    = "M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM12 6.5h.01M12 10a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
  "cargadores"   = "M13 2L4 14h7l-1 8 9-12h-7z"
  "audifonos"    = "M4 15v-3a8 8 0 0116 0v3M4 14h3v6H4zM17 14h3v6h-3z"
  "smartwatches" = "M8 2h8l1 4H7zM7 18h10l-1 4H8zM7 6h10v12H7zM12 9v3l2 1.5"
  "cables"       = "M9 2v5M15 2v5M7 7h10v4a5 5 0 01-10 0zM12 16v6"
  "combos"       = "M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8C10 4 6 4 6 6.5S9.5 8 12 8zM12 8c2-4 6-4 6-1.5S14.5 8 12 8z"
}
function Icono([string]$id) { $d = $ICONOS[$id]; if (-not $d) { $d = $ICONOS["cables"] }; $d }

# ---------- Datos estructurados (JSON-LD para Google) ----------

function JsonLd($obj) {
  $json = ConvertTo-Json -InputObject $obj -Depth 10 -Compress
  "<script type=`"application/ld+json`">" + $json.Replace("</", "<\/") + "</script>`n"
}
function Migas($items) {
  $lista = New-Object Collections.ArrayList
  $n = 1
  foreach ($x in $items) { [void]$lista.Add([ordered]@{ "@type" = "ListItem"; position = $n; name = $x[0]; item = $x[1] }); $n++ }
  [ordered]@{ "@context" = "https://schema.org"; "@type" = "BreadcrumbList"; itemListElement = $lista.ToArray() }
}
$NEGOCIO = [ordered]@{
  "@context" = "https://schema.org"
  "@type" = "Store"
  name = "Studio 3"
  description = "Tecnología y accesorios: power banks, parlantes, cargadores, audífonos, smartwatches y cables. Ventas al por mayor y al detalle."
  url = "$SITIO/"
  image = "$SITIO/img/compartir.jpg"
  logo = "$SITIO/img/logo/logo-3d.png"
  telephone = "+$WA"
  currenciesAccepted = "NIO"
  address = [ordered]@{ "@type" = "PostalAddress"; addressLocality = "Masaya"; addressCountry = "NI" }
  areaServed = [ordered]@{ "@type" = "Country"; name = "Nicaragua" }
  sameAs = @($REDES)
}

# ---------- Armado de páginas ----------

$tplCabecera = Leer "plantillas/cabecera.html"
$tplPie = Leer "plantillas/pie.html"
$OG_DEFECTO = "<meta property=`"og:image`" content=`"$SITIO/img/compartir.jpg`">`n<meta property=`"og:image:width`" content=`"1200`">`n<meta property=`"og:image:height`" content=`"630`">`n"
$sitemap = New-Object Collections.Generic.List[string]

function Variables([string]$pre, [string]$activo) {
  $pie = ($catPorId.Values | ForEach-Object { "          <li><a href=`"${pre}categoria/$($_.id).html`">$(Html $_.nombre)</a></li>" }) -join "`n"
  $v = @{
    P = $pre; A_inicio = ""; A_tienda = ""; A_emprender = ""; A_ayuda = ""
    HEAD_EXTRA = ""; JSONLD = ""; OG_TIPO = "website"; OG_IMAGEN = $OG_DEFECTO; SCRIPT = ""
    PIE_CATEGORIAS = $pie; AVISO = $AVISO
    # Línea de "Envío gratis" de Ayuda (sale de CONFIG.envioGratisDesde; vacía si es null).
    ENVIO_GRATIS_TEXTO = $(if ($UMBRAL -gt 0) { "      <li><strong>Envío gratis:</strong> en pedidos desde $(Precio $UMBRAL), el envío a Managua y al resto de Nicaragua es gratis.</li>" } else { "" })
  }
  if ($activo) { $v["A_$activo"] = ' aria-current="page"' }
  $v
}

function Pagina([string]$ruta, [string]$cuerpo, [hashtable]$v, [bool]$indexar = $true) {
  $v["TITULO"] = Html $v["TITULO_TXT"]
  $v["DESC"] = Html $v["DESC_TXT"]
  if ($indexar) {
    $v["HEAD_EXTRA"] = "<link rel=`"canonical`" href=`"$($v.URL)`">`n" + $v["HEAD_EXTRA"]
    $sitemap.Add($v.URL)
  } else {
    $v["HEAD_EXTRA"] = "<meta name=`"robots`" content=`"noindex`">`n" + $v["HEAD_EXTRA"]
  }
  $html = $tplCabecera + $cuerpo.Trim() + "`n" + $tplPie
  $faltan = New-Object Collections.Generic.List[string]
  $html = [regex]::Replace($html, '\{\{(\w+)\}\}', [Text.RegularExpressions.MatchEvaluator]{
    param($m)
    $k = $m.Groups[1].Value
    if ($v.ContainsKey($k)) { [string]$v[$k] } else { $faltan.Add($k); "" }
  })
  if ($faltan.Count -gt 0) { throw "La plantilla de $ruta usa variables desconocidas: $($faltan -join ', ')" }
  Escribir $ruta $html
}

# Borra páginas generadas antes (por si se eliminó un producto o categoría).
foreach ($carpeta in "categoria", "producto") {
  $dir = Join-Path $raiz $carpeta
  if (Test-Path $dir) { Get-ChildItem -LiteralPath $dir -Filter *.html -File | Remove-Item -Force }
}

# Bloques compartidos por las páginas principales.
$tiles = ($catPorId.Values | Where-Object { $_.id -ne "combos" } | ForEach-Object {
  $n = (DeCategoria $_.id).Count
  $conteo = if ($n -eq 0) { "Próximamente" } elseif ($n -eq 1) { "1 producto" } else { "$n productos" }
  "      <a class=`"cat-tile`" href=`"categoria/$($_.id).html`"><span class=`"cat-icono`"><svg class=`"icono-cat`" viewBox=`"0 0 24 24`" aria-hidden=`"true`"><path d=`"$(Icono $_.id)`"/></svg></span><span class=`"cat-nombre`">$(Html $_.nombre)</span><span class=`"cat-conteo`" data-conteo-cat=`"$($_.id)`">$conteo</span></a>"
}) -join "`n"
$combos = DeCategoria "combos"

# 1) Páginas principales (plantillas/paginas/*.html)
foreach ($f in Get-ChildItem (Join-Path $raiz "plantillas/paginas") -Filter *.html) {
  $texto = [IO.File]::ReadAllText($f.FullName, $u8).Replace("`r`n", "`n")
  $partes = $texto -split "(?m)^---\s*$", 2
  if ($partes.Count -lt 2) { throw "Falta la línea --- en plantillas/paginas/$($f.Name)" }
  $meta = @{}
  foreach ($linea in $partes[0] -split "`n") {
    if ($linea -match '^\s*(\w+)\s*:\s*(.*)$') { $meta[$Matches[1]] = $Matches[2].Trim() }
  }
  $es404 = $f.Name -eq "404.html"
  $pre = if ($es404) { $rutaSitio } else { "" }
  $v = Variables $pre $meta["activo"]
  $v["TITULO_TXT"] = $meta["titulo"]; $v["DESC_TXT"] = $meta["descripcion"]
  $v["URL"] = if ($f.Name -eq "index.html") { "$SITIO/" } else { "$SITIO/$($f.Name)" }
  if ($meta["script"]) { $v["SCRIPT"] = "<script src=`"$pre$($meta["script"])`" defer></script>`n" }
  $v["CATEGORIAS_TILES"] = $tiles
  $v["DESTACADOS"] = Tarjetas $DESTACADOS $pre
  $v["COMBOS"] = Tarjetas $combos $pre
  $v["CATALOGO"] = Tarjetas $PRODS $pre
  if ($f.Name -eq "index.html") { $v["JSONLD"] = JsonLd $NEGOCIO }
  $cuerpo = $partes[1]
  if ($combos.Count -gt 0) { $cuerpo = $cuerpo.Replace("<!--si-combos-->`n", "").Replace("<!--/si-combos-->`n", "") }
  else { $cuerpo = [regex]::Replace($cuerpo, '(?s)<!--si-combos-->.*?<!--/si-combos-->\n?', "") }
  Pagina $f.Name $cuerpo $v (-not $es404)
}

# 2) Una página por categoría
$tplCategoria = Leer "plantillas/categoria.html"
foreach ($c in $catPorId.Values) {
  $lista = DeCategoria $c.id
  $v = Variables "../" ""
  $titulo = if ($c.titulo) { [string]$c.titulo } else { [string]$c.nombre }
  $desc = if ($c.descripcion) { [string]$c.descripcion } else { "$($c.nombre) en Studio 3, Masaya. Envíos a todo Nicaragua." }
  $v["TITULO_TXT"] = "$titulo | Studio 3"
  $v["DESC_TXT"] = Recortar $desc 160
  $v["URL"] = "$SITIO/categoria/$($c.id).html"
  $v["CAT_ID"] = $c.id; $v["CAT_NOMBRE"] = Html $c.nombre; $v["CAT_TITULO"] = Html $titulo; $v["CAT_DESC"] = Html $desc
  $v["CAT_CHIPS"] = ($catPorId.Values | ForEach-Object {
    $actual = if ($_.id -eq $c.id) { ' aria-current="page"' } else { "" }
    "    <a class=`"chip`" href=`"$($_.id).html`"$actual>$(Html $_.nombre)</a>"
  }) -join "`n"
  $v["CAT_CONTEO"] = if ($lista.Count -eq 0) { "Pronto tendremos productos en esta categoría." } elseif ($lista.Count -eq 1) { "1 producto" } else { "$($lista.Count) productos" }
  $v["CAT_PRODUCTOS"] = Tarjetas $lista "../"
  $v["JSONLD"] = JsonLd (Migas @(@("Inicio", "$SITIO/"), @("Tienda", "$SITIO/tienda.html"), @([string]$c.nombre, $v.URL)))
  Pagina "categoria/$($c.id).html" $tplCategoria $v
}

# 3) Una página por producto
$tplProducto = Leer "plantillas/producto.html"
foreach ($p in $PRODS) {
  $c = $catPorId[[string]$p.categoria]
  $url = "$SITIO/producto/$($p.id).html"
  $v = Variables "../" ""
  $v["TITULO_TXT"] = "$($p.nombre) – $(Precio $p.precio) | Studio 3"
  $v["DESC_TXT"] = Recortar "$($p.nombre). $($p.descripcion) Precio: $(Precio $p.precio). Entrega gratis en Masaya y envíos a todo Nicaragua." 160
  $v["URL"] = $url
  $v["OG_TIPO"] = "product"
  if ($p.imagen -match '\.(jpe?g|png)$') { $v["OG_IMAGEN"] = "<meta property=`"og:image`" content=`"$(ImagenAbsoluta $p.imagen)`">`n" }
  $v["HEAD_EXTRA"] = "<meta property=`"product:price:amount`" content=`"$($p.precio)`">`n<meta property=`"product:price:currency`" content=`"NIO`">`n"
  $v["ID"] = $p.id; $v["NOMBRE"] = Html $p.nombre; $v["DESC_PROD"] = Html $p.descripcion
  $v["PRECIO"] = PrecioHtml $p.precio; $v["IMG"] = "../" + (Html $p.imagen)
  # Foto principal + miniaturas si el producto tiene "imagenes" extra (las miniaturas las conecta js/app.js).
  $fotos = @(@($p.imagenes) | Where-Object { $null -ne $_ })
  $imgPrincipal = "<img class=`"producto-img`" id=`"foto-principal`" src=`"$($v.IMG)`" width=`"800`" height=`"800`" fetchpriority=`"high`" alt=`"$(Html $p.nombre)`">"
  if ($fotos.Count -eq 0) {
    $v["GALERIA"] = "    $imgPrincipal"
  } else {
    $n = 0
    $minis = (@($p.imagen) + $fotos | ForEach-Object {
      $n++
      $pres = if ($n -eq 1) { "true" } else { "false" }
      "        <button type=`"button`" class=`"miniatura`" data-foto=`"../$(Html $_)`" aria-pressed=`"$pres`" aria-label=`"Ver foto $n`"><img src=`"../$(Html $_)`" alt=`"`" width=`"64`" height=`"64`" loading=`"lazy`"></button>"
    }) -join "`n"
    $v["GALERIA"] = "    <div class=`"galeria`">`n      $imgPrincipal`n      <div class=`"miniaturas`" role=`"group`" aria-label=`"Fotos del producto`">`n$minis`n      </div>`n    </div>"
  }
  $v["COLORES"] = BloqueColores $p "      "
  $specs = @(@($p.caracteristicas) | Where-Object { $null -ne $_ })
  $v["CARACTERISTICAS"] = ""
  if ($specs.Count -gt 0) {
    $li = ($specs | ForEach-Object { "        <li>$(Html $_)</li>" }) -join "`n"
    $v["CARACTERISTICAS"] = "      <div class=`"producto-specs`">`n        <h2>Características</h2>`n        <ul class=`"lista-check`">`n$li`n        </ul>`n      </div>`n"
  }
  $v["CAT_ID"] = $c.id; $v["CAT_NOMBRE"] = Html $c.nombre
  if ($p.disponible) {
    $v["ESTADO"] = "Disponible"; $v["ESTADO_CLASE"] = ""
    $v["BOTON"] = "<button type=`"button`" class=`"btn btn-primario`" data-agregar=`"$($p.id)`">Agregar al carrito</button>"
  } else {
    $v["ESTADO"] = "Agotado"; $v["ESTADO_CLASE"] = " estado-agotado"
    $v["BOTON"] = "<button type=`"button`" class=`"btn btn-primario`" data-agregar=`"$($p.id)`" disabled>Agotado</button>"
  }
  $partes = Incluidos $p
  $v["INCLUYE"] = ""
  if ($partes.Count -gt 0) {
    $items = ($partes | ForEach-Object { "        <li><a href=`"$($_.id).html`">$(Html $_.nombre)</a></li>" }) -join "`n"
    $a = Ahorro $p
    $ahorroHtml = if ($a -gt 0) { "      <p class=`"etiqueta-ahorro`">Ahorras $(Precio $a) comprando el combo</p>`n" } else { "" }
    $v["INCLUYE"] = "      <div class=`"producto-incluye`">`n        <p><strong>Este combo incluye:</strong></p>`n        <ul>`n$items`n        </ul>`n      </div>`n$ahorroHtml"
  }
  $texto = "Hola Studio 3, me interesa este producto: $($p.nombre)`n$url"
  $v["WA_URL"] = "https://wa.me/${WA}?text=" + [Uri]::EscapeDataString($texto)
  $v["RELACIONADOS"] = Tarjetas (Relacionados $p) "../"
  $producto = [ordered]@{
    "@context" = "https://schema.org"
    "@type" = "Product"
    name = [string]$p.nombre
    description = [string]$p.descripcion
    sku = [string]$p.id
    image = @(@($p.imagen) + $fotos | ForEach-Object { ImagenAbsoluta $_ })
    category = [string]$c.nombre
    offers = [ordered]@{
      "@type" = "Offer"
      url = $url
      priceCurrency = "NIO"
      price = [string]$p.precio
      availability = $(if ($p.disponible) { "https://schema.org/InStock" } else { "https://schema.org/OutOfStock" })
      itemCondition = "https://schema.org/NewCondition"
      seller = [ordered]@{ "@type" = "Organization"; name = "Studio 3" }
    }
  }
  $v["JSONLD"] = (JsonLd $producto) + (JsonLd (Migas @(@("Inicio", "$SITIO/"), @([string]$c.nombre, "$SITIO/categoria/$($c.id).html"), @([string]$p.nombre, $url))))
  Pagina "producto/$($p.id).html" $tplProducto $v
}

# 4) sitemap.xml y robots.txt
$xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n"
foreach ($u in $sitemap) { $xml += "  <url><loc>$(Html $u)</loc></url>`n" }
$xml += "</urlset>`n"
Escribir "sitemap.xml" $xml
Escribir "robots.txt" "User-agent: *`nAllow: /`n`nSitemap: $SITIO/sitemap.xml`n"

if (-not $Silencioso) {
  Write-Host "Listo: $($sitemap.Count) páginas generadas ($($catPorId.Count) categorías, $($PRODS.Count) productos)." -ForegroundColor Green
}
