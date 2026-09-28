// Formulario de emprendedores: valida y envía la solicitud por WhatsApp.
(function () {
  "use strict";

  const S = window.Studio3;
  const form = document.getElementById("form-revendedor");
  if (!form) return;

  const CANALES = ["Tienda física", "Redes sociales", "Ambos"];
  const VOLUMENES = ["10–24 unidades", "25–49 unidades", "50 o más unidades"];

  // Solo se aceptan valores que estén en la lista permitida.
  function permitido(valor, lista) {
    return lista.indexOf(valor) !== -1 ? valor : "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // required + pattern en el HTML rechazan campos vacíos o con solo espacios.
    if (!form.reportValidity()) return;
    if (!S.limpiar(form.elements.nombre.value) || !S.limpiar(form.elements.ciudad.value)) return;

    const negocio = S.limpiar(form.elements.negocio.value);
    const canal = permitido(form.elements.canal.value, CANALES);
    const volumen = permitido(form.elements.volumen.value, VOLUMENES);
    const interes = CATEGORIAS
      .filter(function (c) {
        return Array.prototype.some.call(form.elements.interes, function (i) {
          return i.checked && i.value === c.id;
        });
      })
      .map(function (c) { return c.nombre; });

    let mensaje = "Hola Studio 3, quiero ser emprendedor.\n\n" +
      "Nombre: " + S.limpiar(form.elements.nombre.value) + "\n" +
      "Ciudad o departamento: " + S.limpiar(form.elements.ciudad.value);
    if (negocio) mensaje += "\nNegocio: " + negocio;
    if (canal) mensaje += "\nCanal de venta: " + canal;
    if (interes.length) mensaje += "\nProductos de interés: " + interes.join(", ");
    if (volumen) mensaje += "\nVolumen mensual estimado: " + volumen;
    const vengo = S.origen();
    if (vengo) mensaje += "\nVengo de: " + vengo;

    S.abrirWhatsApp(mensaje);
  });
})();
