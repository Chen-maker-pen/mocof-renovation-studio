// Hosted portfolio persistence is private to each visitor's browser.
(() => {
const realFetch=window.fetch.bind(window),key='mocof-portfolio-projects-v1';
window.fetch=async(input,options={})=>{
 const url=new URL(typeof input==='string'?input:input.url,location.origin);
 if(url.origin!==location.origin||url.pathname!=='/api/projects')return realFetch(input,options);
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
 try{const projects=JSON.parse(localStorage.getItem(key)||'[]');
 if((options.method||'GET')==='GET')return reply(projects);
 const project=JSON.parse(options.body);const validation=await realFetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(project)});if(!validation.ok)return validation;
 const old=projects.find(p=>p.id===project.id);if(old&&old.version!==project.version)return reply({error:'Project changed in this browser. Reopen it before saving.'},409);
 if(old)for(const item of project.items){const before=old.items.find(i=>i.id===item.id);if(before&&['width','depth','height'].some(k=>(before[k]??.75)!==(item[k]??.75)))return reply({error:'Furniture dimensions are fixed.'},400);}
 project.id=project.id||crypto.randomUUID();project.version=(old?.version||0)+1;
 const next=projects.filter(p=>p.id!==project.id).concat(project);localStorage.setItem(key,JSON.stringify(next));return reply(project);
 }catch(error){return reply({error:'Could not save in this browser. Download the editable JSON plan to keep a copy.'},400);}
};
document.addEventListener('DOMContentLoaded',()=>{
 const pdf=document.querySelector('.pdf-import');if(pdf){pdf.querySelector('label.upload')?.remove();pdf.querySelector('label')?.remove();pdf.querySelector('p').textContent='Hosted demo: upload PNG/JPG/WebP. PDF conversion is available with Poppler in the local Python app.';}
 const ai=document.getElementById('ai-status');if(ai)ai.textContent='Live AI requests are disabled in this public portfolio demo. The Python source includes the optional AI proposal endpoint.';
});
})();
