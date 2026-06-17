// screw gauge interactive 2d simulation, this file draws the screw gauge on the cavas and lets the user use either drag the thimble or manually type in values to see how the reading is calculated 
window.mountScrewGauge = function (wrap, readingEl, ctrlEl, hintEl) {
//canvas size
var canvasWidth = 740;  
var canvasHeight = 320;

var canvas = makeCanvas(wrap, canvasWidth, canvasHeight);
var ctx = canvas.getContext('2d');
var currentMode = 'drag';
var thimbleAngleDegrees = 0;

// one full turn moves the spindle forward by 0.5 mm .
var numberOfTurns = 0;
var isDragging = false;

var pitch = 0.5;       
var divisionsOnThimble = 50; 
var leastCount = pitch / divisionsOnThimble; 
var startingGapMM = 5;  

  // pitch Scale Reading: the last 0.5 mm mark we have passed on the main scale
function calculatePitchScaleReading() { var distanceMovedSoFar = numberOfTurns * pitch;
var lastHalfMmMark = Math.floor(distanceMovedSoFar / pitch) * pitch;
return lastHalfMmMark; }

function calculateHeadScaleReading() { var angleAfterOneFullCircle = thimbleAngleDegrees % 360;
var lineNumber = Math.round((angleAfterOneFullCircle / 360) * divisionsOnThimble);
return lineNumber % divisionsOnThimble; }

function calculateCurrentGap() { return startingGapMM + numberOfTurns * pitch; }

  ctrlEl.innerHTML = '<div class="ctrl-mode-btns">' +
'<button class="mode-btn active" id="sgMode1" onclick="sgSetMode(\'drag\')">🖱 Rotate Thimble</button>' + '<button class="mode-btn" id="sgMode2" onclick="sgSetMode(\'type\')">⌨ Type Values</button>' +
'</div>' +
'<div id="sgDragHint" style="font-size:12px;color:var(--text-mute);margin-bottom:8px;">Drag thimble up/down to rotate</div>' +
'<div id="sgTypeInputs" style="display:none;">' +
'<div class="ctrl-item">' +
'<label>PSR — Pitch Scale Reading (0.5mm steps)</label>' +
'<input type="number" id="sgPSR" min="0" max="15" step="0.5" value="2.5" oninput="sgFromType()" />' +
'</div>' + '<div class="ctrl-item">' +
'<label>HSR — Head Scale Reading (0–49)</label>' +
'<input type="number" id="sgHSR" min="0" max="49" step="1" value="18" oninput="sgFromType()" />' +
'</div>' + '</div>' +
'<div class="obs-recorder">' +
'<button onclick="sgRecord()">＋ Record Observation</button>' +
'<div class="obs-list" id="sgObsList"></div>' +
'</div>';

window.sgSetMode = function (newMode) {
currentMode = newMode;

document.getElementById('sgMode1').classList.toggle('active', newMode === 'drag');
document.getElementById('sgMode2').classList.toggle('active', newMode === 'type');
document.getElementById('sgDragHint').style.display = (newMode === 'drag') ? 'block' : 'none';
document.getElementById('sgTypeInputs').style.display = (newMode === 'type') ? 'block' : 'none';

if (newMode === 'drag') { hintEl.textContent = 'Drag thimble up/down to rotate'; }

else { hintEl.textContent = 'Enter PSR and HSR values'; } };

var typedPSR = 2.5;
var typedHSR = 18;

window.sgFromType = function () { var psrInput = document.getElementById('sgPSR').value;
var hsrInput = document.getElementById('sgHSR').value;

typedPSR = parseFloat(psrInput);
if (isNaN(typedPSR)) { typedPSR = 0; }

typedHSR = parseInt(hsrInput);
if (isNaN(typedHSR)) { typedHSR = 0; }

drawEverything();
};

// recording observations
var howManyObservationsSoFar = 0;

window.sgRecord = function () {
howManyObservationsSoFar = howManyObservationsSoFar + 1;
var listElement = document.getElementById('sgObsList');
var psrToShow = (currentMode === 'type') ? typedPSR : calculatePitchScaleReading();
var hsrToShow = (currentMode === 'type') ? typedHSR : calculateHeadScaleReading();
var finalReading = (psrToShow + hsrToShow * leastCount).toFixed(2);
var newRow = document.createElement('div');
newRow.innerHTML =
'<span>#' + howManyObservationsSoFar + ' PSR=' + psrToShow + ' HSR=' + hsrToShow + '</span>' +
'<span>' + finalReading + 'mm</span>';

listElement.appendChild(newRow);
listElement.scrollTop = listElement.scrollHeight;
};

var frameY = 130;     
var barrelX = 310;     
function drawEverything() {
ctx.clearRect(0, 0, canvasWidth, canvasHeight);
ctx.fillStyle = '#0d1E35';
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
var psr = (currentMode === 'type') ? typedPSR : calculatePitchScaleReading();
var hsr = (currentMode === 'type') ? typedHSR : calculateHeadScaleReading();
var finalReading = psr + hsr * leastCount;
var gapInMM = (currentMode === 'type') ? (psr + hsr * leastCount) : calculateCurrentGap();
var gapInPixels = Math.min(gapInMM * 14, 160);

ctx.fillStyle = '#2ee59d';
ctx.font = 'bold 13px JetBrains Mono';
ctx.fillText('SCREW GAUGE (Micrometer)', 20, 22);
ctx.fillStyle = '#4a6580';
ctx.font = '11px JetBrains Mono';
ctx.fillText('Pitch = 0.5 mm | LC = 0.01 mm | Divisions = 50', 20, 38);

// u shape frame
ctx.strokeStyle = '#2A4F7A';
ctx.lineWidth = 3;
ctx.fillStyle = '#162844';

ctx.fillRect(60, frameY + 20, 520, 22);
ctx.strokeRect(60, frameY + 20, 520, 22);

ctx.fillRect(60, frameY - 80, 22, 120);
ctx.strokeRect(60, frameY - 80, 22, 120);

ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#64dfdf';
ctx.fillRect(82, frameY - 50, 30, 90);
ctx.strokeRect(82, frameY - 50, 30, 90);
ctx.fillStyle = '#64dfdf';
ctx.font = '9px JetBrains Mono';
ctx.fillText('ANVIL', 85, frameY + 56);

ctx.fillStyle = '#1c3355';
ctx.strokeStyle = '#2a4f7a';
ctx.lineWidth = 1.5;
ctx.fillRect(barrelX, frameY - 30, 200, 60);
ctx.strokeRect(barrelX, frameY - 30, 200, 60);

ctx.strokeStyle = '#4a6580';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(barrelX, frameY);
ctx.lineTo(barrelX + 200, frameY);
ctx.stroke();

for (var i = 0; i <= 16; i++) {
var tickX = barrelX + i * 13;
if (tickX > barrelX + 195) { break; }

var isHalfMarkOnly = (i % 2 !== 0); 
var tickHeight = isHalfMarkOnly ? 6 : 11;
var tickY = isHalfMarkOnly ? (frameY + 2) : (frameY - tickHeight);

ctx.fillStyle = isHalfMarkOnly ? '#4a6580' : '#64dfdf';
ctx.fillRect(tickX, tickY, 1.5, tickHeight);

if (!isHalfMarkOnly) { ctx.fillStyle = '#8ba3c0';
ctx.font = '9px JetBrains Mono';
ctx.textAlign = 'center';
ctx.fillText(i * 0.5, tickX, frameY - 14);
} }
ctx.textAlign = 'left';



}}
    









