// spherometer 2d interactive modal with controls invloving [changing sagitta h , leg distance l](in millimeters) and h value type 
window.mountSpherometer = function (wrap, readingEl, ctrlEl, hintEl) {

var canvasWidth = 740;
var canvasHeight = 340;
var canvas = makeCanvas(wrap, canvasWidth, canvasHeight);
var ctx = canvas.getContext('2d');

  
  var h = 1.2;  
  var l = 40;   

  