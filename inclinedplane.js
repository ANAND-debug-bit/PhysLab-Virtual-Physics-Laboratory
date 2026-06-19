// inclined plane 2d ineractive simulation involving critical & inclination angle, coefficient of static & kinetic friction , status of friction whether it is kinetic or static on the basis of inclination angle , alao a force analysis table , we can change the type of friction from the control panel

// drawing the canvas 
const WIDTH  = 740;  
const HEIGHT = 360;  
const canvas = window.makeCanvas(wrap, WIDTH, HEIGHT); 
const ctx = canvas.getContext('2d');                

// starting default values 
let angle = 20;      
let mass = 500;     
let staticFriction = 0.40;   
let mode = 'static'; 

let isDragging = false; 
let dragStartX = 0;     
let dragStartAngle = 0;    

const GRAVITY = 9.8;
  
// small reusable helper functions that calculate important values
// Kinetic friction is always slightly less than static friction  (reason: it's harder to start moving something than to keep it moving)
function getKineticFriction() { return staticFriction * 0.85;}

// perpendicular force only 
function getNormalForce() { const massKg = mass / 1000;  
const angleRad = angle * Math.PI / 180;          
return massKg * GRAVITY * Math.cos(angleRad); }
function getWeight() { return (mass / 1000) * GRAVITY; }

// critical angle = the exact angle where the block is just about to start sliding
function getCriticalAngle() { return Math.atan(staticFriction) * 180 / Math.PI; }
function isBlockSliding() { return angle >= getCriticalAngle();}

//building the control panel
ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Angle θ (°): <span id="incTheta">20</span></label>
<input type="range" id="incThetaR" min="1" max="75" step="0.5" value="20" oninput="incUpdate()" />
</div>
<div class="ctrl-item">
<label>Mass (g): <span id="incMass">500</span></label>
<input type="range" id="incMassR" min="100" max="2000" step="100" value="500" oninput="incUpdate()" />
</div>
<div class="ctrl-item">
<label>μₛ (static friction): <span id="incMu">0.40</span></label>
<input type="range" id="incMuR" min="0.05" max="1.0" step="0.01" value="0.40" oninput="incUpdate()" />
</div>
<div class="ctrl-mode-btns" style="margin-top:8px;">
<button class="mode-btn active" id="incM1" onclick="incSetMode('static')">Static</button>
<button class="mode-btn"        id="incM2" onclick="incSetMode('kinetic')">Kinetic</button>
</div>
<div style="margin-top:10px;padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;font-family:var(--font-mono);font-size:11px;line-height:1.9;">
<div id="incInfo"></div>
</div>
<div class="obs-recorder">
<button onclick="incRecord()">＋ Record Reading</button>
<div class="obs-list" id="incObsList"></div>
</div> `;

window.incSetMode = function(newMode) { mode = newMode;
document.getElementById('incM1').classList.toggle('active', newMode === 'static');
document.getElementById('incM2').classList.toggle('active', newMode === 'kinetic');
render();  };

window.incUpdate = function() { angle = parseFloat(document.getElementById('incThetaR').value);
mass = parseInt  (document.getElementById('incMassR').value);
staticFriction = parseFloat(document.getElementById('incMuR').value);

document.getElementById('incTheta').textContent = angle.toFixed(1);
document.getElementById('incMass').textContent  = mass;
document.getElementById('incMu').textContent    = staticFriction.toFixed(2);

updateInfoPanel(); 
render();  };

function updateInfoPanel() { const critAngle = getCriticalAngle();
const sliding = isBlockSliding();

document.getElementById('incInfo').innerHTML = ` Critical angle = <span style="color:var(--amber)">${critAngle.toFixed(2)}°</span>
<br>
μₛ = tan(θ_c) = <span style="color:var(--green)">${staticFriction.toFixed(3)}</span>
<br>
μₖ ≈ 0.85 μₛ  = <span style="color:var(--cyan)">${getKineticFriction().toFixed(3)}</span>
<br>
Status: <span style="color:${sliding ? 'var(--red)' : 'var(--green)'}">
${sliding ? '🔴 SLIDING' : '🟢 STATIC'}
</span>
`; }

// recording a reading and it will save the current angle and calculated coefficient of friction to a final where user can review 

let readingCount = 0; 

window.incRecord = function() { readingCount++;
const muFromAngle = Math.tan(angle * Math.PI / 180);

const list = document.getElementById('incObsList');
const row  = document.createElement('div');
row.innerHTML = `<span>#${readingCount} θ=${angle.toFixed(1)}°</span><span>μ=${muFromAngle.toFixed(3)}</span>`;
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

