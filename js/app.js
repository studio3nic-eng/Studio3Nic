// Código compartido por todas las páginas: formato, carrito, tarjetas, cajón del carrito, menú y pedido.
(function () {
  "use strict";

  const CLAVE_CARRITO = "studio3-carrito";
  const SVG_NS = "http://www.w3.org/2000/svg";

  // ---------- Utilidades ----------

  function formatoPrecio(n) {
    return CONFIG.moneda + " " + Number(n).toLocaleString("en-US");
  }

  // Quita caracteres de control, recorta espacios y limita a 60 caracteres.
  function limpiar(texto) {
    return String(texto == null ? "" : texto)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim()
      .slice(0, 60)
      .trim();
  }

  function el(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function productoPorId(id) {
    return PRODUCTOS.find(function (p) { return p.id === id; }) || null;
  }

  function categoriaValida(id) {
    return CATEGORIAS.some(function (c) { return c.id === id; });
  }

  function abrirWhatsApp(texto) {
    const url = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener");
  }

  // ---------- Carrito (localStorage: solo {id, cant}) ----------

  const Carrito = {
    _items: [],

    cargar: function () {
      let crudo = [];
      try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
        if (Array.isArray(guardado)) crudo = guardado;
      } catch (e) {
        crudo = [];
      }
      const limpio = [];
      crudo.forEach(function (it) {
        if (!it || typeof it.id !== "string" || !productoPorId(it.id)) return;
        const cant = Math.floor(Number(it.cant));
        if (!isFinite(cant) || cant < 1) return;
        const existente = limpio.find(function (x) { return x.id === it.id; });
        if (existente) {
          existente.cant = Math.min(existente.cant + cant, CONFIG.cantidadMaxima);
        } else {
          limpio.push({ id: it.id, cant: Math.min(cant, CONFIG.cantidadMaxima) });
        }
      });
      this._items = limpio;
    },

    guardar: function () {
      try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(this._items));
      } catch (e) { /* almacenamiento bloqueado: el carrito funciona solo en esta pestaña */ }
    },

    items: function () { return this._items.slice(); },

    agregar: function (id) {
      const p = productoPorId(id);
      if (!p || !p.disponible) return;
      const it = this._items.find(function (x) { return x.id === id; });
      if (it) it.cant = Math.min(it.cant + 1, CONFIG.cantidadMaxima);
      else this._items.push({ id: id, cant: 1 });
      this.guardar();
    },

    cambiar: function (id, delta) {
      const it = this._items.find(function (x) { return x.id === id; });
      if (!it) return;
      it.cant = Math.min(it.cant + delta, CONFIG.cantidadMaxima);
      if (it.cant < 1) return this.quitar(id);
      this.guardar();
    },

    quitar: function (id) {
      this._items = this._items.filter(function (x) { return x.id !== id; });
      this.guardar();
    },

    cantidadTotal: function () {
      return this._items.reduce(function (s, it) { return s + it.cant; }, 0);
    },

    total: function () {
      return this._items.reduce(function (s, it) {
        return s + productoPorId(it.id).precio * it.cant;
      }, 0);
    }
  };

  // ---------- Tarjeta de producto ----------

  function tarjetaProducto(p) {
    const tarjeta = el("article", "tarjeta-producto");

    const img = el("img", "tarjeta-img");
    img.src = p.imagen;
    img.alt = p.nombre;
    img.width = 400;
    img.height = 400;
    img.loading = "lazy";
    img.decoding = "async";
    tarjeta.appendChild(img);

    const cuerpo = el("div", "tarjeta-cuerpo");
    cuerpo.appendChild(el("h3", "tarjeta-nombre", p.nombre));
    cuerpo.appendChild(el("p", "tarjeta-desc", p.descripcion));
    cuerpo.appendChild(el("p", "tarjeta-precio", formatoPrecio(p.precio)));

    const boton = el("button", "btn btn-primario btn-bloque");
    boton.type = "button";
    if (p.disponible) {
      boton.textContent = "Agregar al carrito";
      let temporizador = null;
      boton.addEventListener("click", function () {
        Carrito.agregar(p.id);
        notificarCambio();
        boton.textContent = "Agregado";
        clearTimeout(temporizador);
        temporizador = setTimeout(function () {
          boton.textContent = "Agregar al carrito";
        }, 1500);
      });
    } else {
      boton.textContent = "Agotado";
      boton.disabled = true;
    }
    cuerpo.appendChild(boton);
    tarjeta.appendChild(cuerpo);
    return tarjeta;
  }

  // ---------- Cajón del carrito ----------

  const ui = {};
  let ultimoFoco = null;

  function notificarCambio() {
    renderContador();
    renderCarrito();
  }

  function renderContador() {
    if (!ui.contador) return;
    const n = Carrito.cantidadTotal();
    ui.contador.textContent = String(n);
    ui.contador.hidden = n === 0;
    ui.btnCarrito.setAttribute("aria-label",
      n === 0 ? "Abrir carrito" : "Abrir carrito (" + n + (n === 1 ? " producto)" : " productos)"));
  }

  function botonLinea(clase, texto, etiqueta, accion, id) {
    const b = el("button", clase, texto);
    b.type = "button";
    b.setAttribute("aria-label", etiqueta);
    b.dataset.accion = accion;
    b.dataset.id = id;
    return b;
  }

  function renderCarrito(enfocar) {
    if (!ui.lineas) return;
    const items = Carrito.items();
    ui.lineas.replaceChildren();
    ui.vacio.hidden = items.length > 0;

    items.forEach(function (it) {
      const p = productoPorId(it.id);
      const li = el("li", "linea");
      li.appendChild(el("p", "linea-nombre", p.nombre));

      const controles = el("div", "linea-controles");
      controles.appendChild(botonLinea("cant-btn", "−", "Quitar una unidad de " + p.nombre, "menos", p.id));
      controles.appendChild(el("span", "cant-valor", String(it.cant)));
      controles.appendChild(botonLinea("cant-btn", "+", "Agregar una unidad de " + p.nombre, "mas", p.id));
      controles.appendChild(el("span", "linea-subtotal", formatoPrecio(p.precio * it.cant)));
      li.appendChild(controles);

      li.appendChild(botonLinea("linea-eliminar", "Eliminar", "Eliminar " + p.nombre + " del carrito", "eliminar", p.id));
      ui.lineas.appendChild(li);
    });

    ui.total.textContent = formatoPrecio(Carrito.total());
    ui.enviar.disabled = items.length === 0;

    if (enfocar) {
      const objetivo = Array.prototype.find.call(
        ui.lineas.querySelectorAll("button"),
        function (b) { return b.dataset.id === enfocar.id && b.dataset.accion === enfocar.accion; }
      );
      if (objetivo) objetivo.focus();
      else ui.cerrar.focus();
    }
  }

  function abrirCarrito() {
    ultimoFoco = document.activeElement;
    ui.overlay.hidden = false;
    ui.drawer.classList.add("abierto");
    ui.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
    ui.cerrar.focus();
  }

  function cerrarCarrito() {
    if (!ui.drawer.classList.contains("abierto")) return;
    ui.overlay.hidden = true;
    ui.drawer.classList.remove("abierto");
    ui.drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
    if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
  }

  function carritoAbierto() {
    return ui.drawer.classList.contains("abierto");
  }

  function enviarPedido() {
    const items = Carrito.items();
    if (items.length === 0) return;

    const lineas = items.map(function (it, i) {
      const p = productoPorId(it.id);
      return (i + 1) + ". " + p.nombre + " x" + it.cant + " — " + formatoPrecio(p.precio * it.cant);
    });

    const entrega = ui.entrega.value === "otro"
      ? "Otro departamento (envío por CargoTrans)"
      : "Masaya (entrega gratis)";
    const nombre = limpiar(ui.nombre.value);
    const ciudad = limpiar(ui.ciudad.value);

    let mensaje = "¡Hola Studio 3! Quiero hacer este pedido:\n\n" + lineas.join("\n") +
      "\n\nTotal estimado: " + formatoPrecio(Carrito.total()) +
      "\nEntrega: " + entrega;
    if (nombre) mensaje += "\nNombre: " + nombre;
    if (ciudad) mensaje += "\nCiudad: " + ciudad;

    abrirWhatsApp(mensaje);
  }

  function iniciarCarrito() {
    ui.btnCarrito = document.getElementById("btn-carrito");
    ui.contador = document.getElementById("contador");
    ui.overlay = document.getElementById("overlay");
    ui.drawer = document.getElementById("carrito");
    ui.cerrar = document.getElementById("cerrar-carrito");
    ui.vacio = document.getElementById("carrito-vacio");
    ui.lineas = document.getElementById("carrito-lineas");
    ui.total = document.getElementById("carrito-total");
    ui.entrega = document.getElementById("carrito-entrega");
    ui.nombre = document.getElementById("carrito-nombre");
    ui.ciudad = document.getElementById("carrito-ciudad");
    ui.enviar = document.getElementById("carrito-enviar");
    if (!ui.drawer || !ui.btnCarrito) return;

    Carrito.cargar();
    notificarCambio();

    ui.btnCarrito.addEventListener("click", abrirCarrito);
    ui.cerrar.addEventListener("click", cerrarCarrito);
    ui.overlay.addEventListener("click", cerrarCarrito);
    ui.enviar.addEventListener("click", enviarPedido);

    ui.lineas.addEventListener("click", function (e) {
      const b = e.target.closest("button[data-accion]");
      if (!b) return;
      const id = b.dataset.id;
      if (b.dataset.accion === "mas") Carrito.cambiar(id, 1);
      else if (b.dataset.accion === "menos") Carrito.cambiar(id, -1);
      else Carrito.quitar(id);
      renderContador();
      renderCarrito({ id: id, accion: b.dataset.accion });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (carritoAbierto()) cerrarCarrito();
        cerrarMenu();
      }
      // Mantiene el foco dentro del cajón mientras está abierto.
      if (e.key === "Tab" && carritoAbierto()) {
        const focos = ui.drawer.querySelectorAll("button:not([disabled]), input, select");
        if (focos.length === 0) return;
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    });

    // Sincroniza el carrito entre pestañas.
    window.addEventListener("storage", function (e) {
      if (e.key !== CLAVE_CARRITO && e.key !== null) return;
      Carrito.cargar();
      notificarCambio();
    });
  }

  // ---------- Menú móvil ----------

  let btnMenu = null;
  let navPrincipal = null;

  function cerrarMenu() {
    if (!btnMenu) return;
    navPrincipal.classList.remove("abierto");
    btnMenu.setAttribute("aria-expanded", "false");
  }

  function iniciarMenu() {
    btnMenu = document.getElementById("btn-menu");
    navPrincipal = document.getElementById("nav-principal");
    if (!btnMenu || !navPrincipal) return;
    btnMenu.addEventListener("click", function () {
      const abierto = navPrincipal.classList.toggle("abierto");
      btnMenu.setAttribute("aria-expanded", String(abierto));
    });
  }

  // ---------- Enlaces desde CONFIG ----------

  function iniciarEnlaces() {
    document.querySelectorAll("a[data-wa]").forEach(function (a) {
      a.href = "https://wa.me/" + CONFIG.whatsapp;
    });
    document.querySelectorAll("a[data-red]").forEach(function (a) {
      const url = CONFIG.redes[a.dataset.red];
      if (url) a.href = url;
    });
  }

  // ---------- Inicio: categorías y destacados ----------

  const ICONOS = {
    "power-banks": "M9 2h6v2h2a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1h2zM12 8l-2.5 4H14l-2.5 4",
    "parlantes": "M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM12 6.5h.01M12 10a4.5 4.5 0 100 9 4.5 4.5 0 000-9z",
    "cargadores": "M13 2L4 14h7l-1 8 9-12h-7z",
    "audifonos": "M4 15v-3a8 8 0 0116 0v3M4 14h3v6H4zM17 14h3v6h-3z",
    "smartwatches": "M8 2h8l1 4H7zM7 18h10l-1 4H8zM7 6h10v12H7zM12 9v3l2 1.5",
    "cables": "M9 2v5M15 2v5M7 7h10v4a5 5 0 01-10 0zM12 16v6"
  };

  function iconoCategoria(id) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "icono-cat");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", ICONOS[id] || ICONOS["cables"]);
    svg.appendChild(path);
    return svg;
  }

  function iniciarInicio() {
    const cont = document.getElementById("categorias");
    if (cont) {
      CATEGORIAS.forEach(function (c) {
        const a = el("a", "cat-tile");
        a.href = "tienda.html?cat=" + encodeURIComponent(c.id);
        a.appendChild(iconoCategoria(c.id));
        a.appendChild(el("span", "cat-nombre", c.nombre));
        cont.appendChild(a);
      });
    }
    const dest = document.getElementById("destacados");
    if (dest) {
      PRODUCTOS.filter(function (p) { return p.destacado; })
        .slice(0, 8)
        .forEach(function (p) { dest.appendChild(tarjetaProducto(p)); });
    }
  }

  // ---------- Arranque ----------

  window.Studio3 = { formatoPrecio, limpiar, Carrito, tarjetaProducto, categoriaValida, abrirWhatsApp, el };

  iniciarEnlaces();
  iniciarMenu();
  iniciarCarrito();
  iniciarInicio();
})();
