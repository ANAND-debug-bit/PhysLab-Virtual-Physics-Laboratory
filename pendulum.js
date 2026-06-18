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


//drawing the arc showing how wide the pendulum swings
ctx.strokeStyle = 'rgba(100,223,223,0.3)';
ctx.lineWidth   = 1;
ctx.beginPath();
ctx.arc(pivotX, pivotY, 45, Math.PI / 2 - 0.01, Math.PI / 2 + Math.abs(angle), angle < 0);
ctx.stroke();
ctx.fillStyle = '#64dfdf';
ctx.font      = '11px JetBrains Mono';
ctx.fillText(`${Math.abs(angle * 180 / Math.PI).toFixed(1)}°`, pivotX + 10, pivotY + 50);
 
// drawing the string from the pivot point to the metal ball/bob
ctx.strokeStyle = '#8ba3c0';
ctx.lineWidth   = 1.5;
ctx.beginPath();
ctx.moveTo(pivotX, pivotY);
ctx.lineTo(bobX, bobY);
ctx.stroke();
 
ctx.strokeStyle = 'rgba(46,229,157,0.3)';
ctx.lineWidth   = 1;
ctx.setLineDash([4, 3]); 
ctx.beginPath();
ctx.moveTo(pivotX + 20, pivotY);
ctx.lineTo(pivotX + 20, bobY);
ctx.stroke();
ctx.setLineDash([]); 
ctx.fillStyle = '#2ee59d';
ctx.font      = '11px JetBrains Mono';
ctx.fillText(`L = ${length.toFixed(2)} m`, pivotX + 26, (pivotY + bobY) / 2 + 4);
 
ctx.fillStyle = '#8ba3c0';
ctx.beginPath();
ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
ctx.fill();
 
// drawing the metal ball with a shiny gold gradient 
ctx.beginPath();
ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
const grad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
grad.addColorStop(0, '#ffd47a'); 
grad.addColorStop(1, '#a06a1a');
ctx.fillStyle   = grad;
ctx.fill();
ctx.strokeStyle = '#ffb347';
ctx.lineWidth   = 1.5;
ctx.stroke();
 
ctx.strokeStyle = 'rgba(255,107,107,0.2)';
ctx.lineWidth   = 1;
ctx.setLineDash([4, 4]);
ctx.beginPath();
ctx.moveTo(pivotX, pivotY);
ctx.lineTo(pivotX, pivotY + length * pxPerMeter + 30);
ctx.stroke();
ctx.setLineDash([]); 
 
const T = theoreticalT();
const calcG = (4 * Math.PI * Math.PI * length) / (T * T);
 
ctx.fillStyle   = '#112240';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth   = 1.5;
window._roundRect(ctx, 20, H - 72, W - 40, 58, 8); 
ctx.fill();
ctx.stroke();
 
ctx.fillStyle = '#2ee59d';
ctx.font      = '11px JetBrains Mono';
ctx.fillText(`T (theoretical) = 2π√(${length.toFixed(2)}/${g}) = ${T.toFixed(3)} s`, 36, H - 50);
ctx.fillText(`g = 4π²L/T² = 4π²×${length.toFixed(2)}/${(T * T).toFixed(3)} = ${calcG.toFixed(3)} m/s²`, 36, H - 32);
 
if (timing && oscCount > 0) { ctx.fillStyle = '#ffb347';
ctx.font      = 'bold 12px JetBrains Mono';
ctx.fillText(`Oscillations counted: ${oscCount}/10`, W - 260, H - 45); }
 
setReadings(readingEl, [ ['Length L', length.toFixed(2), 'm'],
['Period T', T.toFixed(3),'s'], ['g (calc)', calcG.toFixed(3),  'm/s²'],
['Amplitude', amplitude,'°'],
]);
}
 
// now it's time for the animation  loop
// it will run every frame (60 times per second) to update and redraw the pendulum
let animId;
function loop() {
if (running) {
//pendulum's angular acceleration = -(g / L) × sin(angle)
// this is actually the real physics formula for a simple pendulum
angVel += (-g / length) * Math.sin(angle) * dt;
angVel *= 0.9998;
const prevSign = Math.sign(angle);
angle += angVel;
time  += dt;
 
// count oscillations (an oscillation completes each time the pendulum crosses from the right side)

if (timing && prevSign > 0 && Math.sign(angle) <= 0) {
oscCount++;
 
if (oscCount === 1) oscStart = time;
 document.getElementById('pendTimeStatus').textContent = `⏱ Counting... (${oscCount}/10)`;
 if (oscCount >= 10) { measuredT = (time - oscStart) / 9; 
timing    = false; document.getElementById('pendTimeStatus').textContent = `✅ T (measured) = ${measuredT.toFixed(3)} s`;
} } }
 
render();
animId = requestAnimationFrame(loop);
}
loop();
hintEl.textContent = 'Adjust length & amplitude with sliders';
return () => cancelAnimationFrame(animId);
};

 