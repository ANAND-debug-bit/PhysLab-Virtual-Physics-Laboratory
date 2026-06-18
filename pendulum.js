//pendulum 2d interactive modal invloves length , amplitude as well as a feature of play on clicking that we can see the infinite no. of oscillations with that particular set of data and also a feature to calculate time period within 10 oscillations. 
window.mountPendulum = function(wrap, readingEl, ctrlEl, hintEl) {

// drawing canvas
const W = 740, H = 380;
const canvas = makeCanvas(wrap, W, H);
const ctx = canvas.getContext('2d'); 

let length = 0.5;     
let amplitude = 15;   
let running = true;   
let angle = amplitude * Math.PI / 180; 
let angVel = 0;       
let time = 0;         
const g = 9.8;        
const dt = 0.016;    

let oscCount = 0;         
let timing = false;      
let oscStart = 0;         
let measuredT = null;     

// building the Controls Panel (sliders + buttons) 

ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Length L (m): <span id="pendL">0.50</span></label>
<input type="range" id="pendLRange" min="0.1" max="2.0" step="0.01" value="0.5" oninput="pendUpdate()" /> </div>
<div class="ctrl-item">
<label>Amplitude θ (°): <span id="pendA">15</span></label>
<input type="range" id="pendARange" min="2" max="30" step="1" value="15" oninput="pendUpdate()" />
</div>
<div style="display:flex;gap:8px;margin-top:4px;">
<button class="mode-btn active" id="pendPlay" onclick="pendToggle()" style="flex:1;">⏸ Pause</button>
<button class="mode-btn" onclick="pendReset()" style="flex:1;">↺ Reset</button>
</div>
<div style="margin-top:10px;">
<button class="mode-btn" onclick="pendStartTime()" style="width:100%;background:rgba(46,229,157,0.1);border-color:var(--green);color:var(--green);" id="pendTimeBtn">⏱ Time 10 Oscillations</button>
<div id="pendTimeStatus" style="font-size:11px;color:var(--text-mute);margin-top:6px;font-family:var(--font-mono);">
Press button, then watch 10 swings
</div>
</div> <div class="obs-recorder">
<button onclick="pendRecord()">＋ Record Observation</button>
<div class="obs-list" id="pendObsList"></div>
</div>`;

// function which will be called when the user moves a slider 
// updates the values and restarts the pendulum from its starting angle
window.pendUpdate = function() {
length    = parseFloat(document.getElementById('pendLRange').value);
amplitude = parseFloat(document.getElementById('pendARange').value);

document.getElementById('pendL').textContent = length.toFixed(2);
document.getElementById('pendA').textContent = amplitude;

angle  = amplitude * Math.PI / 180;
angVel = 0;
oscCount = 0;
timing   = false;
measuredT = null;
document.getElementById('pendTimeStatus').textContent = 'Press button, then watch 10 swings'; };

// play / pause button 
window.pendToggle = function() { running = !running; 
document.getElementById('pendPlay').textContent = running ? '⏸ Pause' : '▶ Play';
document.getElementById('pendPlay').classList.toggle('active', running); };

// reset button
window.pendReset = function() { angle = amplitude * Math.PI / 180;
angVel   = 0;
time     = 0;
oscCount = 0;
timing   = false;
measuredT = null;
document.getElementById('pendTimeStatus').textContent = 'Press button, then watch 10 swings'; };

// building time 10 Oscillations button 
// resets the pendulum and starts counting 10 full swings to measure the time period of the pendulum
window.pendStartTime = function() { angle    = amplitude * Math.PI / 180;
angVel   = 0;
time     = 0;
oscCount = 0;
timing   = true;   
oscStart = 0;
measuredT = null;
running  = true;   
document.getElementById('pendPlay').textContent = '⏸ Pause';
document.getElementById('pendTimeStatus').textContent = '⏱ Counting oscillations... (0/10)'; };

// inserting record Observation button 
// it will save a snapshot of the current length and calculated time period to a list
let obsCount = 0;
window.pendRecord = function() { obsCount++;
const T    = theoreticalT();               
const calcG = (4 * Math.PI * Math.PI * length) / (T * T); 

const list = document.getElementById('pendObsList');
const row  = document.createElement('div');
row.innerHTML = `<span>#${obsCount} L=${length.toFixed(2)}m</span><span>T=${T.toFixed(3)}s g=${calcG.toFixed(2)}</span>`;
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

function theoreticalT() {return 2 * Math.PI * Math.sqrt(length / g);}

const pivotX = W / 2; 
const pivotY = 60;    

function render() { ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, W, H);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('SIMPLE PENDULUM', 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('T = 2π√(L/g)  →  g = 4π²L / T²', 20, 38);

const pxPerMeter = 160;
const bobX = pivotX + Math.sin(angle) * length * pxPerMeter; 
const bobY = pivotY + Math.cos(angle) * length * pxPerMeter; 

ctx.fillStyle   = '#1c3355';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth   = 2;
ctx.fillRect(pivotX - 40, 30, 80, 20);
ctx.strokeRect(pivotX - 40, 30, 80, 20);

// adding small bolts across the bracket
for (let i = -3; i <= 3; i++) { ctx.fillStyle = '#2a4f7a';
ctx.fillRect(pivotX + i * 12 - 3, 22, 6, 12); }

} }


