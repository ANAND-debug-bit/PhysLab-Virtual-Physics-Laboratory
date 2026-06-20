// sonomter 2d simulation involvving slider for hanging mass , wire type , option to change the length manually by typing or by dragging with mouse and (main piece ) button of vibration which vibrates the string to give the final frequency
window.mountSonometer = function(wrap, readingEl, ctrlEl, hintEl) {
const W = 740, H = 360;
const canvas = makeCanvas(wrap, W, H);
const ctx = canvas.getContext('2d');

let L = 0.5;         
let tension = 4.9;   
let massGrams = 500; 
let mu = 0.001;      
let isVibrating = false;
let vibAnim = 0;
let rafId = null;
let isDraggingBridge = false;
let dragStartX = 0, dragStartL = 0;

// wire linear densities for different wires
const wireOptions = [
{ label: 'Steel  (μ=0.001)', mu: 0.001 },
{ label: 'Brass  (μ=0.003)', mu: 0.003 },
{ label: 'Copper (μ=0.005)', mu: 0.005 },
];
let wireIdx = 0;
//building control panel 
ctrlEl.innerHTML = `<div class="ctrl-item">
<label>Wire Type:</label>
<select id="sonoWire" onchange="sonoSetWire()" style="width:100%;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:7px 10px;border-radius:6px;font-family:var(--font-mono);font-size:13px;">
${wireOptions.map((w, i) => `<option value="${i}">${w.label}</option>`).join('')}
</select>
</div>
<div class="ctrl-item">
<label>Hanging Mass (g): <span id="sonoMass">500</span></label>
<input type="range" id="sonoMassR" min="100" max="2000" step="100" value="500" oninput="sonoSetMass()" />
</div>
<div class="ctrl-item">
<label>Or type Length L (m):</label>
<input type="number" id="sonoLtype" min="0.1" max="1.0" step="0.01" value="0.5" oninput="sonoTypeL()" />
</div>
<div style="display:flex;gap:8px;margin-top:4px;">
<button class="mode-btn active" id="sonoVibBtn" onclick="sonoToggleVib()" style="flex:1;">🎵 Vibrate</button>
<button class="mode-btn" onclick="sonoReset()" style="flex:1;">↺ Reset</button>
</div>
<div class="obs-recorder">
<button onclick="sonoRecord()">＋ Record Reading</button>
<div class="obs-list" id="sonoObsList"></div>
</div> `;

window.sonoSetWire = function() { wireIdx = parseInt(document.getElementById('sonoWire').value);
mu = wireOptions[wireIdx].mu;
render(); };
window.sonoSetMass = function() { massGrams = parseInt(document.getElementById('sonoMassR').value);
document.getElementById('sonoMass').textContent = massGrams;
tension = massGrams / 1000 * 9.8;
render(); };
window.sonoTypeL = function() { L = Math.max(0.1, Math.min(1.0, parseFloat(document.getElementById('sonoLtype').value) || 0.5));
render(); };

let obsCount = 0;
window.sonoRecord = function() { obsCount++;
const f = calcFreq();
const list = document.getElementById('sonoObsList');
const row = document.createElement('div');
row.innerHTML = `<span>#${obsCount} L=${L.toFixed(2)}m T=${tension.toFixed(1)}N</span><span>${f.toFixed(1)}Hz</span>`;
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

window.sonoToggleVib = function() { isVibrating = !isVibrating;
document.getElementById('sonoVibBtn').textContent = isVibrating ? '⏸ Stop' : '🎵 Vibrate';
document.getElementById('sonoVibBtn').classList.toggle('active', isVibrating);
if (isVibrating) { rafId = requestAnimationFrame(animate); } 
else { cancelAnimationFrame(rafId);
render(); }
};

window.sonoReset = function() { isVibrating = false;
cancelAnimationFrame(rafId);
document.getElementById('sonoVibBtn').textContent = '🎵 Vibrate';
document.getElementById('sonoVibBtn').classList.remove('active');
vibAnim = 0;
L = 0.5;
document.getElementById('sonoLtype').value = '0.5';
render();
};

function animate(ts) { vibAnim = ts / 1000;
render();
if (isVibrating) rafId = requestAnimationFrame(animate); }

function calcFreq() { return (1 / (2 * L)) * Math.sqrt(tension / mu); }

// canvas constants for the instrument
const BOARD_X = 60, BOARD_Y = 80, BOARD_W = 580, BOARD_H = 30;
const WIRE_Y = BOARD_Y - 10;
const LEFT_BRIDGE_X = BOARD_X + 20;

function getBridgeX() { // position of the right movable bridge
return LEFT_BRIDGE_X + L * 500; }

function render() { ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0d1e35'; ctx.fillRect(0, 0, W, H);
const f = calcFreq();

ctx.fillStyle = '#2ee59d'; ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('SONOMETER', 20, 22);
ctx.fillStyle = '#4a6580'; ctx.font = '11px JetBrains Mono';
ctx.fillText('f = (1/2L)·√(T/μ)', 20, 38);

// now it's time for the soundboard
ctx.fillStyle = '#1a2f4a'; ctx.strokeStyle = '#2a4f7a'; ctx.lineWidth = 2;
ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H + 40);
ctx.strokeRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H + 40);
    
ctx.strokeStyle = 'rgba(42,79,122,0.4)'; ctx.lineWidth = 1;
for (let i = 1; i < 5; i++) { ctx.beginPath();
ctx.moveTo(BOARD_X, BOARD_Y + i * (BOARD_H + 40) / 5);
ctx.lineTo(BOARD_X + BOARD_W, BOARD_Y + i * (BOARD_H + 40) / 5);
ctx.stroke(); }

// Sound hole on the bridge
ctx.fillStyle = '#0d1e35'; ctx.strokeStyle = '#2e4f7a'; ctx.lineWidth = 1;
ctx.beginPath(); ctx.ellipse(BOARD_X + BOARD_W / 2, BOARD_Y + 35, 40, 20, 0, 0, Math.PI * 2);
ctx.fill(); ctx.stroke();

ctx.fillStyle = '#4a6580'; ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('SONOMETER', BOARD_X + BOARD_W / 2, BOARD_Y + 88);
ctx.textAlign = 'left';

ctx.strokeStyle = '#8ba3c0'; ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(BOARD_X, WIRE_Y);
ctx.lineTo(BOARD_X + BOARD_W, WIRE_Y);
ctx.stroke();

// fixed left bridge
drawBridge(LEFT_BRIDGE_X, '#64dfdf', 'Fixed');

// ofc movable right bridge
const bridgeX = getBridgeX();
drawBridge(bridgeX, '#2ee59d', 'Move →');


    
   