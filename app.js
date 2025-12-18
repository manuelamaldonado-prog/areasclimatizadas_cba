/* ============================================================
   APP.JS — DEFINICIONES GENERALES
=========================================================== */

let respuestas = {};
let datosGenerales = { medico: null };

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
    { t: "¿El material del techo evita la transferencia de calor al recinto?", d: "Ejemplo: losa, cielorraso aislante, techo de chapa con aislación térmica, etc.", g: "grave" },
    { t: "¿El recinto posee planta superior?", d: "La planta superior reduce la transferencia térmica directa desde la cubierta.", g: "medio" }
  ],

  /* BLOQUE 5 – PROTECCIONES PASIVAS */
  form5: [
    { t: "¿Posee toldos, cortinas o elementos de sombra?", d: "Elementos que mitiguen la radiación solar directa.", g: "leve" },
    { t: "¿Posee vegetación / edificios / medianeras al norte?", d: "Estos elementos ubicados al norte generan sombreado.", g: "medio" },
    { t: "¿Posee vegetación / edificios / medianeras al oeste?", d: "Estos elementos ubicados al oeste generan sombreado.", g: "medio" }
  ],

  /* BLOQUE 6 – DISEÑO */
  form6: [
    { t: "¿Cuenta con aberturas altas para permitir la salida del aire caliente?", d: "Aberturas ubicadas a más de 2 metros favorecen la ventilación.", g: "leve" },
    { t: "¿Posee tela mosquitera?", d: "Evita ingreso de insectos y mejora las condiciones sanitarias.", g: "leve" }
  ],

  /* BLOQUE 7 – SERVICIOS */
  form7: [
    { t: "¿El punto cuenta con disponibilidad de agua fría?", d: "Agua fría proveniente de heladera, dispenser o botellón refrigerado.", g: "medio" },
    { t: "¿Se dispone de un área de reposo o espera?", d: "Sillas, bancos o sectores confortables.", g: "medio" },
    { t: "¿El espacio está preparado para futura instalación de energía solar?", d: "Debe poseer espacio físico, estructura resistente y capacidad eléctrica.", g: "medio" }
  ]
};

/* ============================================================
   GENERACIÓN DE FORMULARIOS
=========================================================== */

function generarFormularios() {
  Object.keys(bloques).forEach(idBloque => {
    const cont = document.getElementById(idBloque);
    if (!cont) return;

    bloques[idBloque].forEach((preg, index) => {
      const div = document.createElement("div");
      div.className = "pregunta";

      div.innerHTML = `
        <strong>${preg.t}</strong>
        <p class="explica">${preg.d}</p>
        <div class="opciones">
          <button class="btn-resp btn-si" onclick="seleccionarRespuesta('${idBloque}', ${index}, 'si', this)">Sí</button>
          <button class="btn-resp btn-no-${preg.g}" onclick="seleccionarRespuesta('${idBloque}', ${index}, 'no', this)">No</button>
        </div>
      `;
      cont.appendChild(div);
    });
  });
}

/* ============================================================
   RESPUESTAS
=========================================================== */

function seleccionarRespuesta(bloque, index, valor, boton) {
  respuestas[`${bloque}_${index}`] = valor;
  boton.parentElement.querySelectorAll(".btn-resp").forEach(b => b.classList.remove("seleccionado"));
  boton.classList.add("seleccionado");
}

function setDatoGeneral(campo, valor, boton) {
  datosGenerales[campo] = valor;
  boton.parentNode.querySelectorAll("button").forEach(b => b.classList.remove("seleccionado"));
  boton.classList.add("seleccionado");
}

/* ============================================================
   NAVEGACIÓN
=========================================================== */

let pasoActual = 1;

function mostrarPaso(n) {
  document.querySelectorAll(".step").forEach(d => d.classList.remove("active"));
  document.getElementById("step" + n).classList.add("active");
  pasoActual = n;
}

function nextStep() { mostrarPaso(pasoActual + 1); }
function prevStep() { mostrarPaso(pasoActual - 1); }

/* ============================================================
   CAPACIDAD
=========================================================== */

function initCapacidad() {
  const m2Input = document.getElementById("m2");
  const texto = document.getElementById("capacidadTexto");

  m2Input.addEventListener("input", () => {
    const m2 = parseFloat(m2Input.value) || 0;
    texto.innerHTML = `<strong>Personas permitidas:</strong> ${Math.floor(m2 / 3.5)}`;
  });
}

/* ============================================================
   CLASIFICACIÓN
=========================================================== */

function obtenerGravedadFinal(bloque, index, valor) {
  if (bloque === "form7" && index === 0) return valor === "si" ? "bueno" : "medio";
  return valor === "si" ? "bueno" : bloques[bloque][index].g;
}

function clasificarPunto() {
  let muy = 0, gra = 0, med = 0, lev = 0, buenas = 0;

  Object.keys(respuestas).forEach(key => {
    const [b, idx] = key.split("_");
    const v = respuestas[key];
    const g = obtenerGravedadFinal(b, +idx, v);
    if (v === "si") buenas++;
    if (v === "no") ({ muygrave: muy++, grave: gra++, medio: med++, leve: lev++ }[g]);
  });

  if (buenas < 4 || muy >= 1 || gra >= 4) return { estado: "rojo", muy, gra, med, lev, buenas };
  if (gra >= 2 || med >= 3) return { estado: "amarillo", muy, gra, med, lev, buenas };
  return { estado: "verde", muy, gra, med, lev, buenas };
}

/* ============================================================
   RESULTADO
=========================================================== */

function calcular() {
  const r = clasificarPunto();
  const m2 = parseFloat(document.getElementById("m2").value) || 0;

  document.getElementById("resultado").innerHTML = `
    <h2>${r.estado === "rojo" ? "🟥 NO apta" : r.estado === "amarillo" ? "🟡 Con mejoras" : "🟢 Apta"}</h2>
    <p><strong>Área:</strong> ${m2} m²</p>
    <p><strong>Personas:</strong> ${Math.floor(m2 / 3.5)}</p>
  `;
  mostrarPaso(8);
}

/* ============================================================
   PDF
=========================================================== */

function descargarPDF() {
  const w = window.open("");
  w.document.write(`<html><body>${document.getElementById("resultado").innerHTML}</body></html>`);
  w.document.close();
  w.print();
}

/* ============================================================
   INIT
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  generarFormularios();
  initCapacidad();
  mostrarPaso(1);
});
