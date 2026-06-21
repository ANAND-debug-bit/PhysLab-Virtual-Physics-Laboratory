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

    