// Atlantica Real Estate. Comportamiento de la landing.
// Orden deliberado: primero el formulario (lo único imprescindible) y después los efectos
// visuales, cada uno protegido, para que un navegador antiguo no deje el formulario sin funcionar.

const CORREO = "realestateatlantica@gmail.com";
const ENVIO = "https://formsubmit.co/ajax/realestateatlantica@gmail.com";   // reenvía la solicitud a nuestro correo
const EN = document.documentElement.lang === "en";
const T = EN ? {
  nombre: "Please enter your name.",
  correo: "Please enter a valid email, for example name@company.com.",
  privacidad: "We need your consent to reply.",
  enviando: "Sending…",
  ok: (c) => `Thank you. We have received your request and will send the dossier to ${c} shortly.`,
  error: `Your request could not be sent. Please email us at ${CORREO} or message us on WhatsApp.`,
} : {
  nombre: "Escriba su nombre.",
  correo: "Escriba un correo válido, por ejemplo nombre@empresa.com.",
  privacidad: "Necesitamos su conformidad para responderle.",
  enviando: "Enviando…",
  ok: (c) => `Gracias. Hemos recibido su solicitud y le enviaremos el dossier a ${c} en breve.`,
  error: `No se ha podido enviar la solicitud. Escríbanos a ${CORREO} o por WhatsApp.`,
};

// ---------- Formulario: la solicitud nos llega por correo (FormSubmit) sin salir de la página ----------
const formulario = document.querySelector("[data-formulario]");
if (formulario) {
  formulario.noValidate = true;   // validamos aquí con mensajes propios; sin JavaScript valida el navegador
  const estado = formulario.querySelector(".formulario__estado");
  const boton = formulario.querySelector('button[type="submit"]');
  const campos = {
    nombre: { el: formulario.nombre, error: T.nombre, valido: (v) => v.trim().length > 1 },
    correo: { el: formulario.email, error: T.correo, valido: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
    privacidad: { el: formulario.privacidad, error: T.privacidad, valido: (_, el) => el.checked },
  };

  function comprobar(nombre) {
    const { el, error, valido } = campos[nombre];
    const aviso = document.getElementById(`e-${nombre}`);
    const ok = valido(el.value, el);
    el.setAttribute("aria-invalid", String(!ok));
    aviso.hidden = ok;
    aviso.textContent = ok ? "" : error;
    return ok;
  }
  Object.keys(campos).forEach((n) => campos[n].el.addEventListener(n === "privacidad" ? "change" : "blur", () => comprobar(n)));

  formulario.addEventListener("submit", (e) => {
    const fallos = Object.keys(campos).filter((n) => !comprobar(n));
    if (fallos.length) { e.preventDefault(); campos[fallos[0]].el.focus(); estado.textContent = ""; return; }
    if (!window.fetch || !window.FormData) return;   // navegador muy antiguo: envío clásico a FormSubmit
    e.preventDefault();
    const correo = formulario.email.value.trim();
    boton.disabled = true; estado.textContent = T.enviando;
    const datos = new FormData(formulario);
    datos.append("_replyto", correo);   // en el correo que nos llega, "Responder" va directo al visitante
    fetch(ENVIO, { method: "POST", headers: { Accept: "application/json" }, body: datos })
      .then((r) => r.json().then((d) => {
        // FormSubmit devuelve success "false" si el formulario aún no está activado o si rechaza el envío
        if (!r.ok || String(d.success) === "false") throw new Error(d.message || "envío rechazado");
        formulario.reset();
        estado.textContent = T.ok(correo);
      }))
      .catch(() => { estado.textContent = T.error; })
      .then(() => { boton.disabled = false; });
  });
}

// ---------- Cabecera: transparente sobre la portada, sólida al salir de ella ----------
const cabecera = document.querySelector(".cabecera");
const portada = document.querySelector(".portada");
if (cabecera && portada) {
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entrada]) => {
      cabecera.dataset.estado = entrada.isIntersecting ? "sobre-portada" : "solida";
    }, { rootMargin: "-76px 0px 0px 0px" }).observe(portada);
  } else {
    cabecera.dataset.estado = "solida";   // sin detección de scroll, siempre legible
  }
}

// ---------- Menú en pantallas estrechas ----------
const menuBoton = document.querySelector(".menu-boton");
const nav = document.getElementById("nav");
function cerrarMenu() {
  nav.removeAttribute("data-abierto");
  menuBoton.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("menu-abierto");
}
if (menuBoton && nav) {
  menuBoton.addEventListener("click", () => {
    const abrir = menuBoton.getAttribute("aria-expanded") !== "true";
    nav.toggleAttribute("data-abierto", abrir);
    menuBoton.setAttribute("aria-expanded", String(abrir));
    document.documentElement.classList.toggle("menu-abierto", abrir);
  });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) cerrarMenu(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuBoton.getAttribute("aria-expanded") === "true") { cerrarMenu(); menuBoton.focus(); }
  });
  const escritorio = matchMedia("(min-width: 1100px)");
  if (escritorio.addEventListener) escritorio.addEventListener("change", cerrarMenu);
  else if (escritorio.addListener) escritorio.addListener(cerrarMenu);   // Safari 13 y anteriores
}

// ---------- Cadena de valor: la línea se dibuja al entrar en pantalla ----------
const cadena = document.querySelector("[data-cadena]");
if (cadena) {
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) { cadena.setAttribute("data-visible", ""); observador.disconnect(); }
    }, { threshold: 0.25 });
    observador.observe(cadena);
  } else {
    cadena.setAttribute("data-visible", "");
  }
}
