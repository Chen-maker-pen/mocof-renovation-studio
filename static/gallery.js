const customerGallery=document.createElement('section');customerGallery.className='customer-gallery';
customerGallery.innerHTML='<div class="gallery-heading"><div><small>MOCOF DESIGN COLLECTION</small><h2>Find a home that feels like yours.</h2><p>Explore MOCOF design concepts and completed renovations. Choose a look for your home.</p></div></div><div class="gallery-filters"><button data-gallery-type="all" class="chosen">All designs</button><button data-gallery-type="concept">Design concepts</button><button data-gallery-type="completed">Completed renovations</button><input id="gallery-search" placeholder="Search design name…" aria-label="Search company designs"></div><p id="gallery-count" class="muted"></p><div id="company-designs"></div><p class="muted">Browse design references from our collection. Product matches, measurements and quotations are confirmed during review.</p>';
panels[1].insertBefore(customerGallery,referenceDock);
const chooseLibrary=document.createElement('details');chooseLibrary.className='template-library';chooseLibrary.innerHTML='<summary>Explore sample catalog</summary>';
panels[1].insertBefore(chooseLibrary,referenceDock);chooseLibrary.append(library);
// Keep the shared catalog in its template drawer when returning to the style step.
const galleryStep=showStep;
showStep=function(n){galleryStep(n);if(n===1)chooseLibrary.append(library);};
const designDialog=document.createElement('dialog');designDialog.id='design-detail';designDialog.innerHTML='<button id="close-design" aria-label="Close design">×</button><div id="design-detail-content"></div>';document.body.append(designDialog);
let companyDesigns=[],galleryType='all',viewedDesign=null,photoIndex=0;
function publicName(d){return d.type==='completed'?d.title:d.title.replace(/^.*?[-–]\s*/,'');}
function renderCompanyGallery(){
  const query=$('gallery-search').value.toLowerCase();const rows=companyDesigns.filter(d=>(galleryType==='all'||galleryType===d.type)&&d.title.toLowerCase().includes(query));
  $('gallery-count').textContent=`${rows.length} collections · ${companyDesigns.filter(d=>d.type==='concept').length} concepts and ${companyDesigns.filter(d=>d.type==='completed').length} completed-home examples`;
  $('company-designs').innerHTML=rows.map(d=>`<button class="design-tile ${project.reference?.id===d.id?'selected-design':''}" data-design="${d.id}"><img src="${escape(d.images[0]?.preview_url||'')}" loading="lazy" alt="${escape(publicName(d))}"><div><small>${d.type==='concept'?'DESIGN CONCEPT':'COMPLETED RENOVATION'}</small><h3>${escape(publicName(d))}</h3><p>${d.images.length} photo previews <span>Explore →</span></p></div></button>`).join('')||'<p>No matching designs. Try another name.</p>';
  $('company-designs').querySelectorAll('img').forEach(img=>img.onerror=()=>{img.alt='Preview unavailable';img.style.opacity='.2';});
}
function renderDesignDetail(){
  const d=viewedDesign,photo=d.images[photoIndex];
  $('design-detail-content').innerHTML=`<div class="detail-photo"><img src="${escape(photo.preview_url)}" alt="${escape(publicName(d))}"></div><div class="detail-copy"><small>${d.type==='concept'?'DESIGN CONCEPT':'COMPLETED RENOVATION'}</small><h2>${escape(publicName(d))}</h2><p>Use this collection as the starting point for your renovation. Your furniture, measurements and quotation can be adjusted for your home.</p><div class="photo-controls"><button id="previous-photo" ${photoIndex===0?'disabled':''}>←</button><span>Photo ${photoIndex+1} of ${d.images.length}</span><button id="next-photo" ${photoIndex===d.images.length-1?'disabled':''}>→</button></div><p class="muted">${d.available_image_count} images available in the source collection. Showing ${d.images.length} imported previews.</p><button class="primary" id="choose-company-design">Choose this design</button><p class="muted">Choosing a reference saves your preference. Furniture is added and measured in the next step.</p></div>`;
  $('previous-photo').onclick=()=>{photoIndex--;renderDesignDetail();};$('next-photo').onclick=()=>{photoIndex++;renderDesignDetail();};
  $('choose-company-design').onclick=()=>{project.reference={id:d.id,name:publicName(d),image:d.images[0].preview_url,source:'MOCOF design collection',collection_type:d.type};changed();renderCompanyGallery();designDialog.close();notify('Design selected. Continue to furnish and customise your layout.');};
}
$('company-designs').onclick=e=>{const b=e.target.closest('[data-design]');if(!b)return;viewedDesign=companyDesigns.find(d=>d.id===b.dataset.design);photoIndex=0;renderDesignDetail();designDialog.showModal();};
$('close-design').onclick=()=>designDialog.close();
$('gallery-search').oninput=renderCompanyGallery;
customerGallery.querySelectorAll('[data-gallery-type]').forEach(b=>b.onclick=()=>{galleryType=b.dataset.galleryType;customerGallery.querySelectorAll('[data-gallery-type]').forEach(x=>x.classList.toggle('chosen',x===b));renderCompanyGallery();});
request('/gallery.json').then(data=>{companyDesigns=data;renderCompanyGallery();}).catch(()=>{$('company-designs').textContent='Design collections could not load. Please refresh.';});
