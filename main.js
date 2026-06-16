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

