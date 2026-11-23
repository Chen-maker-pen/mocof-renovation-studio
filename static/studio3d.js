// Shared metre-based geometry for both views. Furniture uses editable box models.
const drawingToolbar=document.createElement('div');drawingToolbar.className='toolbar';
drawingToolbar.innerHTML='<button id="wall-mode">Draw walls</button><button id="select-mode">Select & move</button><label>Wall height <input id="wall-height" type="number" min=".5" max="6" step=".1" value="2.7"> m</label><button id="undo-wall">Remove last wall</button><label>Orbit <input id="orbit" type="range" min="0" max="360" value="35"></label><label>Zoom <input id="zoom" type="range" min="50" max="150" value="100"></label>';
editingTools.after(drawingToolbar);
$('view3d').textContent='3D studio';
let view3d=false,wallMode=false,wallStart=null;
const svgNS='http://www.w3.org/2000/svg';
function wallGeometry(){return project.walls||[];}
function floorPoint(event){const svg=$('canvas');const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());return {x:Math.max(0,Math.min(project.room.width,(p.x-svg.dataset.ox)/svg.dataset.scale)),y:Math.max(0,Math.min(project.room.depth,(p.y-svg.dataset.oy)/svg.dataset.scale))};}
function appendWallLines(){
  const svg=$('canvas'),s=+svg.dataset.scale,ox=+svg.dataset.ox,oy=+svg.dataset.oy;
  for(const wall of wallGeometry()){
    const line=document.createElementNS(svgNS,'line');
    for(const [k,v] of Object.entries({x1:ox+wall.x1*s,y1:oy+wall.y1*s,x2:ox+wall.x2*s,y2:oy+wall.y2*s,stroke:wall.color||project.wall_color||'#8b7763','stroke-width':Math.max(3,wall.thickness*s),'stroke-linecap':'square'}))line.setAttribute(k,v);
    line.style.pointerEvents='none';svg.append(line);
  }
  if(wallStart){const circle=document.createElementNS(svgNS,'circle');circle.setAttribute('cx',ox+wallStart.x*s);circle.setAttribute('cy',oy+wallStart.y*s);circle.setAttribute('r',5);circle.setAttribute('fill','#a97854');svg.append(circle);}
}
function render3d(){
  const svg=$('canvas'),w=project.room.width,d=project.room.depth;
  const angle=+$('orbit').value*Math.PI/180,scale=Math.min(410/(w+d),40)*+$('zoom').value/100;
  const projectPoint=([x,y,z])=>{x-=w/2;y-=d/2;const a=x*Math.cos(angle)-y*Math.sin(angle),b=x*Math.sin(angle)+y*Math.cos(angle);return [300+a*scale,290+b*scale*.5-z*scale];};
  const polygon=(points,fill,id)=>`<polygon ${id?`data-item="${id}"`:''} points="${points.map(p=>projectPoint(p).join(',')).join(' ')}" fill="${fill}" stroke="#756e6355" stroke-width="1"/>`;
  let faces=[];
  function box(cx,cy,width,depth,height,rotation,id,colours){
    const a=rotation*Math.PI/180;
    const corners=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]].map(([x,y])=>[cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)]);
    const low=corners.map(p=>[...p,0]),high=corners.map(p=>[...p,height]);
    const fs=[[high,colours[0]],...corners.map((_,i)=>[[low[i],low[(i+1)%4],high[(i+1)%4],high[i]],colours[1+i%2]])];
    for(const [points,fill] of fs){const center=points.reduce((r,p)=>[r[0]+p[0]/points.length,r[1]+p[1]/points.length],[0,0]);faces.push({depth:(center[0]-w/2)*Math.sin(angle)+(center[1]-d/2)*Math.cos(angle),points,fill,id});}
  }
  let html=polygon([[0,0,0],[w,0,0],[w,d,0],[0,d,0]],'#e6ded1');
  for(const wall of wallGeometry())box((wall.x1+wall.x2)/2,(wall.y1+wall.y2)/2,Math.hypot(wall.x2-wall.x1,wall.y2-wall.y1),wall.thickness,wall.height,Math.atan2(wall.y2-wall.y1,wall.x2-wall.x1)*180/Math.PI,null,['#eee6da','#d4c8b6','#bfb09c']);
  for(const item of project.items)box(item.x,item.y,item.width,item.depth,item.height||.75,item.rotation,item.id,item.id===selected?['#dcb885','#c59a63','#ac8050']:['#b4c1a5','#91a583','#798d6e']);
  faces.sort((a,b)=>a.depth-b.depth);html+=faces.map(f=>polygon(f.points,f.fill,f.id)).join('');
  html+='<text x="300" y="455" text-anchor="middle" fill="#786b5a" font-size="12">3D block models · Select furniture to move or rotate</text>';
  svg.innerHTML=html;
}
const baseStudioDraw=draw;
draw=function(){
  baseStudioDraw();
  const item=project.items.find(i=>i.id===selected);
  if(item){
    const duplicate=document.createElement('button');duplicate.textContent='Duplicate';duplicate.onclick=()=>{const copy={...item,id:crypto.randomUUID(),x:Math.min(project.room.width,item.x+.2),y:Math.min(project.room.depth,item.y+.2)};project.items.push(copy);selected=copy.id;changed();};inspector.append(duplicate);
  }
  if(view3d)render3d();else appendWallLines();
};
const moveStart=$('canvas').onpointerdown,moveUpdate=$('canvas').onpointermove,moveEnd=$('canvas').onpointerup;
$('canvas').onpointerdown=e=>{
  if(view3d){const shape=e.target.closest('[data-item]');if(shape){selected=shape.dataset.item;draw();}return;}
  if(!wallMode)return moveStart(e);
  const p=floorPoint(e);
  if(!wallStart){wallStart=p;draw();return;}
  const height=+$('wall-height').value;
  if(!Number.isFinite(height)||height<.5||height>6)return notify('Wall height must be between 0.5 and 6 metres.');
  if(Math.hypot(p.x-wallStart.x,p.y-wallStart.y)<.1)return notify('Choose two points at least 10 cm apart.');
  project.walls=wallGeometry().concat({x1:wallStart.x,y1:wallStart.y,x2:p.x,y2:p.y,height,thickness:.12});wallStart=null;changed();
};
$('canvas').onpointermove=e=>{if(!view3d&&!wallMode)moveUpdate(e);};
$('canvas').onpointerup=()=>{moveEnd();};
$('wall-mode').onclick=()=>{view3d=false;wallMode=true;wallStart=null;$('canvas').classList.remove('spatial');$('suggest-note').textContent='Click a wall start, then its end. Each pair adds a wall.';draw();};
$('select-mode').onclick=()=>{wallMode=false;wallStart=null;$('suggest-note').textContent='2D: drag furniture · 3D: select furniture and orbit';draw();};
$('undo-wall').onclick=()=>{project.walls=wallGeometry().slice(0,-1);wallStart=null;changed();};
$('view3d').onclick=()=>{view3d=true;wallMode=false;wallStart=null;$('canvas').classList.remove('spatial');$('suggest-note').textContent='Orbit and zoom the 3D view. Move furniture in 2D.';draw();};
$('view2d').onclick=()=>{view3d=false;wallMode=false;wallStart=null;$('canvas').classList.remove('spatial');$('suggest-note').textContent='Draw walls or drag furniture to edit the shared layout.';draw();};
$('orbit').oninput=()=>{if(view3d)render3d();};$('zoom').oninput=()=>{if(view3d)render3d();};
draw();
