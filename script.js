const DB_KEYS={services:'lumi_services',promos:'lumi_promos',clients:'lumi_clients'};
const seed={
  services:[
    {id:crypto.randomUUID(),name:'Alongamento em gel',price:180,duration:'2h',desc:'Estrutura com acabamento natural e alta durabilidade.'},
    {id:crypto.randomUUID(),name:'Manutenção + decoração',price:140,duration:'1h40',desc:'Correção e arte personalizada.'}
  ],
  promos:[{id:crypto.randomUUID(),title:'Combo Delicado',desc:'Mão + pé com 12% OFF no mesmo dia.',expiry:'2026-12-31'}],
  clients:[]
};
const load=(k,f)=>JSON.parse(localStorage.getItem(k)||JSON.stringify(f));
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let services=load(DB_KEYS.services,seed.services),promos=load(DB_KEYS.promos,seed.promos),clients=load(DB_KEYS.clients,seed.clients);
const $=id=>document.getElementById(id), money=v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
$('year').textContent=new Date().getFullYear();

function serviceOptions(){return services.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');}
function renderServices(){
  $('servicesGrid').innerHTML=services.map(s=>`<article class="card"><h3>${s.name}</h3><p>${s.desc||''}</p><p><strong>${money(s.price)}</strong> · ${s.duration}</p></article>`).join('');
  $('serviceList').innerHTML=services.map(s=>`<div class="item"><div><strong>${s.name}</strong><br><small>${money(s.price)} · ${s.duration}</small></div><div><button onclick="editService('${s.id}')">Editar</button><button onclick="delService('${s.id}')">Excluir</button></div></div>`).join('');
  $('bookingService').innerHTML='<option value="">Selecione</option>'+serviceOptions();
  $('clientService').innerHTML='<option value="">Selecione</option>'+serviceOptions();
}
function renderPromos(){
  $('promotionsGrid').innerHTML=promos.map(p=>`<article class="card"><h3>${p.title}</h3><p>${p.desc}</p><small>Válida até ${new Date(p.expiry+'T00:00:00').toLocaleDateString('pt-BR')}</small></article>`).join('');
  $('promoList').innerHTML=promos.map(p=>`<div class="item"><div><strong>${p.title}</strong><br><small>${new Date(p.expiry+'T00:00:00').toLocaleDateString('pt-BR')}</small></div><div><button onclick="editPromo('${p.id}')">Editar</button><button onclick="delPromo('${p.id}')">Excluir</button></div></div>`).join('');
}
function renderClients(){
  $('clientsTable').innerHTML=clients.map(c=>`<tr><td><img class="avatar" src="${c.photo||'https://via.placeholder.com/70x70.png?text=%F0%9F%92%85'}" alt="${c.name}"></td><td>${c.name}</td><td><a href="https://wa.me/${c.phone.replace(/\D/g,'')}" target="_blank" rel="noreferrer">${c.phone}</a></td><td>${c.service}</td><td><span class="tag ${c.payment}">${c.payment}</span>${c.installments?`<br><small>${c.installments}x</small>`:''}</td><td>${c.lastVisit?new Date(c.lastVisit+'T00:00:00').toLocaleDateString('pt-BR'):'-'}</td><td>${c.notes||'-'}</td><td><button onclick="editClient('${c.id}')">Editar</button> <button onclick="delClient('${c.id}')">Excluir</button></td></tr>`).join('');
}

$('bookingForm').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.target);const s=services.find(x=>x.id===d.get('service'));$('bookingMsg').textContent=`Obrigada, ${d.get('name')}! Recebemos seu pedido para ${s?.name||'o serviço'} 💅`;e.target.reset();});
$('serviceForm').addEventListener('submit',e=>{e.preventDefault();const id=$('serviceId').value;const obj={id:id||crypto.randomUUID(),name:$('serviceName').value,price:$('servicePrice').value,duration:$('serviceDuration').value,desc:$('serviceDesc').value};services=id?services.map(s=>s.id===id?obj:s):[...services,obj];save(DB_KEYS.services,services);e.target.reset();$('serviceId').value='';renderServices();});
$('promoForm').addEventListener('submit',e=>{e.preventDefault();const id=$('promoId').value;const obj={id:id||crypto.randomUUID(),title:$('promoTitle').value,desc:$('promoDesc').value,expiry:$('promoExpiry').value};promos=id?promos.map(p=>p.id===id?obj:p):[...promos,obj];save(DB_KEYS.promos,promos);e.target.reset();$('promoId').value='';renderPromos();});
$('clientForm').addEventListener('submit',e=>{e.preventDefault();const id=$('clientId').value;const s=services.find(x=>x.id===$('clientService').value);const obj={id:id||crypto.randomUUID(),name:$('clientName').value,phone:$('clientPhone').value,photo:$('clientPhoto').value,service:s?s.name:'',payment:$('clientPayment').value,installments:$('clientInstallments').value,lastVisit:$('clientLastVisit').value,notes:$('clientNotes').value};clients=id?clients.map(c=>c.id===id?obj:c):[...clients,obj];save(DB_KEYS.clients,clients);e.target.reset();$('clientId').value='';renderClients();});
window.editService=id=>{const s=services.find(x=>x.id===id);if(!s)return;$('serviceId').value=s.id;$('serviceName').value=s.name;$('servicePrice').value=s.price;$('serviceDuration').value=s.duration;$('serviceDesc').value=s.desc||''};
window.delService=id=>{services=services.filter(x=>x.id!==id);save(DB_KEYS.services,services);renderServices();};
window.editPromo=id=>{const p=promos.find(x=>x.id===id);if(!p)return;$('promoId').value=p.id;$('promoTitle').value=p.title;$('promoDesc').value=p.desc;$('promoExpiry').value=p.expiry;};
window.delPromo=id=>{promos=promos.filter(x=>x.id!==id);save(DB_KEYS.promos,promos);renderPromos();};
window.editClient=id=>{const c=clients.find(x=>x.id===id);if(!c)return;$('clientId').value=c.id;$('clientName').value=c.name;$('clientPhone').value=c.phone;$('clientPhoto').value=c.photo;$('clientPayment').value=c.payment;$('clientInstallments').value=c.installments||'';$('clientLastVisit').value=c.lastVisit||'';$('clientNotes').value=c.notes||'';};
window.delClient=id=>{clients=clients.filter(x=>x.id!==id);save(DB_KEYS.clients,clients);renderClients();};
renderServices();renderPromos();renderClients();
