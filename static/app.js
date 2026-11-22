const $ = id => document.getElementById(id);
let catalog = [], selected = null, limit = 24;
let project = {name:'My renovation',version:0,room:{width:5,depth:4,confirmed:false},items:[],status:'draft'};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const notify = text => { $('toast').textContent=text; $('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',4500); };
async function request(path, data) {
  const response=await fetch(path,data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{});
  const result=await response.json();if(!response.ok)throw Error(result.error);return result;
}
function image(row) { return row.image_file ? '/images/'+row.image_file.split('/').pop() : row.preview_url||row.image_url||''; }
function changed(){project.status='draft';project.review=null;project.quote=null;$('quote-result').textContent='';draw();}
function renderCatalog(){
  const term=$('search').value.toLowerCase();const kind=$('collection').value;
  const rows=catalog.filter(r=>r.kind===kind&&JSON.stringify(r).toLowerCase().includes(term));
  $('count').textContent=`${rows.length.toLocaleString()} records · MOCOF product & design catalog`;
  $('catalog').innerHTML=rows.slice(0,limit).map(r=>`<button class="card" draggable="false" data-placeable="${catalogCanPlace(r)}" data-id="${escape(r.id)}" aria-label="${escape((catalogCanPlace(r)?'Place ':'Reference: ')+catalogBilingualName(r))}">${image(r)?`<img draggable="false" loading="lazy" src="${escape(image(r))}" alt="${escape(catalogBilingualName(r))}">`:'<div class="placeholder">◇</div>'}<strong>${escape(catalogSourceName(r))}</strong>${r.name_en&&r.name_en!==catalogSourceName(r)?`<span class="english-name" lang="en">${escape(r.name_en)}</span>`:''}<span>${escape(r.model_reference||r.category||r.room||r.kind)}${r.category_en?' · '+escape(r.category_en):''}</span><span class="placement-badge">${catalogCanPlace(r)?'Drag or click to place':'Reference only'}</span></button>`).join('');
  $('catalog').querySelectorAll('img').forEach(e=>e.onerror=()=>{e.style.opacity='.15';e.alt='Preview unavailable';});
  $('more').hidden=rows.length<=limit;
}
$('catalog').onclick=event=>{
  const button=event.target.closest('[data-id]');if(!button)return;
  const row=catalog.find(r=>r.id===button.dataset.id);
  if(['layouts','renders','materials','saved-designs'].includes(row.kind)){
    project.reference={id:row.id,name:row.name||row.name_as_shown||row.design_name,image:image(row)};
    changed();return;
  }
  const item={id:crypto.randomUUID(),catalog_id:row.id,name:row.name,x:project.room.width/2,y:project.room.depth/2,width:.6,depth:.6,rotation:0,dimensions_confirmed:false};
  project.items.push(item);selected=item.id;changed();
};
function draw(){
  for(const [id,key,fallback] of [['design-style','design_style','Modern'],['palette','palette','Warm neutral']])$(id).value=project[key]||fallback;
  const width=project.room.width,depth=project.room.depth,scale=Math.min(520/width,380/depth),ox=(600-width*scale)/2,oy=(450-depth*scale)/2;
  let content=`<rect x="${ox}" y="${oy}" width="${width*scale}" height="${depth*scale}" fill="#fffdf7" stroke="#4b5c49" stroke-width="6"/>`;
  if(project.layout)content+=`<image href="${project.layout}" x="${ox}" y="${oy}" width="${width*scale}" height="${depth*scale}" opacity=".4" preserveAspectRatio="none"/>`;
  content+=`<text x="300" y="${oy-13}" text-anchor="middle" fill="#77836c" font-size="12">${width} m × ${depth} m</text>`;
  for(const i of project.items)content+=`<g data-item="${i.id}" class="object" transform="translate(${ox+i.x*scale},${oy+i.y*scale}) rotate(${i.rotation})"><rect class="${i.id===selected?'selected':''}" x="${-i.width*scale/2}" y="${-i.depth*scale/2}" width="${i.width*scale}" height="${i.depth*scale}" rx="4" fill="#ced9c1" stroke="#6c8162"/><text text-anchor="middle" font-size="10" pointer-events="none">${escape(i.name.slice(0,10))}</text></g>`;
  $('canvas').innerHTML=content;
  $('items').innerHTML=project.items.length?project.items.map(i=>`<div class="line"><div>${escape(catalogBilingualName(i))}<br><small>${i.width} × ${i.depth} m · ${i.rotation}°</small></div><span>1</span></div>`).join(''):'<p class="muted">Add products from the collection to build your item list.</p>';
  $('status').textContent=`${project.status.replaceAll('_',' ')} · Version ${project.version}`;
  $('roomstate').textContent=project.room.confirmed?'Room measurements confirmed':'Confirm measured dimensions';
  const ref=project.reference;$('reference').innerHTML=ref?`${escape(ref.name)}${ref.image?`<br><img src="${escape(ref.image)}" alt="Design reference">`:''}<p class="muted">Reference selected. Related items require verified product links.</p>`:'Choose a design from the collection.';
  const i=project.items.find(i=>i.id===selected);
  $('selection').innerHTML=i?`<strong>${escape(catalogBilingualName(i))}</strong><button id="rotate">Rotate 90°</button><label><input id="verified" type="checkbox" ${i.dimensions_confirmed?'checked':''}> Dimensions verified</label><button id="remove">Remove</button>`:'Select a product to add it to your room. Confirm its dimensions before placing.';
  $('selection').querySelectorAll('[data-field]').forEach(e=>e.onchange=()=>{const v=+e.value;if(v>0&&v<100){i[e.dataset.field]=v;changed();}else draw();});
  if(i){$('rotate').onclick=()=>{i.rotation=(i.rotation+90)%360;changed();};$('verified').onchange=e=>{i.dimensions_confirmed=e.target.checked;changed();};$('remove').onclick=()=>{project.items=project.items.filter(r=>r.id!==i.id);selected=null;changed();};}
  $('canvas').dataset.scale=scale;$('canvas').dataset.ox=ox;$('canvas').dataset.oy=oy;
}
let dragging=null;
$('canvas').onpointerdown=e=>{const g=e.target.closest('[data-item]');if(!g)return;dragging=g.dataset.item;selected=dragging;$('canvas').setPointerCapture(e.pointerId);draw();};
$('canvas').onpointermove=e=>{if(!dragging)return;const svg=$('canvas'),p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse()),i=project.items.find(x=>x.id===dragging),s=+svg.dataset.scale;i.x=Math.max(0,Math.min(project.room.width,(p.x-svg.dataset.ox)/s));i.y=Math.max(0,Math.min(project.room.depth,(p.y-svg.dataset.oy)/s));changed();};
$('canvas').onpointerup=()=>dragging=null;
$('canvas').onpointercancel=()=>dragging=null;
$('confirm').onclick=()=>{const w=+$('rw').value,d=+$('rd').value;if(w<=0||d<=0||w>100||d>100)return notify('Enter room dimensions between 0 and 100 metres.');project.room={width:w,depth:d,confirmed:true};changed();};
$('upload').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>8e6)return notify('Choose a PNG, JPEG or WebP under 8 MB.');const reader=new FileReader();reader.onload=()=>{project.layout=reader.result;project.room.confirmed=false;changed();notify('Plan uploaded. Enter and confirm measured room dimensions.');};reader.readAsDataURL(f);};
$('clearbg').onclick=()=>{delete project.layout;changed();};
$('name').onchange=()=>{project.name=$('name').value;changed();};
$('search').oninput=()=>{limit=24;renderCatalog();};$('collection').onchange=()=>{limit=24;renderCatalog();};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));$('collection').value=b.dataset.tab;limit=24;renderCatalog();});
$('more').onclick=()=>{limit+=24;renderCatalog();};
async function save(){project.name=$('name').value;project=await request('/api/projects',project);draw();notify(`Saved version ${project.version}`);}
$('save').onclick=()=>save().catch(e=>notify(e.message));
async function readiness(){if(!project.items.length)throw Error('Add products before requesting a quote.');if(!project.room.confirmed)throw Error('Confirm room measurements first.');const quote=await request('/api/quote',project);project.quote=quote;$('quote-result').innerHTML='<strong>Awaiting supplier quotation</strong><ul>'+quote.flags.map(f=>`<li>${escape(f)}</li>`).join('')+'</ul>';return quote;}
$('quote').onclick=()=>readiness().catch(e=>notify(e.message));
$('export').onclick=async()=>{try{const quote=await readiness();const blob=new Blob([JSON.stringify({schema_version:1,project_id:project.id||null,design_version:project.version,room:project.room,reference:project.reference,...quote},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mocof-renovation-handoff.json';a.click();URL.revokeObjectURL(url);}catch(e){notify(e.message);}};
$('review').onclick=async()=>{try{await readiness();project.status='submitted_for_review';await save();}catch(e){notify(e.message);}};
$('approve').onclick=async()=>{try{const quote=await readiness();if(!$('reviewer').value.trim()||!$('notes').value.trim())throw Error('Add reviewer name and review notes.');project.review={reviewer:$('reviewer').value,notes:$('notes').value,time:new Date().toISOString(),unresolved_flags:quote.flags};project.status='design_review_recorded';await save();}catch(e){notify(e.message);}};
$('open').onclick=async()=>{try{const ps=await request('/api/projects');$('project-list').innerHTML=ps.length?ps.map((p,i)=>`<button data-project="${i}">${escape(p.name)} · v${p.version}</button>`).join(''):'No saved projects yet.';$('project-list').onclick=e=>{const b=e.target.closest('[data-project]');if(!b)return;project=ps[+b.dataset.project];selected=null;$('name').value=project.name;$('rw').value=project.room.width;$('rd').value=project.room.depth;$('notes').value=project.review?.notes||'';$('reviewer').value=project.review?.reviewer||'';$('quote-result').textContent='';draw();$('projects').close();};$('projects').showModal();}catch(e){notify(e.message);}};
$('close-dialog').onclick=()=>$('projects').close();
for(const [id,key] of [['design-style','design_style'],['palette','palette']])$(id).onchange=()=>{project[key]=$(id).value;changed();};
document.addEventListener('paste',event=>{
  const file=[...event.clipboardData.items].find(x=>['image/png','image/jpeg','image/webp'].includes(x.type))?.getAsFile();
  if(!file)return;if(file.size>8e6)return notify('Choose an image under 8 MB.');
  event.preventDefault();const reader=new FileReader();reader.onload=()=>{project.layout=reader.result;project.room.confirmed=false;changed();notify('Plan pasted. Confirm measured room dimensions.');};reader.readAsDataURL(file);
});
$('suggest').onclick=()=>{
  if(!project.room.confirmed)return notify('Confirm room measurements before arranging.');
  if(!project.items.length)return notify('Select your furniture first.');
  if(project.items.some(i=>!i.dimensions_confirmed))return notify('Verify every item’s dimensions before arranging.');
  const positions=[];let x=.2,y=.2,rowDepth=0;
  for(const item of project.items){
    const swap=item.rotation%180!==0,w=swap?item.depth:item.width,d=swap?item.width:item.depth;
    if(x+w>project.room.width-.2){x=.2;y+=rowDepth+.3;rowDepth=0;}
    if(x+w>project.room.width-.2||y+d>project.room.depth-.2)return notify('Furniture does not fit this simple arrangement. Edit positions or reduce the selection.');
    positions.push({item,x:x+w/2,y:y+d/2});x+=w+.3;rowDepth=Math.max(rowDepth,d);
  }
  positions.forEach(p=>{p.item.x=p.x;p.item.y=p.y;});changed();notify('Suggested arrangement ready. Review access, doors and clearances.');
};
$('view2d').onclick=()=>{$('canvas').classList.remove('spatial');$('suggest-note').textContent='Measured footprints · manually editable';};
$('view3d').onclick=()=>{$('canvas').classList.add('spatial');$('suggest-note').textContent='Tilted footprint preview · 3D models pending';};
request('/api/catalog').then(rows=>{catalog=rows;renderCatalog();draw();}).catch(e=>notify(e.message));
