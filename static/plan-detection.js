// Conservative axis-aligned wall draft. Thick, long strokes only; no inferred rooms/furniture.
function detectPlanWalls(rgba, width, height, threshold=140) {
  const mask=new Uint8Array(width*height);
  for(let i=0;i<mask.length;i++)mask[i]=rgba[i*4+3]>120&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<threshold?1:0;
  const result=[];
  for(const vertical of [false,true]){
    const across=vertical?width:height,along=vertical?height:width,minLength=Math.max(18,Math.round(along*.045));
    const bands=[];
    for(let a=0;a<across;a++){
      let start=-1;
      for(let b=0;b<=along;b++){
        const dark=b<along&&mask[vertical?b*width+a:a*width+b];
        if(dark&&start<0)start=b;
        if(!dark&&start>=0){if(b-start>=minLength){
          const match=bands.find(r=>a-r.last===1&&Math.abs(start-r.start)<4&&Math.abs(b-r.end)<4);
          if(match){match.last=a;match.start=Math.max(match.start,start);match.end=Math.min(match.end,b);}else bands.push({first:a,last:a,start,end:b});
        }start=-1;}
      }
    }
    for(const band of bands){const thick=band.last-band.first+1;
      if(thick<3||thick>across*.045||band.end-band.start<thick*4)continue;
      const c=(band.first+band.last)/2;
      result.push(vertical?{x1:c/width,y1:band.start/height,x2:c/width,y2:band.end/height}:{x1:band.start/width,y1:c/height,x2:band.end/width,y2:c/height});
    }
  }
  return result.slice(0,800);
}
if(typeof module!=='undefined')module.exports={detectPlanWalls};
