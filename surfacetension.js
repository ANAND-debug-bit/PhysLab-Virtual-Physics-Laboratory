// surface tension (capillary rise interactive simulation) to illustrate the jurin's law involving 4 different options in liquids with a slider for capillary inner radius and surface tension
window.mountSurface = function (wrap, readingEl, ctrlEl, hintEl) {

// drawing canvas
const CANVAS_W = 740;
const CANVAS_H = 380;
const canvas = window.makeCanvas(wrap, CANVAS_W, CANVAS_H);
const ctx = canvas.getContext('2d');
const GRAVITY = 9.8; 

let capillaryRadius = 0.5;    
let liquidDensity = 1000;  
let surfaceTension = 0.0728; 
let contactAngle = 0;    
let selectedLiquid = 'water';

const LIQUIDS = {
water: { label:'Water',
density:1000,
tension:0.0728,
fillColour:'rgba(64,150,220,0.7)',
surfaceColour:'rgba(100,200,255,0.9)',
contactAngle: 0,
},
ethanol: {
label:'Ethanol',
density:789,
tension: 0.0223,
fillColour:'rgba(100,200,100,0.6)',
surfaceColour:'rgba(150,230,150,0.9)',
contactAngle: 0, 
},
mercury: {
label:'Mercury',
density: 13534,
tension: 0.487,
fillColour: 'rgba(180,190,200,0.8)',
surfaceColour:'rgba(210,220,230,0.9)',
contactAngle: 135, // >90° --> liquid is repelled --> depression
    },
glycerine: {
label: 'Glycerine',
density: 1260,
tension: 0.0634,
fillColour: 'rgba(200,180,100,0.6)',
surfaceColour:'rgba(230,210,130,0.9)',
contactAngle: 0,
},
};

  // function to calculate the rise
function calculateRise() {
const radiusInMetres = capillaryRadius / 1000;
const cosTheta = Math.cos(contactAngle * Math.PI / 180);
const rise = (2 * surfaceTension * cosTheta) / (radiusInMetres * liquidDensity * GRAVITY);
return rise; }

ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Liquid:</label>
<select id="sfLiquid" onchange="sfSetLiquid()"
style="width:100%;background:var(--bg3);border:1px solid var(--border2);
color:var(--text);padding:7px;border-radius:6px;
font-family:var(--font-mono);font-size:12px;">
<option value="water">Water (T = 72.8 mN/m)</option>
<option value="ethanol">Ethanol (T = 22.3 mN/m)</option>
<option value="mercury">Mercury (T = 487 mN/m, contact = 135°)</option>
<option value="glycerine">Glycerine (T = 63.4 mN/m)</option>
</select>
</div>

<div class="ctrl-item">
<label>Capillary Inner Radius r (mm): <span id="sfR">0.50</span></label>
<input type="range" id="sfRR" min="0.1" max="3.0" step="0.05" value="0.5"
oninput="sfUpdate()" />
</div>

<div class="ctrl-item">
<label>Surface Tension T (mN/m): <span id="sfT">72.8</span></label>
<input type="range" id="sfTR" min="10" max="500" step="0.5" value="72.8"
oninput="sfUpdate()" />
</div>

<div style="margin-top:8px;padding:8px;background:var(--bg3);
border:1px solid var(--border);border-radius:6px;
font-family:var(--font-mono);font-size:11px;line-height:1.9;">
<div id="sfInfo"></div>
</div>

<div class="obs-recorder">
<button onclick="sfRecord()">＋ Record Reading</button>
<div class="obs-list" id="sfObsList"></div>
</div> `;

// handling the controls
window.sfSetLiquid = function () { selectedLiquid = document.getElementById('sfLiquid').value;
const preset = LIQUIDS[selectedLiquid];

liquidDensity = preset.density;
surfaceTension = preset.tension;
contactAngle = preset.contactAngle;

document.getElementById('sfTR').value = surfaceTension * 1000;
document.getElementById('sfT').textContent = (surfaceTension * 1000).toFixed(1);

refreshInfoPanel();
render();
};

window.sfUpdate = function () {
capillaryRadius = parseFloat(document.getElementById('sfRR').value);
surfaceTension = parseFloat(document.getElementById('sfTR').value) / 1000;

document.getElementById('sfR').textContent = capillaryRadius.toFixed(2);
document.getElementById('sfT').textContent = (surfaceTension * 1000).toFixed(1);

refreshInfoPanel();
render(); };

function refreshInfoPanel() {
const rise = calculateRise();

const radiusInMetres = capillaryRadius / 1000;
const cosTheta = Math.cos(contactAngle * Math.PI / 180);
const T_derived = (rise * liquidDensity * GRAVITY * radiusInMetres) / (2 * cosTheta);

document.getElementById('sfInfo').innerHTML = ` Capillary rise h = <span style="color:var(--amber)">${(rise * 100).toFixed(3)} cm</span>
<br>
T = r·h·ρ·g / 2cosθ = <span style="color:var(--green)">${(T_derived * 1000).toFixed(2)} mN/m</span>
<br>
Contact angle θ = <span style="color:var(--cyan)">${contactAngle}°</span>
<br>
Liquid: <span style="color:var(--purple)">${LIQUIDS[selectedLiquid].label}</span> `;
}

//recording the observation
let recordCount = 0;
window.sfRecord = function () {
recordCount++;
const rise = calculateRise();
const list = document.getElementById('sfObsList');

const row = document.createElement('div');
row.innerHTML   = ` <span>#${recordCount} r=${capillaryRadius} mm  T=${(surfaceTension * 1000).toFixed(1)} mN/m</span>
<span>h=${(rise * 100).toFixed(3)} cm</span> `;
list.appendChild(row);
list.scrollTop = list.scrollHeight;
};

// four static reference tubes are drawn in addition to the interactive one.
  const REFERENCE_TUBES = [
{ radius: 0.3, centreX: 130 },
{ radius: 0.5, centreX: 230 }, 
{ radius: 1.0, centreX: 330 },
{ radius: 2.0, centreX: 430 },
];

const BEAKER_X = 80;
const BEAKER_Y = 280;
const BEAKER_W = 400;
const BEAKER_H = 70;

const TUBE_TOP = 60;          
const TUBE_BOTTOM = BEAKER_Y;  
const TUBE_HEIGHT = TUBE_BOTTOM - TUBE_TOP;
const MAX_RISE_PX = TUBE_HEIGHT * 0.85;
  
function render() { ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

const liquid = LIQUIDS[selectedLiquid];
const rise = calculateRise();

drawTitle();
drawBeaker(liquid);
drawAllTubes(liquid, rise);
drawParameterPanel(rise);
drawGraph(rise);
drawFormulaBar(rise);

window.setReadings(readingEl, [
['Radius r',capillaryRadius + ' mm', ''],
['Rise h', (rise * 100).toFixed(3) + ' cm', ''],
['T', (surfaceTension * 1000).toFixed(2), 'mN/m'],
['Contact θ', contactAngle + '°', ''],
]);
refreshInfoPanel();
}

function drawTitle() {
ctx.fillStyle = '#2ee59d';
ctx.font= 'bold 13px JetBrains Mono';
ctx.fillText('SURFACE TENSION — Capillary Rise', 20, 22);
 
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('T = r·h·ρ·g / (2·cosθ)', 20, 38);
}
 
function drawBeaker(liquid) { ctx.fillStyle = liquid.fillColour;
ctx.fillRect(BEAKER_X + 4, BEAKER_Y + 4, BEAKER_W - 8, BEAKER_H - 8);
ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(BEAKER_X, BEAKER_Y);
ctx.lineTo(BEAKER_X, BEAKER_Y + BEAKER_H);
ctx.lineTo(BEAKER_X + BEAKER_W, BEAKER_Y + BEAKER_H);
ctx.lineTo(BEAKER_X + BEAKER_W, BEAKER_Y);
ctx.stroke();
 
ctx.strokeStyle = liquid.surfaceColour;
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(BEAKER_X + 4,BEAKER_Y + 4);
ctx.lineTo(BEAKER_X + BEAKER_W - 4, BEAKER_Y + 4);
ctx.stroke();
 
ctx.fillStyle  = '#4A6580';
ctx.font = '10px JetBrains Mono';
ctx.textAlign  = 'center';
ctx.fillText(liquid.label, BEAKER_X + BEAKER_W / 2, BEAKER_Y + BEAKER_H - 10);
ctx.textAlign = 'left'; }
 
function drawAllTubes(liquid, globalRise) { REFERENCE_TUBES.forEach((tube, index) => {
const halfWidth = Math.max(3, tube.radius * 10);
const cx = tube.centreX;
 
const rInMetres = tube.radius / 1000;
const cosTheta = Math.cos(contactAngle * Math.PI / 180);
const tubeRise = (2 * surfaceTension * cosTheta) / (rInMetres * liquidDensity * GRAVITY);
const isDepressed = tubeRise < 0;
 
const risePx = Math.min(Math.abs(tubeRise) * 1500, MAX_RISE_PX);
const liquidTopY = isDepressed
? BEAKER_Y + 4 + risePx   // depression --> liquid goes down from beaker surface
: BEAKER_Y + 4 - risePx;  // rise--> liquid goes UP
 
// highlighting the second tube (index1)
const isHighlighted = index === 1;
 
ctx.strokeStyle = isHighlighted ? '#64dfdf' : '#2a4f7a';
ctx.lineWidth = isHighlighted ? 2 : 1.5;
 
ctx.beginPath();
ctx.moveTo(cx - halfWidth - 2, TUBE_TOP);
ctx.lineTo(cx - halfWidth - 2, TUBE_BOTTOM);
ctx.stroke();
 
ctx.beginPath();
ctx.moveTo(cx + halfWidth + 2, TUBE_TOP);
ctx.lineTo(cx + halfWidth + 2, TUBE_BOTTOM);
ctx.stroke();
 
// drawing the liquid column inside the tube
ctx.fillStyle = liquid.fillColour;
ctx.fillRect(cx - halfWidth, liquidTopY, halfWidth * 2, BEAKER_Y + 4 - liquidTopY);
 
// drawing the meniscus (curved liquid surface at the top of the column)
// Concave for wetting liquids (water), convex for non-wetting (mercury)
ctx.fillStyle = liquid.surfaceColour;
ctx.strokeStyle = liquid.surfaceColour;
ctx.lineWidth = 1.5;
ctx.beginPath();
if (isDepressed) { ctx.arc(cx, liquidTopY, halfWidth, 0, Math.PI, false); }
else { ctx.arc(cx, liquidTopY, halfWidth, 0, Math.PI, true); }
ctx.fill();
 
if (isHighlighted) { const hCm = (tubeRise * 100).toFixed(2);
 
ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 1;
ctx.setLineDash([4, 3]);
 
ctx.beginPath();
ctx.moveTo(cx + halfWidth + 10, BEAKER_Y + 4);
ctx.lineTo(cx + halfWidth + 10, liquidTopY);
ctx.stroke();
ctx.setLineDash([]);
 
// height label alongside the bracket
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 10px JetBrains Mono';
ctx.textAlign = 'left';
ctx.fillText(`h=${hCm}cm`, cx + halfWidth + 14, (BEAKER_Y + 4 + liquidTopY) / 2 + 4);
}
 
// radius label above each tube
ctx.fillStyle = isHighlighted ? '#64DFDF' : '#4A6580';
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(`r=${tube.radius}`, cx, TUBE_TOP - 8);
ctx.fillText('mm', cx, TUBE_TOP - 18);
ctx.textAlign = 'left';
});
}
 
function drawParameterPanel(rise) {
const panelX = 530;
const panelY = 55;
const panelW = 190;
const panelH = 200;
 
ctx.fillStyle = '#112240';
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
window._roundRect(ctx, panelX, panelY, panelW, panelH, 8);
ctx.fill();
ctx.stroke();
 
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 11px JetBrains Mono';
ctx.fillText('PARAMETERS', panelX + 12, panelY + 18);
 
const rows = [
['r (selected)', `${capillaryRadius} mm`,'#64dfdf'],
['h (rise)', `${(rise * 100).toFixed(3)} cm`,'#ffb347'],
['ρ (density)',`${liquidDensity} kg/m³`, '#a855f7'],
['θ (contact)',`${contactAngle}°`, '#2ee59d'],
['T (surface)',`${(surfaceTension * 1000).toFixed(1)} mN/m`,'#ff6b6b'],
];
 
rows.forEach(([label, value, colour], i) => { const rowY = panelY + 36 + i * 26;
ctx.fillStyle = '#4A6580';
ctx.font = '10px JetBrains Mono';
ctx.fillText(label, panelX + 12, rowY);
 
ctx.fillStyle = colour;
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'right';
ctx.fillText(value, panelX + 178, rowY);
ctx.textAlign = 'left';
}); }
 
function drawGraph(rise) { const graphX = 530;
const graphY = 55 + 165;  
const graphW = 190;
const graphH = 140;
 
ctx.fillStyle = '#0a1628';
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
ctx.fillRect(graphX, graphY, graphW, graphH);
ctx.strokeRect(graphX, graphY, graphW, graphH);
 
ctx.fillStyle = '#4A6580';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('h vs 1/r  (inverse relation)', graphX + graphW / 2, graphY - 6);
ctx.textAlign  = 'left';
 
// plotting the h v/s r curve over a range of radii to show the inverse proportionality 
const MIN_RADIUS = 0.0003; 
const MAX_RADIUS = 0.003;  
 
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 2;
ctx.beginPath();
 
let firstPoint = true;
for (let r = MIN_RADIUS; r <= MAX_RADIUS; r += 0.00005) {
const h = (2 * surfaceTension * Math.cos(contactAngle * Math.PI / 180)) / (r * liquidDensity * GRAVITY);
const px  = graphX + ((1 / r - 1 / MAX_RADIUS) / (1 / MIN_RADIUS - 1 / MAX_RADIUS)) * graphW;
const py  = graphY + graphH - Math.min(1, h / 0.35) * (graphH - 20);
 
firstPoint ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
firstPoint = false;
}
ctx.stroke();
 
// dot marking to mark the current radius on the curve
const curR = capillaryRadius / 1000;
const dotX = graphX + ((1 / curR - 1 / MAX_RADIUS) / (1 / MIN_RADIUS - 1 / MAX_RADIUS)) * graphW;
const dotY = graphY + graphH - Math.min(1, Math.abs(rise) / 0.35) * (graphH - 20);
 
ctx.fillStyle = '#ffb347';
ctx.beginPath();
ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
ctx.fill();
 
ctx.fillStyle = '#4A6580';
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('→ 1/r', graphX + graphW - 10, graphY + graphH + 14);
 
ctx.save();
ctx.translate(graphX - 8, graphY + graphH / 2);
ctx.rotate(-Math.PI / 2);
ctx.fillText('h ↑', 0, 0);
ctx.restore();
ctx.textAlign = 'left';
}
 
// bottom bar showing the full formula with real numbers substituted in
function drawFormulaBar(rise) { const barX = 20;
const barY = CANVAS_H - 60;
const barW = 490;
const barH = 46;
 
ctx.fillStyle = '#112240';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
window._roundRect(ctx, barX, barY, barW, barH, 8);
ctx.fill();
ctx.stroke();
 
ctx.fillStyle = '#2ee59d';
ctx.font = '11px JetBrains Mono';
ctx.fillText( `T = r·h·ρ·g / 2cosθ = ${capillaryRadius}mm × ${(rise * 100).toFixed(3)}cm × ${liquidDensity} × 9.8 / 2`,
barX + 8, barY + 20 );
 
// result
ctx.fillStyle = '#FFB347';
ctx.font = 'bold 14px JetBrains Mono';
ctx.fillText( `T = ${(surfaceTension * 1000).toFixed(2)} mN/m   h = ${(rise * 100).toFixed(3)} cm`,
barX + 8, barY + 38
); }
 
hintEl.textContent = 'Adjust radius and liquid to see capillary rise change';
refreshInfoPanel();
render();
return () => {};
};
 
