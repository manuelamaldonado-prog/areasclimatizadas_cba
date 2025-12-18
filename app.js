/* ============================================================
   APP.JS — ÁREAS CLIMATIZADAS CBA
=========================================================== */

let respuestas = {};
let datosGenerales = { medico: null };
let imagenesCargadas = [];

/* ============================================================
   DEFINICIÓN DE BLOQUES Y PREGUNTAS
=========================================================== */

const bloques = {

  /* BLOQUE 2 – CONFORT TÉRMICO */
  form2: [
    { t: "¿El recinto cuenta con temperatura estable?", d: "Considerar que mantiene una temperatura agradable y homogénea.", g: "grave" },
    { t: "¿Hay circulación de aire natural (ventilación cruzada)?", d: "Presencia de ventanas, aberturas o flujo cruzado.", g: "leve" },
    { t: "¿El espacio posee aire acondicionado en funcionamiento?", d: "Aire acondicionado operativo y accesible.", g: "medio" },
    { t: "¿Posee ventiladores funcionando?", d: "Ventiladores operativos y distribuidos adecuadamente.", g: "leve" }
  ],

  /* BLOQUE 3 – DISPOSICIONES EDILICIAS */
  form3: [
    { t: "¿La fachada principal está orientada al norte?", d: "La orientación norte recibe radiación homogénea y controlable.", g: "medio" },
    { t: "¿La menor cantidad de aberturas se orientan al oeste?", d: "La orientación oeste recibe mayor carga térmica.", g: "medio" },
    { t: "¿El área permite el acceso seguro de personas con movilidad reducida?", d: "Considerar rampas, nivelación, ausencia de obstáculos, accesos amplios.", g: "grave" }
  ],

  /* BLOQUE 4 – ENVOLVENTE TÉRMICA */
  form4: [
    { t: "¿El material del techo evita la trasferencia de calor al recinto?", d: "Ejemplo: losa, cieloraso aislante, techo de chapa con aislación térmica, etc.", g: "grave" },
    { t: "¿El recinto posee planta superior?", d: "La planta superior reduce la transferencia térmica directa desde la cubierta.", g: "medio" }
  ],

  /* BLOQUE 5 – PROTECCIONES PASIVAS */
  form5: [
    { t: "¿Posee toldos, cortinas o elementos de sombra?", d: "Elementos que mitiguen la radiación solar directa.", g: "leve" },
    { t: "¿Posee vegetación / edificios / medianeras, etc al norte?", d: "Estos elementos ubicados al norte generan sombreado.", g: "medio" },
    { t: "¿Posee vegetación / edificios / medianeras, etc al oeste?", d: "Estos elementos ubicados al oeste generan sombreado.", g: "medio" }
  ],

  /* BLOQUE 6 – DISEÑO */
  form6: [
    { t: "¿Cuenta con aberturas altas para permitir la salida del aire caliente?", d: "Aberturas ubicadas a más de 2 metros favorecen la ventilación.", g: "leve" },
    { t: "¿Posee tela mosquitera?", d: "Evita ingreso de insectos y mejora las condiciones sanitarias.", g: "leve" }
  ],

  /* BLOQUE 7 – SERVICIOS */
  form7: [
    {
      t: "¿El punto cuenta con disponibilidad de agua fría para el público en general?",
      d: "Agua fría accesible para las personas (heladera, dispenser o botellón refrigerado).",
      g: "muygrave"
    },
    { t: "¿Se dispone de un área de reposo o espera?", d: "Sillas, bancos o sectores confortables.", g: "medio" },
    { t: "¿El espacio está preparado para futura instalación de energía solar?", d: "Debe poseer espacio físico, estructura resistente y capacidad eléctrica.", g: "medio" }
  ]
};

/* ============================================================
   GENERACIÓN DE FORMULARIOS
=========================================================== */

function generarFormularios() {
  Object.keys(bloques).forEach(id => {
    const cont = document.getElementById(id);
    if (!cont) return;

    bloques[id].forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "pregunta";
      div.innerHTML = `
        <strong>${p.t}</strong>
        <p class="explica">${p.d}</p>
        <div class="opciones">
          <button class="btn-resp btn-si"
            onclick="seleccionarRespuesta('${id}', ${i}, 'si', this)">Sí</button>
          <button class="btn-resp btn-no-${p.g}"
            onclick="seleccionarRespuesta('${id}', ${i}, 'no', this)">No</button>
        </div>`;
      cont.appendChild(div);
    });
  });
}
generarFormularios();

/* ============================================================
   RESPUESTAS Y DATOS GENERALES
=========================================================== */

function seleccionarRespuesta(b, i, v, btn) {
  respuestas[`${b}_${i}`] = v;
  btn.parentElement.querySelectorAll(".btn-resp")
    .forEach(x => x.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
}

function setDatoGeneral(campo, valor, btn) {
  datosGenerales[campo] = valor;
  btn.parentNode.querySelectorAll("button")
    .forEach(b => b.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
}

/* ============================================================
   NAVEGACIÓN
=========================================================== */

let pasoActual = 1;

function mostrarPaso(n) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + n).classList.add("active");
}

function nextStep() { pasoActual++; mostrarPaso(pasoActual); }
function prevStep() { pasoActual--; mostrarPaso(pasoActual); }

/* ============================================================
   CAPACIDAD
=========================================================== */

document.getElementById("m2").addEventListener("input", () => {
  const m2 = parseFloat(document.getElementById("m2").value) || 0;
  document.getElementById("capacidadTexto").innerHTML =
    `<strong>Personas permitidas:</strong> ${Math.floor(m2 / 3.5)}`;
});

/* ============================================================
   LÓGICAS DE GRAVEDAD
=========================================================== */

