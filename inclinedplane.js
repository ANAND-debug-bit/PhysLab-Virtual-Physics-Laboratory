// inclined plane 2d ineractive simulation involving critical & inclination angle, coefficient of static & kinetic friction , status of friction whether it is kinetic or static on the basis of inclination angle , alao a force analysis table , we can change the type of friction from the control panel

window.mountInclined = function(wrap, readingEl, ctrlEl, hintEl) {

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
  
// small reusable helper functions to calculate important values
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
ctx.moveTo(baseX, baseY);  
ctx.lineTo(tipX,  tipY);   
ctx.lineTo(tipX,  baseY);  
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
ctx.textAlign  = 'left';

// drawing force arrows 
// weight(mg) force arrow
const weightArrowLen = weight * 12; 
ctx.strokeStyle = '#ff6b6b'; 
ctx.lineWidth   = 2;
ctx.beginPath();
ctx.moveTo(0, -BLOCK_SIZE / 2);                    
ctx.lineTo(0, -BLOCK_SIZE / 2 + weightArrowLen);   
ctx.stroke();
 
ctx.fillStyle = '#ff6b6b';
ctx.beginPath();
ctx.moveTo( 0, -BLOCK_SIZE / 2 + weightArrowLen + 6);  
ctx.lineTo(-5, -BLOCK_SIZE / 2 + weightArrowLen - 2);  
ctx.lineTo( 5, -BLOCK_SIZE / 2 + weightArrowLen - 2);  
ctx.closePath();
ctx.fill();
 
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(`W=${weight.toFixed(1)}N`, 22, -BLOCK_SIZE / 2 + weightArrowLen / 2);
 
// normal force (N) arrow
const normalArrowLen = normalForce * 12;
ctx.strokeStyle = '#64dfdf'; 
ctx.lineWidth   = 2;
ctx.beginPath();
ctx.moveTo(0, -BLOCK_SIZE);                         
ctx.lineTo(0, -BLOCK_SIZE - normalArrowLen);       
ctx.stroke();
 
ctx.fillStyle = '#64dfdf';
ctx.beginPath();
ctx.moveTo( 0, -BLOCK_SIZE - normalArrowLen - 6);  
ctx.lineTo(-5, -BLOCK_SIZE - normalArrowLen + 2);  
ctx.lineTo( 5, -BLOCK_SIZE - normalArrowLen + 2);  
ctx.closePath();
ctx.fill();
 
ctx.fillText(`N=${normalForce.toFixed(1)}N`, 22, -BLOCK_SIZE - normalArrowLen / 2);
 
// friction force (f) arrow
const frictionArrowLen = Math.min(maxStaticFriction, gravityAlongSlope) * 12;
const frictionColor = sliding ? '#ff6b6b' : '#2ee59d';
ctx.strokeStyle = frictionColor;
ctx.lineWidth   = 2;
ctx.beginPath();
ctx.moveTo(-BLOCK_SIZE / 2,-BLOCK_SIZE / 2); 
ctx.lineTo(-BLOCK_SIZE / 2 - frictionArrowLen,  -BLOCK_SIZE / 2); 
ctx.stroke();
 
ctx.fillStyle = frictionColor;
ctx.beginPath();
ctx.moveTo(-BLOCK_SIZE / 2 - frictionArrowLen - 6, -BLOCK_SIZE / 2);    
ctx.lineTo(-BLOCK_SIZE / 2 - frictionArrowLen + 2, -BLOCK_SIZE / 2 - 4); 
ctx.lineTo(-BLOCK_SIZE / 2 - frictionArrowLen + 2, -BLOCK_SIZE / 2 + 4); 
ctx.closePath();
ctx.fill();
 
ctx.textAlign = 'center';
ctx.fillText( `f=${gravityAlongSlope.toFixed(1)}N`, -BLOCK_SIZE / 2 - frictionArrowLen / 2,
-BLOCK_SIZE / 2 - 10 );
ctx.restore(); 
 
// drawing the critical angle line
const critAngleRad = critAngle * Math.PI / 180;
const critTipX = baseX + rampLength * Math.cos(critAngleRad);
const critTipY = baseY - rampLength * Math.sin(critAngleRad);
 
ctx.strokeStyle = 'rgba(255,179,71,0.4)';
ctx.lineWidth = 1.5;
ctx.setLineDash([5, 4]); 
ctx.beginPath();
ctx.moveTo(baseX, baseY);
ctx.lineTo(critTipX, critTipY);
ctx.stroke();
ctx.setLineDash([]); 
 
ctx.fillStyle = '#ffb347';
ctx.font = '10px JetBrains Mono';
ctx.fillText(`θ_c = ${critAngle.toFixed(1)}°`, critTipX + 5, critTipY - 5);
 
// sliding warning box
if (sliding) { ctx.fillStyle = 'rgba(255,107,107,0.15)';
ctx.fillRect(420, 50, 290, 34);
ctx.strokeStyle = '#ff6b6b';
ctx.lineWidth= 1.5;
ctx.strokeRect(420, 50, 290, 34);
 
ctx.fillStyle = '#ff6b6b';
ctx.font = 'bold 13px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('⚠  BLOCK IS SLIDING!', 565, 72);
ctx.textAlign = 'left';
}
 
// info box for force analysis
const panelX = 470;
const panelY = 95;
 
ctx.fillStyle   = '#112240';
ctx.strokeStyle = '#1E3A5F';
ctx.lineWidth   = 1;
window._roundRect(ctx, panelX, panelY, 240, 168, 8);
ctx.fill();
ctx.stroke();
 
const forceRows = [
['Weight W',`${weight.toFixed(2)} N`,'#ff6b6b'],
['Normal N',`${normalForce.toFixed(2)} N`,'#64dfdf'],
['F_gravity ∥',`${gravityAlongSlope.toFixed(2)} N`,'#ffb347'],
['Max static f', `${maxStaticFriction.toFixed(2)} N`,'#2ee59d'],
['μₛ',staticFriction.toFixed(3),'#a855f7'],
['μₖ',getKineticFriction().toFixed(3), '#a855f7'],
];
ctx.font= 'bold 11px JetBrains Mono';
ctx.fillStyle = '#2ee59d';
ctx.fillText('FORCE ANALYSIS', panelX + 12, panelY + 18);
 
forceRows.forEach(function([label, value, color], index) { const rowY = panelY + 36 + index * 22;
 
ctx.fillStyle = '#4a6580';
ctx.font = '10px JetBrains Mono';
ctx.fillText(label, panelX + 12, rowY);
 
ctx.fillStyle = color;
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'right';
ctx.fillText(value, panelX + 228, rowY);
ctx.textAlign = 'left';
});
 
// bottom status bar to show the key formula plus the sliding status
ctx.fillStyle = '#112240';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, HEIGHT - 62, WIDTH - 40, 48, 8);
ctx.fill();
ctx.stroke();
 
