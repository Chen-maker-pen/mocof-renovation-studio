// Keep editing geometry legible without repeating the source drawing's text.
(()=>{
const controls=document.createElement('div');controls.className='toolbar plan-display-controls';
controls.innerHTML='<strong>Plan view</strong><label><input id="plan-reference-visible" type="checkbox"> Show original image</label><label><input id="plan-measurements-visible" type="checkbox"> Show wall measurements</label><small>Select a wall to see its length.</small>';
canvasWrap.before(controls);
$('plan-reference-visible').onchange=()=>{project.show_plan_reference=$('plan-reference-visible').checked;changed();};
$('plan-measurements-visible').onchange=()=>{project.show_dimensions=$('plan-measurements-visible').checked;changed();};
const previous=draw;
draw=function(){previous();controls.hidden=view3d;const hasWalls=!!project.walls?.length;
const showImage=project.show_plan_reference??!hasWalls;
$('plan-reference-visible').checked=showImage;$('plan-reference-visible').disabled=!project.layout;
$('plan-measurements-visible').checked=project.show_dimensions===true;
if(view3d)return;
const image=$('canvas').querySelector('image');if(image)image.style.display=showImage?'':'none';
// Even when all measurements are requested, omit colliding labels.
const occupied=[];
const labels=[...$('canvas').querySelectorAll('[data-wall-dimension]')].sort((a,b)=>(b.dataset.selectedWall==='true')-(a.dataset.selectedWall==='true'));
for(const label of labels){const b=label.getBBox(),box={x:b.x-3,y:b.y-2,w:b.width+6,h:b.height+4};
if(label.dataset.selectedWall!=='true'&&occupied.some(r=>box.x<r.x+r.w&&box.x+box.w>r.x&&box.y<r.y+r.h&&box.y+box.h>r.y)){label.style.display='none';continue;}
occupied.push(box);label.setAttribute('paint-order','stroke');label.setAttribute('stroke','#fffdf7');label.setAttribute('stroke-width','3');label.setAttribute('stroke-linejoin','round');
}
};draw();
})();