function obtenerGravedadFinal(b, i, v) {

  /* Agua fría: condición necesaria y suficiente */
  if (b === "form7" && i === 0)
    return v === "si" ? "bueno" : "muygrave";

  /* Protecciones pasivas */
  if (b === "form5")
    return v === "si" ? "bueno" : "leve";

  return v === "si" ? "bueno" : bloques[b][i].g;
}

/* ============================================================
   CLASIFICACIÓN GENERAL
=========================================================== */

function clasificarPunto() {
  let muy = 0, gra = 0, med = 0, lev = 0, buenas = 0;

  Object.keys(respuestas).forEach(k => {
    const [b, i] = k.split("_");
    const g = obtenerGravedadFinal(b, +i, respuestas[k]);
    if (g === "bueno") buenas++;
    if (g === "muygrave") muy++;
    if (g === "grave") gra++;
    if (g === "medio") med++;
    if (g === "leve") lev++;
  });

  if (
    respuestas["form7_0"] === "no" ||
    buenas < 4 ||
    muy >= 1 ||
    gra >= 4 ||
    med >= 6 ||
    lev >= 7
  ) return { estado: "rojo", muy, gra, med, lev, buenas };

  if (gra >= 2 || med >= 3 || lev >= 4)
    return { estado: "amarillo", muy, gra, med, lev, buenas };

  return { estado: "verde", muy, gra, med, lev, buenas };
}

/* ============================================================
   COMENTARIOS (CARGA EXPLÍCITA)
=========================================================== */

function cargarComentarios() {
  const txt = document.getElementById("comentarios").value.trim();
  const cont = document.getElementById("comentariosCargados");
  cont.innerHTML = txt ? txt.replace(/\n/g, "<br>") : "<em>— Sin comentarios —</em>";
}

/* ============================================================
   IMÁGENES
=========================================================== */

function manejarImagen(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    imagenesCargadas.push(e.target.result);
    mostrarImagenes();
  };
  reader.readAsDataURL(file);
}

function mostrarImagenes() {
  const cont = document.getElementById("imagenesPreview");
  if (!cont) return;
  cont.innerHTML = "";
  imagenesCargadas.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.style.maxWidth = "150px";
    img.style.margin = "5px";
    cont.appendChild(img);
  });
}
/* ============================================================
   CARGAR RESULTADOS (PASO EXPLÍCITO)
=========================================================== */

function cargarResultados() {
  // 1. Congelar comentarios
  cargarComentarios();

  // 2. Generar informe final
  calcular();
}
/* ============================================================
   INFORME FINAL
=========================================================== */

function calcular() {

  const { estado, muy, gra, med, lev, buenas } = clasificarPunto();
  const m2 = parseFloat(document.getElementById("m2").value) || 0;
  const capacidad = Math.floor(m2 / 3.5);

  let html = `
    <h2>${
      estado === "rojo" ? "🟥 Área NO apta como área climatizada" :
      estado === "amarillo" ? "🟡 Área climatizada con mejoras necesarias" :
      "🟢 Área climatizada apta"
    }</h2>

    <p><strong>Área total:</strong> ${m2} m²</p>
    <p><strong>Personas permitidas:</strong> ${capacidad}</p>
    <hr>

    <h3>Resumen de clasificación</h3>
    <ul>
      <li><strong>Buenas (🟢):</strong> ${buenas}</li>
      <li><strong>Leves (🟡):</strong> ${lev}</li>
      <li><strong>Medias (🟠):</strong> ${med}</li>
      <li><strong>Graves (🔴):</strong> ${gra}</li>
      <li><strong>Muy graves (🚨):</strong> ${muy}</li>
    </ul>
    <hr>

    <h3>Detalle de respuestas por bloque</h3>
  `;

  const nombresBloques = {
    form2: "Bloque 2 – Confort térmico",
    form3: "Bloque 3 – Disposiciones edilicias",
    form4: "Bloque 4 – Envolvente térmica",
    form5: "Bloque 5 – Protecciones pasivas",
    form6: "Bloque 6 – Diseño",
    form7: "Bloque 7 – Funciones y provisionamiento"
  };

  Object.keys(bloques).forEach(b => {
    html += `<h4>${nombresBloques[b]}</h4>`;
    bloques[b].forEach((p, i) => {
      const v = respuestas[`${b}_${i}`];
      const g = v ? obtenerGravedadFinal(b, i, v) : null;
      const emoji = !g ? "" :
        g === "muygrave" ? "🚨" :
        g === "grave" ? "🔴" :
        g === "medio" ? "🟠" :
        g === "leve" ? "🟡" : "🟢";

      html += `
        <p>
          <strong>${p.t}</strong><br>
          ${v ? `Respuesta: ${v.toUpperCase()} — ${g.toUpperCase()} ${emoji}` : "Sin respuesta"}
        </p>
      `;
    });
    html += `<hr>`;
  });

  html += `
    <h3>Comentarios adicionales</h3>
    <div id="comentariosCargados">${document.getElementById("comentariosCargados").innerHTML}</div>

    <h3>Registro fotográfico</h3>
    <div id="imagenesPreview"></div>
  `;

  document.getElementById("resultado").innerHTML = html;
  mostrarImagenes();
  nextStep();
}

/* ============================================================
   PDF
=========================================================== */

function descargarPDF() {
  const contenido = document.getElementById("resultado").innerHTML;

  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head>
      <title>Áreas Climatizadas CBA</title>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Public Sans', sans-serif; padding: 20px; }
        img { max-width: 100%; margin-bottom: 10px; }
      </style>
    </head>
    <body>${contenido}</body>
    </html>
  `);
  w.document.close();
  w.print();
}

