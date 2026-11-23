// Extract thick wall cores, excluding thin furniture, text and dimension lines.
function detectPlanWalls(rgba,width,height,threshold=170){
 const mask=new Uint8Array(width*height),cutoff=Math.min(threshold,185);
 for(let i=0;i<mask.length;i++)mask[i]=rgba[i*4+3]>120&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<cutoff?1:0;
 const stride=width+1,integral=new Uint32Array((width+1)*(height+1));
 for(let y=0;y<height;y++){let sum=0;for(let x=0;x<width;x++){sum+=mask[y*width+x];integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+sum;}}
 const size=Math.max(3,Math.round(Math.max(width,height)*.0045)),radius=Math.floor(size/2),core=new Uint8Array(width*height);
 for(let y=radius;y<height-radius;y++)for(let x=radius;x<width-radius;x++){const x0=x-radius,y0=y-radius,x1=x+radius+1,y1=y+radius+1,area=(x1-x0)*(y1-y0);const sum=integral[y1*stride+x1]-integral[y0*stride+x1]-integral[y1*stride+x0]+integral[y0*stride+x0];if(sum>=area*.92)core[y*width+x]=1;}
 const result=[];
 for(const vertical of [false,true]){
  const across=vertical?width:height,along=vertical?height:width,minLength=Math.max(15,Math.round(along*.025)),bands=[];
  for(let a=0;a<across;a++){let start=-1;for(let b=0;b<=along;b++){const dark=b<along&&core[vertical?b*width+a:a*width+b];if(dark&&start<0)start=b;if(!dark&&start>=0){if(b-start>=minLength){const match=bands.find(r=>a-r.last===1&&Math.min(b,r.end)-Math.max(start,r.start)>.75*Math.max(b-start,r.end-r.start));if(match){match.last=a;match.start=Math.min(match.start,start);match.end=Math.max(match.end,b);}else bands.push({first:a,last:a,start,end:b});}start=-1;}}}
  const lines=bands.filter(b=>b.end-b.start>(b.last-b.first+size)*2).map(b=>({c:(b.first+b.last)/2,start:Math.max(0,b.start-radius),end:Math.min(along,b.end+radius)}));
  const merged=[];
  for(const l of lines){const old=merged.find(r=>Math.abs(r.c-l.c)<=size*1.5&&Math.min(r.end,l.end)-Math.max(r.start,l.start)>0);if(old){old.c=(old.c+l.c)/2;old.start=Math.min(old.start,l.start);old.end=Math.max(old.end,l.end);}else merged.push(l);}
  for(const l of merged)result.push(vertical?{x1:l.c/width,y1:l.start/height,x2:l.c/width,y2:l.end/height}:{x1:l.start/width,y1:l.c/height,x2:l.end/width,y2:l.c/height});
 }
 return result.slice(0,800);
}
function replaceConvertedWalls(existing,walls,conversion,replaceAll=false){
 const priorIds=new Set(conversion?.wall_ids||[]);
 // Legacy conversions did not mark walls: rebuilding replaces that flawed draft.
 const kept=replaceAll||conversion&&!conversion.wall_ids?[]:(existing||[]).filter(w=>!priorIds.has(w.id));
 const added=walls.map(w=>({...w,id:crypto.randomUUID(),source:"floor-plan-import"}));
 return {walls:kept.concat(added),wall_ids:added.map(w=>w.id)};
}
if(typeof module!=="undefined")module.exports={detectPlanWalls,replaceConvertedWalls};
