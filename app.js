/* ============================================================
   APP.JS — DEFINICIONES GENERALES
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
   FORMULARIOS
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
          <button class="btn-resp btn-si" onclick="seleccionarRespuesta('${id}',${i},'si',this)">Sí</button>
          <button class="btn-resp btn-no-${p.g}" onclick="seleccionarRespuesta('${id}',${i},'no',this)">No</button>
        </div>`;
      cont.appendChild(div);
    });
  });
}
generarFormularios();

/* ============================================================
   RESPUESTAS
=========================================================== */

function seleccionarRespuesta(b,i,v,bn){
  respuestas[`${b}_${i}`]=v;
  bn.parentElement.querySelectorAll(".btn-resp").forEach(x=>x.classList.remove("seleccionado"));
  bn.classList.add("seleccionado");
}

function setDatoGeneral(c,v,b){
  datosGenerales[c]=v;
  b.parentNode.querySelectorAll("button").forEach(x=>x.classList.remove("seleccionado"));
  b.classList.add("seleccionado");
}

/* ============================================================
   NAVEGACIÓN
=========================================================== */

let pasoActual=1;
function mostrarPaso(n){
  document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));
  document.getElementById("step"+n).classList.add("active");
}
function nextStep(){pasoActual++;mostrarPaso(pasoActual);}
function prevStep(){pasoActual--;mostrarPaso(pasoActual);}

/* ============================================================
   CAPACIDAD
=========================================================== */

document.getElementById("m2").addEventListener("input",()=>{
  const m2=parseFloat(m2.value)||0;
  capacidadTexto.innerHTML=`<strong>Personas permitidas:</strong> ${Math.floor(m2/3.5)}`;
});

/* ============================================================
   LÓGICAS
=========================================================== */

function obtenerGravedadFinal(b,i,v){
  if(b==="form7"&&i===0) return v==="si"?"bueno":"muygrave";
  if(b==="form5") return v==="si"?"bueno":"leve";
  return v==="si"?"bueno":bloques[b][i].g;
}

/* ============================================================
   CLASIFICACIÓN
=========================================================== */

function clasificarPunto(){
  let muy=0,gra=0,med=0,lev=0,buenas=0;
  Object.keys(respuestas).forEach(k=>{
    const[g,i]=k.split("_");
    const gr=obtenerGravedadFinal(g,+i,respuestas[k]);
    if(gr==="bueno")buenas++;
    if(gr==="muygrave")muy++;
    if(gr==="grave")gra++;
    if(gr==="medio")med++;
    if(gr==="leve")lev++;
  });
  if(respuestas["form7_0"]==="no"||buenas<4||muy>=1||gra>=4||med>=6||lev>=7)
    return{estado:"rojo",muy,gra,med,lev,buenas};
  if(gra>=2||med>=3||lev>=4)
    return{estado:"amarillo",muy,gra,med,lev,buenas};
  return{estado:"verde",muy,gra,med,lev,buenas};
}

/* ============================================================
   IMÁGENES
=========================================================== */

function manejarImagen(input){
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    imagenesCargadas.push(e.target.result);
    mostrarImagenes();
  };
  reader.readAsDataURL(file);
}

function mostrarImagenes(){
  const cont=document.getElementById("imagenesPreview");
  cont.innerHTML="";
  imagenesCargadas.forEach(src=>{
    const img=document.createElement("img");
    img.src=src;
    img.style.maxWidth="150px";
    img.style.margin="5px";
    cont.appendChild(img);
  });
}

/* ============================================================
   INFORME FINAL
=========================================================== */

function calcular() {

  const clasif = clasificarPunto();
  let { estado, muy, gra, med, lev, buenas } = clasif;

  let m2 = parseFloat(document.getElementById("m2").value) || 0;
  let capacidad = Math.floor(m2 / 3.5);

  let html = `
  <h2>${
    estado === "rojo" ? "🟥 Área NO apta como área climatizada" :
    estado === "amarillo" ? "🟡 Área climatizada con mejoras necesarias" :
    "🟢 Área climatizada apta"
  }</h2>

  <p><strong>Área total:</strong> ${m2} m²</p>
  <p><strong>Personas permitidas:</strong> ${capacidad}</p>

  <hr>

  <h3>Datos generales del relevamiento</h3>
  <p><strong>Área:</strong> ${document.getElementById("nombre").value}</p>
  <p><strong>Responsable:</strong> ${document.getElementById("persona").value}</p>
  <p><strong>Días:</strong> ${document.getElementById("dias").value}</p>
  <p><strong>Horarios:</strong> ${document.getElementById("horarios").value}</p>
  <p><strong>Servicio médico (107):</strong>
    ${datosGenerales.medico ? datosGenerales.medico.toUpperCase() : "NO DECLARADO"}
  </p>

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

    bloques[b].forEach((pregunta, idx) => {
      let key = `${b}_${idx}`;
      let valor = respuestas[key];

      if (!valor) {
        html += `<p><strong>${pregunta.t}</strong><br>Sin respuesta</p>`;
        return;
      }

      let gravedad = obtenerGravedadFinal(b, idx, valor);

      let emoji =
        gravedad === "muygrave" ? "🚨" :
        gravedad === "grave"    ? "🔴" :
        gravedad === "medio"    ? "🟠" :
        gravedad === "leve"     ? "🟡" : "🟢";

      html += `
        <p>
          <strong>${pregunta.t}</strong><br>
          Respuesta: ${valor.toUpperCase()} — ${gravedad.toUpperCase()} ${emoji}<br>
          <small>${pregunta.d}</small>
        </p>
      `;
    });

    html += `<hr>`;
  });

  html += `
    <h3>Comentarios adicionales</h3>
    <div id="comentariosTexto"></div>

    <h3>Registro fotográfico</h3>
    <div id="imagenesPreview"></div>
  `;

  document.getElementById("resultado").innerHTML = html;

  // Pasamos el texto del textarea al div imprimible
  const txt = document.getElementById("comentarios").value || "— Sin comentarios —";
  document.getElementById("comentariosTexto").innerHTML = txt.replace(/\n/g, "<br>");

  // Mostramos imágenes ya cargadas
  mostrarImagenes();

  nextStep();
}
/* ============================================================
   PDF
=========================================================== */

function descargarPDF() {

  const contenido = document.getElementById("resultado").innerHTML;

  const ventana = window.open("", "_blank");
  ventana.document.write(`
    <html>
    <head>
      <title>Áreas Climatizadas CBA</title>

      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">

      <style>
        body {
          font-family: 'Public Sans', sans-serif;
          padding: 20px;
          color: #222;
          line-height: 1.5;
        }
        h3 {
          border-bottom: 2px solid #ddd;
        }
        img {
          max-width: 100%;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>${contenido}</body>
    </html>
  `);

  ventana.document.close();
  ventana.print();
}
