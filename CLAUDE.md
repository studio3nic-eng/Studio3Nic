# Studio 3 — Website

Online catalog for Studio 3, a tech-accessories store in Masaya, Nicaragua.
Customers browse by category, add items to a cart, and send the order to WhatsApp.
There are NO online payments. Launch date: Thursday, October 1, 2026.

## Hard rules

- All customer-facing text in **Spanish** (`<html lang="es">`). Talk to me in English.
- **Plain HTML, CSS and vanilla JavaScript.** No frameworks, no npm, no build step.
  The folder is deployed as-is to Cloudflare Pages (build command empty, output dir `/`).
- **Mobile first.** Most customers arrive from Instagram/TikTok/WhatsApp on a phone.
- **Security (must hold everywhere):**
  - No inline `<script>` code, no `onclick=` or other inline handlers, no `style="…"` attributes.
    All JS in `/js`, loaded with `<script src="…" defer>`; all CSS in `/css`.
  - Insert product and customer text with `textContent` / `createElement`, never `innerHTML`.
  - The cart in localStorage stores only `{id, cant}`. Names and prices always come from
    `js/productos.js`. Drop unknown ids, cap quantity at `CONFIG.cantidadMaxima` (20).
  - `?cat=` from the URL is accepted only if it matches a `CATEGORIAS` id.
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
index.html            Inicio
tienda.html           Tienda (catalog + category filter)
revendedores.html     Revendedores (reseller application → WhatsApp)
ayuda.html            Ayuda (cómo comprar, envíos, garantía, preguntas frecuentes, privacidad)
404.html
_headers              security headers (see below)
robots.txt, sitemap.xml
css/estilos.css
js/config.js          CONFIG: whatsapp, moneda, cantidadMaxima, redes
js/productos.js       CATEGORIAS + PRODUCTOS (the only file edited for prices/stock)
js/app.js             shared: formatoPrecio, limpiar, Carrito, tarjetaProducto, cart drawer, menu, enviarPedido
js/tienda.js          category chips + ?cat= (tienda.html only)
js/revendedores.js    reseller form → WhatsApp (revendedores.html only)
img/marca/            logo-original.png, portada.png (reference designs)
img/logo/             logo-plano.svg, logo-3d.webp, icono-3.png (from designer; placeholders until then)
img/productos/        one square .webp per product, file name = product id
fuentes/              poppins-400/500/700/800.woff2
```

Every page has the same head, header, cart drawer, footer, floating WhatsApp button and base scripts
(config.js → productos.js → app.js). If header/footer change, update all five HTML files.

## Data format (`js/productos.js`)

Categories (id → name): power-banks → Power Banks · parlantes → Parlantes · cargadores → Cargadores ·
audifonos → Audífonos · smartwatches → Smartwatches · cables → Cables

```js
{ id: "pb-10000-negro", nombre: "Power Bank 10,000 mAh", categoria: "power-banks",
  precio: 650, imagen: "img/productos/pb-10000-negro.webp",
  descripcion: "Carga rápida 20W, salidas USB-C y USB-A.", destacado: true, disponible: true }
```
Until real products arrive, use ~12 clearly fake placeholder products (2 per category) with a
neutral placeholder image, and mark the file with a `// TODO: reemplazar con productos reales` comment.

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
category tiles (link to `tienda.html?cat=…`) → 8 featured products (`destacado: true`, `#destacados`) →
"Cómo comprar": 1. Elige tus productos y agrégalos al carrito. 2. Toca "Enviar pedido por WhatsApp".
3. Te confirmamos disponibilidad, total y entrega por chat. → trust points (Ventas al por mayor y al
detalle · Envíos a todo Nicaragua · Garantía en todos los productos · Entrega gratis en Masaya) →
reseller teaser "¿Quieres emprender? Precios especiales por volumen." + "Quiero ser emprendedor" →
social block "Síguenos: @studio3.ni".

**Tienda:** chips `Todos` + 6 categories (`data-cat`, `aria-pressed`), grid `#productos`.
Card: image, name, description, price, "Agregar al carrito" → "Agregado" for 1.5 s.
`disponible: false` → disabled "Agotado".

**Cart drawer:** title "Tu carrito"; per line: name, −, qty, +, line subtotal, "Eliminar";
empty state "Tu carrito está vacío. ¡Explora la tienda!"; delivery select (Masaya: entrega gratis /
Otro departamento: envío por CargoTrans); Nombre (opcional); Ciudad (opcional);
"Total estimado: C$ …"; button "Enviar pedido por WhatsApp" (disabled when empty);
note "Los precios y la disponibilidad se confirman por WhatsApp. No se realiza ningún pago en este sitio."
Closes with ×, overlay click and Escape. Syncs across tabs (`storage` event). Cart is NOT cleared after sending.

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
(Nombre/Ciudad lines only if filled.)

**¿Quieres emprender? (revendedores.html; all customer-facing text says "emprendedor", never "revendedor"):** benefits (precios por volumen, prioridad en inventario, fotos para tus redes,
misma garantía) → how it works (aplica → revisamos y te enviamos la lista de precios por WhatsApp →
primer pedido) → requirements (pedido mínimo inicial) → form `#form-revendedor`:
Nombre completo* · Nombre del negocio · Ciudad o departamento* · Canal de venta (Tienda física /
Redes sociales / Ambos) · Productos de interés (checkbox per category, name="interes") ·
Volumen mensual estimado (10–24 / 25–49 / 50 o más unidades). Submit → validate with
`reportValidity()` → WhatsApp message starting "Hola Studio 3, quiero ser emprendedor."
Wholesale prices are NEVER shown on the site.

**Ayuda:** Cómo comprar · Envíos · Garantía · Preguntas frecuentes · Privacidad:
"Este sitio no guarda tus datos en ningún servidor. Tu carrito se guarda solo en tu navegador, y la
información que escribes se envía únicamente en tu mensaje de WhatsApp a Studio 3."
Leave clearly marked TODO placeholders where the owners must supply real terms.

**404:** "Página no encontrada" + button to Tienda.

**Footer:** logo, "Masaya, Nicaragua", WhatsApp, Instagram/TikTok/Facebook (inline SVG icons),
page links, "© 2026 Studio 3".

**SEO:** unique `<title>` and meta description per page, Open Graph tags (`img/compartir.jpg`,
1200×630), favicon, robots.txt, sitemap.xml (domain placeholder `https://TU-DOMINIO`).

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
