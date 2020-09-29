/*
remotedebug_ios_webkit_adapter --port=9000
chrome://inspect/#devices
*/
var video = document.getElementById('video');

document.getElementById("btn_inicio_camara").addEventListener("click", function( event ) {
  video.play();
  console.log("Ejecución: play()");
}, false);

function startVideo(){
  console.log("Ejecución: módulos cargados - startVideo()");
  if(getUserMedia){

    var facingMode = "user";//{ audio: true, video: { facingMode: { exact: "environment" } } } , { facingMode: facingMode}
    var constraints = {
      audio: false,
      video: true
    }
        
    navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
      video.srcObject = stream;
      console.log("Ejecución: Stream");

    }).catch(function(err) {
      console.log("El dispositivo no soporta getUserMedia");
    });
  }
  else{

  }
}

function getUserMedia(){

  return !!(navigator.getUserMedia || 
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia || 
    navigator.mediaDevices.getUserMedia);
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models')

]).then(startVideo).catch(reason => { console.log("Ejecución: promiseAll catch", reason)});

video.addEventListener('play',() => {
  console.log("Ejecución: addEventListener play");
  const canvas = faceapi.createCanvasFromMedia(video);
  //document.body.append(canvas);
  document.getElementById("contenedor").appendChild(canvas);
  const displaySize = {width:video.width,height: video.height};
  faceapi.matchDimensions(canvas,displaySize);
  setInterval(async () => {
    console.log("Ejecución: interval");
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    //.withAgeAndGender();
    const resizeDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizeDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections);    
    /*
    resizeDetections.forEach( detection => {
      const box = detection.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
      drawBox.draw(canvas)
    })
    */

  }, 500);

  
});
