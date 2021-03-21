$(document).ready(function() {
  $('select').material_select();
});


let video = document.querySelector('#video');
let selectTag = document.querySelector('#camera-selector');
let audioTag = document.querySelector('#audio-selector');
let canvas = document.querySelector('#canvas');
let bigote = document.querySelector('#bigote');
let lentes = new Image();
let imageLoaded = false;
let ctracker = new clm.tracker();
const context = canvas.getContext('2d');

video.style.display = 'none';
bigote.style.display = 'none';

ctracker.init(pModel);
lentes.src= "images/lentes.png";
lentes.onload = function(){
  imageLoaded = true;
}
navigator.mediaDevices.enumerateDevices().then(devices=>{
devices.forEach
devices.forEach(device=>{
    if(device.kind != "videoinput") return;
    let optionTag = document.createElement("option");
    optionTag.innerHTML = device.label;
    optionTag.value = device.deviceId;
    selectTag.appendChild(optionTag);
  })
});
navigator.mediaDevices.enumerateDevices().then(devices=>{
devices.forEach
devices.forEach(device=>{
    if(device.kind != "audioinput") return;
    let optionTag = document.createElement("option");
    optionTag.innerHTML = device.label;
    optionTag.value = device.deviceId;
    audioTag.appendChild(optionTag);
  })
});
audioTag.addEventListener("change", function(ev){
  let deviceId = this.options[this.selectedIndex].value;
  start(deviceId);
})
selectTag.addEventListener("change", function(ev){
let deviceId = this.options[this.selectedIndex].value;
start(deviceId);
})

function start(deviceId = undefined){
  let constraints =  {
    video: {
      facingMode:"user", 
      deviceId:deviceId
    },
    audio: true
  }
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream=> {
      video.srcObject = stream;
      setTimeout(function(){
        ctracker.start(video);
        requestAnimationFrame(loop);
    },500)
  })
    .catch(err => console.log(err));
}
function drawImageRealTime(imagen,positions,modificadorWidth,modificadorHeight){
if(!positions.x.init || !positions.x.final || !positions.y.init || !positions.y.final)
return;
const x1 = positions.x.init[0] - modificadorWidth;
const x2 = positions.x.final[0] + modificadorWidth;

const y1 = positions.y.init[1] - modificadorHeight;
const y2 = positions.y.final[1] + modificadorHeight;

const width =  x2 - x1;
const height = y2 - y1;
context.drawImage(imagen, x1, y1, width, height);
}
function loop(){
context.drawImage (video,0,0,800,600);
//ctracker.draw(canvas);
let positions = ctracker.getCurrentPosition();
if(imageLoaded)
drawImageRealTime(lentes,{
  x:{
    init: positions[0],
    final: positions[14]
  },
  y:{
    init: positions[33],
    final: positions[41]
  }
},0,10);
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
requestAnimationFrame(loop);
}
start();