// to show the coefficient of static frn = tan(θ_c) result
ctx.fillStyle = '#2ee59d';
ctx.font = '11px JetBrains Mono';
ctx.fillText( `μₛ = tan(θ_c) = tan(${critAngle.toFixed(2)}°) = ${staticFriction.toFixed(3)}`, 36, HEIGHT - 40 );
 
ctx.fillStyle = sliding ? '#ff6b6b' : '#ffb347';
ctx.font = 'bold 14px JetBrains Mono';
ctx.fillText( `θ = ${angle.toFixed(1)}°  →  ${ sliding ? 'SLIDING (θ > θ_c)'
: 'STATIC (θ < θ_c = ' + critAngle.toFixed(1) + '°)' }`, 36, HEIGHT - 20 );
 
window.setReadings(readingEl, [
['Angle θ',angle.toFixed(1), '°'],
['Critical θ', critAngle.toFixed(2), '°'],
['μₛ',staticFriction.toFixed(3), ''],
['μₖ',getKineticFriction().toFixed(3),''],
['Status',sliding ? 'SLIDING' : 'STATIC', ''],
]);
 
updateInfoPanel();  }
 
canvas.addEventListener('mousedown', function(event) {
const rect   = canvas.getBoundingClientRect();
const mouseX = (event.clientX - rect.left) * (WIDTH/ rect.width);
const mouseY = (event.clientY - rect.top)  * (HEIGHT / rect.height);
if (mouseX > 60 && mouseX < 470 && mouseY > 60 && mouseY < 310) {
isDragging     = true; dragStartX     = mouseX; dragStartAngle = angle; } });
 
canvas.addEventListener('mousemove', function(event) {
if (!isDragging) return; 
const rect   = canvas.getBoundingClientRect();
const mouseX = (event.clientX - rect.left) * (WIDTH / rect.width);
const dragDistance = dragStartX - mouseX;
const newAngle = dragStartAngle + dragDistance * 0.2;
angle = Math.max(1, Math.min(75, newAngle));
 
document.getElementById('incThetaR').value   = angle;
document.getElementById('incTheta').textContent = angle.toFixed(1);
 
updateInfoPanel();
render();
});
 
canvas.addEventListener('mouseup',function() { isDragging = false; }); 
canvas.addEventListener('mouseleave', function() { isDragging = false; });
canvas.style.cursor = 'ew-resize'; 
hintEl.textContent  = 'Drag on ramp or use slider to change angle θ';
 
updateInfoPanel(); 
render();         
return function() {};
};
