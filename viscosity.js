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

const liquidGradient = ctx.createLinearGradient(CYL_LEFT, CYL_TOP, CYL_LEFT + CYL_WIDTH, CYL_TOP);
liquidGradient.addColorStop(0,'rgba(180,220,255,0.25)');
liquidGradient.addColorStop(0.5,'rgba(180,220,255,0.12)');
liquidGradient.addColorStop(1,'rgba(180,220,255,0.25)');
ctx.fillStyle = liquidGradient;
ctx.fillRect(CYL_LEFT, CYL_TOP, CYL_WIDTH, CYL_HEIGHT);

ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(CYL_LEFT, CYL_TOP);
ctx.lineTo(CYL_LEFT, CYL_BOTTOM); 
ctx.stroke();
ctx.beginPath(); 
ctx.moveTo(CYL_LEFT + CYL_WIDTH, CYL_TOP);
ctx.lineTo(CYL_LEFT + CYL_WIDTH, CYL_BOTTOM);
ctx.stroke();

ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(CYL_LEFT - 4, CYL_BOTTOM);
ctx.lineTo(CYL_LEFT + CYL_WIDTH + 4, CYL_BOTTOM);
ctx.stroke();

ctx.strokeStyle = '#4a6580';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(CYL_LEFT- 6,CYL_TOP);
ctx.lineTo(CYL_LEFT + CYL_WIDTH + 6, CYL_TOP);
ctx.stroke();

for (let i = 0; i <= 10; i++) { const tickY = CYL_TOP + (i / 10) * CYL_HEIGHT;
ctx.fillStyle = '#4a6580';
ctx.fillRect(CYL_LEFT + CYL_WIDTH + 2, tickY, 10, 1);
ctx.font = '9px JetBrains Mono';
ctx.fillText((i * 3) +' cm', CYL_LEFT + CYL_WIDTH + 14, tickY + 3); }

// timing starter and stopper marking lines
const markerAy = CYL_TOP + MARKER_A_FRACTION * CYL_HEIGHT;
const markerBy = CYL_TOP + MARKER_B_FRACTION * CYL_HEIGHT;

ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 2;
ctx.setLineDash([6,3]);
ctx.beginPath(); ctx.moveTo(CYL_LEFT-16, markerAy); ctx.lineTo(CYL_LEFT+CYL_WIDTH+2,markerAy); ctx.stroke();
ctx.beginPath(); ctx.moveTo(CYL_LEFT-16, markerBy); ctx.lineTo(CYL_LEFT+CYL_WIDTH+2,markerBy); ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle  = '#ffb347';
ctx.font = 'bold 10px JetBrains Mono';
ctx.textAlign = 'right';
ctx.fillText(timeAtMarkerA ? `Start ✓ ${timeAtMarkerA.toFixed(2)}s` : 'Start timing here', CYL_LEFT - 18, markerAy + 4);
ctx.fillText(timeAtMarkerB ? `Stop ✓ ${timeAtMarkerB.toFixed(2)}s` : 'Stop timing here',  CYL_LEFT - 18, markerBy  + 4);
ctx.textAlign = 'left';

ctx.strokeStyle = 'rgba(168,85,247,0.5)';
ctx.lineWidth = 1;
ctx.setLineDash([3, 3]);
ctx.beginPath(); 
ctx.moveTo(CYL_LEFT - 35, markerAy);
ctx.lineTo(CYL_LEFT - 35, markerBy);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#a855f7';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('13.5 cm', CYL_LEFT - 35, (markerAy + markerBy) / 2 + 4);
ctx.textAlign = 'left';

if (sphereY > CYL_TOP - 25 && sphereY < CYL_BOTTOM + 25) { const radiusPx  = Math.max(4, sphereRadiusMm * 4);
const sphereX = CYL_LEFT + CYL_WIDTH / 2;

const sphereGrad = ctx.createRadialGradient( sphereX - radiusPx * 0.3, sphereY - radiusPx * 0.3, 1,
sphereX, sphereY, radiusPx );
sphereGrad.addColorStop(0, '#c0c8d8');
sphereGrad.addColorStop(1, '#2a4f7a');
ctx.fillStyle = sphereGrad;
ctx.beginPath(); ctx.arc(sphereX, sphereY, radiusPx, 0, Math.PI * 2); ctx.fill();
ctx.strokeStyle = '#64dfdf'; ctx.lineWidth = 1;
ctx.beginPath(); ctx.arc(sphereX, sphereY, radiusPx, 0, Math.PI * 2); ctx.stroke();

if (sphereSpeed > 0.01 && isFalling) { const arrowLength = Math.min(40, sphereSpeed * 200);
const arrowStartX = sphereX + radiusPx + 5;
ctx.strokeStyle = '#2ee59d'; 
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(arrowStartX, sphereY);
ctx.lineTo(arrowStartX + arrowLength, sphereY);
ctx.stroke();
        
ctx.fillStyle = '#2ee59d';
ctx.beginPath();
ctx.moveTo(arrowStartX + arrowLength + 6, sphereY);
ctx.lineTo(arrowStartX + arrowLength, sphereY - 4);
ctx.lineTo(arrowStartX + arrowLength, sphereY + 4);
ctx.closePath(); ctx.fill();
        
ctx.font = '9px JetBrains Mono';
ctx.fillText(`v = ${sphereSpeed.toFixed(4)}`, arrowStartX + 8, sphereY - 8); } }

