// One toolbar with floating category panels; tools never push the model off screen.
(()=>{
const shell=document.createElement('section');shell.className='editor-shell';
const bar=document.createElement('div');bar.className='editor-bar';bar.setAttribute('aria-label','Studio editor');
const drawers=document.createElement('div');drawers.className='editor-drawers';
article.insertBefore(shell,editingTools);shell.append(bar,drawers,canvasWrap);
const panelsByName={};let active=null,surface=null;
function category(name){const button=document.createElement('button');button.textContent=name;button.setAttribute('aria-expanded','false');button.dataset.editorCategory=name;bar.append(button);const panel=document.createElement('section');panel.className='editor-drawer';panel.hidden=true;panel.innerHTML=`<header><strong>${name}</strong><button aria-label="Close ${name}">×</button></header>`;drawers.append(panel);panelsByName[name]={button,panel};button.onclick=()=>toggle(name);panel.querySelector('header button').onclick=()=>toggle(null);return panel;}
function toggle(name){active=active===name?null:name;for(const [key,{button,panel}] of Object.entries(panelsByName)){panel.hidden=active!==key;button.setAttribute('aria-expanded',String(active===key));}shell.classList.toggle('has-editor-drawer',!!active);document.dispatchEvent(new Event('studio-editor-resize'));}
for(const id of ['view2d','view3d','select-mode','edit-undo','edit-redo'])if($(id))bar.append($(id));
const walls=category('Walls');for(const id of ['wall-mode'])walls.append($(id));walls.append(document.querySelector('.room-controls'));
const colour=category('Colours');colour.innerHTML+='<p id="surface-name" role="status">Click a wall or floor in 3D to choose its colour.</p><div class="surface-targets"><button id="colour-floor">Floor</button><button id="colour-all-walls">All walls</button></div><div id="surface-swatches"></div><label>Custom colour <input id="surface-custom" type="color" value="#e8e1d5"></label><button id="surface-reset">Reset colour</button>';
// innerHTML replacement recreated the close button.
colour.querySelector('header button').onclick=()=>toggle(null);
const camera=category('View');camera.append(editingTools);const advanced=category('Tools');proTools.hidden=false;advanced.append(proTools);const ai=category('AI');ai.append($('edit-ai'),aiPanel);
const oldMore=$('advanced-tools-toggle');if(oldMore)oldMore.remove();document.querySelector('.studio-commandbar')?.remove();
const display=document.querySelector('.plan-display-controls');if(display)camera.append(display);
const reference=document.createElement('details');reference.className='original-plan-corner';reference.open=true;reference.innerHTML='<summary>Original plan</summary><img alt="Original uploaded floor plan"><p>No uploaded plan yet.</p>';canvasWrap.append(reference);
const palette=['#f5f0e7','#e8e1d5','#c9b69b','#b6c6b0','#a7bec8','#c9a69b','#88837b','#454b47'];
function paintColor(value){if(!surface)return notify('Choose a wall or floor first.');if(surface.kind==='floor')project.floor_color=value;else if(surface.index!==undefined&&project.walls?.[surface.index])project.walls[surface.index].color=value;else{project.wall_color=value;for(const wall of project.walls||[])delete wall.color;}changed();}
for(const value of palette){const button=document.createElement('button');button.className='surface-swatch';button.style.background=value;button.setAttribute('aria-label','Apply colour '+value);button.onclick=()=>paintColor(value);$('surface-swatches').append(button);}
function chooseSurface(value){surface=value;toggle('Colours');if(active!=='Colours')toggle('Colours');$('surface-name').textContent=value.kind==='floor'?'Floor selected':value.index!==undefined?`Wall ${value.index+1} selected`:'All walls selected';$('surface-custom').value=(value.kind==='floor'?project.floor_color:project.walls?.[value.index]?.color||project.wall_color)||'#e8e1d5';}
$('colour-floor').onclick=()=>chooseSurface({kind:'floor'});$('colour-all-walls').onclick=()=>chooseSurface({kind:'wall'});$('surface-custom').oninput=e=>paintColor(e.target.value);$('surface-reset').onclick=()=>paintColor(undefined);
document.addEventListener('studio-surface',e=>chooseSurface(e.detail));
$('canvas').addEventListener('pointerup',e=>{const wall=e.target.closest('[data-wall-index]');if(active==='Colours'&&wall)chooseSurface({kind:'wall',index:+wall.dataset.wallIndex});});
function viewerReady(){const nav=document.querySelector('.camera-navigation');if(nav)camera.append(nav);const tools=document.querySelector('.viewer-tools');if(tools)camera.append(tools);const host=$('three-viewer');if(host)host.append(reference);document.dispatchEvent(new Event('studio-editor-resize'));}
document.addEventListener('studio-viewer-ready',viewerReady);if($('three-viewer'))viewerReady();
const previous=draw;let imageSource=null;draw=function(){previous();const src=project.original_layout||project.layout||'';if(src!==imageSource){imageSource=src;reference.querySelector('img').src=src;reference.querySelector('img').hidden=!src;reference.querySelector('p').hidden=!!src;}reference.hidden=!view3d;};draw();
const previousStep=showStep;showStep=function(n){previousStep(n);if(n===2)shell.append(canvasWrap);};
})();
