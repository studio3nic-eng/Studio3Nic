# Studio 3 — Website

Online catalog for Studio 3, a tech-accessories store in Masaya, Nicaragua.
Customers browse by category, add items to a cart, and send the order to WhatsApp.
There are NO online payments. Launch date: Thursday, October 1, 2026.

## Hard rules

- All customer-facing text in **Spanish** (`<html lang="es">`). Talk to me in English.
- **Plain HTML, CSS and vanilla JavaScript.** No frameworks, no npm, no server-side build.
  Hosted on **GitHub Pages** (repo `studio3nic-eng/Studio3Nic`, branch `main`, folder `/`,
  URL https://studio3nic-eng.github.io/Studio3Nic/); the repo is deployed as-is.
- **HTML pages are generated.** `generar.ps1` (Windows PowerShell 5.1, no installs) builds every
  `.html` from `plantillas/` + `js/productos.js`. Edit templates, never the generated `.html`
  (root pages, `categoria/`, `producto/`). Run it (or `preview.cmd`, which runs it) and commit the output.
  `.ps1` files must be saved as UTF-8 **with BOM**, or PowerShell 5.1 misreads accents.
- **Mobile first.** Most customers arrive from Instagram/TikTok/WhatsApp on a phone.
- **Security (must hold everywhere):**
  - No inline `<script>` code, no `onclick=` or other inline handlers, no `style="…"` attributes.
    All JS in `/js`, loaded with `<script src="…" defer>`; all CSS in `/css`.
    Only exception: `<script type="application/ld+json">` data blocks written by `generar.ps1`
    (not executable; `</` escaped as `<\/`).
  - GitHub Pages ignores `_headers`, so the CSP is also a `<meta http-equiv>` in every page
    (same policy minus `frame-ancestors`/`upgrade-insecure-requests`, which meta can't set).
  - Insert product and customer text with `textContent` / `createElement`, never `innerHTML`.
  - The cart in localStorage stores only `{id, cant}`. Names and prices always come from
    `js/productos.js`. Drop unknown ids, cap quantity at `CONFIG.cantidadMaxima` (20).
  - `?cat=` from the URL is accepted only if it matches a `CATEGORIAS` id.
  - `?ref=` is accepted only if it is a key of `CONFIG.fuentes`; localStorage `studio3-origen`
    stores only `{ref, t}` (30 days) and the order message gets "Vengo de: <nombre>".
  - Product/category ids must match `^[a-z0-9]+(-[a-z0-9]+)*$` (they become file names);
    `generar.ps1` validates this and refuses to build on bad data.
  - Customer inputs: trim, strip control chars, max 60 chars, `encodeURIComponent` into the wa.me link.
  - External links: `target="_blank" rel="noopener noreferrer"`.
  - Self-host fonts (Poppins .woff2 in `/fuentes`) — no Google Fonts CDN, no external scripts.
- **Content:** name products by what they are. Apple/Samsung/JBL names or logos only for genuine units.
  Product photos are our own, never copied from brand or supplier sites.

## Business details

- WhatsApp: +505 8714-6561 → `50587146561` in wa.me links
- Instagram: https://www.instagram.com/studio3.ni · TikTok: https://www.tiktok.com/@studio3.ni
- Facebook: link pending — use placeholder `PEGAR-AQUI-EL-ENLACE-DE-FACEBOOK`
- Currency: córdobas, shown as `C$ 1,450` (setting in `js/config.js`)
- Delivery: free in Masaya; rest of Nicaragua by CargoTrans (cost confirmed in chat)
- Sells retail and wholesale (resellers)

## File structure

```
plantillas/cabecera.html   <head>, header, cart drawer (shared)      ┐
plantillas/pie.html        footer, floating WhatsApp, base scripts   │ edit these,
plantillas/paginas/*.html  index, tienda, revendedores, ayuda, 404   │ then run
                           (front matter: titulo/descripcion/activo/script, then ---)
plantillas/categoria.html  one page per category                     │ generar.ps1
plantillas/producto.html   one page per product                      ┘
generar.ps1 / .cmd         builds all .html + sitemap.xml + robots.txt ($SITIO at the top = public URL)
preview.ps1 / .cmd         runs generar.ps1, then serves http://localhost:3000 with the CSP headers
index.html, tienda.html, revendedores.html, ayuda.html, 404.html   (generated)
categoria/<id>.html, producto/<id>.html                            (generated; folders wiped each run)
robots.txt, sitemap.xml                                            (generated)
_headers                   kept for a future Cloudflare move; ignored by GitHub Pages
.nojekyll                  GitHub Pages serves files as-is
css/estilos.css
js/config.js          CONFIG: whatsapp, moneda, cantidadMaxima, envioGratisDesde, fuentes, redes
js/productos.js       CATEGORIAS + COMPLEMENTOS + PRODUCTOS (the only file edited for prices/stock)
js/app.js             shared: formatoPrecio, limpiar, Carrito, tarjetaProducto, [data-lista] lists,
                      product-page hydration, cart drawer, suggestions, envío gratis, origen, menu, enviarPedido
js/tienda.js          category chips + ?cat= (tienda.html only)
js/revendedores.js    emprendedor form → WhatsApp (revendedores.html only)
img/marca/            logo-original.png, portada.png (reference designs)
img/logo/             logo-plano.svg, logo-3d.webp, icono-3.png (from designer; logo-3d.png copy until then)
img/productos/        one square .webp per product, file name = product id
img/compartir.jpg     1200×630 link preview (cropped from portada.png)
img/apple-touch-icon.png  180×180 home-screen icon (blue "3" on white, matches favicon.svg)
fuentes/              poppins-400/500/700/800.woff2
```

Every page has the same head, header, cart drawer, footer, floating WhatsApp button and base scripts
(config.js → productos.js → app.js); they come from the shared templates. `<body data-base>` holds the
path prefix ("" at root, "../" in categoria/ and producto/, "/Studio3Nic/" in 404.html).
Generated pages carry static product cards for Google and link previews; at runtime `app.js` redraws
every `[data-lista]` from `productos.js`, so prices and stock are always current even if the owner
forgot to regenerate (new/renamed products still need a regenerate for their own pages).

## Data format (`js/productos.js`)

Categories (id → name): power-banks → Power Banks · parlantes → Parlantes · cargadores → Cargadores ·
audifonos → Audífonos · smartwatches → Smartwatches · cables → Cables · combos → Combos.
Each category also has `titulo` + `descripcion` (SEO copy for its category page).
The home-page tiles show every category except `combos` (which has its own home section).

The file must stay **JSON-compatible inside each `const`** (double-quoted keys and strings, no trailing
commas, comments only on their own `//` lines, closing `];`/`};` at column 0) because `generar.ps1`
parses it with `ConvertFrom-Json`.

```js
{ "id": "pb-10000-negro", "nombre": "Power Bank 10,000 mAh carga rápida 20W", "categoria": "power-banks",
  "precio": 650, "imagen": "img/productos/pb-10000-negro.webp",
  "descripcion": "Salidas USB-C y USB-A.", "destacado": true, "disponible": true }
```
Optional `"incluye": ["id-1", "id-2"]` makes a combo: cards show "Incluye: …" and an "Ahorras C$ X" badge
on the photo (sum of parts − price, only if > 0). Other optional fields: `"etiqueta"` (badge on the photo, ≤ 20 chars,
e.g. "Nuevo"; "Agotado" and "Ahorras" take priority), `"imagenes"` (extra photos → thumbnails on the product page),
`"caracteristicas"` (spec bullets on the product page). `generar.ps1` validates the extra photos exist.
Also built in (pre-launch polish, 2026-09-29): top announcement bar (from `CONFIG.envioGratisDesde`), "Agregado" toast +
cart-counter bump, cart line thumbnails, sticky "Agregar al carrito" bar on product pages (phones), floating WhatsApp
prefilled with the product name on product pages, tienda search + price sort (only when > 20 products), chips as a
horizontal scroll row on phones, scroll fade-in of `main .seccion`, smaller "C$" in prices, category tile counts.
Not done (need owner/designer assets): real photos, transparent logo, testimonials, social photo grid, footer hours. `COMPLEMENTOS` maps category → categories suggested in the cart.
Names follow the search pattern "qué es + capacidad/modelo + dato clave".
Until real products arrive, placeholders are named "[PRUEBA] …" (12 products + 2 combos) with a
neutral placeholder image, and the file keeps the `// TODO: reemplazar con productos reales` comment.

## Design system (from img/marca/)

Light, clean, tech. White/very light background, near-black headlines, electric blue accent,
WhatsApp green only on WhatsApp buttons. Faint blue hexagon-network lines behind the hero.

| Token | Value | Use |
|---|---|---|
| --azul | #1F6FEB (confirm with designer) | the "3", eyebrows, links, primary buttons, check icons |
| --tinta | #0F1115 | headlines, body |
| --texto-suave | #5B6472 | secondary text |
| --fondo | #F5F7FA | page background |
| --tarjeta | #FFFFFF | cards, cart drawer |
| --borde | #D9DEE7 | pills, borders |
| --whatsapp | #25D366 | WhatsApp buttons only |

Poppins 400/500/700/800. Headlines `clamp(2rem, 6vw, 3.5rem)`, weight 800.
Pill chips (1px border, fully rounded), white cards (16px radius, soft shadow), fully rounded buttons,
blue check badges for trust points. Buttons ≥ 44px tall, contrast ≥ 4.5:1, alt text on all images.
Header logo ~32px tall (flat version); full 3D logo only in the hero. Favicon = blue "3".
If `logo-plano.svg` isn't there yet, render the wordmark as text: "STUDIO" in Poppins 800 + a blue superscript "3".

## Pages and copy

**Header:** logo · Inicio · Tienda · ¿Quieres emprender? (page revendedores.html) · Ayuda · cart button with counter (counter hidden at 0).
On phones the links collapse into a "Menú" button; the cart stays visible.

**Inicio:** hero — eyebrow "TECNOLOGÍA Y ACCESORIOS", H1 "Todo para tus dispositivos", subtitle
"Power banks, parlantes, cargadores, audífonos, smartwatches y cables. Envíos a todo Nicaragua.",
buttons "Ver tienda" + "Escríbenos por WhatsApp", 3D logo on the right (below on mobile) →
category tiles (link to `categoria/<id>.html`) → 8 featured products (`destacado: true`, `#destacados`) →
"Combos y promociones" (only if the combos category has products) →
"Cómo comprar": 1. Elige tus productos y agrégalos al carrito. 2. Toca "Enviar pedido por WhatsApp".
3. Te confirmamos disponibilidad, total y entrega por chat. → trust points (Ventas al por mayor y al
detalle · Envíos a todo Nicaragua · Garantía en todos los productos · Entrega gratis en Masaya) →
reseller teaser "¿Quieres emprender? Precios especiales por volumen." + "Quiero ser emprendedor" →
social block "Síguenos: @studio3.ni".

**Tienda:** chips `Todos` + 7 categories (`data-cat`, `aria-pressed`), grid `#productos`.
Card: image + name (both link to `producto/<id>.html`), combo "Incluye"/"Ahorras", description, price,
"Agregar al carrito" → "Agregado" for 1.5 s. `disponible: false` → disabled "Agotado".

**Category page (`categoria/<id>.html`):** breadcrumb (Inicio › Tienda › Categoría), H1 = `titulo`,
intro = `descripcion`, chip links to every category, product grid, "¿No encuentras lo que buscas?" WhatsApp band.

**Product page (`producto/<id>.html`):** breadcrumb (Inicio › Categoría › Producto), image, name,
price, Disponible/Agotado, combo contents + savings, "Agregar al carrito", "Preguntar por WhatsApp"
(prefilled with name + page URL), trust checks, 4 related products (same category, then featured).
og:type product; og:image = the product photo only if .jpg/.png (else compartir.jpg).

**Cart drawer:** title "Tu carrito"; per line: name, −, qty, +, line subtotal, "Eliminar";
empty state "Tu carrito está vacío. ¡Explora la tienda!"; delivery select (Masaya: entrega gratis /
Otro departamento: envío por CargoTrans); Nombre (opcional); Ciudad (opcional);
"Total estimado: C$ …"; button "Enviar pedido por WhatsApp" (disabled when empty);
note "Los precios y la disponibilidad se confirman por WhatsApp. No se realiza ningún pago en este sitio."
Closes with ×, overlay click and Escape. Syncs across tabs (`storage` event). Cart is NOT cleared after sending.
"Complementa tu compra": up to 2 available products from `COMPLEMENTOS` categories not already in the cart.
Delivery notice under the select: Masaya → "Entrega gratis en Masaya."; otro + `CONFIG.envioGratisDesde`
set → "Te faltan C$ X para tener envío gratis a todo Nicaragua." / "¡Tu pedido tiene envío gratis a todo
Nicaragua!"; `envioGratisDesde: null` → "Envío por CargoTrans: el costo se confirma por WhatsApp."
The whole drawer scrolls as one column (sticky title bar).

**WhatsApp order message** (opened with `window.open(url, "_blank", "noopener")`):
```
¡Hola Studio 3! Quiero hacer este pedido:

1. Power Bank 10,000 mAh x2 — C$ 1,300
2. Cable USB-C 1 m x1 — C$ 150

Total estimado: C$ 1,450
Entrega: Masaya (entrega gratis)
Nombre: María López
Ciudad: Masaya
```
(Nombre/Ciudad lines only if filled.) Other department: "Entrega: Otro departamento (envío por CargoTrans)",
or "(envío gratis por CargoTrans)" when the free-shipping threshold is reached. Last line
"Vengo de: Instagram" only when a valid `?ref=` was seen in the last 30 days.

**¿Quieres emprender? (revendedores.html; all customer-facing text says "emprendedor", never "revendedor"):** benefits (precios por volumen, prioridad en inventario, fotos para tus redes,
misma garantía) → how it works (aplica → revisamos y te enviamos la lista de precios por WhatsApp →
primer pedido) → requirements (pedido mínimo inicial) → form `#form-revendedor`:
Nombre completo* · Nombre del negocio · Ciudad o departamento* · Canal de venta (Tienda física /
Redes sociales / Ambos) · Productos de interés (checkbox per category, name="interes") ·
Volumen mensual estimado (5–24 / 25–49 / 50 o más unidades). Submit → validate with
`reportValidity()` (required fields also use `pattern=".*\S.*"`) → WhatsApp message starting
"Hola Studio 3, quiero ser emprendedor." (+ "Vengo de: …" when known).
Wholesale prices are NEVER shown on the site.

**Ayuda:** Cómo comprar · Envíos · Garantía · Preguntas frecuentes · Privacidad:
"Este sitio no guarda tus datos en ningún servidor. Tu carrito se guarda solo en tu navegador, y la
información que escribes se envía únicamente en tu mensaje de WhatsApp a Studio 3." plus a sentence
disclosing the 30-day `?ref=` memory. Leave clearly marked TODO placeholders where the owners must supply real terms.

**404:** "Página no encontrada" + button to Tienda.

**Footer:** logo, "Masaya, Nicaragua", WhatsApp, Instagram/TikTok/Facebook (inline SVG icons),
category links, page links, help links, "© 2026 Studio 3".

**SEO:** unique `<title>`, meta description and `<link rel="canonical">` per page (404 is `noindex`),
Open Graph tags (`img/compartir.jpg`, 1200×630), favicon, robots.txt, sitemap.xml listing every page.
JSON-LD: `Store` on index; `BreadcrumbList` on category pages; `Product` (Offer in NIO,
InStock/OutOfStock) + `BreadcrumbList` on product pages. All absolute URLs use `$SITIO` in generar.ps1
(change it there when a custom domain exists; the 404 prefix follows it automatically).

## `_headers`

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin

/img/*
  Cache-Control: public, max-age=604800

/fuentes/*
  Cache-Control: public, max-age=31536000, immutable
```
Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` only after the custom domain works over HTTPS.

## Schedule (3 days left)

- **Mon, Sep 28:** accounts + Cloudflare test deploy; build the complete site with placeholder products.
- **Tue, Sep 29:** real products, photos and prices; reseller page; Ayuda text; headers/SEO; deploy.
- **Wed, Sep 30:** full testing, custom domain, content freeze, soft launch to 5–10 people.
- **Thu, Oct 1:** launch.

## Definition of done (check before saying a task is finished)

- Works on a 360px-wide phone with no sideways scrolling.
- Add / + / − / Eliminar update counter, subtotals and total correctly; cart survives refresh.
- Empty cart disables checkout; checkout message is correct, accents and ñ intact.
- `tienda.html?cat=parlantes` filters; `?cat=xyz` shows all.
- No Content-Security-Policy errors in the browser console on any page.
- `generar.ps1` runs clean; every sitemap URL returns 200; JSON-LD blocks parse as JSON.
- Product pages: add-to-cart works, "Preguntar por WhatsApp" link is correct, related products render.
- `?ref=ig` then an order shows "Vengo de: Instagram"; unknown `?ref=` values are ignored.
