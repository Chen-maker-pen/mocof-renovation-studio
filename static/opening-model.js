// Pure opening geometry, including the implicit rectangle around a new plan.
function planBoundaryWalls(room){const w=room.width,d=room.depth;return [[0,0,w,0,'top'],[w,0,w,d,'right'],[w,d,0,d,'bottom'],[0,d,0,0,'left']].map(([x1,y1,x2,y2,side])=>({x1,y1,x2,y2,height:2.7,thickness:.12,boundary_side:side}));}
function planAddOpening(project,kind,point,tolerance=.4,wallIndex=null){
 if(!['door','window'].includes(kind))throw Error('Choose a door or window.');
 const walls=project.walls||[],candidates=wallIndex===null?[...walls.map((wall,index)=>({wall,index})),...planBoundaryWalls(project.room).map(wall=>({wall,index:-1}))]:[{wall:walls[wallIndex],index:wallIndex}];
 let nearest=null;
 for(const candidate of candidates){const w=candidate.wall;if(!w)continue;const dx=w.x2-w.x1,dy=w.y2-w.y1,length=Math.hypot(dx,dy);if(length<.1)continue;const t=Math.max(0,Math.min(1,((point.x-w.x1)*dx+(point.y-w.y1)*dy)/(length*length))),distance=Math.hypot(point.x-w.x1-t*dx,point.y-w.y1-t*dy);if(!nearest||distance<nearest.distance-1e-8)nearest={...candidate,distance,length,offset:t*length};}
 if(!nearest||nearest.distance>tolerance)throw Error('Click on an outer room boundary or a drawn partition wall.');
 const width=kind==='door'?.9:1.2,w=nearest.wall,length=nearest.length;if(length<width)throw Error('This wall is too short for this opening.');
 const desired=Math.max(0,Math.min(length-width,nearest.offset-width/2)),existing=w.openings||[];
 const starts=[desired,0,length-width,...existing.flatMap(o=>[o.offset-width-.05,o.offset+o.width+.05])];
 const available=starts.filter(start=>start>=-1e-8&&start+width<=length+1e-8&&existing.every(o=>start+width<=o.offset-.049||start>=o.offset+o.width+.049)).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired));
 if(!available.length)throw Error('No free space for another opening on this wall. Choose another wall or remove an opening.');
 const sill=kind==='door'?0:Math.max(0,Math.min(.9,w.height-1.2));
 const opening={kind,offset:Math.max(0,available[0]),width,height:Math.min(kind==='door'?2.1:1.2,w.height-sill),sill};
 if(nearest.index<0){project.walls=walls.concat({...w,openings:[opening]});nearest.index=project.walls.length-1;}else w.openings=existing.concat(opening);
 return {wallIndex:nearest.index,opening};
}
function planWallSlices(wall,height){
 const length=Math.hypot(wall.x2-wall.x1,wall.y2-wall.y1),openings=wall.openings||[];
 const breaks=[...new Set([0,length,...openings.flatMap(o=>[o.offset,o.offset+o.width])])].sort((a,b)=>a-b),slices=[];
 for(let i=0;i<breaks.length-1;i++){const start=breaks[i],end=breaks[i+1],mid=(start+end)/2,opening=openings.find(o=>mid>o.offset&&mid<o.offset+o.width);if(!opening)slices.push({start,end,bottom:0,top:height});else{if(opening.sill>0)slices.push({start,end,bottom:0,top:Math.min(height,opening.sill)});if(opening.sill+opening.height<height)slices.push({start,end,bottom:opening.sill+opening.height,top:height});}}
 return slices.filter(s=>s.end-s.start>.001&&s.top-s.bottom>.001);
}
function planHasBoundaryWall(walls,room,side){const b=planBoundaryWalls(room).find(w=>w.boundary_side===side);return walls.some(w=>(Math.hypot(w.x1-b.x1,w.y1-b.y1)<.01&&Math.hypot(w.x2-b.x2,w.y2-b.y2)<.01)||(Math.hypot(w.x1-b.x2,w.y1-b.y2)<.01&&Math.hypot(w.x2-b.x1,w.y2-b.y1)<.01));}
