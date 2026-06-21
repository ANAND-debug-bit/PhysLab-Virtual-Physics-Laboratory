// ohm's law with a slider involving for changing the resistance , an option to manually change the voltage ,option to regard the v-i reading with a graph depicting on time change in dataset values and a slider for rheostat  
window.mountOhm = function(wrap, readingEl, ctrlEl, hintEl) {
var W = 740;
var H = 360;
var canvas = makeCanvas(wrap, W, H);
var ctx = canvas.getContext('2d');

var voltage = 3.0;     
var resistance = 10;    
var isDragging = false;
var dragStartX = 0;
var dragStartV = 0;

var observations = [];
var obsCount = 0;

ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Resistance R (Ω): <span id="ohmR">10</span></label>
<input type="range" id="ohmRR" min="2" max="50" step="1" value="10" oninput="ohmUpdateR()" />
</div>
<div style="font-size:12px;color:var(--text-mute);margin-bottom:6px;" id="ohmDragHint">← Drag rheostat slider on canvas →</div>
<div class="ctrl-item">
<label>Or type Voltage (V):</label>
<input type="number" id="ohmV" min="0.5" max="12" step="0.5" value="3" oninput="ohmTypeV()" />
</div>
<div class="obs-recorder">
<button onclick="ohmRecord()">＋ Record V-I Reading</button>
<div class="obs-list" id="ohmObsList"></div>
</div> `;

// runs when the resistance slider moves.
window.ohmUpdateR = function() { resistance = parseInt(document.getElementById('ohmRR').value);
document.getElementById('ohmR').textContent = resistance;
render(); };

// runs when someone types a voltage value directly into the box.
window.ohmTypeV = function() { var typedValue = parseFloat(document.getElementById('ohmV').value);
if (!typedValue) { typedValue = 1; }
voltage = Math.max(0.5, Math.min(12, typedValue));
render(); };

// record V-I Reading
window.ohmRecord = function() { obsCount++;
var I = voltage / resistance;
observations.push({ V: voltage, I: I });

var list = document.getElementById('ohmObsList');
var row = document.createElement('div');
row.innerHTML = '<span>#' + obsCount + ' V=' + voltage.toFixed(1) + 'V R=' + resistance + 'Ω</span><span>I=' + I.toFixed(3) + 'A</span>';
list.appendChild(row);
list.scrollTop = list.scrollHeight;
render(); };

var GX = 420;
var GY = 50;
var GW = 290;
var GH = 210;

var RHEO_X = 60;
var RHEO_Y = 290;
var RHEO_W = 300;

function render() { ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, W, H);

var I = voltage / resistance;

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText("OHM'S LAW", 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('V = IR  |  Slope of V-I graph = R', 20, 38);

// drawing circuit , rheostat slider and the v-i graph
drawCircuit(I);
drawRheostat();
drawGraph(I);

ctx.fillStyle = '#112240';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, H - 58, 370, 44, 8);
ctx.fill();
ctx.stroke();

ctx.fillStyle = '#2ee59d';
ctx.font = '11px JetBrains Mono';
ctx.fillText('V = ' + voltage.toFixed(2) + ' V  |  R = ' + resistance + ' Ω', 36, H - 38);

ctx.fillStyle = '#ffb347';
ctx.font = 'bold 14px JetBrains Mono';
ctx.fillText('I = V/R = ' + I.toFixed(4) + ' A = ' + (I * 1000).toFixed(2) + ' mA', 36, H - 18);

setReadings(readingEl, [
['Voltage V', voltage.toFixed(2), 'V'],
['Resistance R', resistance, 'Ω'],
['Current I', I.toFixed(4), 'A'],
['Power P', (voltage * I).toFixed(3), 'W'],
]); }

// Draws the battery, wires, ammeter, resistor, voltmeter, and the rheostat symbol
function drawCircuit(I) { var bx = 60;
var by = 160;

//describing the wire loop
var pts = [
[bx + 30, by],      
[200, by],           
[200, by],           
[280, by],           
[280, by],           
[280, by + 80],      
[bx + 30, by + 80], 
[bx + 30, by],];

ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 2;

ctx.beginPath();
ctx.moveTo(bx + 30, by);
ctx.lineTo(340, by);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(340, by);
ctx.lineTo(340, by + 80);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(340, by + 80);
ctx.lineTo(bx + 30, by + 80);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(bx + 30, by + 80);
ctx.lineTo(bx + 30, by);
ctx.stroke();

// animating the current flow as little dashes moving around the loop
var dashOffset = (Date.now() / 80) % 20;
ctx.strokeStyle = 'rgba(46,229,157,0.5)';
ctx.lineWidth = 4;
ctx.setLineDash([6, 14]);
ctx.lineDashOffset = -dashOffset;
ctx.beginPath();
ctx.moveTo(bx + 30, by);
ctx.lineTo(340, by);
ctx.lineTo(340, by + 80);
ctx.lineTo(bx + 30, by + 80);
ctx.lineTo(bx + 30, by);
ctx.stroke();
ctx.setLineDash([]);
ctx.lineDashOffset = 0;

//battery
ctx.fillStyle = '#233d5c';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1.5;
ctx.fillRect(bx - 10, by - 30, 40, 110);
ctx.strokeRect(bx - 10, by - 30, 40, 110);

for (var i = 0; i < 3; i++) { var ty = by - 20 + i * 30;

if (i % 2 === 0) { ctx.strokeStyle = '#ffb347';}
else { ctx.strokeStyle = '#64dfdf'; }

ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(bx - 5, ty);
ctx.lineTo(bx + 25, ty);
ctx.stroke();

ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(bx + 2, ty + 8);
ctx.lineTo(bx + 18, ty + 8);
ctx.stroke();
}

ctx.fillStyle = '#ffb347';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('+', bx + 10, by - 34);
ctx.fillStyle = '#64dfdf';
ctx.fillText('−', bx + 10, by + 96);
ctx.fillStyle = '#8ba3c0';
ctx.font = '10px JetBrains Mono';
ctx.fillText('EMF', bx + 10, by + 110);
ctx.fillText(voltage.toFixed(1) + 'V', bx + 10, by + 122);
ctx.textAlign = 'left';

// ammeter
var ax = 175;
var ay = by;
ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.arc(ax, ay, 18, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

ctx.fillStyle = '#ffb347';
ctx.font = 'bold 13px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('A', ax, ay + 5);
ctx.fillStyle = '#8BA3C0';
ctx.font = '10px JetBrains Mono';
ctx.fillText((I * 1000).toFixed(1) + 'mA', ax, ay + 32);
ctx.textAlign = 'left';

// resistor
var rx = 230;
var ry = by - 12;
ctx.fillStyle = '#233d5c';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
ctx.fillRect(rx, ry, 70, 24);
ctx.strokeRect(rx, ry, 70, 24);

// zigzag line inside the resistor box
ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 1.5;
ctx.beginPath();
for (var z = 0; z <= 7; z++) { var tx = rx + 5 + z * 8;

var ty2;
if (z % 2 === 0) { ty2 = ry + 5; }
else { ty2 = ry + 19; }

if (z === 0) { ctx.moveTo(tx, ty2); }
else { ctx.lineTo(tx, ty2); } }
ctx.stroke();

ctx.fillStyle = '#2ee59d';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(resistance + 'Ω', rx + 35, ry - 6);
ctx.textAlign = 'left';

// voltmeter
var vx2 = 265;
var vy2 = by + 80;
ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 1;
ctx.setLineDash([3, 3]);
ctx.beginPath();
ctx.moveTo(230, by);
ctx.lineTo(230, vy2 + 40);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(300, by);
ctx.lineTo(300, vy2 + 40);
ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.arc(vx2, vy2 + 40, 18, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

ctx.fillStyle = '#64dfdf';
ctx.font = 'bold 13px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('V', vx2, vy2 + 45);
ctx.fillStyle = '#8ba3c0';
ctx.font = '10px JetBrains Mono';
ctx.fillText(voltage.toFixed(2) + 'V', vx2, vy2 + 70);
ctx.textAlign = 'left';

// rheostat symbol
var rhX = 340;
var rhY = by;
ctx.fillStyle = '#233d5c';
ctx.strokeStyle = '#a855f7';
ctx.lineWidth = 1.5;
ctx.fillRect(rhX - 10, rhY - 10, 20, 20);
ctx.strokeRect(rhX - 10, rhY - 10, 20, 20);
ctx.fillStyle = '#a855f7';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('RH', rhX, rhY - 14);
ctx.textAlign = 'left';
requestAnimationFrame(render);
  }

  // Drawing the rheostat slider track 
function drawRheostat() { ctx.fillStyle = '#162844';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1.5;
ctx.fillRect(RHEO_X, RHEO_Y, RHEO_W, 16);
ctx.strokeRect(RHEO_X, RHEO_Y, RHEO_W, 16);

var knobX = RHEO_X + ((voltage - 0.5) / 11.5) * RHEO_W;
ctx.fillStyle = '#2ee59d';
ctx.strokeStyle = '#0a1628';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(knobX, RHEO_Y + 8, 12, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

ctx.fillStyle = '#0a1628';
ctx.font = 'bold 9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(voltage.toFixed(1), knobX, RHEO_Y + 12);
ctx.textAlign = 'left';

ctx.fillStyle = '#8ba3c0';
ctx.font = '10px JetBrains Mono';
ctx.fillText('0.5V', RHEO_X - 4, RHEO_Y + 30);
ctx.textAlign = 'right';
ctx.fillText('12V', RHEO_X + RHEO_W + 4, RHEO_Y + 30);
ctx.textAlign = 'left';

ctx.fillStyle = '#a855f7';
ctx.font = '11px JetBrains Mono';
ctx.fillText('RHEOSTAT — drag to vary voltage', RHEO_X, RHEO_Y - 8); }

  // Drawing the v-i graph
function drawGraph(I) { ctx.fillStyle = '#112240';
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
ctx.fillRect(GX, GY, GW, GH);
ctx.strokeRect(GX, GY, GW, GH);
  
ctx.strokeStyle = 'rgba(30,58,95,0.8)';
ctx.lineWidth = 1;
for (var i = 1; i < 5; i++) { var gy = GY + (GH / 5) * i;
ctx.beginPath();
ctx.moveTo(GX, gy);
ctx.lineTo(GX + GW, gy);
ctx.stroke(); }

for (var j = 1; j < 6; j++) { var gx = GX + (GW / 6) * j;
ctx.beginPath();
ctx.moveTo(gx, GY);
ctx.lineTo(gx, GY + GH);
ctx.stroke(); }

ctx.fillStyle = '#8ba3c0';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
for (var xi = 0; xi <= 6; xi++) { var gxLabel = GX + (GW / 6) * xi;
var Ival = (xi * 200).toFixed(0);
ctx.fillText(Ival + 'mA', gxLabel, GY + GH + 14); }

ctx.textAlign = 'right';
for (var yi = 0; yi <= 5; yi++) { var gyLabel = GY + GH - (GH / 5) * yi;
ctx.fillText((yi * 2.4).toFixed(1) + 'V', GX - 4, gyLabel + 4); }
ctx.textAlign = 'left';

ctx.fillStyle = '#64dfdf';
ctx.font = '11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('Current I (mA)', GX + GW / 2, GY + GH + 28);

ctx.save();
ctx.translate(GX - 44, GY + GH / 2);
ctx.rotate(-Math.PI / 2);
ctx.fillText('Voltage V (V)', 0, 0);
ctx.restore();

ctx.strokeStyle = 'rgba(46,229,157,0.25)';
ctx.lineWidth = 1.5;
ctx.beginPath();
var firstPoint = true;
for (var Iv = 0; Iv <= 1.2; Iv += 0.01) { var Vv = Iv * resistance;
if (Vv > 12) { break; }

var px = GX + (Iv * 1000 / 1200) * GW;
var py = GY + GH - (Vv / 12) * GH;

if (firstPoint) { ctx.moveTo(px, py);
firstPoint = false; }
else { ctx.lineTo(px, py); } }
ctx.stroke();

if (observations.length >= 2) { var lastObs = observations[observations.length - 1];
ctx.strokeStyle ='#2ee59d';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(GX, GY + GH);
var endPx = GX + (lastObs.I * 1000 / 1200) * GW;
var endPy = GY + GH - (lastObs.V / 12) * GH;
ctx.lineTo(endPx, endPy);
ctx.stroke(); }

for (var k = 0; k < observations.length; k++) { var pt = observations[k];
var ptPx = GX + (pt.I * 1000 / 1200) * GW;
var ptPy = GY + GH - (pt.V / 12) * GH;

ctx.fillStyle = '#ff6b6b';
ctx.beginPath();
ctx.arc(ptPx, ptPy, 4, 0, Math.PI * 2);
ctx.fill(); }

var livePx = GX + (I * 1000 / 1200) * GW;
var livePy = GY + GH - (voltage / 12) * GH;
ctx.fillStyle = '#ffb347';
ctx.beginPath();
ctx.arc(livePx, livePy, 6, 0, Math.PI * 2);
ctx.fill();

if (observations.length >= 2) {
ctx.fillStyle = '#2ee59d';
ctx.font = '10px JetBrains Mono';
ctx.fillText('Slope = R = ' + resistance + 'Ω', GX + 8, GY + 16); }

ctx.fillStyle = '#8ba3c0';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('V-I CHARACTERISTIC', GX + GW / 2, GY - 8);
ctx.textAlign = 'left'; }

canvas.addEventListener('mousedown', function(e) { var rect = canvas.getBoundingClientRect();
var mx = (e.clientX - rect.left) * (W / rect.width);
var my = (e.clientY - rect.top) * (H / rect.height);
var knobX = RHEO_X + ((voltage - 0.5) / 11.5) * RHEO_W;

if (Math.abs(mx - knobX) < 20 && Math.abs(my - (RHEO_Y + 8)) < 20) { isDragging = true;
dragStartX = mx;
dragStartV = voltage;
canvas.style.cursor = 'grabbing'; }
});

canvas.addEventListener('mousemove', function(e) { if (!isDragging) { return; }

var rect = canvas.getBoundingClientRect();
var mx = (e.clientX - rect.left) * (W / rect.width);
var delta = (mx - dragStartX) / RHEO_W * 11.5;

voltage = Math.max(0.5, Math.min(12, dragStartV + delta));

document.getElementById('ohmV').value = voltage.toFixed(1);
render();
});

canvas.addEventListener('mouseup', function() { isDragging = false;
canvas.style.cursor = 'ew-resize'; });

canvas.addEventListener('mouseleave', function() { isDragging = false; });

canvas.style.cursor = 'ew-resize';
hintEl.textContent = 'Drag the rheostat slider to vary voltage';
render();
return function cleanup() {}; };