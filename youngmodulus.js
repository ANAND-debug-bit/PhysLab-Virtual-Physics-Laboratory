// yongmodulus 2d simulation involves the length of wire , radius of wire , load mass in determining young modulus of the wire .
window.mountYoungModulus = function(wrap, readingEl, ctrlEl, hintEl) {

// drawing the canvas 
const WIDTH  = 740; 
const HEIGHT = 380; 
const canvas = makeCanvas(wrap, WIDTH, HEIGHT); 
const ctx = canvas.getContext('2d');      

// experiment starting default values
let wireLength = 2.0;   
let wireRadius = 0.25;  
let loadMass   = 0.5;   
const GRAVITY = 9.8; 
let observations = [];

//building the control panel
ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Wire Length L (m): <span id="ymL">2.00</span></label>
<input type="range" id="ymLR" min="0.5" max="4.0" step="0.1" value="2.0" oninput="ymUpdate()" />
</div>
<div class="ctrl-item">
<label>Wire Radius r (mm): <span id="ymR">0.25</span></label>
<input type="range" id="ymRR" min="0.1" max="1.0" step="0.01" value="0.25" oninput="ymUpdate()" />
</div>
<div class="ctrl-item">
<label>Load mass (kg): <span id="ymM">0.50</span></label>
<input type="range" id="ymMR" min="0" max="5" step="0.5" value="0.5" oninput="ymUpdate()" />
</div>
<div class="obs-recorder">
<button onclick="ymAddObs()">＋ Add to Table</button>
<div class="obs-list" id="ymObsList" style="max-height:160px;"></div>
</div> `;

window.ymUpdate = function() { wireLength = parseFloat(document.getElementById('ymLR').value);
wireRadius = parseFloat(document.getElementById('ymRR').value);
loadMass = parseFloat(document.getElementById('ymMR').value);

document.getElementById('ymL').textContent = wireLength.toFixed(2);
document.getElementById('ymR').textContent = wireRadius.toFixed(2);
document.getElementById('ymM').textContent = loadMass.toFixed(2);

render();  };
let readingCount = 0; 
window.ymAddObs = function() {
readingCount++;
const force = loadMass * GRAVITY;
const radiusInMeters = wireRadius / 1000;
const area = Math.PI * radiusInMeters * radiusInMeters;
const stress = force / area;
const extension = calculateExtension();
const strain = extension / wireLength;
const youngsModulusGPa = strain > 0
? (stress / strain / 1e9).toFixed(3)  : '—';

const list = document.getElementById('ymObsList');
const row  = document.createElement('div');
row.innerHTML = `<span>#${readingCount} F=${force.toFixed(1)}N</span><span>Y≈${youngsModulusGPa} GPa</span>`;
list.appendChild(row);
list.scrollTop = list.scrollHeight;
};

// physics helper functions
function calculateExtension() { const STEEL_YOUNGS_MODULUS = 2e11; 
const force = loadMass * GRAVITY;                 
const radiusInMeters = wireRadius / 1000;          
const area = Math.PI * radiusInMeters ** 2;       
return (force * wireLength) / (area * STEEL_YOUNGS_MODULUS); }

function calculateYoungsModulus() { const force = loadMass * GRAVITY;
const radiusInMeters = wireRadius / 1000;
const area = Math.PI * radiusInMeters ** 2;
const extension = calculateExtension();
if (extension === 0) return Infinity; 
return (force * wireLength) / (area * extension); }

const wireTopY    = 70;   
const wireBottomY = 280; 
const wire1X       = 250; 
const wire2X       = 460;

//main drawing fn to draw the entire experiment on the canvas
function render() { ctx.clearRect(0, 0, WIDTH, HEIGHT);
ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText("YOUNG'S MODULUS — Searle's Method", 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('Y = FL / (πr²·ΔL)  [Pa = N/m²]', 20, 38);

ctx.fillStyle   = '#1c3355';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth   = 2;
ctx.fillRect(wire1X - 80, wireTopY - 20, 380, 20);
ctx.strokeRect(wire1X - 80, wireTopY - 20, 380, 20);

for (let i = 0; i < 8; i++) { ctx.beginPath();
ctx.moveTo(wire1X - 75 + i * 45, wireTopY - 20);
ctx.lineTo(wire1X - 85 + i * 45, wireTopY - 30);
ctx.stroke();}

const extension   = calculateExtension();             // real stretch, in meters (tiny! ofc)
const extensionPx = Math.min(extension * 50000, 50);  // scaled up hugely so it's visible on screen

// drawing the reference wire 
ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(wire1X, wireTopY);
ctx.lineTo(wire1X, wireBottomY);
ctx.stroke();

ctx.fillStyle = '#64dfdf';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('Reference', wire1X, wireTopY - 5);
ctx.fillText('wire', wire1X, wireTopY + 8);

ctx.strokeStyle = '#ffb347'; 
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(wire2X, wireTopY);
ctx.lineTo(wire2X, wireBottomY + extensionPx); // bottom moves DOWN as it stretches
ctx.stroke();

ctx.fillStyle = '#FFB347';
ctx.textAlign = 'center';
ctx.fillText('Experimental', wire2X, wireTopY - 5);
ctx.fillText('wire', wire2X, wireTopY + 8);
ctx.textAlign = 'left';

// drawing the spirit lvl b/w two wires which is actually the measuring instrument in searle's method
const levelY = wireBottomY - 15;

ctx.fillStyle   = '#233D5C';
ctx.strokeStyle = '#2A4F7A';
ctx.lineWidth = 1.5;
ctx.fillRect(wire1X + 10, levelY - 8, wire2X - wire1X - 20, 16);
ctx.strokeRect(wire1X + 10, levelY - 8, wire2X - wire1X - 20, 16);

const bubbleOffset = extensionPx * 1.5;
const bubbleX = Math.min(wire2X - 30, wire1X + (wire2X - wire1X) / 2 + bubbleOffset);

ctx.fillStyle = 'rgba(100,223,223,0.5)';
ctx.beginPath();
ctx.arc(bubbleX, levelY, 6, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = '#64dfdf';
ctx.stroke();

ctx.fillStyle = '#64dfdf';
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('Spirit level', (wire1X + wire2X) / 2, levelY + 22);
ctx.textAlign = 'left';

// drawing the micrometer screw
const micrometerX = wire2X + 20;
const micrometerY = wireBottomY - 40;

ctx.fillStyle   = '#162844';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth   = 1.5;
ctx.fillRect(micrometerX, micrometerY, 60, 80);
ctx.strokeRect(micrometerX, micrometerY, 60, 80);

ctx.fillStyle = '#2ee59d';
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('Micro-', micrometerX + 30, micrometerY + 38);
ctx.fillText('meter', micrometerX + 30, micrometerY + 50);
ctx.textAlign = 'left';

if (extensionPx > 2) { ctx.strokeStyle = '#ff6B6b';
ctx.lineWidth = 1;
ctx.setLineDash([3, 3]); 
ctx.beginPath();
ctx.moveTo(wire2X + 10, wireBottomY);
ctx.lineTo(wire2X + 10, wireBottomY + extensionPx);
ctx.stroke();
ctx.setLineDash([]); 
ctx.fillStyle = '#ff6b6b';
ctx.font = '10px JetBrains Mono';
ctx.fillText(`ΔL=${(extension * 1000).toFixed(3)}mm`, wire2X + 14, wireBottomY + extensionPx / 2 + 4);
}

  