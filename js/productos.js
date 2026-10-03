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
//   "colores": ["blanco", "negro"] -> circulitos de "Colores Disponibles". Permitidos: blanco, negro, gris, plateado,
//                                     dorado, azul, rojo, verde, rosado, morado, amarillo, naranja, camuflaje, durazno, beige, menta, lila.

const CATEGORIAS = [
  { "id": "power-banks", "nombre": "Power Banks",
    "titulo": "Power banks en Masaya con envío a todo Nicaragua",
    "descripcion": "Baterías portátiles para cargar tu celular, audífonos o smartwatch donde estés. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "parlantes", "nombre": "Parlantes",
    "titulo": "Parlantes Bluetooth en Masaya con envío a todo Nicaragua",
    "descripcion": "Parlantes Bluetooth portátiles para la casa, la playa o tus reuniones. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "audifonos", "nombre": "Audífonos",
    "titulo": "Audífonos inalámbricos en Masaya con envío a todo Nicaragua",
    "descripcion": "Audífonos inalámbricos y de diadema para música, llamadas y ejercicio. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "smartwatches", "nombre": "Smartwatches",
    "titulo": "Smartwatches en Masaya con envío a todo Nicaragua",
    "descripcion": "Relojes inteligentes para ver notificaciones, medir tu actividad y más. Entrega gratis en Masaya y envíos a todo Nicaragua." },
  { "id": "combos", "nombre": "Combos",
    "titulo": "Combos y promociones de accesorios en Masaya",
    "descripcion": "Kits con productos que se usan juntos, a mejor precio que comprándolos por separado. Entrega gratis en Masaya y envíos a todo Nicaragua." }
];

// "Complementa tu compra": qué categorías se sugieren en el carrito según lo que el cliente ya agregó.
// TODO: ajustar las sugerencias reales (placeholder).
const COMPLEMENTOS = {
  "power-banks": [],
  "parlantes": [],
  "audifonos": ["power-banks"],
  "smartwatches": [],
  "combos": []
};

