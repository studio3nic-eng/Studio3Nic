// Único archivo que se edita para precios, disponibilidad y productos.
// TODO: reemplazar con productos reales (ids, nombres, precios y fotos en img/productos/).

const CATEGORIAS = [
  { id: "power-banks", nombre: "Power Banks" },
  { id: "parlantes", nombre: "Parlantes" },
  { id: "cargadores", nombre: "Cargadores" },
  { id: "audifonos", nombre: "Audífonos" },
  { id: "smartwatches", nombre: "Smartwatches" },
  { id: "cables", nombre: "Cables" }
];

const IMG_TEMPORAL = "img/productos/placeholder.svg";

// TODO: reemplazar con productos reales
const PRODUCTOS = [
  { id: "demo-pb-1", nombre: "Producto de prueba – Power Bank A", categoria: "power-banks",
    precio: 650, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: true },
  { id: "demo-pb-2", nombre: "Producto de prueba – Power Bank B", categoria: "power-banks",
    precio: 900, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: true },
  { id: "demo-pa-1", nombre: "Producto de prueba – Parlante A", categoria: "parlantes",
    precio: 800, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: true },
  { id: "demo-pa-2", nombre: "Producto de prueba – Parlante B", categoria: "parlantes",
    precio: 1200, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: false },
  { id: "demo-ca-1", nombre: "Producto de prueba – Cargador A", categoria: "cargadores",
    precio: 350, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: true },
  { id: "demo-ca-2", nombre: "Producto de prueba – Cargador B", categoria: "cargadores",
    precio: 500, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: false, disponible: true },
  { id: "demo-au-1", nombre: "Producto de prueba – Audífonos A", categoria: "audifonos",
    precio: 750, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: true },
  { id: "demo-au-2", nombre: "Producto de prueba – Audífonos B", categoria: "audifonos",
    precio: 1100, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: false, disponible: true },
  { id: "demo-sw-1", nombre: "Producto de prueba – Smartwatch A", categoria: "smartwatches",
    precio: 1450, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: true },
  { id: "demo-sw-2", nombre: "Producto de prueba – Smartwatch B", categoria: "smartwatches",
    precio: 1900, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: false, disponible: true },
  { id: "demo-cb-1", nombre: "Producto de prueba – Cable A", categoria: "cables",
    precio: 150, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: true, disponible: true },
  { id: "demo-cb-2", nombre: "Producto de prueba – Cable B", categoria: "cables",
    precio: 200, imagen: IMG_TEMPORAL,
    descripcion: "Texto de ejemplo. Aquí va la descripción real.", destacado: false, disponible: true }
];
