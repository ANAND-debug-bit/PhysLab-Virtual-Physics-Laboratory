//spring mas system 2d modal involves a spring with a definite mass which can be selected by user , with values inputting includes spring constant with that also showing a graph between force and x (distance moved by the spring).
window.mountSpring = function(wrap, readingEl, ctrlEl, hintEl) {

//drawing canvas 
const W = 740, H = 380;
const canvas = makeCanvas(wrap, W, H);
const ctx = canvas.getContext('2d'); 

// simulation variables --> mass , spring constant(k)
const massOptions = [0, 50, 100, 150, 200, 250];
let selectedMassIndex = 0;
let springConstant = 25;
const naturalLengthPx = 120;
const gravity = 9.8;
  
let bobY    = 0;   
let bobVelocity = 0;   

// helper function to Return the current mass in KGs (physics needs kg, not grams).
function getCurrentMassKg() { return massOptions[selectedMassIndex] / 1000; }

// to calculate how far the spring stretches in meters using Hooke's Law:
function getExtensionMetres() { return getCurrentMassKg() * gravity / springConstant; }
function getExtensionPixels() { return getExtensionMetres() * 1600; }

// building the control panel
ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Spring Constant k (N/m): <span id="springK">25</span></label>
<input type="range" id="springKRange" min="5" max="100" step="1" value="25"
oninput="springKUpdate()" /> </div>
<div class="ctrl-item" style="margin-top:8px;">
<label>Mass added (g):</label>
<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
${massOptions.map((mass, index) => `
<button class="mode-btn ${index === 0 ? 'active' : ''}"
id="massBtn${index}" onclick="springSetMass(${index})" style="flex:1;min-width:48px;" >${mass}g</button>
`).join('')}
</div>
</div>
<div style="margin-top:10px;padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;">
<div style="font-size:11px;color:var(--text-mute);font-family:var(--font-mono);margin-bottom:6px;">F vs x DATA</div>
<div id="springTable" style="font-size:11px;font-family:var(--font-mono);color:var(--text-dim);"></div>
</div>
<div class="obs-recorder">
<button onclick="springRecord()">＋ Record Point</button>
<div class="obs-list" id="springObsList"></div>
</div> `;

window.springKUpdate = function() {
springConstant = parseInt(document.getElementById('springKRange').value);
document.getElementById('springK').textContent = springConstant;
bobVelocity = 0;
};

window.springSetMass = function(index) { selectedMassIndex = index;
massOptions.forEach((_, i) => { document.getElementById('massBtn' + i)
.classList.toggle('active', i === index);
});

bobVelocity = 0; };

// record point (This will save a snapshot of the current force and extension)
let recordCount = 0;
window.springRecord = function() { recordCount++;

const currentMass = getCurrentMassKg();
const force = (currentMass * gravity).toFixed(3);     
const extensionM  = getExtensionMetres().toFixed(4);        
const extensionCm = (parseFloat(extensionM) * 100).toFixed(2); 

const list = document.getElementById('springObsList');
const row  = document.createElement('div');
row.innerHTML = ` <span>#${recordCount} m=${massOptions[selectedMassIndex]}g</span>
<span>F=${force}N x=${extensionCm}cm</span> `;
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

function updateDataTable() { const rows = massOptions.map(massGrams => {
const massKg = massGrams / 1000;
const force  = (massKg * gravity).toFixed(2);           
const extensionCm = (massKg * gravity / springConstant * 100).toFixed(2); 

return ` <div style="display:flex;justify-content:space-between;
border-bottom:1px solid var(--border);padding:2px 0;">
<span style="color:var(--text-mute)">${massGrams}g</span>
<span>${force}N</span>
<span style="color:var(--amber)">${extensionCm}cm</span>
</div> `;
});

document.getElementById('springTable').innerHTML = `<div style="display:flex;justify-content:space-between;
color:var(--green);margin-bottom:4px;">
<span>Mass</span><span>F(N)</span><span>x(cm)</span>
</div>` + rows.join('');
}

const springX = W / 2 - 30; 
const ceilingY = 40;                   
const anchorY = ceilingY + naturalLengthPx; 

// drawing a zig zag linewhich looks like a coiled spring
// numCoils --> how many zigzag loops to draw
function drawSpringCoil(x, y1, y2, numCoils) { const coilWidth = 22;  const stepHeight = (y2 - y1) / numCoils; 
ctx.beginPath();
ctx.moveTo(x, y1); 

for (let i = 0; i < numCoils; i++) { const loopTop = y1 + i * stepHeight;
ctx.lineTo(x + coilWidth, loopTop + stepHeight * 0.25);
ctx.lineTo(x - coilWidth, loopTop + stepHeight * 0.75);
ctx.lineTo(x,loopTop + stepHeight); }

ctx.strokeStyle = '#2ee59d'; 
ctx.lineWidth = 2;
ctx.stroke(); }

// adding the animation loop
let animationFrameId;
function animationLoop() { const equilibriumY = anchorY + getExtensionPixels();

// simple damped spring physics 
// to calculate a restoring force that pulls the bob toward equilibrium, then apply a damping factor so it slows down and stops (not bounce forever for infinity).

const springForce = springConstant * (bobY - equilibriumY) / 1600;
const dampingFactor = 0.85; 
const isFarFromRest = Math.abs(bobY - equilibriumY) > 0.5;
const isStillMoving = Math.abs(bobVelocity) > 0.1;

if (isFarFromRest || isStillMoving) { bobVelocity += (-gravity * getCurrentMassKg() - springForce * 10) * 0.01;
bobVelocity *= dampingFactor; 
bobY += bobVelocity; } 
else { bobY        = equilibriumY;
bobVelocity = 0; }
drawFrame(); 
animationFrameId = requestAnimationFrame(animationLoop);}
bobY = anchorY;
function drawFrame() { ctx.clearRect(0, 0, W, H);

ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, W, H);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText("SPRING-MASS SYSTEM (Hooke's Law)", 20, 22);

ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('F = kx  →  k = F/x (N/m)', 20, 38);

ctx.fillStyle = '#1c3355';
ctx.fillRect(springX - 60, ceilingY - 10, 180, 18);

ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1.5;
ctx.strokeRect(springX - 60, ceilingY - 10, 180, 18);

for (let i = 0; i < 8; i++) { ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(springX - 50 + i * 22, ceilingY - 10);
ctx.lineTo(springX - 60 + i * 22, ceilingY - 20);
ctx.stroke(); }

ctx.strokeStyle = 'rgba(100,223,223,0.4)';
ctx.lineWidth = 1;
ctx.setLineDash([3, 3]); 
ctx.beginPath();
ctx.moveTo(springX - 55, ceilingY + 8);
ctx.lineTo(springX - 55, anchorY);
ctx.stroke();
ctx.setLineDash([]); 

ctx.fillStyle = '#64dfdf';
ctx.font = '10px JetBrains Mono';
ctx.fillText('L₀', springX - 78, (ceilingY + anchorY) / 2);

const springBottomY = Math.min(bobY - 18, anchorY + getExtensionPixels());
drawSpringCoil(springX, ceilingY + 8, springBottomY, 10);

// adding extension arrow (if the spring is stretched,show a red annotation with the distance)
const stretchPixels = bobY - anchorY;
if (stretchPixels > 5) { const extensionCm = (stretchPixels / 1600 * 100).toFixed(2);
ctx.strokeStyle = '#ff6b6b'; 
ctx.lineWidth = 1;
ctx.setLineDash([3, 3]);
ctx.beginPath();
ctx.moveTo(springX + 55, anchorY);
ctx.lineTo(springX + 55, bobY);
ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle = '#ff6b6b';
ctx.font = '11px JetBrains Mono';
ctx.fillText(`x = ${extensionCm} cm`, springX + 60, (anchorY + bobY) / 2 + 4); }

const currentMassGrams = massOptions[selectedMassIndex];
const blockWidth  = 60;
const blockHeight = 36;

ctx.fillStyle = '#233d5c';
ctx.strokeStyle = currentMassGrams > 0 ? '#ffb347' : '#2a4f7a'; 
ctx.lineWidth = 2;
ctx.fillRect(springX - blockWidth / 2, bobY, blockWidth, blockHeight);
ctx.strokeRect(springX - blockWidth / 2, bobY, blockWidth, blockHeight);

ctx.fillStyle = currentMassGrams > 0 ? '#ffb347' : '#4a6580';
ctx.font = 'bold 12px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(currentMassGrams + 'g', springX, bobY + 22);
ctx.textAlign = 'left'; 

// adding force arrow
const massKg = getCurrentMassKg();
const forceN = massKg * gravity;

if (massKg > 0) { const arrowLength = Math.min(forceN * 8, 70); 
const arrowX = springX + 50;
const arrowY = bobY + 18; 

ctx.strokeStyle = '#ff6b6b';
ctx.lineWidth   = 2;
ctx.beginPath();
ctx.moveTo(arrowX, arrowY);
ctx.lineTo(arrowX, arrowY + arrowLength);
ctx.stroke();

ctx.fillStyle = '#ff6b6b';
ctx.beginPath();
ctx.moveTo(arrowX, arrowY + arrowLength + 6);
ctx.lineTo(arrowX - 5, arrowY + arrowLength - 2);
ctx.lineTo(arrowX + 5, arrowY + arrowLength - 2);
ctx.closePath();
ctx.fill();

ctx.fillStyle = '#ff6b6b';
ctx.font = '10px JetBrains Mono';
ctx.fillText(`F=${forceN.toFixed(2)}N`, arrowX + 8, arrowY + arrowLength / 2); }

    
// (F-x graph)A small live graph showing Force vs Extension for all masses.
const graphX = 440, graphY = 60, graphW = 260, graphH = 200;

ctx.fillStyle = '#112240';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1;
ctx.fillRect(graphX, graphY, graphW, graphH);
ctx.strokeRect(graphX, graphY, graphW, graphH);

ctx.fillStyle  = '#4A6580';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText("F-x Graph (Hooke's Law)", graphX + graphW / 2, graphY - 8);
ctx.textAlign = 'left';

const originX = graphX + 30;
const originY = graphY + graphH - 20;

ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(originX, graphY + 10); ctx.lineTo(originX, originY); ctx.stroke();
ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(graphX + graphW - 10, originY); ctx.stroke();

ctx.fillStyle  = '#8ba3c0';
ctx.font  = '9px JetBrains Mono';
ctx.fillText('F(N)', graphX + 8, graphY + 20);
ctx.textAlign  = 'right';
ctx.fillText('x(m)', graphX + graphW - 8, originY + 12);
ctx.textAlign  = 'left';

const maxForce = 0.25 * gravity; 
const maxExtension = maxForce / springConstant;

massOptions.forEach((massGrams, index) => { const m  = massGrams / 1000;
const f  = m * gravity;
const x  = m * gravity / springConstant;
const px = originX + (x / maxExtension) * (graphW - 50); 
const py = originY - (f / maxForce) * (graphH - 30); 

ctx.fillStyle = (index === selectedMassIndex) ? '#ffb347' : '#2ee59d';
ctx.beginPath();
ctx.arc(px, py, index === selectedMassIndex ? 6 : 4, 0, Math.PI * 2);
ctx.fill(); });

ctx.strokeStyle = 'rgba(168,85,247,0.5)';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(originX, originY);
ctx.lineTo(originX + (graphW - 50), originY - (graphH - 30));
ctx.stroke();

ctx.fillStyle = '#a855f7';
ctx.font  = '10px JetBrains Mono';
ctx.fillText(`k=${springConstant} N/m`, graphX + graphW - 75, graphY + 30);

const extensionM  = getExtensionMetres();
const extensionCm = (extensionM * 100).toFixed(2);
const force = massKg * gravity;

ctx.fillStyle   = '#112240';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, H - 72, 390, 58, 8);
ctx.fill();
ctx.stroke();

ctx.fillStyle = '#2ee59d';
ctx.font = '11px JetBrains Mono';
ctx.fillText( `F = mg = ${massKg}×9.8 = ${force.toFixed(3)} N`, 36, H - 50 );
ctx.fillText( `x = F/k = ${force.toFixed(3)}/${springConstant} = ${extensionM.toFixed(4)} m = ${extensionCm} cm`, 36, H - 32 );

// live reading panel
setReadings(readingEl, [ ['Mass', massOptions[selectedMassIndex], 'g'],
['Force F',    force.toFixed(3), 'N'],
['Extension x', extensionCm, 'cm'],
['k (spring)', springConstant, 'N/m'], ]);

updateDataTable(); }
animationLoop(); 
hintEl.textContent = 'Click mass buttons to add weights';
return () => cancelAnimationFrame(animationFrameId);
};
