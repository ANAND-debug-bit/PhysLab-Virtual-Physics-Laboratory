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

// drawing the left side jaw that ofc don't move
ctx.fillStyle   = '#1c3355';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth   = 1.5;
ctx.fillRect(MAIN_X - 10, MAIN_Y - 50, 16, JAW_H + 20);
ctx.strokeRect(MAIN_X - 10, MAIN_Y - 50, 16, JAW_H + 20);

//getting the movable jaw + vernier scale
    const vjX = msr2px(msrMM);         
    const VERN_W = nDivisions * 9;     

ctx.fillStyle   = '#1c3355';
ctx.strokeStyle = '#2ee59d'; 
ctx.lineWidth   = 1.5;
ctx.fillRect(vjX - 10, MAIN_Y - 50, VERN_W + 20, JAW_H + 20);
ctx.strokeRect(vjX - 10, MAIN_Y - 50, VERN_W + 20, JAW_H + 20);


const VSD_PX = 9;
for (let i = 0; i <= nDivisions; i++) { const tickX = vjX + i * VSD_PX;
const isCoincide = (i === vsrDiv); 
const tickH = i === 0 ? 18 : isCoincide ? 16 : 8;
ctx.fillStyle = isCoincide ? '#ffb347' : '#2ee59d';
ctx.fillRect(tickX, MAIN_Y + 2, 1.5, tickH);
ctx.fillStyle = isCoincide ? '#ffb347' : '#4a6580';
ctx.font = (isCoincide ? 'bold ' : '') + '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(i, tickX, MAIN_Y + tickH + 14);
}
ctx.textAlign = 'left';

// to get a dashed vertical line at the coinciding (matching) division
const coinX = vjX + vsrDiv * VSD_PX;
ctx.strokeStyle = '#ffb347';
ctx.lineWidth   = 1;
ctx.setLineDash([4, 3]); 
ctx.beginPath();
ctx.moveTo(coinX, MAIN_Y - 10);
ctx.lineTo(coinX, MAIN_Y + 50);
ctx.stroke();
ctx.setLineDash([]); 
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 10px JetBrains Mono';
ctx.fillText(`VSR=${vsrDiv}`, coinX + 4, MAIN_Y - 14);

ctx.strokeStyle = '#2ee59d';
ctx.lineWidth   = 1;
ctx.setLineDash([3, 3]);
ctx.beginPath();
ctx.moveTo(vjX, MAIN_Y - 30);
ctx.lineTo(vjX, MAIN_Y + 2);
ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 11px JetBrains Mono';
ctx.fillText(`MSR = ${msrMM} mm`, vjX - 30, MAIN_Y - 34);
const reading = msrMM + vsrDiv * LC; // the final measurement

ctx.fillStyle   = '#112240';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth   = 1.5;
roundRect(ctx, 20, H - 72, W - 40, 58, 8);
ctx.fill();
ctx.stroke();
ctx.fillStyle = '#2ee59d';
ctx.font = '11px JetBrains Mono';
ctx.fillText('READING  =  MSR  +  (VSR × LC)', 36, H - 52);
ctx.fillText(`=  ${msrMM}  + (${vsrDiv} × ${LC})`, 36, H - 36);
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 16px JetBrains Mono';
ctx.fillText(` =  ${reading.toFixed(2)} mm`, 36, H - 17);
setReadings(readingEl, [ ['MSR',msrMM.toFixed(1),'mm'],
['VSR', vsrDiv,'div'],
['LC', LC.toFixed(1),'mm'],
['Reading', reading.toFixed(2),'mm'],
]);
}
canvas.addEventListener('mousedown', e => { if (mode !== 'drag') return; 
const rect   = canvas.getBoundingClientRect();
const scaleX = W / rect.width;
const mx     = (e.clientX - rect.left) * scaleX;
const my     = (e.clientY - rect.top) * (H / rect.height);
const vjX    = msr2px(msrMM);

if (Math.abs(mx - vjX) < 60 && my > MAIN_Y - 60 && my < MAIN_Y + JAW_H) {
dragging     = true;
dragStartX   = mx;
dragStartMSR = msrMM;
canvas.style.cursor = 'grabbing'; 
}
});

canvas.addEventListener('mousemove', e => { if (!dragging) return;
const rect   = canvas.getBoundingClientRect();
const scaleX = W / rect.width;
const mx     = (e.clientX - rect.left) * scaleX;

const delta = (mx - dragStartX) / MM_SCALE;
msrMM = Math.max(0, Math.min(40, dragStartMSR + delta));
vsrDiv = Math.round(((msrMM % 1) / LC)) % nDivisions;
msrMM = Math.floor(msrMM);
render(); 
});

canvas.addEventListener('mouseup',    () => { dragging = false; canvas.style.cursor = 'ew-resize'; });
canvas.addEventListener('mouseleave', () => { dragging = false; canvas.style.cursor = 'ew-resize'; });

// touch events (for mobile/tablet users) 

canvas.addEventListener('touchstart', e => { if (mode !== 'drag') return;
e.preventDefault(); 

const touch  = e.touches[0]; 
const rect   = canvas.getBoundingClientRect();
dragStartX   = (touch.clientX - rect.left) * (W / rect.width);
dragStartMSR = msrMM;
dragging     = true;
}, { passive: false });

canvas.addEventListener('touchmove', e => { if (!dragging) return;
e.preventDefault();

const touch = e.touches[0];
const rect  = canvas.getBoundingClientRect();
const mx    = (touch.clientX - rect.left) * (W / rect.width);
const delta = (mx - dragStartX) / MM_SCALE;

msrMM  = Math.max(0, Math.min(40, dragStartMSR + delta));
vsrDiv = Math.round(((msrMM % 1) / LC)) % nDivisions;
msrMM  = Math.floor(msrMM);

render(); }, { passive: false });

canvas.addEventListener('touchend', () => { dragging = false; });
render();
return function cleanup() {};
};

function roundRect(ctx, x, y, w, h, r) {
ctx.beginPath();
ctx.moveTo(x+r,y);
ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w, y+h,x+w-r,y+h);
ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
ctx.closePath();
}
window._roundRect = roundRect; 