// TODO: reemplazar con productos reales
const PRODUCTOS = [
  { "id": "galaxy-buds-4-pro", "nombre": "Samsung Galaxy Buds 4 Pro - Calidad Premium", "categoria": "audifonos",
    "precio": 900, "imagen": "img/productos/galaxy-buds-4-pro.jpg",
    "imagenes": ["img/productos/galaxy-buds-4-pro-2.jpg", "img/productos/galaxy-buds-4-pro-3.jpg"],
    "colores": ["blanco", "negro"],
    "descripcion": "Audífonos inalámbricos Bluetooth con estuche de carga transparente.", "destacado": true, "disponible": true },
  { "id": "galaxy-buds-2-pro", "nombre": "Samsung Galaxy Buds 2 Pro - Calidad Premium", "categoria": "audifonos",
    "precio": 750, "imagen": "img/productos/galaxy-buds-2-pro.jpg",
    "imagenes": ["img/productos/galaxy-buds-2-pro-2.jpg", "img/productos/galaxy-buds-2-pro-3.jpg"],
    "colores": ["blanco", "negro"],
    "descripcion": "Audífonos inalámbricos Bluetooth con estuche de carga, cable y puntas de repuesto.", "destacado": true, "disponible": true },
  { "id": "apple-watch-series-11", "nombre": "Apple Watch Series 11 - Calidad Premium", "categoria": "smartwatches",
    "precio": 1300, "imagen": "img/productos/apple-watch-series-11.jpg",
    "imagenes": ["img/productos/apple-watch-series-11-2.jpg", "img/productos/apple-watch-series-11-3.jpg"],
    "colores": ["blanco", "negro"],
    "descripcion": "Reloj inteligente con pantalla a color y correa de silicona. Incluye cable de carga.", "destacado": true, "disponible": true },
  { "id": "fajas-apple-watch", "nombre": "Fajas para Apple Watch", "categoria": "smartwatches",
    "precio": 120, "imagen": "img/productos/fajas-apple-watch.jpg",
    "imagenes": ["img/productos/fajas-apple-watch-2.jpg", "img/productos/fajas-apple-watch-3.jpg"],
    "colores": ["menta", "lila", "negro", "durazno", "blanco"],
    "descripcion": "Fajas de silicona compatibles con relojes de 42 a 46 mm.", "destacado": true, "disponible": true },
  { "id": "airpods-pro-max", "nombre": "AirPods Pro Max - Calidad Premium", "categoria": "audifonos",
    "precio": 1300, "imagen": "img/productos/airpods-pro-max.jpg",
    "imagenes": ["img/productos/airpods-pro-max-2.jpg", "img/productos/airpods-pro-max-3.jpg"],
    "colores": ["blanco", "negro", "durazno", "beige", "verde", "rojo"],
    "descripcion": "Audífonos inalámbricos de diadema con almohadillas acolchadas y estuche de transporte.", "destacado": true, "disponible": true },
  { "id": "airpods-pro-2", "nombre": "AirPods Pro 2 - Calidad Premium", "categoria": "audifonos",
    "precio": 750, "imagen": "img/productos/airpods-pro-2.jpg",
    "imagenes": ["img/productos/airpods-pro-2-2.jpg", "img/productos/airpods-pro-2-3.jpg"],
    "colores": ["blanco"],
    "descripcion": "Audífonos inalámbricos con estuche de carga, cable de carga y puntas de repuesto.", "destacado": true, "disponible": true },
  { "id": "airpods-pro-3", "nombre": "AirPods Pro 3 - Calidad Premium", "categoria": "audifonos",
    "precio": 900, "imagen": "img/productos/airpods-pro-3.jpg",
    "imagenes": ["img/productos/airpods-pro-3-2.jpg", "img/productos/airpods-pro-3-3.jpg", "img/productos/airpods-pro-3-4.jpg"],
    "colores": ["blanco"],
    "descripcion": "Audífonos inalámbricos con estuche de carga, cable de carga y puntas de repuesto.", "destacado": true, "disponible": true },
  { "id": "jbl-charge-6", "nombre": "JBL Charge 6 - Calidad Premium", "categoria": "parlantes",
    "precio": 1500, "imagen": "img/productos/jbl-charge-6.jpg",
    "imagenes": ["img/productos/jbl-charge-6-2.jpg", "img/productos/jbl-charge-6-3.jpg"],
    "colores": ["rojo", "negro", "azul", "camuflaje"],
    "descripcion": "Parlante Bluetooth portátil con forro de tela y correas laterales.", "destacado": true, "disponible": false },
  { "id": "jbl-extreme-mini", "nombre": "JBL Extreme Mini - Calidad Premium", "categoria": "parlantes",
    "precio": 1000, "imagen": "img/productos/jbl-extreme-mini.jpg",
    "imagenes": ["img/productos/jbl-extreme-mini-2.jpg", "img/productos/jbl-extreme-mini-3.jpg"],
    "colores": ["negro", "rojo", "gris", "azul"],
    "descripcion": "Parlante Bluetooth portátil con correa de hombro y cable de carga.", "destacado": false, "disponible": true },
  { "id": "jbl-go-5", "nombre": "JBL Go 5 - Calidad Premium", "categoria": "parlantes",
    "precio": 850, "imagen": "img/productos/jbl-go-5.jpg",
    "imagenes": ["img/productos/jbl-go-5-2.jpg", "img/productos/jbl-go-5-3.jpg"],
    "colores": ["rojo", "azul", "negro"],
    "descripcion": "Parlante Bluetooth portátil con correa de transporte. Incluye cable de carga.", "destacado": false, "disponible": true },
  { "id": "power-bank-ldnio-5000", "nombre": "Power Bank LDNIO 5,000 mAh", "categoria": "power-banks",
    "precio": 1000, "imagen": "img/productos/power-bank-ldnio-5000.jpg",
    "imagenes": ["img/productos/power-bank-ldnio-5000-2.jpg", "img/productos/power-bank-ldnio-5000-3.jpg"],
    "descripcion": "Power bank magnético compatible con MagSafe, con carga inalámbrica de 15 W y puerto USB-C. Incluye cable USB-C.", "destacado": true, "disponible": true },
  { "id": "power-bank-ldnio-10000", "nombre": "Power Bank LDNIO 10,000 mAh", "categoria": "power-banks",
    "precio": 1200, "imagen": "img/productos/power-bank-ldnio-10000.jpg",
    "imagenes": ["img/productos/power-bank-ldnio-10000-2.jpg"],
    "descripcion": "Power bank con pantalla LED y dos cables integrados (USB-C y Lightning). Carga rápida de 20 W.", "destacado": false, "disponible": true },
  { "id": "demo-pa-1", "nombre": "[PRUEBA] Parlante Bluetooth portátil resistente al agua", "categoria": "parlantes",
    "precio": 800, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": true },
  { "id": "demo-pa-2", "nombre": "[PRUEBA] Parlante Bluetooth con luces LED", "categoria": "parlantes",
    "precio": 1200, "imagen": "img/productos/placeholder.svg",
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": true, "disponible": false },
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
    "descripcion": "Descripción de prueba. Escribe aquí las características reales.", "destacado": false, "disponible": true }
];
