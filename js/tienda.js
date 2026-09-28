// Tienda: chips de categoría, filtro por ?cat= y cuadrícula de productos.
(function () {
  "use strict";

  const S = window.Studio3;
  const chips = document.getElementById("chips");
  const grilla = document.getElementById("productos");
  const conteo = document.getElementById("conteo");
  if (!chips || !grilla) return;

  let actual = "todos";

  function pintar() {
    const lista = actual === "todos"
      ? PRODUCTOS
      : PRODUCTOS.filter(function (p) { return p.categoria === actual; });

    grilla.replaceChildren();
    lista.forEach(function (p) { grilla.appendChild(S.tarjetaProducto(p)); });

    conteo.textContent = lista.length === 0
      ? "Pronto tendremos productos en esta categoría."
      : lista.length + (lista.length === 1 ? " producto" : " productos");

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

  crearChip("todos", "Todos");
  CATEGORIAS.forEach(function (c) { crearChip(c.id, c.nombre); });

  // Solo se acepta un ?cat= que coincida con una categoría real.
  const pedida = new URLSearchParams(window.location.search).get("cat");
  actual = pedida !== null && S.categoriaValida(pedida) ? pedida : "todos";
  pintar();
})();