// right side info panel
const panelX = 360, panelY = 55;
ctx.fillStyle = '#112240';
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
window._roundRect(ctx, panelX, panelY, 360, 200, 8); ctx.fill(); ctx.stroke();

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 12px JetBrains Mono';
ctx.fillText("STOKES' LAW — live values", panelX + 14, panelY + 20);

const tableRows = [ ['Sphere radius r', `${sphereRadiusMm} mm = ${(sphereRadiusMm/1000).toExponential(2)} m`,'#64dfdf'],
['Sphere density ρ', `${sphereDensity} kg/m³`,'#ffb347'],
['Liquid density σ',`${liquidDensity} kg/m³`,'#ffb347'],
['Viscosity η',`${viscosity} Pa·s`, '#a855f7'],
['Terminal speed v_T', `${vTerminal.toExponential(4)} m/s`,'#2ee59d'], ];

if (measuredSpeed) { const r = sphereRadiusMm / 1000;
const etaFromMeasurement = (2 * r**2 * (sphereDensity - liquidDensity) * GRAVITY) / (9*measuredSpeed);
tableRows.push(['Measured speed', `${measuredSpeed.toExponential(4)} m/s`,'#ffb347']);
tableRows.push(['η (from timing)',`${etaFromMeasurement.toFixed(4)} Pa·s`,'#2ee59d']); }

tableRows.forEach(([label, value, colour], idx) => { const rowY = panelY + 38 + idx * 22;
ctx.fillStyle = '#4a6580'; ctx.font = '10px JetBrains Mono'; ctx.fillText(label, panelX + 14, rowY);
ctx.fillStyle = colour; ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'right';   ctx.fillText(value, panelX + 344, rowY); ctx.textAlign = 'left';
});

// FBD(force body diagram )
const diagX = 460, diagY = 265;
ctx.fillStyle = '#112240';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1;
window._roundRect(ctx, diagX, diagY, 240, 80, 6); ctx.fill(); ctx.stroke();
ctx.fillStyle = '#4a6580'; ctx.font = '10px JetBrains Mono';
ctx.fillText('At terminal speed:  Weight = Buoyancy + Drag', diagX + 8, diagY + 16);
ctx.fillStyle = '#ff6b6b'; ctx.fillText('↓  Weight = ρ·V·g',diagX + 8, diagY + 34);
ctx.fillStyle = '#64dfdf'; ctx.fillText('↑  Buoyancy = σ·V·g', diagX + 8, diagY + 50);
ctx.fillStyle = '#a855f7'; ctx.fillText('↑  Stokes drag = 6πηrv', diagX + 8, diagY + 66);

if (measuredSpeed) { ctx.fillStyle ='rgba(46,229,157,0.1)';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 2;
window._roundRect(ctx, CYL_LEFT - 10, CYL_BOTTOM + 10, CYL_WIDTH + 20, 28, 6);
ctx.fill(); ctx.stroke();
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign ='center';
ctx.fillText('TERMINAL SPEED REACHED ✓',CYL_LEFT + CYL_WIDTH / 2,CYL_BOTTOM + 28);
ctx.textAlign ='left'; }

ctx.fillStyle ='#112240';
ctx.strokeStyle ='#2ee59d';
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, CANVAS_HEIGHT - 60, CANVAS_WIDTH - 40, 46, 8);
ctx.fill();
ctx.stroke();

ctx.fillStyle ='#2ee59d'; ctx.font ='11px JetBrains Mono';
ctx.fillText(`η = 2×(${sphereRadiusMm}mm)²×(${sphereDensity}−${liquidDensity})×9.8 /(9×v)`,36, CANVAS_HEIGHT-40 );
ctx.fillStyle = '#ffb347'; ctx.font = 'bold 14px JetBrains Mono';
ctx.fillText( `v_T = ${vTerminal.toExponential(4)} m/s→ η = ${viscosity} Pa·s`, 36, CANVAS_HEIGHT- 18);

window.setReadings(readingEl, [ ['Radius r', sphereRadiusMm + ' mm', ''],
['Terminal speed', vTerminal.toExponential(3), 'm/s'],
['Measured speed', measuredSpeed ? measuredSpeed.toExponential(3) : '—', 'm/s'],
['Viscosity η', viscosity.toFixed(3),'Pa·s'], ]);

refreshInfoPanel(); }
hintEl.textContent = 'Press "Drop it in!" — the sphere will accelerate until drag and buoyancy balance gravity.';
drawFrame();

return function cleanup() { cancelAnimationFrame(animFrameId);
isFalling = false; }; };