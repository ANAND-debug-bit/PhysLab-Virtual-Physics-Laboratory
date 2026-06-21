// lens formula(optical bench) 2D interactive simulation with sliders to change the object distance and focal length of convex lens and on the basis of that change in light rays position with that instant , the type of image i.e. real/virtual
window.mountLens = function(wrap, readingEl, ctrlEl, hintEl) { var W = 740;
var H = 360;
var canvas = makeCanvas(wrap, W, H);
var ctx = canvas.getContext('2d');

var focalLength = 15;  
var objectDist = 30;   
var isDragging = false;
var dragStartX = 0;
var dragStartU = 0;

var SCALE = 5; 
var lensX = W / 2;       
var axisY = H / 2 - 10;   

// work out that where the image will form by using the lens formula
function getImageDist() { var u = -objectDist;
var f = focalLength;
var invV = 1 / f + 1 / u;

if (Math.abs(invV) < 0.0001) { return Infinity;}
return 1 / invV; }

function getMagnification() { var v = getImageDist();
var u = -objectDist;

if (!isFinite(v)) { return 0; }
return v / u; }

// Building the control panel
ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Focal Length f (cm): <span id="lensF">15</span></label>
<input type="range" id="lensFR" min="5" max="30" step="0.5" value="15" oninput="lensUpdate()" />
</div>
<div class="ctrl-item">
<label>Object Distance u (cm): <span id="lensU">30</span></label>
<input type="range" id="lensUR" min="5" max="80" step="0.5" value="30" oninput="lensUpdate()" />
</div>
<div style="margin-top:8px;padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;font-family:var(--font-mono);font-size:11px;color:var(--text-dim);line-height:2;">
<div id="lensCalc"></div>
</div>
<div style="margin-top:8px;">
<div style="font-size:11px;color:var(--text-mute);margin-bottom:6px;font-family:var(--font-mono);">DRAG OBJECT ← → on canvas</div>
</div>
<div class="obs-recorder">
<button onclick="lensRecord()">＋ Record (u, v, f)</button>
<div class="obs-list" id="lensObsList"></div>
</div> `;

//slider work
window.lensUpdate = function() { focalLength = parseFloat(document.getElementById('lensFR').value);
objectDist = parseFloat(document.getElementById('lensUR').value);
document.getElementById('lensF').textContent = focalLength;
document.getElementById('lensU').textContent = objectDist;
updateCalc();
render(); };

function updateCalc() { var v = getImageDist();
var m = getMagnification();

// to figure out what text to show for v (it might be a real number, or infinity)
var vText;
if (isFinite(v)) { vText = v.toFixed(2); }
else { vText = '∞'; }

// figuring out what text to show for m (magnification)
var mText;
if (isFinite(m)) { mText = m.toFixed(3); }
else { mText = '∞'; }

// figuring out what text to show for the 1/f check value
var fCheckText;
if (isFinite(v)) { fCheckText = (1 / v - 1 / (-objectDist)).toFixed(3); } 
else { fCheckText = '∞';}

document.getElementById('lensCalc').innerHTML = 'u = −' + objectDist + ' cm  (object left)<br>' +
'v = ' + vText + ' cm<br>' + '1/f = 1/v − 1/u = ' + fCheckText + ' cm⁻¹<br>' +
'm = v/u = ' + mText; }

var obsCount = 0;

window.lensRecord = function() { obsCount++;
var v = getImageDist();

var fCalc;
if (isFinite(v)) { fCalc = 1 / (1 / v + 1 / objectDist); } 
else { fCalc = NaN; }

var vText;
if (isFinite(v)) { vText = v.toFixed(1); } 
else { vText = '∞'; }

var fText;
if (isFinite(fCalc)) { fText = fCalc.toFixed(2); } 
else { fText = '—'; }

var list = document.getElementById('lensObsList');
var row = document.createElement('div');
row.innerHTML = '<span>#' + obsCount + ' u= −' + objectDist + 'cm v=' + vText + 'cm</span><span>f=' + fText + 'cm</span>';
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

// Drawing the whole optical bench scene: the rail, the axis, the lens, the focal points, the object, the rays, and the image.
function render() { ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0d1E35';
ctx.fillRect(0, 0, W, H);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('LENS FORMULA — Optical Bench', 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('1/f = 1/v − 1/u  (New Cartesian Sign Convention)', 20, 38);

// drawing the optical bench rail (the grey bar on which the lens sits on)
ctx.fillStyle = '#162844';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1.5;
ctx.fillRect(20, axisY + 30, W - 40, 10);
ctx.strokeRect(20, axisY + 30, W - 40, 10);

// drawing the principal axis as a dashed line
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1;
ctx.setLineDash([6, 4]);
ctx.beginPath();
ctx.moveTo(20, axisY);
ctx.lineTo(W - 20, axisY);
ctx.stroke();
ctx.setLineDash([]);

// figuring out the lens but the easiest way i found is to represent it as a vertical line
ctx.strokeStyle = '#64dfdf';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(lensX, axisY - 80);
ctx.lineTo(lensX, axisY + 80);
ctx.stroke();

// basic helper function that draws one of the little triangle arrow tips on the ends of the lens line (so it looks like a standard biconvex lens symbol).
function drawArrow(x, y, dir) { ctx.fillStyle = '#64dfdf';
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x + dir * 12, y - 8);
ctx.lineTo(x + dir * 12, y + 8);
ctx.closePath();
ctx.fill(); }
drawArrow(lensX, axisY - 80, 1);
drawArrow(lensX, axisY + 80, -1);

ctx.fillStyle = '#64dfdf';
ctx.font = '11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('Convex Lens', lensX, axisY - 92);
ctx.textAlign = 'left';

// working out where the two focal points are (one on each side of the lens)
var f1X = lensX - focalLength * SCALE;
var f2X = lensX + focalLength * SCALE;
var focalPoints = [f1X, f2X];

for (var i = 0; i < focalPoints.length; i++) { var fx = focalPoints[i];

ctx.fillStyle = '#ff6b6b';
ctx.beginPath();
ctx.arc(fx, axisY, 4, 0, Math.PI * 2);
ctx.fill();

var focalLabel;
if (i === 0) {focalLabel = 'F'; }
else { focalLabel = "F'"; }

ctx.fillStyle = '#ff6b6b';
ctx.font = '11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(focalLabel, fx, axisY + 16);
ctx.textAlign = 'left';
}

// drawing the object as a small upward green arrow on the left side
var objX = lensX - objectDist * SCALE;
var objH = 50; 
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(objX, axisY);
ctx.lineTo(objX, axisY - objH);
ctx.stroke();

ctx.fillStyle = '#2ee59d';
ctx.beginPath();
ctx.moveTo(objX, axisY - objH);
ctx.lineTo(objX - 7, axisY - objH + 10);
ctx.lineTo(objX + 7, axisY - objH + 10);
ctx.closePath();
ctx.fill();

ctx.fillStyle = '#2ee59d';
ctx.font = '11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('O', objX, axisY + 16);
ctx.textAlign = 'left';
