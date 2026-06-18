// spherometer 2d interactive modal with controls invloving [changing sagitta h , leg distance l](in millimeters) and h value type 
window.mountSpherometer = function (wrap, readingEl, ctrlEl, hintEl) {

var canvasWidth = 740;
var canvasHeight = 340;
var canvas = makeCanvas(wrap, canvasWidth, canvasHeight);
var ctx = canvas.getContext('2d');
var h = 1.2;  
var l = 40;   

// building the little control panel: two sliders + one number box
  ctrlEl.innerHTML = '<div class="ctrl-item">' +
'  <label>Sagitta h (mm): <span id="spH">1.20</span></label>' +
'  <input type="range" id="spHRange" min="0.1" max="8" step="0.01" value="1.2" oninput="spUpdate()" />' + '</div>' + '<div class="ctrl-item">' +
' <label>Leg distance l (mm): <span id="spL">40.0</span></label>' +
' <input type="range" id="spLRange" min="20" max="80" step="0.5" value="40" oninput="spUpdate()" />' + '</div>' + '<div class="ctrl-item">' +
'  <label>h value (type)</label>' + '  <input type="number" id="spHtype" min="0.1" max="8" step="0.01" value="1.2" oninput="spTypeUpdate()" />' +
'</div>';
 
// runs every time one of the sliders is moved
window.spUpdate = function () { h = parseFloat(document.getElementById('spHRange').value);
l = parseFloat(document.getElementById('spLRange').value);
document.getElementById('spH').textContent = h.toFixed(2);
document.getElementById('spL').textContent = l.toFixed(1);
document.getElementById('spHtype').value = h;
render();
};
 
window.spTypeUpdate = function () { var typedValue = parseFloat(document.getElementById('spHtype').value);
 if (!typedValue) { typedValue = 0.1; }
h = typedValue;
document.getElementById('spHRange').value = h;
document.getElementById('spH').textContent = h.toFixed(2);
 
render();
};
 
// spherometer formula---> R = l^2 / (6 * h) + h / 2
function calcR() { var firstPart = (l * l) / (6 * h); var secondPart = h / 2;
return firstPart + secondPart; }
function render() { ctx.clearRect(0, 0, canvasWidth, canvasHeight);
ctx.fillStyle = '#0d1e35'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('SPHEROMETER', 20, 22);
 
ctx.fillStyle = '#4A6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('R = l² / (6h) + h/2', 20, 38);
var R = calcR();
 
var cx = 380;
var cy = 180;
var scale = 3;
var Rpx = R * scale;
var chordWidth = l * scale; // how wide the curved surface looks on screen
 
// drawing the curved surface as an arc
ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 2;
ctx.beginPath();
var startAngle = Math.asin(chordWidth / 2 / Rpx);
ctx.arc(cx, cy + Rpx - h * scale, Rpx, Math.PI + startAngle, -startAngle);
ctx.stroke();
 
var legAngles = [90, 210, 330];
var legRadius = l * scale * 0.58;
var legs = [];
for (var i = 0; i < legAngles.length; i++) { var angleInRadians = legAngles[i] * Math.PI / 180;
var legX = cx + legRadius * Math.cos(angleInRadians);
var legY = cy + legRadius * 0.4 * Math.sin(angleInRadians);
legs.push({ x: legX, y: legY });
}
 
    
ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1.5;
ctx.beginPath();
for (var j = 0; j < legs.length; j++) { if (j === 0) { ctx.moveTo(legs[j].x, legs[j].y); }
else { ctx.lineTo(legs[j].x, legs[j].y); }
}
ctx.closePath();
ctx.fill();
ctx.stroke();
for (var k = 0; k < legs.length; k++) { ctx.fillStyle = '#2ee59d'; ctx.beginPath();
ctx.arc(legs[k].x, legs[k].y, 5, 0, Math.PI * 2); ctx.fill();
}
 
var screwTop = cy - h * scale * 4;
ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(cx, screwTop);
ctx.lineTo(cx, cy + h * scale);
ctx.stroke();
 
ctx.fillStyle = '#ffb347';
ctx.beginPath();
ctx.arc(cx, cy + h * scale, 5, 0, Math.PI * 2);
ctx.fill();
 
ctx.strokeStyle = '#ff6b6b';
ctx.lineWidth = 1;
ctx.setLineDash([3, 3]);
ctx.beginPath();
ctx.moveTo(cx + 15, cy);
ctx.lineTo(cx + 15, cy + h * scale);
ctx.stroke();
ctx.setLineDash([]);
 
ctx.fillStyle = '#ff6b6b';
ctx.font = 'bold 11px JetBrains Mono';
ctx.fillText('h=' + h.toFixed(2) + 'mm', cx + 20, cy + (h * scale) / 2 + 4);