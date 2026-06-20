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
ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, W, H);
const f = calcFreq();

ctx.fillStyle = '#2ee59d'; 
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('SONOMETER', 20, 22);
ctx.fillStyle = '#4a6580'; 
ctx.font = '11px JetBrains Mono';
ctx.fillText('f = (1/2L)·√(T/μ)', 20, 38);

// now it's time for the soundboard
ctx.fillStyle = '#1a2f4a'; 
ctx.strokeStyle = '#2a4f7a'; 
ctx.lineWidth = 2;
ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H + 40);
ctx.strokeRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H + 40);
    
ctx.strokeStyle = 'rgba(42,79,122,0.4)'; 
ctx.lineWidth = 1;
for (let i = 1; i < 5; i++) { ctx.beginPath();
ctx.moveTo(BOARD_X, BOARD_Y + i * (BOARD_H + 40) / 5);
ctx.lineTo(BOARD_X + BOARD_W, BOARD_Y + i * (BOARD_H + 40) / 5);
ctx.stroke(); }

// Sound hole on the bridge
ctx.fillStyle = '#0d1e35'; 
ctx.strokeStyle = '#2e4f7a'; 
ctx.lineWidth = 1;
ctx.beginPath(); 
ctx.ellipse(BOARD_X + BOARD_W / 2, BOARD_Y + 35, 40, 20, 0, 0, Math.PI * 2);
ctx.fill(); 
ctx.stroke();

ctx.fillStyle = '#4a6580'; 
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('SONOMETER', BOARD_X + BOARD_W / 2, BOARD_Y + 88);
ctx.textAlign = 'left';

ctx.strokeStyle = '#8ba3c0'; 
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(BOARD_X, WIRE_Y);
ctx.lineTo(BOARD_X + BOARD_W, WIRE_Y);
ctx.stroke();

// fixed left bridge
drawBridge(LEFT_BRIDGE_X,'#64dfdf', 'Fixed');

// ofc movable right bridge
const bridgeX = getBridgeX();
drawBridge(bridgeX, '#2ee59d', 'Move →');

// vibrating wire part 
const vx1 = LEFT_BRIDGE_X, vx2 = getBridgeX();
const amp = isVibrating ? 12 * Math.sin(Math.PI * (Date.now() % 300) / 150) : 0;

// Draw fundamental mode vibration (half sine wave)
ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 2.5;
ctx.beginPath();
for (let i = 0; i <= 100; i++) { const frac = i / 100;
const wx = vx1 + frac * (vx2 - vx1);
const wy = WIRE_Y + amp * Math.sin(frac * Math.PI) * (isVibrating ? Math.sin(vibAnim * f * 0.3) : 0);
i === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy); }
ctx.stroke();

// length of the wire annotation part
ctx.strokeStyle = '#a855f7'; 
ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
const arrY = WIRE_Y - 28;
ctx.beginPath(); ctx.moveTo(vx1, arrY); ctx.lineTo(vx2, arrY); ctx.stroke();
ctx.setLineDash([]);
    
ctx.fillStyle = '#a855f7';
ctx.beginPath(); 
ctx.moveTo(vx1, arrY); 
ctx.lineTo(vx1 + 8, arrY - 4); 
ctx.lineTo(vx1 + 8, arrY + 4); 
ctx.closePath(); 
ctx.fill();
ctx.beginPath(); 
ctx.moveTo(vx2, arrY); 
ctx.lineTo(vx2 - 8, arrY - 4); 
ctx.lineTo(vx2 - 8, arrY + 4); 
ctx.closePath(); ctx.fill();
ctx.fillStyle = '#a855f7'; ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(`L = ${L.toFixed(2)} m`, (vx1 + vx2) / 2, arrY - 8);
ctx.textAlign = 'left';

// weight hanger 
const hangerX = BOARD_X + BOARD_W + 20;
const hangerRopeY = WIRE_Y;
    
ctx.strokeStyle = '#2a4f7a'; 
ctx.lineWidth = 2; 
ctx.fillStyle = '#162844';
ctx.beginPath(); 
ctx.arc(hangerX, hangerRopeY, 12, 0, Math.PI * 2);
ctx.fill(); 
ctx.stroke();
    
ctx.strokeStyle = '#8ba3c0'; 
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(BOARD_X + BOARD_W, hangerRopeY);
ctx.lineTo(hangerX - 12, hangerRopeY);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(hangerX, hangerRopeY + 12);
ctx.lineTo(hangerX, hangerRopeY + 80);
ctx.stroke();
    
const numPlates = Math.min(8, Math.round(massGrams / 250));
for (let i = 0; i < numPlates; i++) { const wy2 = hangerRopeY + 80 + i * 14;
ctx.fillStyle = i % 2 === 0 ? '#233d5c' : '#1c3355';
ctx.strokeStyle = '#2a4f7a'; ctx.lineWidth = 1;
ctx.fillRect(hangerX - 20, wy2, 40, 12);
ctx.strokeRect(hangerX - 20, wy2, 40, 12); }
ctx.fillStyle = '#ffb347'; ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(`${massGrams}g`, hangerX, hangerRopeY + 80 + numPlates * 14 + 14);
ctx.fillText(`T=${tension.toFixed(1)}N`, hangerX, hangerRopeY + 80 + numPlates * 14 + 26);
ctx.textAlign = 'left';

