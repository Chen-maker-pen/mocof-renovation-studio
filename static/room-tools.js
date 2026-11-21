// Partition walls and named rooms share geometry with the 2D/3D studio.
(() => {
const svg=$('canvas');let drawingRoom=false,vertices=[],rotationDrag=null;
const controls=document.createElement('section');controls.className='room-controls';controls.innerHTML='<button id="partition-room">Add partition wall</button><button id="draw-new-room">Draw a new room</button><input id="new-room-name" aria-label="New room name" placeholder="Room name"><button id="close-new-room" hidden>Close room</button><button id="cancel-new-room" hidden>Cancel room</button><p id="room-tool-help" role="status"></p><div id="named-room-list"></div>';
document.querySelector('.studio-commandbar').after(controls);
function cancelRoom(){drawingRoom=false;vertices=[];$('close-new-room').hidden=true;$('cancel-new-room').hidden=true;draw();}
$('partition-room').onclick=()=>{cancelRoom();$('wall-mode').click();$('room-tool-help').textContent='Click the start and end of a partition. Connect it to existing walls to separate rooms. Furniture keeps its size.';};
$('draw-new-room').onclick=()=>{$('select-mode').click();$('view2d').click();drawingRoom=true;vertices=[];$('close-new-room').hidden=false;$('cancel-new-room').hidden=false;$('room-tool-help').textContent='Click each corner, then Close room. Walls, room name and floor area will be added.';};
$('cancel-new-room').onclick=cancelRoom;
function area(points){return Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;},0))/2;}
function intersects(a,b,c,d){const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0;}
$('close-new-room').onclick=()=>{if(vertices.length<3||area(vertices)<.25)return notify('Draw at least three corners enclosing 0.25 m² or more.');for(let i=0;i<vertices.length;i++)for(let j=i+1;j<vertices.length;j++){if(j===i+1||(i===0&&j===vertices.length-1))continue;if(intersects(vertices[i],vertices[(i+1)%vertices.length],vertices[j],vertices[(j+1)%vertices.length]))return notify('Room edges cannot cross.');}
 const height=+$('wall-height').value;if(!Number.isFinite(height)||height<.5||height>6)return notify('Choose a wall height between 0.5 and 6 metres.');
 const room={id:crypto.randomUUID(),name:$('new-room-name').value.trim().slice(0,80)||'Room '+((project.rooms?.length||0)+1),vertices:structuredClone(vertices)};
 project.walls=project.walls||[];for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length];if(Math.hypot(b.x-a.x,b.y-a.y)<.1)return notify('Room corners must be at least 10 cm apart.');}
 for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length];const exists=project.walls.some(w=>(Math.hypot(w.x1-a.x,w.y1-a.y)<.02&&Math.hypot(w.x2-b.x,w.y2-b.y)<.02)||(Math.hypot(w.x2-a.x,w.y2-a.y)<.02&&Math.hypot(w.x1-b.x,w.y1-b.y)<.02));if(!exists)project.walls.push({x1:a.x,y1:a.y,x2:b.x,y2:b.y,height,thickness:.12,room_id:room.id});}
 (project.rooms||=[]).push(room);cancelRoom();changed();$('room-tool-help').textContent=room.name+' created. Its walls can be selected and edited.';};
