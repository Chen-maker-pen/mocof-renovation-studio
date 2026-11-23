// Run against an actual floor-plan image with Sharp installed; no customer image is committed.
const assert=require('node:assert/strict');
const {detectPlanWalls}=require('./static/plan-detection.js');
const sharp=require(process.env.SHARP_MODULE||'sharp');
(async()=>{
 const {data,info}=await sharp(process.argv[2]).resize({width:1400}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const walls=detectPlanWalls(data,info.width,info.height,220);
 assert(walls.length>=20&&walls.length<=40,'Expected building walls, not dozens of furnishings');
 for(const [x,y,w,h] of [[370,205,95,75],[350,510,70,135],[810,500,50,110]]){
  assert(!walls.some(l=>{const mx=(l.x1+l.x2)*700,my=(l.y1+l.y2)*info.height/2;return mx>x&&mx<x+w&&my>y&&my<y+h;}),'Do not extrude bed, sofa or kitchen island as a wall');
 }
 assert(!walls.some(w=>w.y1>.85||w.y2>.85),'Ignore FLOOR PLAN caption and underline');
 console.log(`Actual image: ${walls.length} structural segments; furniture and caption excluded.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
