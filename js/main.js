// Una vez que cargue el contenido del content, inicializa las etiquetas select de Materialize
document.addEventListener('DOMContentLoaded', function() { 
  elems = document.querySelectorAll('select');
  M.FormSelect.init(elems);
});


let video = document.querySelector('#video'); // Seleccionar la etiqueta vídeo.
let cameraTag = document.querySelector('#cameraSelector'); // Drowpdown de opciones de cámara.
let audioTag = document.querySelector('#audioSelector'); // Drowpdown de opciones de micrófono.
let canvas = document.querySelector('#canvas'); // Seleccionamos el elementos canvas para dibujar elementos gráficos.
const context = canvas.getContext('2d'); // Más información https://developer.mozilla.org/es/docs/Web/API/HTMLCanvasElement/getContext
let bigote = document.querySelector('#bigote'); // Seleccionamos la imagen del bigote, que está oculta (alternativa)
let lentes = new Image(); // Creación de una imagen por JS.
let imageLoaded = false; // Bandera que nos indica si la imagen de lentes cargó exitosamente.
let ctracker = new clm.tracker(); // Instanciamos el objeto ctracker, librería de face tracking, Más info: https://www.auduno.com/clmtrackr/docs/reference.html

video.style.display = 'none'; // Ocultamos el vídeo.

ctracker.init(); // Inicializando el objeto del face tracking
lentes.src= "images/lentes.png"; // Pasamos la ruta relativa del asset.

lentes.onload = function() {
  imageLoaded = true; // Habilita el redibujado en tiempo real de los lentes.
}

// Listar las cámaras existentes en el select de cameraSelector.
navigator.mediaDevices.enumerateDevices().then(devices => {
  devices.forEach(device => {
    if(device.kind != "videoinput") return;
    let optionTag = document.createElement("option");
    optionTag.innerHTML = device.label;
    optionTag.value = device.deviceId;
    cameraTag.appendChild(optionTag);
  });
});

// Listar los microfónos existentes en el select de audioSelector.
navigator.mediaDevices.enumerateDevices().then(devices => {
  devices.forEach(device => {
    if(device.kind != "audioinput") return;
    let optionTag = document.createElement("option");
    optionTag.innerHTML = device.label;
    optionTag.value = device.deviceId;
    audioTag.appendChild(optionTag);
  })
  M.FormSelect.init(elems); // Redibujamos los select.
});

// Cada vez que se haga un cambio en el select se cambiará de cámara.
cameraTag.addEventListener("change", function(ev) {
  let deviceId = this.options[this.selectedIndex].value;
  start(deviceId);
});

// Función que inicializa la webcam y el redibujado.
function start(deviceId = undefined) {
  let constraints =  {
    video: {
      facingMode:"user", // Vista frontal
      deviceId: deviceId, // id del dispositivo de vídeo a utilizar
    },
    audio: false
  }
  navigator.mediaDevices.getUserMedia(constraints) // Obtiene el stream de datos de la webcam.
    .then(stream => {
        video.srcObject = stream;
        setTimeout( () => {
          ctracker.start(video); // Inicializar objeto.
          requestAnimationFrame(loop); // Función que solicita realizar una animación para el repintado de la ventana. El método acepta como argumento una función a la que llamar antes de efectuar el repintado.
      },500) // Tiempo de espera para carga los datos de la webcam y luego ejecutar.
    }).catch(err => console.log(err));
}

function drawImageRealTime(imagen, positions, modificadorWidth, modificadorHeight) {
  if( !positions.x.init || !positions.x.final || !positions.y.init || !positions.y.final ) // Si no se escanearon bien las posiciones, sale de la función.
    return;
  
  const x1 = positions.x.init[0] - modificadorWidth; // Posición x inicial (imagen)
  const x2 = positions.x.final[0] + modificadorWidth; // Posición x final (imagen)

  const y1 = positions.y.init[1] - modificadorHeight; // Posición y inicial (imagen)
  const y2 = positions.y.final[1] + modificadorHeight; // Posición y final (imagen)

  const width =  x2 - x1; // Punto x final - Punto x inicial para obtener el ancho a redibujar del objeto.
  const height = y2 - y1; // Punto y final - Punto t inicial para obtener el alto a redibujar del objeto.

  context.drawImage(imagen, x1, y1, width, height); // Redibujamos la imagen en el contexto del canvas.
}

function loop() { // Función que se va ejecutar indefinidamente.
  context.drawImage(video,0,0,800,600);  // Estado inicial del vídeo de la webcam del canvas.
  let positions = ctracker.getCurrentPosition(); // Obtener las posiciones actuales (Retorna un arreglo de arreglos con posiciones).
  if (imageLoaded) {

    // Redibujamos la imagen de los lentes, las posiciones de los arreglos fueron obtenidas de la documentación de la librería ctracker.js 
    drawImageRealTime(lentes,{
      x: {
        init: positions[0],
        final: positions[14]
      },
      y: {
        init: positions[33],
        final: positions[41]
      }
    },0,10);

     // Redibujamos la imagen del bigote.
    drawImageRealTime(bigote,{
      x:{
        init: positions[44],
        final: positions[50]
      },
      y:{
        init: positions[37],
        final: positions[47]
      }
    },20,40);
  }  
  requestAnimationFrame(loop); // Loop
}

start(); // Llamamos a la función start para comenzar a pedir permiso de uso de la webcam o micrófono.
