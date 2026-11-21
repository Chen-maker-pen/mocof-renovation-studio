(() => {
const bar=document.createElement('div');bar.className='selection-quick-actions';bar.hidden=true;bar.innerHTML='<strong id="selected-furniture-name"></strong><button id="delete-furniture" class="delete-furniture">Delete furniture</button><button id="quick-rotate-furniture">Rotate 90°</button>';
document.querySelector('.studio-commandbar').after(bar);
function deleteSelected(){const item=project.items.find(i=>i.id===selected);if(!item)return;project.items=project.items.filter(i=>i.id!==selected);selected=null;dragging=null;changed();notify('Furniture deleted. Use Undo to restore it.');}
$('delete-furniture').onclick=deleteSelected;$('quick-rotate-furniture').onclick=()=>{$('rotate')?.click();};
const previous=draw;draw=function(){previous();const item=project.items.find(i=>i.id===selected);bar.hidden=!item;if(item){$('selected-furniture-name').textContent=catalogBilingualName(item);if($('remove')){$('remove').textContent='Delete furniture';$('remove').classList.add('delete-furniture');$('remove').onclick=deleteSelected;}}};
document.addEventListener('keydown',event=>{if(!['Delete','Backspace'].includes(event.key)||!selected||step!==2)return;const target=event.target;if(target.closest('input,textarea,select,[contenteditable="true"],dialog'))return;event.preventDefault();deleteSelected();});
draw();
})();
