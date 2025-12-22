/* ============================================================
   ESTADO
=========================================================== */

let respuestas = {};
let datosGenerales = { medico: null };

/* ============================================================
   BLOQUES
=========================================================== */

const bloques = {
  form2: [
    { t: "¿El recinto cuenta con temperatura estable?", d: "Temperatura homogénea.", g: "muygrave" },
    { t: "¿Hay circulación de aire natural (ventilación cruzada)?", d: "Ventanas, flujo cruzado.", g: "leve" },
    { t: "¿El espacio posee aire acondicionado en funcionamiento?", d: "AA operativo.", g: "medio" },
    { t: "¿Posee ventiladores funcionando?", d: "Ventiladores operativos.", g: "leve" }
  ],
  form3: [
    { t: "¿La fachada principal está orientada al norte?", d: "Radiación controlable.", g: "medio" },
    { t: "¿La menor cantidad de aberturas se orientan al oeste?", d: "Menor carga térmica.", g: "medio" },
    { t: "¿El área permite acceso a personas con movilidad reducida?", d: "Rampas, accesos.", g: "grave" }
  ],
  form4: [
    { t: "¿El techo evita la transferencia de calor?", d: "Aislación térmica.", g: "grave" },
    { t: "¿El recinto posee planta superior?", d: "Reduce carga térmica.", g: "medio" }
  ],
  form5: [
    { t: "¿Posee toldos o elementos de sombra?", d: "Sombreado.", g: "leve" },
    { t: "¿Vegetación al norte?", d: "Sombra norte.", g: "medio" },
    { t: "¿Vegetación al oeste?", d: "Sombra oeste.", g: "medio" }
  ],
  form6: [
    { t: "¿Aberturas altas para salida de aire caliente?", d: "Ventilación.", g: "leve" },
    { t: "¿Posee tela mosquitera?", d: "Condición sanitaria.", g: "leve" }
  ],
  form7: [
    { t: "¿Disponibilidad de agua fría?", d: "Dispenser / heladera.", g: "muygrave" },
    { t: "¿Área de espera?", d: "Sillas, bancos.", g: "medio" },
    { t: "¿Preparado para energía solar?", d: "Espacio y estructura.", g: "medio" }
  ]
};

/* ============================================================
   MEJORAS
=========================================================== */

const mejoras = {
  "form2_1": { tipo: "MS", texto: ["Agregar ventilación cruzada o extractores."] },
  "form2_2": { tipo: "MR", texto: ["Instalar o reparar aire acondicionado."] },
  "form2_3": { tipo: "MR", texto: ["Instalar o reparar ventiladores."] },
  "form3_2": { tipo: "MR", texto: ["Adaptar ingreso para movilidad reducida."] },
  "form4_0": { tipo: "MS", texto: ["Cielorraso, aislación, pintura clara."] },
  "form5_0": { tipo: "MR", texto: ["Agregar toldos o cortinas."] },
  "form5_1": { tipo: "MS", texto: ["Agregar vegetación al norte."] },
  "form5_2": { tipo: "MS", texto: ["Agregar vegetación al oeste."] },
  "form6_1": { tipo: "MS", texto: ["Instalar tela mosquitera."] },
  "form7_0": { tipo: "MR", texto: ["Colocar dispenser de agua fría."] },
  "form7_1": { tipo: "MR", texto: ["Agregar sillas o bancos."] },
  "form7_2": { tipo: "MS", texto: ["Evaluar instalación solar."] }
};

/* ============================================================
   FORMULARIOS
=========================================================== */

function generarFormularios() {
  Object.entries(bloques).forEach(([id, preguntas]) => {
    const cont = document.getElementById(id);
    if (!cont) return;

    preguntas.forEach((p, i) => {
      cont.insertAdjacentHTML("beforeend", `
        <div class="pregunta">
          <strong>${p.t}</strong>
          <p class="explica">${p.d}</p>
          <div class="opciones">
            <button class="btn-resp btn-si" onclick="responder('${id}',${i},'si',this)">Sí</button>
            <button class="btn-resp btn-no-${p.g}" onclick="responder('${id}',${i},'no',this)">No</button>
          </div>
        </div>
      `);
    });
  });
}

function responder(b,i,v,btn){
  respuestas[`${b}_${i}`]=v;
  btn.parentElement.querySelectorAll(".btn-resp").forEach(b=>b.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
}

/* ============================================================
   SERVICIO MÉDICO
=========================================================== */

function setDatoGeneral(campo, valor, btn){
  datosGenerales[campo]=valor;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
}

/* ============================================================
   NAVEGACIÓN (DOM-DRIVEN)
=========================================================== */

function mostrarPaso(el){
  document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));
  el.classList.add("active");
}

function nextStep(){
  const actual=document.querySelector(".step.active");
  const next=actual.nextElementSibling;
  if(next && next.classList.contains("step")) mostrarPaso(next);
}

function prevStep(){
  const actual=document.querySelector(".step.active");
  const prev=actual.previousElementSibling;
  if(prev && prev.classList.contains("step")) mostrarPaso(prev);
}

/* ============================================================
   CAPACIDAD
=========================================================== */

function actualizarCapacidad(){
  const m2=parseFloat(document.getElementById("m2").value)||0;
  document.getElementById("capacidadTexto").innerHTML=
    `<strong>Personas permitidas:</strong> ${Math.floor(m2/3.5)}`;
}

/* ============================================================
   RESULTADO
=========================================================== */

function calcular(){
  actualizarCapacidad();
  document.getElementById("resultado").innerHTML="<h2>Resultado calculado correctamente</h2>";
  nextStep();
}

/* ============================================================
   INIT
=========================================================== */

document.addEventListener("DOMContentLoaded",()=>{
  generarFormularios();
  document.getElementById("m2").addEventListener("input",actualizarCapacidad);
});
