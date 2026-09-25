// Atlantica Real Estate. Comportamiento de la landing.
// Orden deliberado: primero el formulario (lo único imprescindible) y después los efectos
// visuales, cada uno protegido, para que un navegador antiguo no deje el formulario sin funcionar.

const CORREO = "atlanticarealestate@gmail.com";

// ---------- Formulario: valida y abre el correo del visitante con la solicitud redactada ----------
const formulario = document.querySelector("[data-formulario]");
if (formulario) {
  const estado = formulario.querySelector(".formulario__estado");
  const boton = formulario.querySelector('button[type="submit"]');
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
    const d = new FormData(formulario);
    const cuerpo = [
      "Solicito el dossier para inversores de Atlantica Real Estate.", "",
      `Nombre: ${d.get("nombre")}`, `Correo: ${d.get("correo")}`,
      `País de residencia: ${d.get("pais") || "-"}`, `Perfil: ${d.get("perfil") || "-"}`, "",
      d.get("mensaje") || "",
    ].join("\n");
    location.href = `mailto:${CORREO}?subject=${encodeURIComponent("Solicitud de dossier para inversores")}&body=${encodeURIComponent(cuerpo)}`;
    estado.textContent = `Se ha abierto su programa de correo con la solicitud. Si no se abre, escríbanos a ${CORREO}.`;
  });
  if (boton) boton.disabled = false;   // el botón solo se activa cuando el envío ya está controlado
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
