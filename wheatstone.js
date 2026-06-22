// wheatstone bridge 2d interactive simulation involves sliders for changing known and unknown resistance and jockey position which can also be changed through mouse dragging.
window.mountWheatstone = function(wrap, readingEl, ctrlEl, hintEl) {
var W = 740;
var H = 380;
var canvas = makeCanvas(wrap, W, H);
var ctx = canvas.getContext('2d');

var knownR = 10;       
var unknownS = 23.5;   
var jockeyPos = 50;   
var isDragging = false;
var animT = 0;
var animId;

// figuring out where the jockey should be for the bridge to balance, based on the known and unknown resistances.
function getBalanceLength() { return (unknownS / (knownR + unknownS)) * 100; }

function isNearBalance() { return Math.abs(jockeyPos - getBalanceLength()) < 1.5; }

// figuring out how far the galvanometer needle should swing, based on how far the jockey is from the true balance point.
function getGalvDeflection() { var balanced = getBalanceLength();
return (jockeyPos - balanced) * 2.5;  }

function getCalculatedS() { return knownR * jockeyPos / (100 - jockeyPos); }

ctrlEl.innerHTML = ` <div class="ctrl-item">
<label>Known Resistance R (Ω): <span id="wbR">10</span></label>
<input type="range" id="wbRR" min="1" max="100" step="0.5" value="10" oninput="wbUpdate()" />
</div>
<div class="ctrl-item">
<label>Unknown Resistance S (Ω): <span id="wbS">23.5</span></label>
<input type="range" id="wbSR" min="1" max="200" step="0.5" value="23.5" oninput="wbUpdate()" />
</div>
<div class="ctrl-item">
<label>Jockey position l (cm): <span id="wbJ">50.0</span></label>
<input type="range" id="wbJR" min="1" max="99" step="0.1" value="50" oninput="wbJockey()" />
</div>
<div style="margin-top:8px;padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;font-family:var(--font-mono);font-size:11px;line-height:2;">
<div id="wbInfo"></div>
</div>
<div class="obs-recorder">
<button onclick="wbRecord()">＋ Record Balance Point</button>
<div class="obs-list" id="wbObsList"></div>
</div> `;

window.wbUpdate = function() { knownR = parseFloat(document.getElementById('wbRR').value);
unknownS = parseFloat(document.getElementById('wbSR').value);
document.getElementById('wbR').textContent = knownR;
document.getElementById('wbS').textContent = unknownS;
updateInfo();
render();
};

window.wbJockey = function() { jockeyPos = parseFloat(document.getElementById('wbJR').value);
document.getElementById('wbJ').textContent = jockeyPos.toFixed(1);
updateInfo();
render(); };

function updateInfo() { var balance = getBalanceLength();
var Scalc = getCalculatedS();
var galv = getGalvDeflection();

var galvColor;
var galvText;
if (isNearBalance()) { galvColor = 'var(--green)';
galvText = '✅ NULL'; } 
else { galvColor = 'var(--red)';
galvText = 'deflecting'; }

document.getElementById('wbInfo').innerHTML = 'Balance length = <span style="color:var(--amber)">' + balance.toFixed(2) + ' cm</span><br>' +
'Current l = <span style="color:var(--cyan)">' + jockeyPos.toFixed(1) + ' cm</span><br>' +
'S = R×l/(100-l) = <span style="color:var(--green)">' + Scalc.toFixed(2) + ' Ω</span><br>' +
'Galvanometer = <span style="color:' + galvColor + '">' + galvText + '</span>'; }

var obsCount = 0;

// record Balance Point
window.wbRecord = function() { obsCount++;
var Scalc = getCalculatedS();

var list = document.getElementById('wbObsList');
var row = document.createElement('div');
row.innerHTML = '<span>#' + obsCount + ' l=' + jockeyPos.toFixed(1) + 'cm R=' + knownR + 'Ω</span><span>S=' + Scalc.toFixed(2) + 'Ω</span>';
list.appendChild(row);
list.scrollTop = list.scrollHeight; };

var wireStartX = 80;
var wireEndX = 660;
var wireY = 220;
var wireLen = wireEndX - wireStartX; // 580px = 100cm

function cmToPx(cm) { return wireStartX + (cm / 100) * wireLen; }

// drawing the whole bridge: the wire, the battery, the resistance boxes, the jockey, the galvanometer, and the reading box.
function render() { ctx.clearRect(0, 0, W, H);
ctx.fillStyle = '#0d1e35';
ctx.fillRect(0, 0, W, H);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('WHEATSTONE BRIDGE (Meter Bridge)', 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('S = R × l / (100 − l)  at null deflection', 20, 38);

// wire of meter bridge 
ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 2;
ctx.fillRect(wireStartX - 20, wireY - 10, wireLen + 40, 20);
ctx.strokeRect(wireStartX - 20, wireY - 10, wireLen + 40, 20);

ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(wireStartX, wireY);
ctx.lineTo(wireEndX, wireY);
ctx.stroke();

for (var cm = 0; cm <= 100; cm += 10) { var px = cmToPx(cm);
ctx.fillStyle = '#64dfdf';
ctx.fillRect(px, wireY + 10, 1.5, 12);
ctx.fillStyle = '#8ba3c0';
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(cm, px, wireY + 28); }

for (var cm2 = 5; cm2 <= 95; cm2 += 10) { var px2 = cmToPx(cm2);
ctx.fillStyle = '#4a6580';
ctx.fillRect(px2, wireY + 10, 1, 8); }
ctx.textAlign = 'left';

// end terminals (the two little dots at each end of the wire)
ctx.fillStyle = '#64dfdf';
ctx.beginPath();
ctx.arc(wireStartX - 20, wireY, 8, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(wireEndX + 20, wireY, 8, 0, Math.PI * 2);
ctx.fill();

// battery    
var batX = W / 2 - 30;
var batY = 55;
ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#ffb347';
ctx.lineWidth = 1.5;
ctx.fillRect(batX, batY, 60, 28);
ctx.strokeRect(batX, batY, 60, 28);
ctx.fillStyle = '#ffb347';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('Battery', batX + 30, batY + 18);
ctx.textAlign = 'left';

// wires from the battery down to each end of the meter bridge wire
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(batX, batY + 14);
ctx.lineTo(wireStartX - 20, batY + 14);
ctx.lineTo(wireStartX - 20, wireY);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(batX + 60, batY + 14);
ctx.lineTo(wireEndX + 20, batY + 14);
ctx.lineTo(wireEndX + 20, wireY);
ctx.stroke();

// known resistance
var rBoxX = wireStartX - 70;
var rBoxY = wireY + 50;
ctx.fillStyle = '#233d5c';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 2;
ctx.fillRect(rBoxX, rBoxY, 60, 35);
ctx.strokeRect(rBoxX, rBoxY, 60, 35);
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('R=' + knownR + 'Ω', rBoxX + 30, rBoxY + 22);
ctx.textAlign = 'left';

// connection wires for the known resistance box
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(wireStartX - 20, wireY);
ctx.lineTo(wireStartX - 20, rBoxY);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(wireStartX - 20, rBoxY + 35);
ctx.lineTo(wireStartX - 20, wireY + 90);
ctx.stroke();

// unknown resistance
var sBoxX = wireEndX + 10;
var sBoxY = wireY + 50;
ctx.fillStyle = '#233d5c';
ctx.strokeStyle = '#ff6b6b';
ctx.lineWidth = 2;
ctx.fillRect(sBoxX, sBoxY, 60, 35);
ctx.strokeRect(sBoxX, sBoxY, 60, 35);
ctx.fillStyle = '#ff6b6b';
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('S = ?', sBoxX + 30, sBoxY + 22);
ctx.textAlign = 'left';

ctx.strokeStyle = '#ff6b6b';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(wireEndX + 20, wireY);
ctx.lineTo(wireEndX + 20, sBoxY);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(wireEndX + 20, sBoxY + 35);
ctx.lineTo(wireEndX + 20, wireY + 90);
ctx.stroke();

// common wire below (joins the bottom of R and S together)
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(wireStartX - 20, wireY + 90);
ctx.lineTo(wireEndX + 20, wireY + 90);
ctx.stroke();

// jockey 
var jockeyX = cmToPx(jockeyPos);
ctx.fillStyle = '#233d5c';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 2;
ctx.fillRect(jockeyX - 8, wireY - 30, 16, 30);
ctx.strokeRect(jockeyX - 8, wireY - 30, 16, 30);
ctx.fillStyle = '#2ee59d';
ctx.beginPath();
ctx.arc(jockeyX, wireY, 5, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#2ee59d';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('l=' + jockeyPos.toFixed(1), jockeyX, wireY - 34);
ctx.textAlign = 'left';

// galvanometer
var galvX = W / 2 - 20;
var galvY = wireY - 110;
var defl = getGalvDeflection();

// the galvanometer circle and needle turn green when balanced, and red when the bridge is not balanced
var galvColor;
if (isNearBalance()) { galvColor = '#2ee59d'; }
else { galvColor = '#ff6b6b'; }

ctx.fillStyle = '#1c3355';
ctx.strokeStyle = galvColor;
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(galvX + 20, galvY + 20, 25, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

// galvanometer needle 
ctx.strokeStyle = galvColor;
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(galvX + 20, galvY + 20);
var needleAngle = (Math.PI / 2) + Math.max(-Math.PI / 3, Math.min(Math.PI / 3, defl * 0.03));
ctx.lineTo(galvX + 20 + 18 * Math.cos(needleAngle), galvY + 20 - 18 * Math.sin(needleAngle));
ctx.stroke();

ctx.fillStyle = galvColor;
ctx.font = 'bold 11px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('G', galvX + 20, galvY + 23);
ctx.textAlign = 'left';

ctx.strokeStyle = '#8ba3c0';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(jockeyX, wireY - 30);
ctx.lineTo(jockeyX, galvY + 20);
ctx.lineTo(galvX + 45, galvY + 20);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(galvX - 5, galvY + 20);
ctx.lineTo(wireStartX + 150, galvY + 20);
ctx.lineTo(wireStartX + 150, wireY + 90);
ctx.stroke();

// Balance point marker 
var balPx = cmToPx(getBalanceLength());
ctx.strokeStyle = 'rgba(255,179,71,0.5)';
ctx.lineWidth = 1;
ctx.setLineDash([4, 3]);
ctx.beginPath();
ctx.moveTo(balPx, wireY - 8);
ctx.lineTo(balPx, wireY + 40);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#ffb347';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.textAlign = 'left';

// l and (100-l) labels underneath the wire
ctx.fillStyle = '#2ee59D';
ctx.font = '10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('l = ' + jockeyPos.toFixed(1) + ' cm', (wireStartX + jockeyX) / 2, wireY + 40);
ctx.fillText('100-l = ' + (100 - jockeyPos).toFixed(1) + ' cm', (jockeyX + wireEndX) / 2, wireY + 40);
ctx.textAlign = 'left';

if (isNearBalance()) { ctx.fillStyle = 'rgba(46,229,157,0.1)';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 2;
window._roundRect(ctx, galvX - 30, galvY - 10, 100, 70, 8);
ctx.fill();
ctx.stroke();
ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 10px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText('NULL ✅', galvX + 20, galvY - 14);
ctx.textAlign = 'left'; }

// reading box at the bottom showing the formula and the result
var Scalc = getCalculatedS();
ctx.fillStyle = '#112240';
ctx.strokeStyle = '#2ee59d';
ctx.lineWidth = 1.5;
window._roundRect(ctx, 20, H - 66, W - 40, 52, 8);
ctx.fill();
ctx.stroke();

ctx.fillStyle = '#2ee59d';
ctx.font = '11px JetBrains Mono';
ctx.fillText('S = R × l / (100-l) = ' + knownR + ' × ' + jockeyPos.toFixed(1) + ' / ' + (100 - jockeyPos).toFixed(1), 36, H - 46);

ctx.fillStyle = '#ffb347';
ctx.font = 'bold 14px JetBrains Mono';
ctx.fillText('S = ' + Scalc.toFixed(2) + ' Ω   (actual S = ' + unknownS + ' Ω)', 36, H - 24);

setReadings(readingEl, [ ['Known R', knownR, 'Ω'],
['Balance l', getBalanceLength().toFixed(2), 'cm'],
['Jockey l', jockeyPos.toFixed(1), 'cm'],
['S (calc)', Scalc.toFixed(2), 'Ω'], ]);

updateInfo(); }

canvas.addEventListener('mousedown', function(e) { var rect = canvas.getBoundingClientRect();
var mx = (e.clientX - rect.left) * (W / rect.width);
var my = (e.clientY - rect.top) * (H / rect.height);

if (Math.abs(mx - cmToPx(jockeyPos)) < 20 && Math.abs(my - wireY) < 50) { isDragging = true; }
});

canvas.addEventListener('mousemove', function(e) { if (!isDragging) { return; }

var rect = canvas.getBoundingClientRect();
var mx = (e.clientX - rect.left) * (W / rect.width);

jockeyPos = Math.max(1, Math.min(99, (mx - wireStartX) / wireLen * 100));

document.getElementById('wbJR').value = jockeyPos;
document.getElementById('wbJ').textContent = jockeyPos.toFixed(1);
updateInfo();
render(); });

canvas.addEventListener('mouseup', function() { isDragging = false; });
canvas.addEventListener('mouseleave', function() { isDragging = false; });
canvas.style.cursor = 'ew-resize';
render();
hintEl.textContent = 'Drag the jockey along the wire until galvanometer shows null';
return function() {};
};