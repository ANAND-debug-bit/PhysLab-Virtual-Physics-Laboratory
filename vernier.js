// getting a 2d interactive vernier caliiper on the site under the domain of measurement

window.mountVernier = function(wrap, readingEl, ctrlEl, hintEl) {

  // Canvas size (think of it like a drawing board)
  const W = 740, H = 320;
  const canvas = makeCanvas(wrap, W, H);
  const ctx = canvas.getContext('2d'); // "ctx" is the pen to draw

  let mode = 'drag';  
  let msrMM = 12;     
  let vsrDiv = 4;   
  const LC = 0.1;     
  const nDivisions = 10; 

  let dragging = false;   
  let dragStartX = 0;      
  let dragStartMSR = 0;    

  // building the control buttons and inputs

  ctrlEl.innerHTML = ` <div class="ctrl-mode-btns">
<button class="mode-btn active" id="vMode1" onclick="vSetMode('drag')">🖱 Drag Scale</button>
<button class="mode-btn" id="vMode2" onclick="vSetMode('type')">⌨ Type Values</button>
</div>

<div id="vDragHint" style="font-size:12px;color:var(--text-mute);margin-bottom:8px;">
Drag the jaw left/right to set MSR
</div>

<div id="vTypeInputs" style="display:none;">
<div class="ctrl-item">
<label>MSR (mm) — main scale reading, enter 0 to 50</label>
<input type="number" id="vMSR" min="0" max="50" step="1" value="12" oninput="vFromType()" />
</div>
<div class="ctrl-item">
<label>VSR (division) — which vernier line matches, enter 0 to 9</label>
<input type="number" id="vVSR" min="0" max="9" step="1" value="4" oninput="vFromType()" />
</div>
</div>

<div class="obs-recorder">
<button onclick="vRecordObs()">＋ Record Observation</button>
<div class="obs-list" id="vObsList"></div>
</div> `;

window.vSetMode = function(m) {
mode = m;
// to highlight the active button 
document.getElementById('vMode1').classList.toggle('active', m === 'drag');
document.getElementById('vMode2').classList.toggle('active', m === 'type');

document.getElementById('vDragHint').style.display = m === 'drag' ? 'block' : 'none';
document.getElementById('vTypeInputs').style.display = m === 'type' ? 'block' : 'none';

hintEl.textContent = m === 'drag'
      ? 'Drag the movable jaw ←→'
      : 'Enter MSR and VSR values';
};

// user inputting msr and vsr values
window.vFromType = function() {

msrMM  = Math.max(0, Math.min(50, parseFloat(document.getElementById('vMSR').value) || 0));
vsrDiv = Math.max(0, Math.min(9,  parseInt(document.getElementById('vVSR').value)   || 0));
render(); 
};

  // to record the reading and display it
let obsCount = 0; 
window.vRecordObs = function() {
const reading = (msrMM + vsrDiv * LC).toFixed(2);
    obsCount++;

const list = document.getElementById('vObsList');
const row = document.createElement('div');
row.innerHTML = `
      <span>#${obsCount}  MSR=${msrMM}  VSR=${vsrDiv}</span>
      <span>${reading} mm</span>
`;

list.appendChild(row);
list.scrollTop = list.scrollHeight; 
};

const MAIN_X = 60;   
const MAIN_Y = 130;  
const MAIN_W = 620;  
const MAIN_H = 28;   
const MM_SCALE = 10; 
const JAW_H = 120;   


function msr2px(msr) { return MAIN_X + msr * MM_SCALE; }
// main drawing function (called every time something changes)
function render() {
ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0D1E35';
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('VERNIER CALLIPER', 20, 22);

ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('LC = 1 MSD − 1 VSD = 0.1 mm', 20, 38);
ctx.fillStyle   = '#162844';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth   = 1.5;
ctx.fillRect(MAIN_X, MAIN_Y, MAIN_W, MAIN_H);
ctx.strokeRect(MAIN_X, MAIN_Y, MAIN_W, MAIN_H);

for (let mm = 0; mm <= 60; mm++) { const tickX = MAIN_X + mm * MM_SCALE; 
if (tickX > MAIN_X + MAIN_W) break;  
const isCm  = mm % 10 === 0; 
const is5mm = mm % 5 === 0;
const tickH = isCm ? 18 : is5mm ? 12 : 7;
ctx.fillStyle = isCm ? '#64dfdf' : '#4a6580';
ctx.fillRect(tickX, MAIN_Y + MAIN_H - tickH, 1.2, tickH);

if (isCm) { ctx.fillStyle = '#8BA3C0';
ctx.font = '11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(mm / 10 + ' cm', tickX, MAIN_Y + MAIN_H + 16); }
}
ctx.textAlign = 'left';

