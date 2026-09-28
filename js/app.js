// Código compartido por todas las páginas: formato, carrito, tarjetas, cajón del carrito, menú, origen y pedido.
(function () {
  "use strict";

  const CLAVE_CARRITO = "studio3-carrito";
  const CLAVE_ORIGEN = "studio3-origen";
  const DIAS_ORIGEN = 30;
  // Prefijo de rutas: "" en la raíz, "../" en categoria/ y producto/ (lo pone generar.ps1 en <body data-base>).
  const BASE = document.body.dataset.base || "";

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

  function tieneClave(obj, clave) {
    return Object.prototype.hasOwnProperty.call(obj, clave);
  }

  function productoPorId(id) {
    return PRODUCTOS.find(function (p) { return p.id === id; }) || null;
  }

  function categoriaValida(id) {
    return CATEGORIAS.some(function (c) { return c.id === id; });
  }

  function urlProducto(id) {
    return BASE + "producto/" + encodeURIComponent(id) + ".html";
  }

  function abrirWhatsApp(texto) {
    const url = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener");
  }

  // ---------- Origen del visitante (?ref=ig) ----------
  // Solo se guarda la clave de la lista CONFIG.fuentes, nunca el texto del enlace.

  function guardarOrigen() {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref === null || !tieneClave(CONFIG.fuentes, ref)) return;
    try {
      localStorage.setItem(CLAVE_ORIGEN, JSON.stringify({ ref: ref, t: Date.now() }));
    } catch (e) { /* almacenamiento bloqueado */ }
  }

  function origen() {
    try {
      const o = JSON.parse(localStorage.getItem(CLAVE_ORIGEN));
      if (o && typeof o.ref === "string" && tieneClave(CONFIG.fuentes, o.ref) &&
          Date.now() - Number(o.t) < DIAS_ORIGEN * 86400000) {
        return CONFIG.fuentes[o.ref];
      }
    } catch (e) { /* dato roto o almacenamiento bloqueado */ }
    return "";
  }

  // ---------- Combos ----------

  function incluidos(p) {
    return (Array.isArray(p.incluye) ? p.incluye : []).map(productoPorId).filter(Boolean);
  }

  function ahorro(p) {
    const partes = incluidos(p);
    if (partes.length === 0) return 0;
    const suma = partes.reduce(function (s, x) { return s + x.precio; }, 0);
    return Math.max(0, suma - p.precio);
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

  function conectarBotonAgregar(boton, p) {
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
  }

  function tarjetaProducto(p) {
    const tarjeta = el("article", "tarjeta-producto");
    const url = urlProducto(p.id);

    const enlaceImg = el("a", "tarjeta-enlace-img");
    enlaceImg.href = url;
    enlaceImg.tabIndex = -1;
    enlaceImg.setAttribute("aria-hidden", "true");
    const img = el("img", "tarjeta-img");
    img.src = BASE + p.imagen;
    img.alt = p.nombre;
    img.width = 400;
    img.height = 400;
    img.loading = "lazy";
    img.decoding = "async";
    enlaceImg.appendChild(img);
    tarjeta.appendChild(enlaceImg);

    const cuerpo = el("div", "tarjeta-cuerpo");
    const titulo = el("h3", "tarjeta-nombre");
    const enlace = el("a", "", p.nombre);
    enlace.href = url;
    titulo.appendChild(enlace);
    cuerpo.appendChild(titulo);

    const partes = incluidos(p);
    if (partes.length) {
      cuerpo.appendChild(el("p", "tarjeta-incluye",
        "Incluye: " + partes.map(function (x) { return x.nombre; }).join(" + ")));
      const a = ahorro(p);
      if (a > 0) cuerpo.appendChild(el("p", "etiqueta-ahorro", "Ahorras " + formatoPrecio(a)));
    }

    cuerpo.appendChild(el("p", "tarjeta-desc", p.descripcion));
    cuerpo.appendChild(el("p", "tarjeta-precio", formatoPrecio(p.precio)));

    const boton = el("button", "btn btn-primario btn-bloque");
    boton.type = "button";
    if (p.disponible) {
      boton.textContent = "Agregar al carrito";
      conectarBotonAgregar(boton, p);
    } else {
      boton.textContent = "Agotado";
      boton.disabled = true;
    }
    cuerpo.appendChild(boton);
    tarjeta.appendChild(cuerpo);
    return tarjeta;
  }

  // Las listas se vuelven a dibujar desde productos.js para que precios y existencias
  // estén siempre al día aunque no se haya ejecutado generar.ps1.
  function listaProductos(tipo, id) {
    if (tipo === "destacados") {
      return PRODUCTOS.filter(function (p) { return p.destacado; }).slice(0, 8);
    }
    if (tipo === "categoria") {
      return PRODUCTOS.filter(function (p) { return p.categoria === id; });
    }
    if (tipo === "relacionados") {
      const base = productoPorId(id);
      const lista = PRODUCTOS.filter(function (p) {
        return base && p.categoria === base.categoria && p.id !== id;
      });
      PRODUCTOS.forEach(function (p) {
        if (p.destacado && p.id !== id && lista.indexOf(p) === -1) lista.push(p);
      });
      return lista.slice(0, 4);
    }
    return [];
  }

  function iniciarListas() {
    document.querySelectorAll("[data-lista]").forEach(function (cont) {
      const partes = cont.dataset.lista.split(":");
      const lista = listaProductos(partes[0], partes[1]);
      cont.replaceChildren();
      lista.forEach(function (p) { cont.appendChild(tarjetaProducto(p)); });
    });
  }

  // Página de un producto: precio, estado y botón se actualizan desde productos.js.
  function iniciarFicha() {
    document.querySelectorAll("[data-precio]").forEach(function (n) {
      const p = productoPorId(n.dataset.precio);
      if (p) n.textContent = formatoPrecio(p.precio);
    });
    document.querySelectorAll("[data-estado]").forEach(function (n) {
      const p = productoPorId(n.dataset.estado);
      const disponible = Boolean(p && p.disponible);
      n.textContent = disponible ? "Disponible" : "Agotado";
      n.classList.toggle("estado-agotado", !disponible);
    });
    document.querySelectorAll("button[data-agregar]").forEach(function (b) {
      const p = productoPorId(b.dataset.agregar);
      if (!p || !p.disponible) {
        b.disabled = true;
        b.textContent = p ? "Agotado" : "No disponible";
        return;
      }
      b.disabled = false;
      b.textContent = "Agregar al carrito";
      conectarBotonAgregar(b, p);
    });
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

  // "Complementa tu compra": productos de las categorías de COMPLEMENTOS que aún no están en el carrito.
  function sugerencias(items) {
    if (typeof COMPLEMENTOS === "undefined") return [];
    const enCarrito = items.map(function (it) { return it.id; });
    const categorias = [];
    items.forEach(function (it) {
      const p = productoPorId(it.id);
      const lista = tieneClave(COMPLEMENTOS, p.categoria) ? COMPLEMENTOS[p.categoria] : [];
      lista.forEach(function (c) { if (categorias.indexOf(c) === -1) categorias.push(c); });
    });
    const res = [];
    categorias.forEach(function (c) {
      PRODUCTOS.forEach(function (p) {
        if (res.length < 2 && p.categoria === c && p.disponible &&
            enCarrito.indexOf(p.id) === -1 && res.indexOf(p) === -1) res.push(p);
      });
    });
    return res;
  }

  function renderSugerencias(items) {
    if (!ui.sugerencias) return;
    const lista = sugerencias(items);
    ui.sugerencias.replaceChildren();
    ui.complementa.hidden = lista.length === 0;
    lista.forEach(function (p) {
      const li = el("li", "sugerencia");
      li.appendChild(el("span", "sugerencia-nombre", p.nombre));
      li.appendChild(el("span", "sugerencia-precio", formatoPrecio(p.precio)));
      li.appendChild(botonLinea("btn btn-secundario sugerencia-btn", "Agregar",
        "Agregar " + p.nombre + " al carrito", "agregar", p.id));
      ui.sugerencias.appendChild(li);
    });
  }

  function envioGratisLogrado(total) {
    const umbral = CONFIG.envioGratisDesde;
    return typeof umbral === "number" && umbral > 0 && total >= umbral;
  }

  function renderEnvio() {
    if (!ui.envio) return;
    const total = Carrito.total();
    const umbral = CONFIG.envioGratisDesde;
    ui.envio.hidden = Carrito.items().length === 0;
    ui.envio.classList.remove("logrado");
    if (ui.entrega.value !== "otro") {
      ui.envio.textContent = "Entrega gratis en Masaya.";
      ui.envio.classList.add("logrado");
    } else if (typeof umbral !== "number" || umbral <= 0) {
      ui.envio.textContent = "Envío por CargoTrans: el costo se confirma por WhatsApp.";
    } else if (envioGratisLogrado(total)) {
      ui.envio.textContent = "¡Tu pedido tiene envío gratis a todo Nicaragua!";
      ui.envio.classList.add("logrado");
    } else {
      ui.envio.textContent = "Te faltan " + formatoPrecio(umbral - total) +
        " para tener envío gratis a todo Nicaragua.";
    }
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
    renderSugerencias(items);
    renderEnvio();

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

    const total = Carrito.total();
    let entrega = "Masaya (entrega gratis)";
    if (ui.entrega.value === "otro") {
      entrega = envioGratisLogrado(total)
        ? "Otro departamento (envío gratis por CargoTrans)"
        : "Otro departamento (envío por CargoTrans)";
    }
    const nombre = limpiar(ui.nombre.value);
    const ciudad = limpiar(ui.ciudad.value);
    const vengo = origen();

    let mensaje = "¡Hola Studio 3! Quiero hacer este pedido:\n\n" + lineas.join("\n") +
      "\n\nTotal estimado: " + formatoPrecio(total) +
      "\nEntrega: " + entrega;
    if (nombre) mensaje += "\nNombre: " + nombre;
    if (ciudad) mensaje += "\nCiudad: " + ciudad;
    if (vengo) mensaje += "\nVengo de: " + vengo;

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
    ui.complementa = document.getElementById("carrito-complementa");
    ui.sugerencias = document.getElementById("carrito-sugerencias");
    ui.envio = document.getElementById("carrito-envio");
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
    ui.entrega.addEventListener("change", renderEnvio);

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

    if (ui.sugerencias) {
      ui.sugerencias.addEventListener("click", function (e) {
        const b = e.target.closest("button[data-accion='agregar']");
        if (!b) return;
        Carrito.agregar(b.dataset.id);
        renderContador();
        renderCarrito({ id: b.dataset.id, accion: "mas" });
      });
    }

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

  // ---------- Arranque ----------

  window.Studio3 = { formatoPrecio, limpiar, Carrito, tarjetaProducto, categoriaValida, abrirWhatsApp, el, origen };

  guardarOrigen();
  iniciarEnlaces();
  iniciarMenu();
  iniciarCarrito();
  iniciarListas();
  iniciarFicha();
})();
