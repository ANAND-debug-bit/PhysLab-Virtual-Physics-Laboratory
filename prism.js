// prism spectrometer 2d simulation involving two sliders to change the angle of prism and rotation and 7 options to select light colour
window.mountPrism = function(wrap, readingEl, ctrlEl, hintEl) {
var W = 740;
var H = 380;
var canvas = makeCanvas(wrap, W, H);
var ctx = canvas.getContext('2d');

var prismAngle = 60;     
var rotationAngle = 30;  
var selectedColor = 'white';
var animT = 0;
var animId;

// #VIBGYOR
var colors = {
red:{ wavelength: 700, n: 1.513, color: '#ff4444' },
orange:{ wavelength: 600, n: 1.519, color: '#ff8c00' },
yellow:{ wavelength: 580, n: 1.523, color: '#ffd700' },
green: { wavelength: 550, n: 1.530, color: '#44ff44' },
blue: { wavelength: 450, n: 1.545, color: '#4444ff' },
violet:{ wavelength: 400, n: 1.558, color: '#8b44ff' },
};

function getDeviation(n) { var A = prismAngle * Math.PI / 180;
var r1 = Math.asin(Math.sin(rotationAngle * Math.PI / 180) / n);
var r2 = A - r1;

if (r2 < 0 || r2 > Math.PI / 2) { return null; }
var e = Math.asin(n * Math.sin(r2));
return (rotationAngle + e * 180 / Math.PI) - prismAngle; }

function getDm(n)  {var A = prismAngle * Math.PI / 180;
var r = A / 2;
var sinE = n * Math.sin(r);

// if sinE is bigger than 1, there's no valid angle (TIR)
if (Math.abs(sinE) > 1) { return null; }
var e = Math.asin(sinE);
return (2 * e - A) * 180 / Math.PI; }

// Building the row of color buttons one at a time with a plain for loop,
var colorNames = Object.keys(colors);
var colorButtonsHtml = '';
for (var i = 0; i < colorNames.length; i++) {
var cName = colorNames[i];
var cInfo = colors[cName];
var cLabel = cName.charAt(0).toUpperCase() + cName.slice(1);

colorButtonsHtml += '<button class="mode-btn" onclick="prismColor(\'' + cName + '\')" style="border-color:' + cInfo.color + ';color:' + cInfo.color + ';">' + cLabel + '</button>';
}

// Building the rest of the control panel 
ctrlEl.innerHTML = '<div class="ctrl-item">' +
'<label>Prism Angle A (°): <span id="prismA">60</span></label>' +
'<input type="range" id="prismAR" min="30" max="75" step="1" value="60" oninput="prismUpdate()" />' +
'</div>' + '<div class="ctrl-item">' +
'<label>Prism Rotation (°): <span id="prismRot">30</span></label>' +
'<input type="range" id="prismRotR" min="15" max="70" step="0.5" value="30" oninput="prismUpdate()" />' +
'</div>' +
'<div class="ctrl-item" style="margin-top:8px;">' +
'<label>Select Light Color:</label>' +
'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">' +
'<button class="mode-btn active" onclick="prismColor(\'white\')" style="background:rgba(255,255,255,0.15);border-color:#fff;">White</button>' +
colorButtonsHtml + '</div>' + '</div>' +
'<div style="margin-top:8px;padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;font-family:var(--font-mono);font-size:11px;line-height:1.9;">' +
'<div id="prismCalc"></div>' +
'</div>' + '<div class="obs-recorder">' +
'<button onclick="prismRecord()">＋ Record D_m for color</button>' +
'<div class="obs-list" id="prismObsList"></div>' +
'</div>';

window.prismUpdate = function() { prismAngle = parseInt(document.getElementById('prismAR').value);
rotationAngle = parseFloat(document.getElementById('prismRotR').value);
document.getElementById('prismA').textContent = prismAngle;
document.getElementById('prismRot').textContent = rotationAngle.toFixed(1);
updateCalc();
render(); };

// will run when a color button is clicked.
window.prismColor = function(c) { selectedColor = c;

var buttons = document.querySelectorAll('.ctrl-row .mode-btn');
for (var bi = 0; bi < buttons.length; bi++) { buttons[bi].classList.remove('active'); }
render(); };

function updateCalc() {
var refColor;
if (selectedColor === 'white') { refColor = 'yellow'; } 
else { refColor = selectedColor; }

var n = colors[refColor].n;
var Dm = getDm(n);
var A = prismAngle;

var nCalc;
if (Dm !== null) { nCalc = (Math.sin((A + Dm) / 2 * Math.PI / 180) / Math.sin(A / 2 * Math.PI / 180)).toFixed(4); }
else { nCalc = '—'; }

var DmText;
if (Dm !== null) { DmText = Dm.toFixed(2) + '°'; } 
else { DmText = '—'; }

document.getElementById('prismCalc').innerHTML =
'<span style="color:var(--green)">A</span> = ' + A + '°<br>' +
'<span style="color:var(--amber)">D_m</span> = ' + DmText + '<br>' +
'<span style="color:var(--cyan)">n</span> = sin((A+D_m)/2) / sin(A/2) = ' + nCalc + '<br>' +
'<span style="color:var(--text-mute)">Refractive index of glass</span>'; }

var obsCount = 0;
window.prismRecord = function() { obsCount++;
var refColor;
if (selectedColor === 'white') { refColor = 'yellow'; } 
else { refColor = selectedColor; }

var n = colors[refColor].n;
var Dm = getDm(n);
var A = prismAngle;

var nCalc;
if (Dm !== null) { nCalc = (Math.sin((A + Dm) / 2 * Math.PI / 180) / Math.sin(A / 2 * Math.PI / 180)).toFixed(4); }
else { nCalc = '—'; }

var DmText;
if (Dm) { DmText = Dm.toFixed(1); } 
else { DmText = '—'; }

var list = document.getElementById('prismObsList');
var row = document.createElement('div');
row.innerHTML = '<span>#' + obsCount + ' ' + refColor + ' A=' + A + '°</span><span>D_m=' + DmText + '° n=' + nCalc + '</span>';
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

var prismCX = 320;
var prismCY = 200;
var prismSize = 100;

function getPrismPoints() { var A = prismAngle * Math.PI / 180;
var baseAngle = (Math.PI - A) / 2;
var h = prismSize;
return [ { x: prismCX, y: prismCY - h * 0.6 },
{ x: prismCX - h * Math.sin(baseAngle) * 0.8, y: prismCY + h * 0.4 },
{ x: prismCX + h * Math.sin(baseAngle) * 0.8, y: prismCY + h * 0.4 },
]; }

function drawRay(x1, y1, x2, y2, color, alpha) { ctx.globalAlpha = alpha;
ctx.strokeStyle = color;
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.stroke();
ctx.globalAlpha = 1; }

// Drawing the whole scene: the prism, the rays, the dispersion panel, and the formula boxes.
function render() {
ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, W, H);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('PRISM SPECTROMETER', 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('n = sin((A + D_m)/2) / sin(A/2)', 20, 38);

var pts = getPrismPoints();

ctx.fillStyle = 'rgba(100,223,223,0.08)';
ctx.beginPath();
for (var p = 0; p < pts.length; p++) {
if (p === 0) { ctx.moveTo(pts[p].x, pts[p].y); } 
else { ctx.lineTo(pts[p].x, pts[p].y); }
}
ctx.closePath();
ctx.fill();

// drawing the prism outline the same way
ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 2;
ctx.beginPath();
for (var p2 = 0; p2 < pts.length; p2++) {
if (p2 === 0) { ctx.moveTo(pts[p2].x, pts[p2].y);} 
else { ctx.lineTo(pts[p2].x, pts[p2].y); }
}
ctx.closePath();
ctx.stroke();

// angle label at the apex of the prism
ctx.fillStyle = '#64dfdf';
ctx.font = 'bold 12px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('A=' + prismAngle + '°', pts[0].x, pts[0].y - 14);
ctx.textAlign = 'left';

var inStartX = 60;
var inStartY = 180;
var inEndX = pts[1].x + (pts[0].x - pts[1].x) * 0.4;
var inEndY = pts[1].y + (pts[0].y - pts[1].y) * 0.4;

//color selection responses    
var colorsToDraw;
if (selectedColor === 'white') { colorsToDraw = Object.keys(colors); } 
else { colorsToDraw = [selectedColor]; }

for (var idx = 0; idx < colorsToDraw.length; idx++) { var colorName = colorsToDraw[idx];
var col = colors[colorName];
var DmThisColor = getDm(col.n);

if (DmThisColor === null) { continue; }

var alpha;
if (selectedColor === 'white') {alpha = 0.85; } 
else { alpha = 1; }

// Incident ray before entering the prism
drawRay(inStartX, inStartY, inEndX, inEndY, col.color, alpha);

//refraction of ray inside the prism 
var midX = prismCX - 5;
var midY = prismCY;
drawRay(inEndX, inEndY, midX, midY, col.color, alpha * 0.5);

// emergent ray      
var exitOffset;
if (selectedColor === 'white') { exitOffset = (idx - 2.5) * 8; } 
else { exitOffset = 0; }

var exitDev = DmThisColor + exitOffset * 0.3;
var exitLen = 150;
var exitAngle = (90 - exitDev) * Math.PI / 180;
var exitX = pts[2].x - (pts[2].x - pts[0].x) * 0.4;
var exitY = pts[2].y - (pts[2].y - pts[0].y) * 0.4;
var outX = exitX + exitLen * Math.cos(exitAngle);
var outY = exitY - exitLen * Math.sin(exitAngle) + exitOffset;

drawRay(exitX, exitY, outX, outY, col.color, alpha);

if (selectedColor !== 'white') { ctx.fillStyle = col.color;
ctx.font = '10px JetBrains Mono';
ctx.fillText('D=' + DmThisColor.toFixed(1) + '°', outX + 4, outY); } }

   