const oldPoint=floorPoint;floorPoint=function(event){const p=oldPoint(event);if(wallMode||drawingRoom){p.x=Math.max(0,Math.min(project.room.width,Math.round(p.x*10)/10));p.y=Math.max(0,Math.min(project.room.depth,Math.round(p.y*10)/10));const candidates=[{x:0,y:p.y},{x:project.room.width,y:p.y},{x:p.x,y:0},{x:p.x,y:project.room.depth},...(project.walls||[]).flatMap(w=>{const dx=w.x2-w.x1,dy=w.y2-w.y1,length2=dx*dx+dy*dy,t=length2?Math.max(0,Math.min(1,((p.x-w.x1)*dx+(p.y-w.y1)*dy)/length2)):0;return [{x:w.x1,y:w.y1},{x:w.x2,y:w.y2},{x:w.x1+t*dx,y:w.y1+t*dy}];})];const nearest=candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(nearest&&Math.hypot(nearest.x-p.x,nearest.y-p.y)<.16)return nearest;}return p;};
const pointerDown=svg.onpointerdown,pointerMove=svg.onpointermove,pointerUp=svg.onpointerup;
svg.onpointerdown=e=>{if(drawingRoom){const p=floorPoint(e);if(!vertices.length||Math.hypot(p.x-vertices.at(-1).x,p.y-vertices.at(-1).y)>=.1)vertices.push(p);draw();return;}if(e.target.dataset.rotateItem){const item=project.items.find(i=>i.id===e.target.dataset.rotateItem);if(!item||project.furniture_locked)return;rotationDrag=item.id;svg.setPointerCapture(e.pointerId);return;}pointerDown(e);};
svg.onpointermove=e=>{if(!rotationDrag)return pointerMove(e);const item=project.items.find(i=>i.id===rotationDrag),p=oldPoint(e);if(item){item.rotation=(Math.round((Math.atan2(p.y-item.y,p.x-item.x)*180/Math.PI+90)/5)*5+360)%360;changed();}};
svg.onpointerup=e=>{rotationDrag=null;pointerUp(e);};svg.addEventListener('pointercancel',()=>rotationDrag=null);
for(const id of ['select-mode','wall-mode']){const previous=$(id).onclick;$(id).onclick=()=>{if(drawingRoom)cancelRoom();previous();};}
const priorDraw=draw;
draw=function(){priorDraw();
 // Remove dimension editors from every selection path, including the old inspector.
 const item=project.items.find(i=>i.id===selected);
 if(item){for(const input of inspector.querySelectorAll('[data-field],input[aria-label="Furniture height in metres"]')){const label=input.closest('label');if(label)label.remove();else input.remove();}
 const fixed=document.createElement('p');fixed.className='fixed-size-note';fixed.textContent=`Fixed size: ${item.width} × ${item.depth} × ${item.height||.75} m. ${item.dimensions_confirmed&&item.height_confirmed?'Measurements confirmed.':'Stored dimensions are not yet verified.'}`;inspector.prepend(fixed);
 const heightCheck=document.createElement('label');const verifiedHeight=document.createElement('input');verifiedHeight.type='checkbox';verifiedHeight.checked=!!item.height_confirmed;verifiedHeight.onchange=()=>{item.height_confirmed=verifiedHeight.checked;changed();};heightCheck.append(verifiedHeight,document.createTextNode('Stored height verified'));inspector.append(heightCheck);
 const clockwise=document.createElement('button');clockwise.textContent='Rotate +15°';clockwise.onclick=()=>{item.rotation=(item.rotation+15)%360;changed();};const counter=document.createElement('button');counter.textContent='Rotate −15°';counter.onclick=()=>{item.rotation=(item.rotation+345)%360;changed();};inspector.append(counter,clockwise);
 const help=document.createElement('span');help.textContent='Drag to move. Use the rotation handle or angle field. Size is fixed.';inspector.append(help);
 }
 $('named-room-list').innerHTML=(project.rooms||[]).map(r=>`<span>${escape(r.name)} · ${area(r.vertices).toFixed(2)} m² <button data-remove-room="${escape(r.id)}">Remove room label</button></span>`).join('');$('named-room-list').querySelectorAll('button').forEach(b=>b.onclick=()=>{project.rooms=project.rooms.filter(r=>r.id!==b.dataset.removeRoom);changed();});
 if(view3d)return;const s=+svg.dataset.scale,ox=+svg.dataset.ox,oy=+svg.dataset.oy;
 for(const r of project.rooms||[]){const center=r.vertices.reduce((c,p)=>({x:c.x+p.x/r.vertices.length,y:c.y+p.y/r.vertices.length}),{x:0,y:0});const label=document.createElementNS(svgNS,'text');label.setAttribute('x',ox+center.x*s);label.setAttribute('y',oy+center.y*s);label.setAttribute('text-anchor','middle');label.setAttribute('font-size','12');label.setAttribute('fill','#715b42');label.style.pointerEvents='none';label.textContent=r.name+' · '+area(r.vertices).toFixed(2)+' m²';svg.append(label);}
 if(drawingRoom&&vertices.length){const line=document.createElementNS(svgNS,'polyline');line.setAttribute('points',vertices.map(p=>[ox+p.x*s,oy+p.y*s].join(',')).join(' '));line.setAttribute('stroke','#a97854');line.setAttribute('stroke-width','4');line.setAttribute('fill','none');svg.append(line);}
 if(item&&!project.furniture_locked){const a=item.rotation*Math.PI/180,distance=item.depth/2+.35,x=item.x+Math.sin(a)*distance,y=item.y-Math.cos(a)*distance;const handle=document.createElementNS(svgNS,'circle');Object.entries({cx:ox+x*s,cy:oy+y*s,r:7,fill:'#fff',stroke:'#a97854','stroke-width':2,'data-rotate-item':item.id,'aria-label':'Drag to rotate furniture'}).forEach(([k,v])=>handle.setAttribute(k,v));handle.style.cursor='grab';svg.append(handle);}
};
draw();
})();
