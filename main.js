// global helper to draw a rounded triangle , this function will be used by all canvases to draw cool rounded boxes 
window.roundRect = function(ctx,x,y,w,h,r) {
ctx.beginPath();
ctx.moveTo(x+r,y);
ctx.lineTo(x+w-r,y);
ctx.quadraticCurveTo(x+w,y,x+w,y+r);
ctx.lineTo(x+w,y+h-r);
ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
ctx.lineTo(x+r,y+h);
ctx.quadraticCurveTo(x,y+h,x,y+h-r);
ctx.lineTo(x,y+r);
ctx.quadraticCurveTo(x,y,x+r,y);
ctx.closePath(); };

// creating the canvas element inside the wrapper div 
// w(width) , h(height)
function makeCanvas(wrap,w,h){
const c = document.createElement('canvas');
c.width= w;
c.height= h;
c.style.width = '100%' ;
c.style.cursor = 'ew-resize' ;
wrap.appendChild(c);
return c; }

window.makeCanvas = makeCanvas ;

// to update the readings value display with label/value/unit 
function setReadings(container, rows) {
container.innerHTML = rows.map(([label, val, unit]) => `
<div class="reading-row">
<span class="reading-label">${label}</span>
<span><span class="reading-val">${val}</span><span class="reading-unit">${unit}</span></span>
</div>
`).join('');
}
window.setReadings = setReadings;

// to run the animated background on the screen invloving 3 different speed and color sine waves , a pendulum and a moving vernier calliper 

(function() { const canvas = document.getElementById('heroCanvas');
if (!canvas) return;
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let t = 0;

// Three sine waves
const waves = [
{ amp: 40, freq: 0.025, speed: 0.04, color: '#2EE59D', alpha: 0.9, y: H/2 - 30 },
{ amp: 28, freq: 0.04,  speed: 0.06, color: '#64DFDF', alpha: 0.6, y: H/2 },
{ amp: 18, freq: 0.06,  speed: 0.09, color: '#FFB347', alpha: 0.4, y: H/2 + 30 },
];

// Pendulum properties
const pend = { cx: W - 90, cy: 60,   
len: 80,               
angle: Math.PI / 6,   
angV: 0,              
g: 9.8,               
dt: 0.04};

// Draw a faint grid in the background
function drawGrid() { ctx.strokeStyle = 'rgba(30,58,95,0.6)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 40) {
ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
} }

// Draw the three animated sine waves
function drawWaves() { waves.forEach(w => {
ctx.beginPath();
for (let x = 0; x <= W; x += 2) { const y = w.y + w.amp * Math.sin(x * w.freq + t * w.speed * 60);
x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
ctx.strokeStyle = w.color;
ctx.globalAlpha = w.alpha;
ctx.lineWidth = 2.5;
ctx.stroke();
ctx.globalAlpha = 1; 
}); }

// to draw a swinging pendulum using basic physics
function drawPendulum() {
pend.angV += (-pend.g / pend.len) * Math.sin(pend.angle) * pend.dt;
pend.angV *= 0.999;    // tiny damping so it doesn't swing forever
pend.angle += pend.angV;
const bx = pend.cx + pend.len * Math.sin(pend.angle);
const by = pend.cy + pend.len * Math.cos(pend.angle);

ctx.beginPath();
ctx.moveTo(pend.cx, pend.cy);
ctx.lineTo(bx, by);
ctx.strokeStyle = '#8ba3c0';
ctx.lineWidth = 1.5;
ctx.stroke();
ctx.beginPath();
ctx.arc(pend.cx, pend.cy, 4, 0, Math.PI * 2);
ctx.fillStyle = '#8ba3c0';
ctx.fill();

ctx.beginPath();
ctx.arc(bx, by, 10, 0, Math.PI * 2);
const g2 = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 10);
g2.addColorStop(0, '#ffb347');
g2.addColorStop(1, '#a06a1a');
ctx.fillStyle = g2;
ctx.fill(); }

//to draw a simple animated Vernier calliper illustration
function drawVernier() { const vx = 30, vy = H - 100;
// main scale 
ctx.fillStyle = '#162844';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1;
ctx.fillRect(vx, vy, 300, 22);
ctx.strokeRect(vx, vy, 300, 22);
ctx.fillStyle = '#64dfdf';
for (let i = 0; i <= 30; i++) { const tx = vx + i * 10;
const th = (i % 10 === 0) ? 14 : (i % 5 === 0 ? 10 : 6); 
ctx.fillRect(tx, vy + 22 - th, 1, th);

if (i % 10 === 0) { ctx.fillStyle = '#8ba3c0';
ctx.font = '9px JetBrains Mono';
ctx.fillText(i / 10, tx - 3, vy + 36);
ctx.fillStyle = '#64dfdf';
} }

// sliding jaw
const voff = 45 + 20 * Math.sin(t * 0.015);
ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
ctx.fillRect(vx + voff, vy - 8, 50, 36);
ctx.strokeRect(vx + voff, vy - 8, 50, 36);
ctx.fillStyle = '#2ee59d';
for (let i = 0; i <= 10; i++) { const tx = vx + voff + i * 4.9;
ctx.fillRect(tx, vy - 2, 1, 10); }
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 10px JetBrains Mono';
ctx.fillText('VERNIER CALLIPER', vx, vy - 14); }

// main animation loop ,, runs every frame
function frame() { ctx.clearRect(0, 0, W, H); 
drawGrid();
drawWaves();
drawPendulum();
drawVernier();
t++; 
requestAnimationFrame(frame); }
frame(); 
})();

