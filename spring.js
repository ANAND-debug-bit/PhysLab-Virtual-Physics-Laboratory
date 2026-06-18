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
</div>
`;
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
ctx.lineWidth   = 2;
ctx.stroke(); }

  