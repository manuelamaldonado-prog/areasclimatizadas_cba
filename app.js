/* ============================================================
   ESTADO GLOBAL
=========================================================== */

let respuestas = {};
let datosGenerales = { medico: null };

/* ============================================================
   BLOQUES Y PREGUNTAS
=========================================================== */

const bloques = {
  form2: [
    { t: "¿El recinto cuenta con temperatura estable?", g: "muygrave" },
    { t: "¿Hay circulación de aire natural (ventilación cruzada)?", g: "leve" },
    { t: "¿El espacio posee aire acondicionado en funcionamiento?", g: "medio" },
    { t: "¿Posee ventiladores funcionando?", g: "leve" }
  ],
  form3: [
    { t: "¿La fachada principal está orientada al norte?", g: "medio" },
    { t: "¿La menor cantidad de aberturas se orientan al oeste?", g: "medio" },
    { t: "¿El área permite el acceso seguro de personas con movilidad reducida?", g: "grave" }
  ],
  form4: [
    { t: "¿El material del techo evita la transferencia de calor al recinto?", g: "grave" },
    { t: "¿El recinto posee planta superior?", g: "medio" }
  ],
  form5: [
    { t: "¿Posee toldos, cortinas o elementos de sombra?", g: "leve" },
    { t: "¿Posee vegetación / edificios / medianeras al norte?", g: "medio" },
    { t: "¿Posee vegetación / edificios / medianeras al oeste?", g: "medio" }
  ],
  form6: [
    { t: "¿Cuenta con aberturas altas para permitir la salida del aire caliente?", g: "leve" },
    { t: "¿Posee tela mosquitera?", g: "leve" }
  ],
  form7: [
    { t: "¿El punto cuenta con disponibilidad de agua fría?", g: "muygrave" },
    { t: "¿Se dispone de un área de reposo o espera?", g: "medio" },
    { t: "¿El espacio está preparado para futura instalación de energía solar?", g: "medio" }
  ]
};

/* ============================================================
   MAPA DE MEJORAS
=========================================================== */

const mapaMejoras = {
  "form2_1": { tipo: "MS", texto: "Agregar ventilación cruzada o extractores." },
  "form2_2": { tipo: "MR", texto: "Instalar o reparar aire acondicionado." },
  "form2_3": { tipo: "MR", texto: "Instalar o reparar ventiladores." },
  "form3_2": { tipo: "MR", texto: "Adaptar accesos para movilidad reducida." },
  "form4_0": { tipo: "MS", texto: "Incorporar aislación térmica en cubierta." },
  "form5_0": { tipo: "MR", texto: "Agregar toldos o elementos de sombra." },
  "form7_0": { tipo: "MR", texto: "Incorporar dispenser de agua fría." }
};

/* ============================================================
   GENERACIÓN DE FORMULARIOS
=========================================================== */

function generarFormularios() {
  Object.entries(bloques).forEach(([id, preguntas]) => {
    const cont = document.getElementById(id);
    if (!cont) return;

    preguntas.forEach((p, i) => {
      cont.insertAdjacentHTML("beforeend", `
        <div class="pregunta">
          <strong>${p.t}</strong>
          <div class="opciones">
            <button class="btn-resp btn-si" onclick="responder('${id}',${i},'si',this)">Sí</button>
            <button class="btn-resp btn-no-${p.g}" onclick="responder('${id}',${i},'no',this)">No</button>
          </div>
        </div>
      `);
    });
  });
}

function responder(b, i, v, btn) {
  respuestas[`${b}_${i}`] = v;
  btn.parentElement.querySelectorAll(".btn-resp").forEach(b => b.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
}

/* ============================================================
   PERSONAS / m²
=========================================================== */

function actualizarCapacidad() {
  const m2 = parseFloat(document.getElementById("m2").value);
  const txt = document.getElementById("capacidadTexto");

  if (isNaN(m2) || m2 <= 0) {
    txt.innerHTML = "";
    return;
  }

  txt.innerHTML = `<strong>Capacidad máxima estimada:</strong> ${Math.floor(m2 / 3.5)} personas`;
}
/* ============================================================
   DATOS GENERALES — SERVICIO MÉDICO
=========================================================== */

function setDatoGeneral(campo, valor, boton) {
  datosGenerales[campo] = valor;

  boton.parentElement
    .querySelectorAll("button")
    .forEach(b => b.classList.remove("seleccionado"));

  boton.classList.add("seleccionado");
}


/* ============================================================
   NAVEGACIÓN ENTRE PASOS
=========================================================== */

let pasoActual = 1;
const TOTAL_PASOS = 8;

function mostrarPaso(n) {
  if (n < 1) n = 1;
  if (n > TOTAL_PASOS) n = TOTAL_PASOS;

  pasoActual = n;
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + pasoActual).classList.add("active");
}

function nextStep() {
  mostrarPaso(pasoActual + 1);
}

function prevStep() {
  mostrarPaso(pasoActual - 1);
}

/* ============================================================
   CÁLCULO FINAL
=========================================================== */

function calcular() {

  const m2 = parseFloat(document.getElementById("m2").value) || 0;
  const personas = Math.floor(m2 / 3.5);

  let html = `
    <p><strong>Superficie evaluada:</strong> ${m2} m²</p>
    <p><strong>Capacidad máxima estimada:</strong> ${personas} personas</p>
  `;

  Object.entries(bloques).forEach(([id, preguntas], idx) => {
    html += `<h3>Bloque ${idx + 2}</h3><ul>`;
    preguntas.forEach((p, i) => {
      const r = respuestas[`${id}_${i}`] || "No respondido";
      html += `<li>${p.t}<br><strong>Respuesta:</strong> ${r.toUpperCase()}`;
      const k = `${id}_${i}`;
      if (r === "no" && mapaMejoras[k]) {
        html += `<br><em>Mejora (${mapaMejoras[k].tipo}):</em> ${mapaMejoras[k].texto}`;
      }
      html += `</li>`;
    });
    html += `</ul>`;
  });

  html += `
    <h3>Observaciones del relevador</h3>
    <textarea id="comentarios" style="width:100%;min-height:120px;"></textarea>
  `;

  document.getElementById("resultado").innerHTML = html;
  mostrarPaso(8);
}

/* ============================================================
   PDF
=========================================================== */

function descargarPDF() {
  const res = document.getElementById("resultado").cloneNode(true);
  const t = res.querySelector("#comentarios");
  if (t) {
    const p = document.createElement("p");
    p.innerHTML = t.value || "Sin observaciones.";
    t.replaceWith(p);
  }
  const w = window.open("");
  w.document.write(`<html><body>${res.innerHTML}</body></html>`);
  w.document.close();
  w.print();
}

/* ============================================================
   INIT
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  generarFormularios();
  document.getElementById("m2").addEventListener("input", actualizarCapacidad);
});
