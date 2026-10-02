// Ajustes generales del sitio. Aquí se cambian el WhatsApp, la moneda, las promociones y los enlaces de redes.
const CONFIG = Object.freeze({
  whatsapp: "50587146561",
  moneda: "C$",
  cantidadMaxima: 20,

  // Envío gratis a Managua y al resto del país a partir de este total (en córdobas). Masaya siempre tiene entrega gratis. Pon null para desactivarlo.
  envioGratisDesde: 2500,

  // Etiquetas de origen permitidas en los enlaces, p. ej. .../tienda.html?ref=ig
  // El nombre aparece en el pedido de WhatsApp como "Vengo de: Instagram".
  fuentes: Object.freeze({
    ig: "Instagram",
    tt: "TikTok",
    fb: "Facebook",
    wa: "WhatsApp",
    google: "Google",
    qr: "Código QR"
  }),

  redes: Object.freeze({
    instagram: "https://www.instagram.com/studio3.ni",
    tiktok: "https://www.tiktok.com/@studio3.ni",
    facebook: "https://www.facebook.com/share/1BtNzth1zg/?mibextid=wwXIfr"
  })
});
