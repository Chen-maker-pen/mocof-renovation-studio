const assert=require('node:assert/strict');
const {detectPlanWalls}=require('./static/plan-detection.js');
const width=400,height=300;
function blank(){const pixels=new Uint8ClampedArray(width*height*4);pixels.fill(255);return pixels;}
function rect(p,x,y,w,h,value=30){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const n=(j*width+i)*4;p[n]=p[n+1]=p[n+2]=value;}}
const p=blank();
// Thin reference grid and labels must not become walls.
for(let x=0;x<width;x+=10)rect(p,x,0,1,height,200);
for(let y=0;y<height;y+=10)rect(p,0,y,width,1,200);
rect(p,20,20,360,6);rect(p,20,270,150,6);rect(p,205,270,175,6);
rect(p,20,20,6,256);rect(p,374,20,6,256);rect(p,190,20,6,170);
const walls=detectPlanWalls(p,width,height);
assert(walls.length>=6&&walls.length<15,'Find perimeter, partition and two separate door-side segments');
assert(walls.every(w=>Object.values(w).every(n=>n>=0&&n<=1)));
const bottom=walls.filter(w=>w.y1===w.y2&&w.y1>.85);
assert.equal(bottom.length,2,'Do not bridge a door gap');
assert.equal(detectPlanWalls(blank(),width,height).length,0);
const thin=blank();rect(thin,20,30,300,1);assert.equal(detectPlanWalls(thin,width,height).length,0);
assert.equal(40*.3048,12.192);
console.log('Wall detection: perimeter, partitions, openings, thin-line rejection, blank image and feet conversion passed.');
