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
red:{ wavelength: 700, n: 1.513, color:'#ff4444' },
orange:{ wavelength: 600, n: 1.519, color:'#ff8c00' },
yellow:{ wavelength: 580, n: 1.52, color:'#ffd700' },
green: { wavelength: 550, n: 1.53, color:'#44ff44' },
blue: { wavelength: 450, n: 1.54, color:'#4444ff' },
violet:{ wavelength: 400, n: 1.56, color:'#8b44ff' }, };

function getDm(n)  {var A = prismAngle * Math.PI / 180;
var r = A / 2;
var sinE = n * Math.sin(r);

// if sinE is bigger than 1, there's no valid angle (TIR > total internal reflection)
if (Math.abs(sinE) > 1) { return null; }
var e = Math.asin(sinE);
return (2 * e - A) * 180 / Math.PI; }

function physicsFor(colorName) {
  var n = colors[colorName].n;
  var Dm = getDm(n);
  var nCalc = Dm !== null
    ? (Math.sin((prismAngle + Dm) / 2 * Math.PI / 180) / Math.sin(prismAngle / 2 * Math.PI / 180)).toFixed(4)
    : null;
  return { n: n, Dm: Dm, nCalc: nCalc };
}

// Single source of truth for the calc panel text — used by prismUpdate, prismColor, and render.
function updateCalc() {
  var refColor = selectedColor === 'white' ? 'yellow' : selectedColor;
  var phys = physicsFor(refColor);
  var Dm = phys.Dm;
  var nCalc = phys.nCalc !== null ? phys.nCalc : '—';
  var DmText = Dm !== null ? Dm.toFixed(2) + '°' : '—';
  var A = prismAngle;

  document.getElementById('prismCalc').innerHTML =
    '<span style="color:var(--green)">A</span> = ' + A + '°<br>' +
    '<span style="color:var(--amber)">D<sub>m</sub></span> = ' + DmText + '<br>' +
    '<span style="color:var(--cyan)">n</span> = sin((A+D<sub>m</sub>)/2) / sin(A/2) = ' + nCalc + '<br>' +
    '<span style="color:var(--text-mute)">Refractive index of glass</span>';
}

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
'<button onclick="prismRecord()">＋ Record D<sub>m</sub> for color</button>' +
'<div class="obs-list" id="prismObsList"></div>' +
'</div>';

window.prismUpdate = function() { prismAngle = parseInt(document.getElementById('prismAR').value);
rotationAngle = parseFloat(document.getElementById('prismRotR').value);
document.getElementById('prismA').textContent = prismAngle;
document.getElementById('prismRot').textContent = rotationAngle.toFixed(1);
updateCalc();
render(); };

// will run when a color button is clicked.
window.prismColor = function(c) {
  selectedColor = c;
  updateCalc();
  render();
};

var obsCount = 0;
window.prismRecord = function() {
  obsCount++;
  var refColor = selectedColor === 'white' ? 'yellow' : selectedColor;
  var phys = physicsFor(refColor);
  var Dm = phys.Dm;
  var nCalc = phys.nCalc !== null ? phys.nCalc : '—';
  var DmText = Dm !== null ? Dm.toFixed(1) : '—';

  var list = document.getElementById('prismObsList');
  var row = document.createElement('div');
  row.innerHTML = '<span>#' + obsCount + ' ' + refColor + ' A=' + prismAngle + '°</span><span>D<sub>m</sub>=' + DmText + '° n=' + nCalc + '</span>';
  list.appendChild(row);
  list.scrollTop = list.scrollHeight;
};

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

ctx.fillStyle = '#a8442e';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('PRISM SPECTROMETER', 20, 22);
ctx.fillStyle = '#8a8478';
ctx.font = '11px JetBrains Mono';
ctx.fillText('n = sin((A + Dm)/2) / sin(A/2)', 20, 38);

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
ctx.strokeStyle = '#6b7660';
ctx.lineWidth = 2;
ctx.beginPath();
for (var p2 = 0; p2 < pts.length; p2++) {
if (p2 === 0) { ctx.moveTo(pts[p2].x, pts[p2].y);} 
else { ctx.lineTo(pts[p2].x, pts[p2].y); }
}
ctx.closePath();
ctx.stroke();

// angle label at the apex of the prism
ctx.fillStyle = '#6b7660';
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

// Draw the incident ray ONCE. White light looks white before entering the prism;
// only draw it in a single color when a specific color is selected.
var incidentColor = selectedColor === 'white' ? '#ffffff' : colors[selectedColor].color;
drawRay(inStartX, inStartY, inEndX, inEndY, incidentColor, 1);

