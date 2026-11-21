// Move the existing controls into guided panels so their event handlers and state stay intact.
const workspace = document.querySelector('main');
const library = workspace.querySelector('aside');
const article = workspace.querySelector('article');
const summary = workspace.querySelector('.summary');
const preferences = article.querySelector('.preferences');
const styleChoice = preferences.children[0];
const paletteChoice = preferences.children[1];
const studioHead = article.querySelector('.studio-head');
const upload = studioHead.querySelector('.upload');
const dimensions = article.querySelectorAll('.toolbar')[0];
const editingTools = article.querySelectorAll('.toolbar')[1];
const canvasWrap = article.querySelector('.canvas-wrap');
const inspector = $('selection');
const bottom = article.querySelector('.bottom');
const stages = [
  ['Floor plan', 'Start with your whole-house floor plan', 'Upload or paste the full house layout, then confirm its overall measured width and depth.'],
  ['Your style', 'Find your direction', 'Choose your style, colour palette and a design reference.'],
  ['Furnish & edit', 'Make it your own', 'Add furniture, confirm its size and arrange it in your room.'],
  ['Review', 'Bring your design together', 'Review your selection and prepare it for supplier quotation.']
];
const wizard = document.createElement('section');
wizard.className = 'wizard';
wizard.innerHTML = `<nav class="step-progress" aria-label="Project steps">${stages.map((s,i)=>`<button data-step="${i}" aria-label="Step ${i+1}: ${s[0]}"><span>${i+1}</span>${s[0]}</button>`).join('')}</nav><div class="step-heading"><small id="step-label"></small><h1 id="step-title" tabindex="-1"></h1><p id="step-description"></p></div><div id="step-content"></div><footer class="step-footer"><button id="step-back">← Back</button><span id="step-count"></span><button class="primary" id="step-next">Continue →</button></footer>`;
workspace.before(wizard);
const welcome=document.createElement('section');
welcome.className='welcome-hero';
welcome.innerHTML='<div class="hero-copy"><p class="hero-eyebrow">PORTFOLIO PROJECT · CHIT NAING</p><h1>Your home.<br>Your possibilities.</h1><p class="hero-description">Bring your space to life. Explore designs, choose your furniture and make every detail your own.</p><button id="begin-design">Start my renovation <span>↗</span></button><a href="https://www.mocof.com.my" target="_blank" rel="noopener">Explore MOCOF</a></div><div class="hero-bottom"><span>LIVE WITH SURPRISE</span><button id="hero-scroll" aria-label="Continue to floor plan">Discover your space ↓</button></div>';
wizard.before(welcome);
document.body.classList.add('welcome-mode');
function beginDesign(){document.body.classList.remove('welcome-mode');wizard.scrollIntoView({behavior:'smooth',block:'start'});}
$('begin-design').onclick=beginDesign;
$('hero-scroll').onclick=beginDesign;
const panels = stages.map((_,i)=>{const p=document.createElement('section');p.className='step-panel';p.id='stage-'+i;$('step-content').append(p);return p;});
panels[0].append(studioHead);
const uploadPanel=document.createElement('div');uploadPanel.className='upload-panel';uploadPanel.innerHTML='<span class="upload-symbol">↑</span><h2>Your floor plan starts here</h2><p>PNG, JPG or WebP · up to 8 MB</p><p>Or copy an image and paste it with ⌘V</p>';
uploadPanel.append(upload);panels[0].append(uploadPanel,dimensions);
const layoutFeedback=document.createElement('p');layoutFeedback.id='layout-feedback';layoutFeedback.className='muted';panels[0].append(layoutFeedback);
const styleGrid=document.createElement('div');styleGrid.className='style-grid';styleGrid.append(styleChoice,paletteChoice);panels[1].append(styleGrid);
const paletteSwatches=document.createElement('div');paletteSwatches.className='palette-swatches';paletteSwatches.innerHTML=['Warm neutral','White','Natural wood','Dark'].map((v,i)=>`<button data-palette="${v}" style="--swatch:${['#d3bfa5','#f9f7f1','#ae8056','#414b43'][i]}"><span></span>${v}</button>`).join('');panels[1].append(paletteSwatches);
const editor=document.createElement('div');editor.className='guided-editor';
const designLibrary=document.createElement('div');designLibrary.className='guided-library';
editor.append(designLibrary,article);panels[2].append(editor);article.append(editingTools,canvasWrap,inspector);
designLibrary.append(library);
panels[3].append(summary);
const referenceDock=document.createElement('div');referenceDock.className='reference-dock';referenceDock.append(bottom);panels[1].append(referenceDock);
workspace.remove();
library.querySelector('.intro').remove();
$('review').hidden=true;
let step=0,furthest=0;
function syncWizard(){
  paletteSwatches.querySelectorAll('button').forEach(b=>b.classList.toggle('chosen',b.dataset.palette===$('palette').value));
  layoutFeedback.textContent=project.layout?'Floor plan added. Confirm the overall plan measurements.':'Enter the overall floor-plan width and depth in metres.';
}
function showStep(next){
  step=next;furthest=Math.max(furthest,step);
  panels.forEach((p,i)=>p.hidden=i!==step);
  $('step-label').textContent=`STEP ${step+1} OF ${stages.length}`;
  $('step-title').textContent=stages[step][1];$('step-description').textContent=stages[step][2];
  $('step-back').hidden=step===0;$('step-next').textContent=step===3?'Save project ✓':'Continue →';
  $('step-count').textContent=`${step+1} / ${stages.length}`;
  wizard.querySelectorAll('[data-step]').forEach(b=>{const i=+b.dataset.step;b.classList.toggle('current',i===step);b.classList.toggle('complete',i<step);b.disabled=i>furthest;b.setAttribute('aria-current',i===step?'step':'false');});
  if(step===0){panels[0].append(canvasWrap);canvasWrap.classList.add('plan-preview');}
  if(step===1){panels[1].insertBefore(library,referenceDock);$('collection').value='layouts';limit=12;renderCatalog();}
  if(step===2){article.insertBefore(canvasWrap,inspector);canvasWrap.classList.remove('plan-preview');designLibrary.append(library);if(['layouts','renders','saved-designs','materials'].includes($('collection').value))$('collection').value='products';limit=12;renderCatalog();}
  if(step===3){panels[3].prepend(canvasWrap);canvasWrap.classList.remove('plan-preview');$('review').hidden=false;}else $('review').hidden=true;
  syncWizard();window.scrollTo({top:0,behavior:'smooth'});$('step-title').focus({preventScroll:true});
}
$('step-back').onclick=()=>showStep(step-1);
$('step-next').onclick=async()=>{
  if(step===0&&!project.room.confirmed)return notify('Enter the overall floor-plan size and choose Confirm plan.');
  if(step===2&&!project.items.length)return notify('Add at least one furniture item to continue.');
  if(step===3){try{await save();notify('Your project is saved. You can reopen it from My projects.');}catch(e){notify(e.message);}return;}
  showStep(step+1);
};
wizard.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>showStep(+b.dataset.step));
paletteSwatches.onclick=e=>{const b=e.target.closest('[data-palette]');if(!b)return;$('palette').value=b.dataset.palette;$('palette').dispatchEvent(new Event('change'));syncWizard();};
const originalDraw=draw;
draw=function(){originalDraw();syncWizard();};
showStep(0);
