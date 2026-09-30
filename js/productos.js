// Único archivo que se edita para precios, disponibilidad y productos.
// TODO: reemplazar con productos reales (ids, nombres, precios y fotos en img/productos/).
//
// FORMATO (importante):
//   - Usa comillas dobles en todo: "nombre": "Cable USB-C 1 m"
//   - No pongas coma después del último elemento de cada lista.
//   - Los comentarios van en su propia línea y empiezan con //
//   - Después de cambiar este archivo, haz doble clic en generar.cmd (preview.cmd también
//     lo hace) para actualizar las páginas de cada producto y categoría. Luego súbelo a GitHub.
//
// NOMBRES: escríbelos como los buscaría un cliente en Google:
//   qué es + capacidad o modelo + dato clave.
//   Ej.: "Power Bank 20,000 mAh carga rápida 22.5W", "Parlante Bluetooth resistente al agua",
//        "Cable USB-C a USB-C 1 m". Marcas (Apple, Samsung, JBL…) solo si el producto es original.
//
// id: minúsculas, números y guiones (ej. "pb-20000-negro"). Es también el nombre de la foto
//   (img/productos/<id>.webp) y de su página (producto/<id>.html). No lo cambies después de
//   publicar: rompería los enlaces que ya compartiste.
//
// Campos opcionales:
//   "incluye": ["id-1", "id-2"]  -> para combos: muestra qué trae y cuánto se ahorra.
//   "etiqueta": "Nuevo"           -> cartelito sobre la foto (máx. 20 letras; ej. "Nuevo", "Más vendido").
//   "imagenes": ["img/productos/<id>-2.webp"]  -> fotos extra: la página del producto muestra miniaturas.
//   "caracteristicas": ["Carga rápida 20W", "Incluye cable"]  -> lista de características en la página del producto.

const CATEGORIAS = [
  { "id": "power-banks", "nombre": "Power Banks",
    "titulo": "Power banks en Masaya con envío a todo Nicaragua",
    "descripcion": "Baterías portátiles para cargar tu celular, audífonos o smartwatch donde estés. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "parlantes", "nombre": "Parlantes",
    "titulo": "Parlantes Bluetooth en Masaya con envío a todo Nicaragua",
    "descripcion": "Parlantes Bluetooth portátiles para la casa, la playa o tus reuniones. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "cargadores", "nombre": "Cargadores",
    "titulo": "Cargadores para celular en Masaya con envío a todo Nicaragua",
    "descripcion": "Cargadores de pared y para carro, con carga rápida para tu celular. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "audifonos", "nombre": "Audífonos",
    "titulo": "Audífonos inalámbricos en Masaya con envío a todo Nicaragua",
    "descripcion": "Audífonos inalámbricos y de diadema para música, llamadas y ejercicio. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "smartwatches", "nombre": "Smartwatches",
    "titulo": "Smartwatches en Masaya con envío a todo Nicaragua",
    "descripcion": "Relojes inteligentes para ver notificaciones, medir tu actividad y más. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "cables", "nombre": "Cables",
    "titulo": "Cables USB-C y USB en Masaya con envío a todo Nicaragua",
    "descripcion": "Cables de carga y datos en varios largos y tipos de conector. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "combos", "nombre": "Combos",
    "titulo": "Combos y promociones de accesorios en Masaya",
    "descripcion": "Kits con productos que se usan juntos, a mejor precio que comprándolos por separado. Entrega gratis en Masaya y envíos a todo Nicaragua." }
];

// "Complementa tu compra": qué categorías se sugieren en el carrito según lo que el cliente ya agregó.
// TODO: ajustar las sugerencias reales (placeholder).
const COMPLEMENTOS = {
  "power-banks": ["cables"],
  "parlantes": ["cables"],
  "cargadores": ["cables"],
  "audifonos": ["power-banks"],
  "smartwatches": ["cargadores"],
  "cables": ["cargadores"],
  "combos": []
};

// TODO: reemplazar con productos reales
const PRODUCTOS = [
  { "id": "demo-pb-1", "nombre": "[PRUEBA] Power Bank 10,000 mAh carga rápida 20W", "categoria": "power-banks",
    "precio": 650, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-pb-2", "nombre": "[PRUEBA] Power Bank 20,000 mAh con pantalla digital", "categoria": "power-banks",
    "precio": 900, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-pa-1", "nombre": "[PRUEBA] Parlante Bluetooth portátil resistente al agua", "categoria": "parlantes",
    "precio": 800, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-pa-2", "nombre": "[PRUEBA] Parlante Bluetooth con luces LED", "categoria": "parlantes",
    "precio": 1200, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": false },
  { "id": "demo-ca-1", "nombre": "[PRUEBA] Cargador de pared USB-C 20W", "categoria": "cargadores",
    "precio": 350, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-ca-2", "nombre": "[PRUEBA] Cargador para carro de doble puerto", "categoria": "cargadores",
    "precio": 500, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": false, "disponible": true },
  { "id": "demo-au-1", "nombre": "[PRUEBA] Audífonos inalámbricos con estuche de carga", "categoria": "audifonos",
    "precio": 750, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-au-2", "nombre": "[PRUEBA] Audífonos de diadema Bluetooth", "categoria": "audifonos",
    "precio": 1100, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": false, "disponible": true },
  { "id": "demo-sw-1", "nombre": "[PRUEBA] Smartwatch con monitor de ritmo cardíaco", "categoria": "smartwatches",
    "precio": 1450, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-sw-2", "nombre": "[PRUEBA] Smartwatch deportivo resistente al agua", "categoria": "smartwatches",
    "precio": 1900, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": false, "disponible": true },
  { "id": "demo-cb-1", "nombre": "[PRUEBA] Cable USB-C a USB-C 1 m", "categoria": "cables",
    "precio": 150, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-cb-2", "nombre": "[PRUEBA] Cable USB-A a USB-C 2 m", "categoria": "cables",
    "precio": 200, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": false, "disponible": true },
  { "id": "combo-prueba-viaje", "nombre": "[PRUEBA] Combo viaje: power bank + cable", "categoria": "combos",
    "precio": 720, "imagen": "img/productos/placeholder.svg", "incluye": ["demo-pb-1", "demo-cb-1"],
    "descripcion": "Combo de prueba. Define aquí el combo real y su precio.", "destacado": false, "disponible": true },
  { "id": "combo-prueba-audio", "nombre": "[PRUEBA] Combo audio: audífonos + power bank", "categoria": "combos",
    "precio": 1300, "imagen": "img/productos/placeholder.svg", "incluye": ["demo-au-1", "demo-pb-1"],
    "descripcion": "Combo de prueba. Define aquí el combo real y su precio.", "destacado": false, "disponible": true }
];