for (var idx = 0; idx < colorsToDraw.length; idx++) { var colorName = colorsToDraw[idx];
var col = colors[colorName];
var DmThisColor = getDm(col.n);

if (DmThisColor === null) { continue; }

var alpha;
if (selectedColor === 'white') {alpha = 0.85; } 
else { alpha = 1; }

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

// normal line at the entry face 
ctx.strokeStyle = 'rgba(255,255,255,0.2)';
ctx.lineWidth = 1;
ctx.setLineDash([4, 4]);
ctx.beginPath();
ctx.moveTo(inEndX - 20, inEndY - 30);
ctx.lineTo(inEndX + 20, inEndY + 30);
ctx.stroke();
ctx.setLineDash([]);
 
// dispersion diagram panel on the right side
var dx = 490;
var dy = 60;
ctx.fillStyle = '#e3dac8';
ctx.strokeStyle = 'rgba(27, 26, 23, 0.28)';
ctx.lineWidth = 1;
ctx.fillRect(dx, dy, 230, 220);
ctx.strokeRect(dx, dy, 230, 220);
ctx.fillStyle = '#a8442e';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('Dispersion Pattern', dx + 115, dy + 18);
ctx.textAlign = 'left';
 
// spectrum bar 
var specY = dy + 40;
var gradient = ctx.createLinearGradient(dx + 20, specY, dx + 210, specY);
gradient.addColorStop(0,'#ff4444');
gradient.addColorStop(0.3,'#ffd700');
gradient.addColorStop(0.5,'#44ff44');
gradient.addColorStop(0.8,'#4444ff');
gradient.addColorStop(1,'#8b44ff');
ctx.fillStyle = gradient;
ctx.fillRect(dx + 20, specY, 190, 18);
 
var colorNames2 = Object.keys(colors);
for (var j = 0; j < colorNames2.length; j++) {
var name = colorNames2[j];
var col2 = colors[name];
var lx = dx + 20 + j * 32;
 
ctx.fillStyle = col2.color;
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(name[0].toUpperCase(), lx, specY + 30);
 
var Dm2 = getDm(col2.n);
if (Dm2) { ctx.fillStyle = col2.color;
ctx.font = '9px JetBrains Mono';
ctx.fillText('n=' + col2.n, lx, specY + 42); } }
ctx.textAlign = 'left';
 
var refColor2;
if (selectedColor === 'white') { refColor2 = 'yellow'; } 
else { refColor2 = selectedColor; }
 
var phys = physicsFor(refColor2);
var Dm = phys.Dm;
var nStr = phys.nCalc !== null ? phys.nCalc : '—';
ctx.fill();
ctx.stroke();
 
ctx.fillStyle = '#a8442e';
ctx.font = '10px JetBrains Mono';
ctx.fillText('A = ' + prismAngle + '°', dx + 20, dy + 150);
 
var DmBoxText;
if (Dm !== null) { DmBoxText = Dm.toFixed(2) + '°'; }
else { DmBoxText = '—'; }
ctx.fillText('Dm = ' + DmBoxText, dx + 20, dy + 164);
 
ctx.fillStyle = '#9c7a3c';
ctx.font = 'bold 12px JetBrains Mono';
ctx.fillText('n = ' + nStr, dx + 20, dy + 182);
 
ctx.fillStyle = '#8a8478';
ctx.font = '9px JetBrains Mono';
ctx.fillText('sin((A+Dm)/2)/sin(A/2)', dx + 20, dy + 196);
 
ctx.fillStyle = '#e3dac8';
ctx.strokeStyle = '#a8442e';
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, H - 62, 440, 48, 8);
ctx.fill();
ctx.stroke();
 
var DmBottomText;
if (Dm) { DmBottomText = Dm.toFixed(1); } 
else { DmBottomText = 'Dm'; }
 
ctx.fillStyle = '#a8442e';
ctx.font = '11px JetBrains Mono';
ctx.fillText('n = sin((' + prismAngle + '+' + DmBottomText + ')/2) / sin(' + prismAngle + '/2)', 36, H - 42);
 
ctx.fillStyle = '#9c7a3c';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('n = ' + nStr + '  for ' + refColor2 + ' light', 36, H - 24);
 
var DmReading;
if (Dm !== null) { DmReading = Dm.toFixed(2); } 
else { DmReading = '—'; }
 
setReadings(readingEl, [ ['Prism angle A', prismAngle, '°'],
['Dm (min dev)', DmReading, '°'],
['n (refractive)', nStr, ''],
['Color', refColor2, ''],
]);
 
updateCalc(); }
 
function loop() { animT++;
render();
animId = requestAnimationFrame(loop); }
loop();
 
hintEl.textContent = 'Rotate prism with slider — find minimum deviation';
return function() { cancelAnimationFrame(animId); };
};