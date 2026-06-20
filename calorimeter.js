// calorimetry based on the principal of newton's law of cooling, in which we have a graph of temperature v/s time and a beaker with an animation from high boiling water temperature to cool down temperature along with the graph
window.mountCooling = function (wrap, readingEl, ctrlEl, hintEl) {
//drawing canvas
var W = 740; var H = 360;
var canvas = makeCanvas(wrap, W, H);
var ctx = canvas.getContext('2d');

var ambientT = 30;      
var initialT = 80;    
var k = 0.025;          
var isRunning = false; 
var elapsed = 0;        
var rafId = null;       
var lastTime = null;    

// to store temperature readings we record while the sim runs
// each entry looks like: { t: 30, T: 65.2 }  -->  "at 30 seconds, temp was 65.2"
var dataPoints = [];
var recordInterval = 0; // counts up to 30 seconds before saving a new point

// building the control panel
ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Ambient Temp T₀ (°C): <span id="clAmbient">30</span></label>
<input type="range" id="clAmbientR" min="15" max="40" step="1" value="30" oninput="clUpdateAmbient()" />
</div>
<div class="ctrl-item">
<label>Initial Temp (°C): <span id="clInitial">80</span></label>
<input type="range" id="clInitialR" min="50" max="95" step="1" value="80" oninput="clUpdateInitial()" />
</div>
<div class="ctrl-item">
<label>Cooling constant k: <span id="clK">0.025</span></label>
<input type="range" id="clKR" min="0.005" max="0.06" step="0.005" value="0.025" oninput="clUpdateK()" />
</div>
<div style="display:flex;gap:8px;margin-top:4px;">
<button class="mode-btn active" id="clStartBtn" onclick="clToggle()" style="flex:1;">▶ Start</button>
<button class="mode-btn" onclick="clReset()" style="flex:1;">↺ Reset</button>
</div>
<div class="obs-recorder" style="margin-top:8px;">
<div class="obs-list" id="clObsList" style="max-height:90px;"></div>
</div> `;

// functions which will run when sliders are moved 
window.clUpdateAmbient = function () { ambientT = parseInt(document.getElementById('clAmbientR').value);
document.getElementById('clAmbient').textContent = ambientT;
if (isRunning === false) { render(); } };

// called when the initial temp slider moves
window.clUpdateInitial = function () { initialT = parseInt(document.getElementById('clInitialR').value);
document.getElementById('clInitial').textContent = initialT;
if (isRunning === false) { elapsed = 0;
dataPoints = [];
render(); } };

// called when the cooling const k  slider moves
window.clUpdateK = function () { k = parseFloat(document.getElementById('clKR').value);
document.getElementById('clK').textContent = k.toFixed(3);
if (isRunning === false) { render(); } };

// called when the Start/Pause button is clicked
window.clToggle = function () { if (isRunning === true) {
isRunning = false;
cancelAnimationFrame(rafId);
document.getElementById('clStartBtn').textContent = '▶ Start';
document.getElementById('clStartBtn').classList.remove('active'); }
else { isRunning = true;
lastTime = null;
document.getElementById('clStartBtn').textContent = '⏸ Pause';
document.getElementById('clStartBtn').classList.add('active');
rafId = requestAnimationFrame(animate); } };

//reset button  
window.clReset = function () { isRunning = false;
cancelAnimationFrame(rafId);
elapsed = 0;
dataPoints = [];
recordInterval = 0;
document.getElementById('clStartBtn').textContent = '▶ Start';
document.getElementById('clStartBtn').classList.remove('active');
document.getElementById('clObsList').innerHTML = '';
render(); };

function currentTemp() { return ambientT + (initialT - ambientT) * Math.exp(-k * elapsed); }

// animation loop
function animate(ts) { if (lastTime === null) { lastTime = ts; }

// dt(how much real time is passed )
var dt = (ts - lastTime) / 1000;
lastTime = ts;
elapsed = elapsed + dt * 20;

recordInterval = recordInterval + dt * 20;
if (recordInterval >= 30) {
recordInterval = 0;

var T = currentTemp();
dataPoints.push({ t: Math.round(elapsed), T: T });

var list = document.getElementById('clObsList');
var row = document.createElement('div');
row.innerHTML = '<span>t=' + Math.round(elapsed) + 's</span>' +
'<span>' + T.toFixed(1) + '°C</span>';
list.appendChild(row);
list.scrollTop = list.scrollHeight; }

if (elapsed > 600) { isRunning = false;
document.getElementById('clStartBtn').textContent = '▶ Start';
document.getElementById('clStartBtn').classList.remove('active'); }

render();
if (isRunning === true) { rafId = requestAnimationFrame(animate);} }

//positioning of graph
var CX = 80;
var CY = 40;
var CW = 500;
var CH = 220;

function render() { ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText("NEWTON'S LAW OF COOLING", 20, 22);

ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('T(t) = T₀ + (Ti − T₀)·e^(−kt)', 20, 38);

var cx2 = 670;
var cy2 = 140;

ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(cx2 - 30, cy2 - 60);
ctx.lineTo(cx2 - 35, cy2 + 50);
ctx.lineTo(cx2 + 35, cy2 + 50);
ctx.lineTo(cx2 + 30, cy2 - 60);
ctx.closePath();
ctx.fill();
ctx.stroke();

var T = currentTemp();
var heatFrac = (T - ambientT) / (initialT - ambientT);
if (heatFrac < 0) { heatFrac = 0; }
if (heatFrac > 1) { heatFrac = 1; }

// blending the water colour
var r = Math.round(30 + heatFrac * 220);
var g2 = Math.round(80 + heatFrac * 30);
var b = Math.round(200 - heatFrac * 170);

var waterColor = 'rgba(' + r + ',' + g2 + ',' + b + ',0.6)';
ctx.fillStyle = waterColor;

ctx.beginPath();
ctx.moveTo(cx2 - 28, cy2 - 10);
ctx.lineTo(cx2 - 33, cy2 + 48);
ctx.lineTo(cx2 + 33, cy2 + 48);
ctx.lineTo(cx2 + 28, cy2 - 10);
ctx.closePath();
ctx.fill();

ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(cx2, cy2 - 70);
ctx.lineTo(cx2, cy2 + 30);
ctx.stroke();

ctx.fillStyle = '#ff6b6b';
ctx.beginPath();
ctx.arc(cx2, cy2 + 30, 6, 0, Math.PI * 2);
ctx.fill();

// drawing little steam squiggles above the cup, but only if it's still hot
if (heatFrac > 0.3) { var steamColor = 'rgba(100,223,223,' + (heatFrac * 0.6) + ')';
ctx.strokeStyle = steamColor;
ctx.lineWidth = 1.5;

for (var i = -1; i <= 1; i++) { var sx = cx2 + i * 12;
var base = cy2 - 65 - (elapsed * 0.3 % 20);

ctx.beginPath();
ctx.moveTo(sx, base + 20);
ctx.quadraticCurveTo(sx + 6, base + 10, sx, base);
ctx.quadraticCurveTo(sx - 6, base - 10, sx, base - 20);
ctx.stroke(); } }

// temperature label above the cup
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 13px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(T.toFixed(1) + '°C', cx2, cy2 - 78);

// room temperature label below the cup
ctx.fillStyle = '#4a6580';
ctx.font = '10px JetBrains Mono';
ctx.fillText('T₀=' + ambientT + '°C', cx2, cy2 + 70);
ctx.textAlign = 'left';

 