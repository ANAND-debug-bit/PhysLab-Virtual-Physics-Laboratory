// resonance tube 2d simulation with a tuning fork of sliding frequency and also to change the percentage of water level in the tube with an option of fork ringing and at resonance state a unique blink of cyan light to show resonance state 
window.mountResonance = function(wrap, readingEl, ctrlEl, hintEl) {

// drawing canvas 
const WIDTH = 740, HEIGHT = 360;
const canvas = makeCanvas(wrap, WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

const TUBE_LENGTH_METRES = 1.0;       
const SPEED_OF_SOUND = 346;          
const END_CORRECTION = 0.3 * 0.025;  

let frequency = 512;       
let waterLevel = 0.85;      
let isDragging = false;
let dragStartY = 0;
let dragStartWaterLevel = 0;
let isForkRinging = false;
let animTime = 0;           
let animFrameId = null;

const rid = 'res_' + Math.random().toString(36).slice(2, 8);

const TUBE_LEFT = 220;
const TUBE_TOP = 50;
const TUBE_BOTTOM = 310;
const TUBE_WIDTH = 60;
const TUBE_HEIGHT_PX = TUBE_BOTTOM - TUBE_TOP;

function metresToPx(m) { return (m / TUBE_LENGTH_METRES) * TUBE_HEIGHT_PX; }
function pxToMetres(px) { return (px / TUBE_HEIGHT_PX) * TUBE_LENGTH_METRES; }

function getFirstResonanceLength()  { return SPEED_OF_SOUND / (4 * frequency) - END_CORRECTION; }
function getSecondResonanceLength() { return 3 * SPEED_OF_SOUND / (4 * frequency) - END_CORRECTION; }
function getAirColumnLength() { return (1 - waterLevel) * TUBE_LENGTH_METRES; }

function isAtResonance() { const airCol = getAirColumnLength();
const l1 = getFirstResonanceLength();
const l2 = getSecondResonanceLength();
return Math.abs(airCol - l1) < 0.015 || Math.abs(airCol - l2) < 0.015; }

  // building the control panel 
ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Tuning Fork Frequency (Hz): <span id="resFreq">512</span></label>
<input type="range" id="resFreqR" min="256" max="1024" step="16" value="512" oninput="${rid}_setFreq()" />
</div>
<div style="font-size:12px;color:var(--text-mute);margin-bottom:8px;">↕ Drag water surface up/down on canvas</div>
<div class="ctrl-item">
<label>Or type water level (0–100%):</label>
<input type="number" id="resWLtype" min="0" max="100" step="1" value="85" oninput="${rid}_typeWL()" />
</div>
<div style="display:flex;gap:8px;margin-top:4px;">
<button class="mode-btn active" id="resRingBtn" onclick="${rid}_toggleRing()" style="flex:1;">🔔 Ring Fork</button>
<button class="mode-btn" onclick="${rid}_reset()" style="flex:1;">↺ Reset</button>
</div>
<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;margin-top:8px;font-size:12px;color:var(--text-dim);">
<div>L₁ (1st resonance): <span id="resL1" style="color:var(--amber);font-family:var(--font-mono);">—</span>
</div>
<div style="margin-top:4px;">L₂ (2nd resonance): <span id="resL2" style="color:var(--amber);font-family:var(--font-mono);">—</span></div>
<div style="margin-top:4px;">v = 2f(L₂−L₁): <span id="resV" style="color:var(--green);font-family:var(--font-mono);">—</span>
</div>
</div>
<div class="obs-recorder">
<button onclick="${rid}_record()">＋ Record Reading</button>
<div class="obs-list" id="resObsList"></div>
</div> `;

window[rid + '_setFreq'] = function() { frequency = parseInt(document.getElementById('resFreqR').value);
document.getElementById('resFreq').textContent = frequency;
updateFormulaDisplay();
if (!isForkRinging) render(); };

window[rid + '_typeWL'] = function() { const percent = Math.max(0, Math.min(100, parseFloat(document.getElementById('resWLtype').value) || 50));
waterLevel = percent / 100;
updateFormulaDisplay();
if (!isForkRinging) render();
};

window[rid + '_toggleRing'] = function() { isForkRinging = !isForkRinging;
const btn = document.getElementById('resRingBtn');
btn.textContent = isForkRinging ? '⏸ Stop' : '🔔 Ring Fork';
btn.classList.toggle('active', isForkRinging);
if (isForkRinging) animFrameId = requestAnimationFrame(animate);
else { cancelAnimationFrame(animFrameId); render(); } };

window[rid + '_reset'] = function() { isForkRinging = false;
cancelAnimationFrame(animFrameId);
waterLevel = 0.85;
frequency = 512;
document.getElementById('resFreqR').value = 512;
document.getElementById('resFreq').textContent = 512;
document.getElementById('resWLtype').value = 85;
const btn = document.getElementById('resRingBtn');
btn.textContent = '🔔 Ring Fork';
btn.classList.remove('active');
updateFormulaDisplay();
render(); };

// recording observation
let observationCount = 0;

window[rid + '_record'] = function() { observationCount++;
const airCol = getAirColumnLength();
const list = document.getElementById('resObsList');
const row = document.createElement('div');
const resonanceNote = isAtResonance() ? ' ✓ RESONANCE' : '';
row.innerHTML = `<span>#${observationCount} L=${airCol.toFixed(3)}m${resonanceNote}</span><span>${frequency}Hz</span>`;
if (isAtResonance()) row.style.color = 'var(--green)';
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

function updateFormulaDisplay() { const l1 = getFirstResonanceLength();
const l2 = getSecondResonanceLength();
document.getElementById('resL1').textContent = l1 > 0 ? l1.toFixed(3) + ' m' : 'N/A';
document.getElementById('resL2').textContent = (l2 > 0 && l2 < 1) ? l2.toFixed(3) + ' m' : 'N/A';
if (l1 > 0 && l2 > 0 && l2 < 1) {
const speedOfSound = 2 * frequency * (l2 - l1);
document.getElementById('resV').textContent = speedOfSound.toFixed(1) + ' m/s';}
else { document.getElementById('resV').textContent = '—'; } }

// animation loop 
function animate(timestamp) { animTime = timestamp / 1000;   
render();
if (isForkRinging) animFrameId = requestAnimationFrame(animate); }

function render() { ctx.clearRect(0, 0, WIDTH, HEIGHT);

ctx.fillStyle = '#0D1E35';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

const airColumnM = getAirColumnLength();
const l1 = getFirstResonanceLength();
const l2 = getSecondResonanceLength();
const atResonance = isAtResonance();
const calculatedSpeed = 2 * frequency * (l2 - l1);

drawTitle();
drawTube();
drawScaleMarkings();
drawWater(airColumnM);
drawAirColumnLabel(airColumnM);
drawResonanceMarkers(l1, l2);
drawStandingWave(airColumnM, atResonance);
drawResonanceAlert(atResonance);
drawTuningFork();
drawInfoPanel(airColumnM, l1, l2, calculatedSpeed, atResonance);
drawFormulaBar(l2, calculatedSpeed);

setReadings(readingEl, [
['Frequency f', frequency, 'Hz'],
['Air column', (airColumnM * 100).toFixed(1), 'cm'],
['L₁', l1 > 0 ? (l1 * 100).toFixed(1) : '—', 'cm'],
['L₂', (l2 > 0 && l2 < 1) ? (l2 * 100).toFixed(1) : '—', 'cm'],
['Speed v', (l2 > 0 && l2 < 1) ? calculatedSpeed.toFixed(1) : '—', 'm/s'],
]); }

function drawTitle() { ctx.fillStyle = '#a8442e';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('RESONANCE TUBE', 20, 22);
ctx.fillStyle = '#6b7660';
ctx.font = '11px JetBrains Mono';
ctx.fillText('v = 2f(L₂ − L₁)  |  f = ' + frequency + ' Hz', 20, 38); }

function drawTube() { ctx.lineWidth = 3;
ctx.strokeStyle = '#2a4f7a';

ctx.beginPath();
ctx.moveTo(TUBE_LEFT, TUBE_TOP);
ctx.lineTo(TUBE_LEFT, TUBE_BOTTOM);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(TUBE_LEFT + TUBE_WIDTH, TUBE_TOP);
ctx.lineTo(TUBE_LEFT + TUBE_WIDTH, TUBE_BOTTOM);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(TUBE_LEFT - 4, TUBE_BOTTOM);
ctx.lineTo(TUBE_LEFT + TUBE_WIDTH + 4, TUBE_BOTTOM);
ctx.lineWidth = 4;
ctx.stroke(); }

function drawScaleMarkings() { ctx.fillStyle = '#6b7660';
ctx.font = '10px JetBrains Mono';

for (let cm = 0; cm <= 100; cm += 10) { const y = TUBE_BOTTOM - metresToPx(cm / 100);
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(TUBE_LEFT + TUBE_WIDTH + 4, y);
ctx.lineTo(TUBE_LEFT + TUBE_WIDTH + 14, y);
ctx.stroke();
ctx.textAlign = 'left';
ctx.fillText(cm + 'cm', TUBE_LEFT + TUBE_WIDTH + 16, y + 4); }

for (let cm = 5; cm <= 100; cm += 10) { const y = TUBE_BOTTOM - metresToPx(cm / 100);
ctx.strokeStyle = '#1e3a5f';
ctx.beginPath();
ctx.moveTo(TUBE_LEFT + TUBE_WIDTH + 4, y);
ctx.lineTo(TUBE_LEFT + TUBE_WIDTH + 9, y);
ctx.stroke(); } }

function drawWater(airColumnM) { const waterTopY = TUBE_TOP + (1 - waterLevel) * TUBE_HEIGHT_PX;
// water body (solid filling instead of gradient for clarity)
ctx.fillStyle = 'rgba(40,100,180,0.75)';
ctx.fillRect(TUBE_LEFT + 2, waterTopY, TUBE_WIDTH - 4, TUBE_BOTTOM - waterTopY);

ctx.strokeStyle = 'rgba(100,200,255,0.8)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(TUBE_LEFT + 2, waterTopY);
ctx.lineTo(TUBE_LEFT + TUBE_WIDTH - 2, waterTopY);
ctx.stroke();

ctx.fillStyle = '#a8442e';
ctx.beginPath();
ctx.arc(TUBE_LEFT - 14, waterTopY, 8, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#0a1628';
ctx.font = 'bold 10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('↕', TUBE_LEFT - 14, waterTopY + 4);
ctx.textAlign = 'left'; }

function drawAirColumnLabel(airColumnM) { const waterTopY = TUBE_TOP + (1 - waterLevel) * TUBE_HEIGHT_PX;
ctx.textAlign = 'center';
const tubeCentreX = TUBE_LEFT + TUBE_WIDTH / 2;

ctx.fillStyle = '#8ba3c0';
ctx.font = '10px JetBrains Mono';
ctx.fillText('AIR', tubeCentreX, TUBE_TOP + 12);

ctx.fillStyle = '#64dfdf';
ctx.font = 'bold 11px JetBrains Mono';
ctx.fillText(`${(airColumnM * 100).toFixed(1)} cm`, tubeCentreX, waterTopY - 8);
ctx.textAlign = 'left'; }

function drawResonanceMarkers(l1, l2) { 
//first resonance (orange line)  
if (l1 > 0) { const y1 = TUBE_BOTTOM - metresToPx(l1);
ctx.strokeStyle = 'rgba(255,179,71,0.6)';
ctx.lineWidth = 1.5;
ctx.setLineDash([4, 3]);
ctx.beginPath();
ctx.moveTo(TUBE_LEFT - 40, y1);
ctx.lineTo(TUBE_LEFT + TUBE_WIDTH, y1);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 10px JetBrains Mono';
ctx.textAlign = 'right';
ctx.fillText(`L₁=${(l1 * 100).toFixed(1)}cm`, TUBE_LEFT - 44, y1 + 4);
ctx.textAlign = 'left'; }

if (l2 > 0 && l2 < TUBE_LENGTH_METRES) { const y2 = TUBE_BOTTOM - metresToPx(l2);
ctx.strokeStyle = 'rgba(156,122,60,0.6)';
ctx.lineWidth = 1.5;
ctx.setLineDash([4, 3]);
ctx.beginPath();
ctx.moveTo(TUBE_LEFT - 40, y2);
ctx.lineTo(TUBE_LEFT + TUBE_WIDTH, y2);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#9c7a3c';
ctx.font = 'bold 10px JetBrains Mono';
ctx.textAlign = 'right';
ctx.fillText(`L₂=${(l2 * 100).toFixed(1)}cm`, TUBE_LEFT - 44, y2 + 4);
ctx.textAlign = 'left'; } }

function drawStandingWave(airColumnM, atResonance) { if (airColumnM < 0.02) return;
const waterTopY = TUBE_TOP + (1 - waterLevel) * TUBE_HEIGHT_PX;
const tubeCentreX = TUBE_LEFT + TUBE_WIDTH / 2;

const wavePhase = isForkRinging ? Math.sin(animTime * frequency * 0.1) : 0.5;
const amplitude = atResonance ? 18 : (isForkRinging ? 6 : 4);
const waveColour = atResonance ? '#ffb347' : 'rgba(100,223,223,0.4)';

ctx.strokeStyle = waveColour;
ctx.lineWidth = atResonance ? 2.5 : 1.5;
ctx.beginPath();

const steps = 60;
for (let i = 0; i <= steps; i++) { const fraction = i / steps;
const y = waterTopY + fraction * (TUBE_BOTTOM - waterTopY - 2);
const distFromSurface = fraction * airColumnM;

// Cosine standing wave pattern--> node at closed end (water surface), antinode at open top
const displacement = Math.sin(Math.PI * distFromSurface / (2 * airColumnM)) * amplitude * wavePhase;
if (i === 0) ctx.moveTo(tubeCentreX + displacement, y);
else ctx.lineTo(tubeCentreX + displacement, y);
}
ctx.stroke(); }

function drawResonanceAlert(atResonance) { if (!atResonance || !isForkRinging) return;
 
// cyan highlight blinking/pulse at resonance condition
const pulseAlpha = 0.4 + 0.3 * Math.sin(animTime * 8);
ctx.fillStyle = `rgba(168,68,46,${pulseAlpha})`;
ctx.fillRect(TUBE_LEFT + 2, TUBE_TOP, TUBE_WIDTH - 4, TUBE_HEIGHT_PX);
 
ctx.fillStyle = '#a8442e';
ctx.font = 'bold 13px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('RESONANCE!', TUBE_LEFT + TUBE_WIDTH / 2, TUBE_TOP - 10);
ctx.textAlign = 'left'; }
 
function drawTuningFork() { const forkX = TUBE_LEFT + TUBE_WIDTH / 2;
const forkY = TUBE_TOP - 30;   
 
ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(forkX, forkY + 20);
ctx.lineTo(forkX, forkY + 40);
ctx.stroke();
 
ctx.beginPath();
ctx.moveTo(forkX, forkY + 20);
ctx.lineTo(forkX - 10, forkY + 5);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(forkX, forkY + 20);
ctx.lineTo(forkX + 10, forkY + 5);
ctx.stroke();
 
ctx.beginPath();
ctx.moveTo(forkX - 10, forkY + 5);
ctx.lineTo(forkX - 14, forkY - 10);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(forkX + 10, forkY + 5);
ctx.lineTo(forkX + 14, forkY - 10);
ctx.stroke();
 
if (isForkRinging) { const vibration = Math.sin(animTime * frequency * 0.2) * 4;
ctx.strokeStyle = 'rgba(255,179,71,0.4)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(forkX - 14 + vibration, forkY - 10);
ctx.lineTo(forkX - 20 + vibration, forkY - 10);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(forkX + 14 - vibration, forkY - 10);
ctx.lineTo(forkX + 20 - vibration, forkY - 10);
ctx.stroke(); }
 
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(frequency + ' Hz', forkX, forkY - 18);
ctx.textAlign = 'left'; }
 
function drawInfoPanel(airColumnM, l1, l2, speed, atResonance) { const panelX = TUBE_LEFT + TUBE_WIDTH + 100;
const panelY = 60;
 
ctx.fillStyle = '#112240';
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1.5;
window._roundRect(ctx, panelX, panelY, 260, 220, 8);
ctx.fill();
ctx.stroke();
ctx.fillStyle = '#a8442e';
ctx.font = 'bold 12px JetBrains Mono';
ctx.fillText('READINGS', panelX + 14, panelY + 22);
 
const rows = [
['Frequency f',frequency + ' Hz', '#64dfdf'],
['Air column L',   (airColumnM * 100).toFixed(1) + ' cm','#ffb347'],
['L₁ (1st res.)',  l1 > 0 ? (l1 * 100).toFixed(1) + ' cm' : 'N/A', '#ffb347'],
['L₂ (2nd res.)',  (l2 > 0 && l2 < 1) ? (l2 * 100).toFixed(1) + ' cm' : 'N/A', '#9c7a3c'],
['v = 2f(L₂-L₁)', (l2 > 0 && l2 < 1) ? speed.toFixed(1) + ' m/s' : '—', '#a8442e'], ];
 
rows.forEach(([label, value, colour], i) => { const rowY = panelY + 44 + i * 34;
ctx.fillStyle = '#6b7660';
ctx.font = '10px JetBrains Mono';
ctx.fillText(label, panelX + 14, rowY);
ctx.fillStyle = colour;
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText(value, panelX + 14, rowY + 16); });
 
// status badge at the bottom of panel
const badgeY = panelY + 210;
ctx.fillStyle = atResonance ? 'rgba(168,68,46,0.2)' : 'rgba(107,118,96,0.15)';
ctx.strokeStyle = atResonance ? '#A8442E' : '#6B7660';
ctx.lineWidth = 1;
window._roundRect(ctx, panelX + 14, badgeY, 232, 28, 6);
ctx.fill();
ctx.stroke();
ctx.fillStyle = atResonance ? '#A8442E' : '#6B7660';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText( atResonance ? '✓ AT RESONANCE' : 'Adjust water level to resonance',
panelX + 14 + 116, badgeY + 18 );
ctx.textAlign = 'left'; }
 
function drawFormulaBar(l2, speed) { ctx.fillStyle = '#112240';
ctx.strokeStyle = '#a8442e';
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, HEIGHT - 44, WIDTH - 40, 30, 8);
ctx.fill();
ctx.stroke();
ctx.fillStyle = '#a8442e';
ctx.font = '11px JetBrains Mono';
const speedText = (l2 > 0 && l2 < 1) ? speed.toFixed(1) : '—';
ctx.fillText(`λ/4 = L₁ + e  |  3λ/4 = L₂ + e  |  v = 2f(L₂ − L₁) = ${speedText} m/s`, 36, HEIGHT - 24);
}
 
canvas.addEventListener('mousedown', e => { const rect = canvas.getBoundingClientRect();
const mouseX = (e.clientX - rect.left) * (WIDTH / rect.width);
const mouseY = (e.clientY - rect.top) * (HEIGHT / rect.height);
const waterTopY = TUBE_TOP + (1 - waterLevel) * TUBE_HEIGHT_PX;
 
const handleX = TUBE_LEFT - 14;
if (Math.abs(mouseX - handleX) < 20 && Math.abs(mouseY - waterTopY) < 20) { isDragging = true;
dragStartY = mouseY;
dragStartWaterLevel = waterLevel;
canvas.style.cursor = 'ns-resize';
} });
 
canvas.addEventListener('mousemove', e => { if (!isDragging) return;
const rect = canvas.getBoundingClientRect();
const mouseY = (e.clientY - rect.top) * (HEIGHT / rect.height);
const draggedFraction = (mouseY - dragStartY) / TUBE_HEIGHT_PX;
 
waterLevel = Math.max(0.05, Math.min(0.98, dragStartWaterLevel - draggedFraction));
document.getElementById('resWLtype').value = Math.round(waterLevel * 100);
updateFormulaDisplay();
if (!isForkRinging) render();
});
 
canvas.addEventListener('mouseup', () => { isDragging = false;
canvas.style.cursor = 'ns-resize'; });
 
canvas.addEventListener('mouseleave', () => { isDragging = false; });
canvas.style.cursor = 'ns-resize';
hintEl.textContent= 'Drag the green handle ↕ to raise/lower water level';
updateFormulaDisplay();
render();
return function cleanup() {
cancelAnimationFrame(animFrameId);
isForkRinging = false;
};
};