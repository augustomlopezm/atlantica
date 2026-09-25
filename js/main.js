// Atlantica Real Estate. Comportamiento de la landing.

// Datos de contacto (también escritos en el HTML del pie).
const CONTACTO = {
  correo: "atlanticarealestate@gmail.com",
  whatsapp: "584244149968",   // +58 424 414 9968 (Venezuela), sin + ni espacios
};

// Cabecera: transparente sobre la portada, sólida al salir de ella.
const cabecera = document.querySelector(".cabecera");
const portada = document.querySelector(".portada");
if (cabecera && portada) {
  new IntersectionObserver(([entrada]) => {
    cabecera.dataset.estado = entrada.isIntersecting ? "sobre-portada" : "solida";
  }, { rootMargin: "-76px 0px 0px 0px" }).observe(portada);
}

// Menú en pantallas estrechas.
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
  matchMedia("(min-width: 1100px)").addEventListener("change", cerrarMenu);
}

// Cadena de valor: la línea se dibuja al entrar en pantalla.
const cadena = document.querySelector("[data-cadena]");
if (cadena) {
  const observador = new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting) { cadena.setAttribute("data-visible", ""); observador.disconnect(); }
  }, { threshold: 0.25 });
  observador.observe(cadena);
}

// Enlaces de contacto: solo se activan si los datos están configurados.
const enlaceWhatsapp = CONTACTO.whatsapp ? `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent("Hola, me interesa recibir información sobre Atlantica Real Estate.")}` : "";
document.querySelectorAll("[data-whatsapp]").forEach((a) => {
  if (enlaceWhatsapp) {
    a.href = enlaceWhatsapp; a.target = "_blank"; a.rel = "noopener";
    if (a.textContent.startsWith("[PENDIENTE")) a.textContent = `+${CONTACTO.whatsapp}`;
  } else if (a.closest(".dossier__alternativa")) {
    a.closest(".dossier__alternativa").hidden = true;   // sin número, mejor no ofrecer un enlace muerto
  }
});
document.querySelectorAll("[data-correo]").forEach((a) => {
  if (CONTACTO.correo) { a.href = `mailto:${CONTACTO.correo}`; a.textContent = CONTACTO.correo; }
});

// Formulario: valida y abre el correo del visitante con la solicitud redactada.
const formulario = document.querySelector("[data-formulario]");
if (formulario) {
  const estado = formulario.querySelector(".formulario__estado");
  const campos = {
    nombre: { el: formulario.nombre, error: "Escriba su nombre.", valido: (v) => v.trim().length > 1 },
    correo: { el: formulario.correo, error: "Escriba un correo válido, por ejemplo nombre@empresa.com.", valido: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
    privacidad: { el: formulario.privacidad, error: "Necesitamos su conformidad para responderle.", valido: (_, el) => el.checked },
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
    e.preventDefault();
    const fallos = Object.keys(campos).filter((n) => !comprobar(n));
    if (fallos.length) { campos[fallos[0]].el.focus(); estado.textContent = ""; return; }

    if (!CONTACTO.correo) {
      estado.textContent = "Todavía no hay un correo de destino configurado. Puede escribirnos por WhatsApp mientras tanto.";
      return;
    }
    const d = new FormData(formulario);
    const cuerpo = [
      "Solicito el dossier para inversores de Atlantica Real Estate.", "",
      `Nombre: ${d.get("nombre")}`, `Correo: ${d.get("correo")}`,
      `País de residencia: ${d.get("pais") || "-"}`, `Perfil: ${d.get("perfil") || "-"}`, "",
      d.get("mensaje") || "",
    ].join("\n");
    location.href = `mailto:${CONTACTO.correo}?subject=${encodeURIComponent("Solicitud de dossier para inversores")}&body=${encodeURIComponent(cuerpo)}`;
    estado.textContent = `Se ha abierto su programa de correo con la solicitud. Si no se abre, escríbanos a ${CONTACTO.correo}.`;
  });
}
