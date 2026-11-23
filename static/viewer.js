import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const host=document.createElement('div');host.id='three-viewer';host.hidden=true;
const viewport=document.createElement('div');viewport.className='three-viewport';host.append(viewport);
const caption=document.createElement('div');caption.className='three-caption';caption.textContent='Drag background to orbit · Scroll to zoom · Click furniture to select';host.append(caption);
canvasWrap.append(host);
const closeView=document.createElement('button');closeView.className='close-expanded';closeView.textContent='Close expanded view ×';host.append(closeView);
function toggleExpanded(){const expand=!host.classList.contains('expanded-view');host.classList.toggle('expanded-view',expand);document.body.classList.toggle('viewer-expanded',expand);(expand?document.body:canvasWrap).append(host);resize();fit();}
closeView.onclick=toggleExpanded;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&host.classList.contains('expanded-view'))toggleExpanded();});
const tools=document.createElement('div');tools.className='viewer-tools';
tools.innerHTML='<button id="load-bedroom">Load bedroom example</button><button id="fit-camera">Fit view</button><button id="expand-3d">Expand 3D view</button><button id="drag-furniture">Move furniture in 3D</button><label><input id="outer-walls" type="checkbox" checked> Room walls</label><label><input id="cutaway-walls" type="checkbox"> Cutaway walls</label><span id="viewer-status" role="status">3D viewer ready</span>';
drawingToolbar.after(tools);
const explore=document.createElement('button');explore.id='explore-3d';explore.textContent='Explore 3D studio';explore.className='explore-3d';$('begin-design').after(explore);
let renderer,scene,camera,controls,objects,raf,dragItem=null,dragOffset=new THREE.Vector3(),moveMode=false;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
let inside=false,lookDrag=null,yaw=0,pitch=0;
const navigation=document.createElement('div');navigation.className='camera-navigation';
navigation.innerHTML='<div class="camera-modes"><button id="outside-view" class="chosen">360° orbit</button><button id="inside-view">Inside view</button><button id="auto-tour">Auto rotate</button><button id="camera-home">Reset view</button></div><label>Visit <select id="visit-room" aria-label="Visit a room"><option value="">Choose a room…</option></select></label><p id="camera-help">Drag to rotate 360° · Two-finger scroll or wheel to zoom · Right-drag / two-finger drag to pan</p><div class="walk-controls" hidden><button data-walk="forward" aria-label="Move forward">↑</button><button data-walk="left" aria-label="Step left">←</button><button data-walk="back" aria-label="Move backward">↓</button><button data-walk="right" aria-label="Step right">→</button></div>';
host.prepend(navigation);
function setCameraMode(value){
  if(!renderer&&!init())return;
  inside=value;lookDrag=null;controls.autoRotate=false;$('auto-tour').textContent='Auto rotate';
  controls.enabled=!inside;moveMode=false;
  $('drag-furniture').textContent='Move furniture in 3D';$('drag-furniture').classList.remove('chosen');
  $('inside-view').classList.toggle('chosen',inside);$('outside-view').classList.toggle('chosen',!inside);
  navigation.querySelector('.walk-controls').hidden=!inside;
  if(inside){
    camera.position.set(project.room.width*.27,1.6,project.room.depth*.65);yaw=0;pitch=0;lookInside();
    $('cutaway-walls').checked=false;rebuild();
    $('camera-help').textContent='Drag to look all around · Scroll to move · W A S D / arrows to walk · Use Visit to change rooms';
  }else{fit();$('camera-help').textContent='Drag to rotate 360° · Scroll or pinch to zoom · Right-drag or Shift-drag to pan';}
}
function lookInside(){camera.lookAt(camera.position.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))));}
function walk(direction,distance=.35){
  if(!inside)return;
  const forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw));
  const delta=direction==='forward'?forward:direction==='back'?forward.negate():direction==='right'?right:right.negate();
  camera.position.addScaledVector(delta,distance);
  camera.position.x=Math.max(.15,Math.min(project.room.width-.15,camera.position.x));
  camera.position.z=Math.max(.15,Math.min(project.room.depth-.15,camera.position.z));lookInside();
}
$('inside-view').onclick=()=>setCameraMode(true);$('outside-view').onclick=()=>setCameraMode(false);$('camera-home').onclick=()=>setCameraMode(false);
$('auto-tour').onclick=()=>{if(inside)setCameraMode(false);controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.7;$('auto-tour').textContent=controls.autoRotate?'Stop rotation':'Auto rotate';};
navigation.querySelectorAll('[data-walk]').forEach(button=>button.onclick=()=>walk(button.dataset.walk));
$('visit-room').onchange=()=>{const room=visitRooms()[+$('visit-room').value];if(!room||$('visit-room').value==='')return;if(!inside)setCameraMode(true);camera.position.set(room.x,1.6,room.y);yaw=0;pitch=0;lookInside();};
let modelSignature='';
function visitRooms(){return [...(project.sample_rooms||[]),...(project.rooms||[]).map(r=>({name:r.name,x:r.vertices.reduce((v,p)=>v+p.x,0)/r.vertices.length,y:r.vertices.reduce((v,p)=>v+p.y,0)/r.vertices.length}))];}
function material(colour,roughness=.8){return new THREE.MeshStandardMaterial({color:colour,roughness});}
function block(parent,w,h,d,x,y,z,colour){const mesh=new THREE.Mesh(new THREE.BoxGeometry(Math.max(w,.01),Math.max(h,.01),Math.max(d,.01)),material(colour));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function furniture(item){
  const group=new THREE.Group(),w=item.width,d=item.depth,h=item.height||.75;
  const name=item.name.toLowerCase();group.userData.itemId=item.id;
  const timber=project.palette==='Dark'?'#51463b':'#b99a74',fabric=project.palette==='White'?'#f2ede5':'#d5c8b5';
  if(/table|desk/.test(name)){
    block(group,w,.07,d,0,h-.035,0,timber);
    for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35])block(group,.05,h-.07,.05,x,(h-.07)/2,z,'#625447');
  }else if(/chair/.test(name)){
    block(group,w,.07,d,0,h*.5,0,fabric);block(group,w,h*.5,.06,0,h*.75,-d*.45,timber);
    for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35])block(group,.04,h*.5,.04,x,h*.25,z,timber);
  }else if(/bathtub/.test(name)){
    block(group,w,h,d,0,h/2,0,'#f3f0ea');block(group,w*.76,.025,d*.82,0,h+.01,0,'#b7d0d2');
  }else if(/shower/.test(name)){
    block(group,w,.08,d,0,.04,0,'#eeeeea');
    const glass=block(group,.02,h,d,-w/2,h/2,0,'#b2d6d8');glass.material.transparent=true;glass.material.opacity=.3;
    const back=block(group,w,h,.02,0,h/2,-d/2,'#b2d6d8');back.material.transparent=true;back.material.opacity=.3;
  }else if(/toilet|sink|basin/.test(name)){
    block(group,w*.8,h*.6,d*.8,0,h*.3,0,'#f5f4f0');block(group,w,.12,d,0,h*.65,0,'#ffffff');
    if(/toilet/.test(name))block(group,w,h*.6,.18,0,h*.7,-d*.35,'#f5f4f0');
  }else if(/软床|单床|米床|成品床|bed/.test(name)&&!/柜|头柜/.test(name)){
    block(group,w,h*.28,d,0,h*.2,0,timber);block(group,w*.96,h*.35,d*.96,0,h*.52,0,'#ede7dc');
    block(group,w,h*1.4,.12,0,h*.7,-d/2,fabric);
    for(const x of [-w*.25,w*.25])block(group,w*.4,h*.12,d*.2,x,h*.75,-d*.28,'#fcf8ef');
    block(group,w*.97,.05,d*.4,0,h*.72,d*.25,'#9b8d79');
  }else if(/沙发|sofa/.test(name)){
    block(group,w,h*.24,d,0,h*.24,0,timber);block(group,w*.84,h*.24,d*.78,0,h*.45,d*.05,fabric);
    block(group,w,h*.65,d*.2,0,h*.65,-d*.4,fabric);
    for(const x of [-w*.45,w*.45])block(group,w*.12,h*.52,d,x,h*.48,0,fabric);
  }else{
    block(group,w,h,d,0,h/2,0,timber);
    const front=d/2+.008;
    for(const y of [h*.33,h*.66])block(group,w*.95,.012,.015,0,y,front,'#75634e');
    for(const y of [h*.2,h*.5,h*.83])block(group,Math.min(.12,w*.3),.015,.025,0,y,front+.015,'#c7b89b');
  }
  group.position.set(item.x,0,item.y);group.rotation.y=-item.rotation*Math.PI/180;
  if(item.id===selected){const edge=new THREE.BoxHelper(group,0xc18c51);edge.userData.selection=true;group.add(edge);}
  return group;
}
function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});group.clear();}
function init(){
  if(renderer)return true;
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor('#e8e4dc');renderer.outputColorSpace=THREE.SRGBColorSpace;viewport.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Interactive 3D home. Drag to turn, scroll to zoom. Inside view supports arrow keys to move.');
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(55,1,.05,1000);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.rotateSpeed=.7;controls.zoomSpeed=.7;controls.screenSpacePanning=true;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=.5;controls.maxDistance=100;
    scene.add(new THREE.HemisphereLight(0xffffff,0x91816e,2.3));const light=new THREE.DirectionalLight(0xfff5e4,3);light.position.set(4,10,6);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-20;light.shadow.camera.right=20;light.shadow.camera.top=20;light.shadow.camera.bottom=-20;scene.add(light);
    objects=new THREE.Group();scene.add(objects);
    new ResizeObserver(resize).observe(viewport);
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);
    renderer.domElement.addEventListener('wheel',event=>{if(inside){event.preventDefault();walk(event.deltaY<0?'forward':'back',Math.min(Math.abs(event.deltaY)*.005,.5));}},{passive:false});
    renderer.domElement.addEventListener('keydown',event=>{if(!inside)return;const direction={w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'}[event.key];if(direction){event.preventDefault();walk(direction);}});
    fit();tick();return true;
  }catch(error){$('viewer-status').textContent='3D could not start. Enable WebGL in your browser or try another browser.';notify('Your browser could not create a WebGL view.');return false;}
}
function resize(){if(!renderer||!viewport.clientWidth)return;renderer.setSize(viewport.clientWidth,viewport.clientHeight,false);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();}
function fit(){if(!camera)return;if(inside){resize();lookInside();return;}const w=project.room.width,d=project.room.depth,span=Math.max(w,d)*Math.max(1,viewport.clientHeight/Math.max(viewport.clientWidth,1)*.85);controls.target.set(w/2,.4,d/2);camera.position.set(w/2+span*.95,span*1.05,d/2+span*1.15);controls.update();resize();}
function rebuild(){
  if(!objects)return;
  const signature=JSON.stringify([project.room,project.rooms,project.items,project.walls,project.palette,project.floor_color,project.wall_color,selected,$('outer-walls').checked,$('cutaway-walls').checked]);if(signature===modelSignature)return;modelSignature=signature;
  disposeGroup(objects);const w=project.room.width,d=project.room.depth;
  const rooms=visitRooms();$('visit-room').innerHTML='<option value="">Choose a room…</option>'+rooms.map((room,index)=>`<option value="${index}">${escape(room.name)}</option>`).join('');
  const visibleHeight=h=>$('cutaway-walls').checked?Math.min(h,.8):h;
  block(objects,w,.1,d,w/2,-.08,d/2,project.floor_color||'#d6c3a6').userData.surface='floor';
  if(!project.floor_color)for(let x=.3;x<w;x+=.35)block(objects,.006,.002,d,x,-.026,d/2,'#bbaa90').userData.surface='floor';
  if($('outer-walls').checked&&!project.plan_conversion){if(!planHasBoundaryWall(project.walls||[],project.room,'top'))block(objects,w,visibleHeight(2.7),.12,w/2,visibleHeight(2.7)/2,0,project.wall_color||'#f1ede5').userData.surface='wall';if(!planHasBoundaryWall(project.walls||[],project.room,'left'))block(objects,.12,visibleHeight(2.7),d,0,visibleHeight(2.7)/2,d/2,project.wall_color||'#e4ded2').userData.surface='wall';}
  for(const [wallIndex,wall] of (project.walls||[]).entries()){
    const group=new THREE.Group();group.userData.surface='wall';group.userData.wallIndex=wallIndex;const length=Math.hypot(wall.x2-wall.x1,wall.y2-wall.y1),height=visibleHeight(wall.height);
    const segment=(start,end,bottom,top)=>{if(end-start>.001&&top-bottom>.001)block(group,end-start,top-bottom,wall.thickness,(start+end)/2-length/2,(bottom+top)/2,0,wall.color||project.wall_color||'#e8e1d5');};
    for(const slice of planWallSlices(wall,height))segment(slice.start,slice.end,slice.bottom,slice.top);
    for(const opening of wall.openings||[])if(opening.kind==='window'&&height>opening.sill)block(group,opening.width,Math.min(opening.height,height-opening.sill),.025,opening.offset+opening.width/2-length/2,opening.sill+Math.min(opening.height,height-opening.sill)/2,0,'#a5c6ce');
    group.position.set((wall.x1+wall.x2)/2,0,(wall.y1+wall.y2)/2);group.rotation.y=-Math.atan2(wall.y2-wall.y1,wall.x2-wall.x1);objects.add(group);
  }
  for(const item of project.items)objects.add(furniture(item));
  $('viewer-status').textContent=`${project.items.length} furniture items · ${project.walls?.length||0} drawn walls · schematic models`;
}
function tick(){raf=requestAnimationFrame(tick);if(!host.hidden){if(!inside)controls.update();renderer.render(scene,camera);}}
function hit(event){const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(objects.children,true);}
let surfacePress=null;
function pointerDown(event){
  const nearest=hit(event)[0];let target=nearest?.object;while(target&&!target.userData.surface&&!target.userData.itemId)target=target.parent;surfacePress=target?.userData.surface?{x:event.clientX,y:event.clientY,kind:target.userData.surface,index:target.userData.wallIndex}:null;
  renderer.domElement.focus({preventScroll:true});
  if(inside){lookDrag={x:event.clientX,y:event.clientY};renderer.domElement.setPointerCapture(event.pointerId);return;}
  const intersects=hit(event);let item=null;
  for(const match of intersects){let o=match.object;while(o&&!o.userData.itemId)o=o.parent;if(o){item=project.items.find(i=>i.id===o.userData.itemId);break;}}
  if(!item)return;if(project.furniture_locked){notify('Unlock furniture in the plan tools to edit it.');return;}selected=item.id;
  if(moveMode){const point=new THREE.Vector3();raycaster.ray.intersectPlane(floorPlane,point);dragOffset.set(item.x-point.x,0,item.y-point.z);dragItem=item;controls.enabled=false;renderer.domElement.setPointerCapture(event.pointerId);}
  draw();
}
function pointerMove(event){if(inside&&lookDrag){yaw-=(event.clientX-lookDrag.x)*.005;pitch=Math.max(-1.3,Math.min(1.3,pitch-(event.clientY-lookDrag.y)*.005));lookDrag={x:event.clientX,y:event.clientY};lookInside();return;}if(!dragItem)return;hit(event);const p=new THREE.Vector3();if(!raycaster.ray.intersectPlane(floorPlane,p))return;dragItem.x=Math.max(0,Math.min(project.room.width,p.x+dragOffset.x));dragItem.y=Math.max(0,Math.min(project.room.depth,p.z+dragOffset.z));changed();}
function pointerUp(event){if(surfacePress&&event&&Math.hypot(event.clientX-surfacePress.x,event.clientY-surfacePress.y)<5)document.dispatchEvent(new CustomEvent('studio-surface',{detail:surfacePress}));surfacePress=null;dragItem=null;lookDrag=null;if(controls)controls.enabled=!inside;}
function open3d(){view3d=true;wallMode=false;wallStart=null;host.hidden=false;$('canvas').setAttribute('hidden','');if(init()){rebuild();resize();fit();}host.scrollIntoView({behavior:'smooth',block:'center'});$('view3d').setAttribute('aria-pressed','true');$('view2d').setAttribute('aria-pressed','false');$('suggest-note').textContent='3D studio · Drag background to orbit, or enable Move furniture in 3D.';}
const previousDraw=draw;
draw=function(){previousDraw();if(!host.hidden&&renderer){rebuild();resize();}};
$('view3d').onclick=open3d;
$('view2d').onclick=()=>{host.hidden=true;$('canvas').removeAttribute('hidden');view3d=false;wallMode=false;wallStart=null;$('view3d').setAttribute('aria-pressed','false');$('view2d').setAttribute('aria-pressed','true');draw();};
const wallClick=$('wall-mode').onclick;$('wall-mode').onclick=()=>{host.hidden=true;$('canvas').removeAttribute('hidden');wallClick();};
$('expand-3d').onclick=()=>{if(host.hidden)open3d();toggleExpanded();};
$('fit-camera').onclick=fit;$('outer-walls').onchange=()=>{rebuild();};$('cutaway-walls').onchange=()=>rebuild();
$('drag-furniture').onclick=()=>{moveMode=!moveMode;$('drag-furniture').classList.toggle('chosen',moveMode);$('drag-furniture').textContent=moveMode?'Moving furniture · click to orbit':'Move furniture in 3D';};
function example(){
  if(project.items.length&&!confirm('Replace the current furniture with a sample bedroom? Save your version first if needed.'))return;
  const bed=catalog.find(r=>r.id==='sample:bed');
  const side=catalog.find(r=>r.id==='sample:side-table');
  if(!bed||!side)return notify('Bedroom catalog is still loading. Try again in a moment.');
  project.room={width:5,depth:4,confirmed:false};$('rw').value=5;$('rd').value=4;
  project.items=[{row:bed,x:2.5,y:1.5,width:1.8,depth:2.1,height:.55},{row:side,x:1.15,y:1.1,width:.55,depth:.45,height:.5},{row:side,x:3.85,y:1.1,width:.55,depth:.45,height:.5}].map(({row,...geometry})=>({id:crypto.randomUUID(),catalog_id:row.id,name:row.name,...geometry,rotation:0,dimensions_confirmed:false,height_confirmed:false}));
  project.walls=[];project.name='Sample bedroom · confirm measurements';$('name').value=project.name;changed();notify('Example dimensions are illustrative. Verify measurements before quoting.');open3d();
}
$('load-bedroom').onclick=example;
const houseSelector=document.createElement('select');houseSelector.id='house-sample';houseSelector.setAttribute('aria-label','Whole-house sample');
houseSelector.innerHTML='<option value="">Choose a whole-house sample…</option>';
const houseButton=document.createElement('button');houseButton.id='load-house';houseButton.textContent='Open whole-house 3D';tools.prepend(houseSelector,houseButton);
let houseSamples=[];
request('/house-samples.json').then(data=>{houseSamples=data.houses;for(const h of houseSamples){const option=document.createElement('option');option.value=h.id;option.textContent=h.title;houseSelector.append(option);}});
houseButton.onclick=()=>{
  const house=houseSamples.find(h=>h.id===houseSelector.value);if(!house)return notify('Choose a whole-house sample first.');
  if(project.items.length&&!confirm('Replace the current layout with this whole-house sample? Save your version first if needed.'))return;
  project.room={width:house.width,depth:house.depth,confirmed:false};project.walls=structuredClone(house.walls);project.sample_rooms=structuredClone(house.rooms);project.palette=house.palette;
  project.items=house.items.map(item=>{const row=catalog.find(r=>r.id===item.catalog_id);return {...item,id:crypto.randomUUID(),name:row?.name||'Sample furniture',dimensions_confirmed:false,height_confirmed:false};});
  project.name=house.title+' · illustrative';project.sample_layout=house.id;project.reference=null;project.layout=null;selected=null;
  $('name').value=project.name;$('rw').value=house.width;$('rd').value=house.depth;changed();beginDesign();showStep(2);open3d();notify('Illustrative sample layout. Confirm actual measurements and product choices before quoting.');
};
explore.onclick=()=>{beginDesign();showStep(2);if(!project.items.length&&!project.layout&&!project.walls?.length)example();else open3d();};
const stageObserver=new MutationObserver(()=>{if(!host.hidden){resize();}});stageObserver.observe(canvasWrap,{attributes:true,subtree:false});

document.dispatchEvent(new Event('studio-viewer-ready'));

document.addEventListener('studio-editor-resize',()=>requestAnimationFrame(resize));
