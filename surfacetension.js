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


