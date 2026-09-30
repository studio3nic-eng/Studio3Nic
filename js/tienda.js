// Tienda: chips de categoría, filtro por ?cat=, búsqueda y orden (con más de 20 productos) y cuadrícula de productos.
(function () {
  "use strict";

  const S = window.Studio3;
  const chips = document.getElementById("chips");
  const grilla = document.getElementById("productos");
  const conteo = document.getElementById("conteo");
  if (!chips || !grilla) return;

  // La búsqueda y el orden solo aparecen cuando el catálogo ya es largo.
  const MINIMO_BUSQUEDA = 20;

  let actual = "todos";
  let busqueda = "";
  let orden = "relevancia";

  // Minúsculas y sin tildes, para que "audifonos" encuentre "Audífonos".
  function normalizar(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function pintar() {
    let lista = actual === "todos"
      ? PRODUCTOS.slice()
      : PRODUCTOS.filter(function (p) { return p.categoria === actual; });

    if (busqueda) {
      lista = lista.filter(function (p) {
        return normalizar(p.nombre + " " + p.descripcion).indexOf(busqueda) !== -1;
      });
    }
    if (orden === "precio-asc") lista.sort(function (a, b) { return a.precio - b.precio; });
    if (orden === "precio-desc") lista.sort(function (a, b) { return b.precio - a.precio; });

    grilla.replaceChildren();
    lista.forEach(function (p) { grilla.appendChild(S.tarjetaProducto(p)); });

    if (lista.length === 0) {
      conteo.textContent = busqueda
        ? "No encontramos productos con esa búsqueda."
        : "Pronto tendremos productos en esta categoría.";
    } else {
      conteo.textContent = lista.length + (lista.length === 1 ? " producto" : " productos");
    }

    chips.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.cat === actual));
    });
  }

  function elegir(id) {
    actual = id;
    const url = new URL(window.location.href);
    if (id === "todos") url.searchParams.delete("cat");
    else url.searchParams.set("cat", id);
    history.replaceState(null, "", url);
    pintar();
  }

  function crearChip(id, texto) {
    const b = S.el("button", "chip", texto);
    b.type = "button";
    b.dataset.cat = id;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { elegir(id); });
    chips.appendChild(b);
  }

  function crearHerramientas() {
    const cont = S.el("div", "herramientas");

    const campoBuscar = S.el("div", "campo");
    const etiquetaBuscar = S.el("label", "sr-only", "Buscar producto");
    etiquetaBuscar.htmlFor = "buscar";
    const entrada = S.el("input");
    entrada.type = "search";
    entrada.id = "buscar";
    entrada.maxLength = 60;
    entrada.placeholder = "Buscar producto";
    entrada.autocomplete = "off";
    entrada.addEventListener("input", function () {
      busqueda = normalizar(S.limpiar(entrada.value));
      pintar();
    });
    campoBuscar.appendChild(etiquetaBuscar);
    campoBuscar.appendChild(entrada);

    const campoOrden = S.el("div", "campo");
    const etiquetaOrden = S.el("label", "sr-only", "Ordenar por");
    etiquetaOrden.htmlFor = "orden";
    const selector = S.el("select");
    selector.id = "orden";
    [
      ["relevancia", "Ordenar por"],
      ["precio-asc", "Precio: de menor a mayor"],
      ["precio-desc", "Precio: de mayor a menor"]
    ].forEach(function (o) {
      const opcion = S.el("option", "", o[1]);
      opcion.value = o[0];
      selector.appendChild(opcion);
    });
    selector.addEventListener("change", function () {
      orden = selector.value;
      pintar();
    });
    campoOrden.appendChild(etiquetaOrden);
    campoOrden.appendChild(selector);

    cont.appendChild(campoBuscar);
    cont.appendChild(campoOrden);
    chips.parentNode.insertBefore(cont, chips);
  }

  if (PRODUCTOS.length > MINIMO_BUSQUEDA) crearHerramientas();

  crearChip("todos", "Todos");
  CATEGORIAS.forEach(function (c) { crearChip(c.id, c.nombre); });

  // Solo se acepta un ?cat= que coincida con una categoría real.
  const pedida = new URLSearchParams(window.location.search).get("cat");
  actual = pedida !== null && S.categoriaValida(pedida) ? pedida : "todos";
  pintar();
  S.centrarChip(chips.querySelector("button[aria-pressed='true']"));
})();