function render() { ctx.clearRect(0, 0, WIDTH, HEIGHT);
ctx.fillStyle = '#0d1E35';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('INCLINED PLANE & FRICTION', 20, 22);

ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('μₛ = tan(θ_critical)|f = μN = μmg·cosθ', 20, 38);

// precalculation part 
const angleRad = angle * Math.PI / 180;     
const massKg = mass / 1000;               
const weight = massKg * GRAVITY;          
const normalForce = weight * Math.cos(angleRad); 
const gravityAlongSlope = weight * Math.sin(angleRad); 
const maxStaticFriction = staticFriction * normalForce; 
const sliding = isBlockSliding();
const critAngle = getCriticalAngle();

// drawing the ramp 
const baseX = 80;
const baseY = 300;
const rampLength = 380;
const tipX = baseX + rampLength * Math.cos(angleRad); 
const tipY = baseY - rampLength * Math.sin(angleRad); 

ctx.fillStyle = '#112240';
ctx.fillRect(baseX - 20, baseY, rampLength + 60, 20);
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1;
ctx.strokeRect(baseX - 20, baseY, rampLength + 60, 20);

for (let i = 0; i < 20; i++) { ctx.beginPath();
ctx.moveTo(baseX - 10 + i * 22, baseY);
ctx.lineTo(baseX - 20 + i * 22, baseY + 14);
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
ctx.stroke(); }

ctx.fillStyle = '#162844';
ctx.beginPath();
ctx.moveTo(baseX, baseY);  // bottom-left
ctx.lineTo(tipX,  tipY);   // top (peak of ramp)
ctx.lineTo(tipX,  baseY);  // bottom-right (directly below the peak)
ctx.closePath();
ctx.fill();
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 2;
ctx.stroke();

ctx.strokeStyle = '#64dfdf'; 
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(baseX, baseY);
ctx.lineTo(tipX, tipY);
ctx.stroke();

ctx.strokeStyle = '#ffb347'; 
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.arc(baseX, baseY, 50, -angleRad, 0); 
ctx.stroke();
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 12px JetBrains Mono';
ctx.fillText(`θ=${angle.toFixed(1)}°`, baseX + 55, baseY - 8);

//drawing the block with its initial posn 
const BLOCK_SIZE = 40; 
const midFraction = 0.48;
const blockCenterX = baseX + rampLength * midFraction * Math.cos(angleRad);
const blockCenterY = baseY - rampLength * midFraction * Math.sin(angleRad);

ctx.save();                            
ctx.translate(blockCenterX, blockCenterY);
ctx.rotate(-angleRad);                 

const blockFillColor = sliding ? '#3d1515' : '#1c3355';    
const blockBorderColor = sliding ? '#ff6b6b' : (mode === 'kinetic' ? '#ffb347' : '#2ee59d'); 

ctx.fillStyle = blockFillColor;
ctx.strokeStyle = blockBorderColor;
ctx.lineWidth = 2;
ctx.fillRect(-BLOCK_SIZE / 2, -BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
ctx.strokeRect(-BLOCK_SIZE / 2, -BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

//mass inside block
ctx.fillStyle  = blockBorderColor;
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign  = 'center';
ctx.fillText(`${mass}g`, 0, -BLOCK_SIZE /2 +4);
ctx.textAlign  = 'left'; }