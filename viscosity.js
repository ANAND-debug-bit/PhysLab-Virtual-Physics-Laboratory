// stokes law -- > viscosity simulator to find the coefficient of viscosity of that particular liquid by measuring the terminal velocity of the metallic ball with 4 types of metallic balls, 3 types of viscous liquid and a slider to change ball radius and also a option of drop sphere to get that particular value of viscosity .
window.mountStokes = function(wrap, readingEl, ctrlEl, hintEl) {

// drawing canvas
const CANVAS_WIDTH = 740; 
const CANVAS_HEIGHT = 380;
const canvas = window.makeCanvas(wrap, CANVAS_WIDTH, CANVAS_HEIGHT);
const ctx = canvas.getContext('2d');

// default starter values 
let sphereRadiusMm = 1.5;   
let sphereDensity = 7800;  
let liquidDensity = 1260;  
let viscosity = 1.41;  

let isFalling= false;
let sphereY= 80;     
let sphereSpeed = 0;     
let animFrameId = null;
let lastTimestamp = null;
let elapsedSeconds = 0;

// timing markers (two rubber bands on the measuring cylinder)
const MARKER_A_FRACTION = 0.30;  
const MARKER_B_FRACTION = 0.75;  
let timeAtMarkerA = null;
let timeAtMarkerB = null;
let measuredSpeed = null;  
const GRAVITY = 9.8; 

// cylinder dimensions
const CYL_LEFT = 220;
const CYL_TOP = 50;
const CYL_BOTTOM = 340;
const CYL_WIDTH = 80;
const CYL_HEIGHT = CYL_BOTTOM - CYL_TOP;

function calculateTerminalVelocity() { const radiusMetres = sphereRadiusMm / 1000;
return (2 * radiusMetres ** 2 * (sphereDensity - liquidDensity) * GRAVITY) / (9 * viscosity); }

// building the control panel 
ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Sphere radius (mm): <span id="lblRadius">1.5</span></label>
<input type="range" id="sliderRadius" min="0.5" max="5" step="0.1" value="1.5"
oninput="onRadiusChange()" />
</div>
<div class="ctrl-item">
<label>Sphere material: <span id="lblDensity">7800 kg/m³</span></label>
<select id="selectMaterial" onchange="onMaterialChange()"
style="width:100%;background:var(--bg3);border:1px solid var(--border2);
color:var(--text);padding:7px;border-radius:6px;
font-family:var(--font-mono);font-size:12px;">
<option value="7800">Steel — 7800 kg/m³</option>
<option value="2700">Aluminium — 2700 kg/m³</option>
<option value="8900">Copper — 8900 kg/m³</option>
<option value="11300">Lead — 11300 kg/m³</option>
</select>
</div>

<div class="ctrl-item">
<label>Liquid inside cylinder: <span id="lblViscosity">η = 1.41 Pa·s</span></label>
<select id="selectLiquid" onchange="onLiquidChange()"
style="width:100%;background:var(--bg3);border:1px solid var(--border2);
color:var(--text);padding:7px;border-radius:6px;
font-family:var(--font-mono);font-size:12px;">
<option value="1.41,1260">Glycerine — η = 1.41 Pa·s</option>
<option value="0.097,1070">Castor oil — η = 0.097 Pa·s</option>
<option value="0.001,1000">Water— η = 0.001 Pa·s</option>
</select>
</div>

<div style="display:flex;gap:8px;margin-top:8px;">
<button class="mode-btn active" id="btnDrop" onclick="dropSphere()" style="flex:1;">
Drop it in!
</button>
<button class="mode-btn" onclick="resetExperiment()" style="flex:1;">
↺ Start over
</button>
</div>

<div style="margin-top:8px;padding:8px;background:var(--bg3);
border:1px solid var(--border);border-radius:6px;
font-family:var(--font-mono);font-size:11px;line-height:1.9;">
<div id="infoPanel"></div>
</div>
<div class="obs-recorder">
<button onclick="saveReading()">＋ Save this reading</button>
<div class="obs-list" id="savedReadings"></div>
</div>
`;

window.onRadiusChange = function() { sphereRadiusMm = parseFloat(document.getElementById('sliderRadius').value);
document.getElementById('lblRadius').textContent = sphereRadiusMm.toFixed(1);
refreshInfoPanel();
if (!isFalling) drawFrame(); };

window.onMaterialChange = function() { sphereDensity = parseInt(document.getElementById('selectMaterial').value);
document.getElementById('lblDensity').textContent = sphereDensity + ' kg/m³';
refreshInfoPanel();
if (!isFalling) drawFrame(); };

window.onLiquidChange = function() { const parts = document.getElementById('selectLiquid').value.split(',');
viscosity     = parseFloat(parts[0]);
liquidDensity = parseFloat(parts[1]);
document.getElementById('lblViscosity').textContent = `η = ${viscosity} Pa·s`;
refreshInfoPanel();
if (!isFalling) drawFrame();
};

window.dropSphere = function() { if (isFalling) return;
resetExperiment();           
isFalling = true;
sphereY = CYL_TOP - 20;
sphereSpeed = 0;
elapsedSeconds= 0;
timeAtMarkerA = null;
timeAtMarkerB = null;
measuredSpeed = null;
lastTimestamp = null;
animFrameId = requestAnimationFrame(animationLoop);
};

window.resetExperiment = function() { isFalling = false;
cancelAnimationFrame(animFrameId);
sphereY = CYL_TOP - 20;
sphereSpeed = 0;
elapsedSeconds = 0;
timeAtMarkerA  = null;
timeAtMarkerB  = null;
measuredSpeed  = null;
drawFrame();
};

let readingCount = 0;
window.saveReading = function() { if (!measuredSpeed) return;
readingCount++;
const r = sphereRadiusMm / 1000;
const calculatedViscosity = (2 * r ** 2 * (sphereDensity - liquidDensity) * GRAVITY) / (9 * measuredSpeed);
const list = document.getElementById('savedReadings');
const row  = document.createElement('div');
row.innerHTML = ` <span>#${readingCount}  r=${sphereRadiusMm}mm  v=${measuredSpeed.toFixed(4)} m/s
</span>
<span>η = ${calculatedViscosity.toFixed(3)} Pa·s</span>`;
list.appendChild(row);
list.scrollTop = list.scrollHeight; };


// info panel 
function refreshInfoPanel() { const vTerminal = calculateTerminalVelocity();
document.getElementById('infoPanel').innerHTML = `
Expected terminal speed = <span style="color:var(--green)">${vTerminal.toFixed(5)} m/s</span>
<br>
Formula: η = 2r²(ρ−σ)g / 9v<br>
r = ${sphereRadiusMm} mm &nbsp; ρ_sphere = ${sphereDensity} &nbsp; ρ_liquid = ${liquidDensity}
<br>
${measuredSpeed ? `Measured speed = <span style="color:var(--amber)">${measuredSpeed.toFixed(5)} m/s
</span>` : 'Drop the sphere to measure its speed'} `; }


//physics simulation in loop(some physics work too)
function animationLoop(timestamp) { if (!lastTimestamp) lastTimestamp = timestamp;
const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
lastTimestamp   = timestamp;
elapsedSeconds += dt;
const r = sphereRadiusMm / 1000;  
const weightForce = (4/3) * Math.PI * r**3 * sphereDensity  * GRAVITY;  
const buoyancyForce = (4/3) * Math.PI * r**3 * liquidDensity  * GRAVITY;  
const dragForce = 6 * Math.PI * viscosity * r * sphereSpeed;          
const sphereMass = (4/3) * Math.PI * r**3 * sphereDensity;
const netForce = weightForce - buoyancyForce - dragForce;
const acceleration = netForce / sphereMass;

sphereSpeed += acceleration * dt * 30;
sphereY += sphereSpeed  * dt * 30;

const markerAy = CYL_TOP + MARKER_A_FRACTION * CYL_HEIGHT;
const markerBy = CYL_TOP + MARKER_B_FRACTION * CYL_HEIGHT;

if (sphereY >= markerAy && timeAtMarkerA === null) { timeAtMarkerA = elapsedSeconds;}
if (sphereY >= markerBy && timeAtMarkerB === null) { timeAtMarkerB = elapsedSeconds;
const distanceMetres = (MARKER_B_FRACTION - MARKER_A_FRACTION) * 0.30;
const timeDifference = timeAtMarkerB - timeAtMarkerA;
measuredSpeed = distanceMetres / timeDifference; }

// to stop the animation if sphere exits the bottom of cylinder 
if (sphereY > CYL_BOTTOM + 20) { isFalling = false; }
drawFrame();
if (isFalling) animFrameId = requestAnimationFrame(animationLoop); }

function drawFrame() { ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
const vTerminal = calculateTerminalVelocity();

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText("STOKES' LAW — Viscosity", 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('η = 2r²(ρ − σ)g / 9v', 20, 38);

   