const fx = BOARD_X - 50, fy = WIRE_Y + 40;
ctx.strokeStyle = '#64dfdf'; ctx.lineWidth = 2;
ctx.beginPath(); 
ctx.moveTo(fx, fy); 
ctx.lineTo(fx, fy - 50); 
ctx.stroke();
ctx.beginPath(); 
ctx.moveTo(fx - 8, fy - 50); 
ctx.lineTo(fx - 8, fy - 20); 
ctx.stroke();
ctx.beginPath(); 
ctx.moveTo(fx + 8, fy - 50); 
ctx.lineTo(fx + 8, fy - 20); 
ctx.stroke();
ctx.beginPath(); 
ctx.moveTo(fx - 8, fy - 50); 
ctx.arcTo(fx, fy - 58, fx + 8, fy - 50, 10); 
ctx.lineTo(fx + 8, fy - 50); 
ctx.stroke();
ctx.fillStyle = '#64dfdf'; 
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('FORK', fx, fy + 14);
ctx.fillText(`${f.toFixed(0)}Hz`, fx, fy + 26);
ctx.textAlign = 'left';

// display for wire frequency
ctx.fillStyle = '#112240'; 
ctx.strokeStyle = '#ffb347'; 
ctx.lineWidth = 1.5;
window._roundRect(ctx, BOARD_X + 180, BOARD_Y + 100, 200, 56, 8);
ctx.fill(); 
ctx.stroke();
ctx.fillStyle = '#ffb347'; 
ctx.font = 'bold 22px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(`${f.toFixed(2)} Hz`, BOARD_X + 280, BOARD_Y + 135);
ctx.fillStyle = '#8ba3c0'; 
ctx.font = '10px JetBrains Mono';
ctx.fillText('Frequency', BOARD_X + 280, BOARD_Y + 150);
ctx.textAlign = 'left';

// reading box in the bottom side
ctx.fillStyle = '#112240'; 
ctx.strokeStyle = '#2ee59d'; 
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, H - 58, W - 40, 44, 8);
ctx.fill(); ctx.stroke();
ctx.fillStyle = '#2ee59d'; 
ctx.font = '11px JetBrains Mono';
ctx.fillText(`f = 1/(2×${L.toFixed(2)}) × √(${tension.toFixed(1)}/${mu.toFixed(3)})`, 36, H - 38);
ctx.fillStyle = '#ffb347'; ctx.font = 'bold 14px JetBrains Mono';
ctx.fillText(`f = ${f.toFixed(2)} Hz  |  λ = ${(2 * L).toFixed(2)} m`, 36, H - 18);

setReadings(readingEl, [
['Length L', L.toFixed(2), 'm'],
['Tension T', tension.toFixed(2), 'N'],
['μ (linear density)', mu.toFixed(4), 'kg/m'],
['Frequency f', f.toFixed(2), 'Hz'],
['Wavelength λ', (2 * L).toFixed(2), 'm'],
]);
}

function drawBridge(x, color, label) {
ctx.fillStyle = '#1c3355'; ctx.strokeStyle = color; ctx.lineWidth = 2;
ctx.fillRect(x - 6, WIRE_Y - 20, 12, 40);
ctx.strokeRect(x - 6, WIRE_Y - 20, 12, 40);
ctx.fillStyle = color; ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center'; ctx.fillText(label, x, WIRE_Y + 50);
ctx.textAlign = 'left'; }

canvas.addEventListener('mousedown', e => { const rect = canvas.getBoundingClientRect();
const mx = (e.clientX - rect.left) * (W / rect.width);
const my = (e.clientY - rect.top) * (H / rect.height);
const bx = getBridgeX();
if (Math.abs(mx - bx) < 18 && my > WIRE_Y - 30 && my < WIRE_Y + 50) { isDraggingBridge = true;
dragStartX = mx; dragStartL = L; canvas.style.cursor = 'grabbing';
} });

canvas.addEventListener('mousemove', e => { if (!isDraggingBridge) return;
const rect = canvas.getBoundingClientRect();
const mx = (e.clientX - rect.left) * (W / rect.width);
const delta = (mx - dragStartX) / 500;
L = Math.max(0.1, Math.min(1.0, dragStartL + delta));
document.getElementById('sonoLtype').value = L.toFixed(2);
if (!isVibrating) render(); });
canvas.addEventListener('mouseup', () => { isDraggingBridge = false; canvas.style.cursor = 'ew-resize'; });
canvas.addEventListener('mouseleave', () => { isDraggingBridge = false; });

canvas.style.cursor = 'ew-resize';
hintEl.textContent = 'Drag the right bridge to change vibrating length L';
render();

return function cleanup() {cancelAnimationFrame(rafId);
isVibrating = false;
};
};


    
   