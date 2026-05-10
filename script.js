const STORAGE_KEYS = {
  services: 'nails_services',
  promotions: 'nails_promotions',
  clients: 'nails_clients'
};

const seed = {
  services: [
    { id: crypto.randomUUID(), name: 'Alongamento em gel', price: 180, duration: '2h', description: 'Estrutura e acabamento impecável.' },
    { id: crypto.randomUUID(), name: 'Blindagem', price: 95, duration: '1h', description: 'Proteção e brilho por mais tempo.' }
  ],
  promotions: [
    { id: crypto.randomUUID(), title: 'Combo Mãe & Filha', description: '15% OFF em dois serviços no mesmo dia.', expiry: '2026-12-31' }
  ],
  clients: []
};

const load = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let services = load(STORAGE_KEYS.services, seed.services);
let promotions = load(STORAGE_KEYS.promotions, seed.promotions);
let clients = load(STORAGE_KEYS.clients, seed.clients);

const servicesGrid = document.getElementById('services-grid');
const promotionsList = document.getElementById('promotions-list');
const bookingForm = document.getElementById('booking-form');
const bookingFeedback = document.getElementById('booking-feedback');
const serviceChoice = document.getElementById('serviceChoice');
const clientService = document.getElementById('clientService');
const clientsTable = document.getElementById('clients-table-body');
document.getElementById('year').textContent = new Date().getFullYear();

function money(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function renderServices() {
  servicesGrid.innerHTML = services.map(s => `
    <article class="card">
      <h3>${s.name}</h3>
      <p>${s.description || ''}</p>
      <p class="price">${money(s.price)}</p>
      <small>Duração média: ${s.duration}</small>
    </article>
  `).join('');

  const options = services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  serviceChoice.innerHTML = `<option value="">Selecione...</option>${options}`;
  clientService.innerHTML = `<option value="">Selecione...</option>${options}`;

  const list = document.getElementById('service-admin-list');
  list.innerHTML = services.map(s => `
    <li>
      <div><strong>${s.name}</strong><br /><small>${money(s.price)} • ${s.duration}</small></div>
      <div class="admin-actions">
        <button onclick="editService('${s.id}')">Editar</button>
        <button onclick="deleteService('${s.id}')">Excluir</button>
      </div>
    </li>
  `).join('');
}

function renderPromotions() {
  promotionsList.innerHTML = promotions.map(p => `
    <article class="card">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <small>Válida até: ${new Date(p.expiry + 'T00:00:00').toLocaleDateString('pt-BR')}</small>
    </article>
  `).join('');

  const list = document.getElementById('promotion-admin-list');
  list.innerHTML = promotions.map(p => `
    <li>
      <div><strong>${p.title}</strong><br /><small>até ${new Date(p.expiry + 'T00:00:00').toLocaleDateString('pt-BR')}</small></div>
      <div class="admin-actions">
        <button onclick="editPromotion('${p.id}')">Editar</button>
        <button onclick="deletePromotion('${p.id}')">Excluir</button>
      </div>
    </li>
  `).join('');
}

function renderClients() {
  clientsTable.innerHTML = clients.map(c => `
    <tr>
      <td><img class="avatar" src="${c.photoUrl || 'https://via.placeholder.com/80x80.png?text=%F0%9F%92%85'}" alt="${c.fullName}"/></td>
      <td>${c.fullName}</td>
      <td><a href="https://wa.me/${(c.whatsapp || '').replace(/\D/g, '')}" target="_blank" rel="noreferrer">${c.whatsapp}</a></td>
      <td>${c.services.join(', ')}</td>
      <td><span class="tag ${c.paymentStatus}">${c.paymentStatus}</span>${c.installments ? `<br/><small>${c.installments}x</small>` : ''}</td>
      <td>${c.lastVisit ? new Date(c.lastVisit + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
      <td>${c.notes || '-'}</td>
      <td>
        <button class="action-inline" onclick="editClient('${c.id}')">Editar</button>
        <button class="action-inline" onclick="deleteClient('${c.id}')">Excluir</button>
      </td>
    </tr>
  `).join('');
}

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(bookingForm);
  const serviceId = data.get('serviceChoice');
  const service = services.find(s => s.id === serviceId);
  bookingFeedback.textContent = `Obrigada, ${data.get('clientName')}! Seu pedido para ${service?.name || 'serviço'} foi enviado.`;
  bookingForm.reset();
});

document.getElementById('service-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('serviceId').value;
  const payload = {
    id: id || crypto.randomUUID(),
    name: document.getElementById('serviceName').value,
    price: document.getElementById('servicePrice').value,
    duration: document.getElementById('serviceDuration').value,
    description: document.getElementById('serviceDescription').value
  };
  if (id) services = services.map(s => s.id === id ? payload : s);
  else services.push(payload);
  save(STORAGE_KEYS.services, services);
  e.target.reset();
  document.getElementById('serviceId').value = '';
  renderServices();
});

document.getElementById('promotion-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('promotionId').value;
  const payload = {
    id: id || crypto.randomUUID(),
    title: document.getElementById('promotionTitle').value,
    description: document.getElementById('promotionDescription').value,
    expiry: document.getElementById('promotionExpiry').value
  };
  if (id) promotions = promotions.map(p => p.id === id ? payload : p);
  else promotions.push(payload);
  save(STORAGE_KEYS.promotions, promotions);
  e.target.reset();
  document.getElementById('promotionId').value = '';
  renderPromotions();
});

document.getElementById('client-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('clientId').value;
  const serviceId = document.getElementById('clientService').value;
  const service = services.find(s => s.id === serviceId);
  const payload = {
    id: id || crypto.randomUUID(),
    fullName: document.getElementById('fullName').value,
    whatsapp: document.getElementById('whatsapp').value,
    photoUrl: document.getElementById('photoUrl').value,
    services: service ? [service.name] : [],
    paymentStatus: document.getElementById('paymentStatus').value,
    installments: document.getElementById('installments').value,
    lastVisit: document.getElementById('lastVisit').value,
    notes: document.getElementById('notes').value
  };
  if (id) clients = clients.map(c => c.id === id ? payload : c);
  else clients.push(payload);
  save(STORAGE_KEYS.clients, clients);
  e.target.reset();
  document.getElementById('clientId').value = '';
  renderClients();
});

window.editService = (id) => {
  const item = services.find(s => s.id === id);
  if (!item) return;
  document.getElementById('serviceId').value = item.id;
  document.getElementById('serviceName').value = item.name;
  document.getElementById('servicePrice').value = item.price;
  document.getElementById('serviceDuration').value = item.duration;
  document.getElementById('serviceDescription').value = item.description || '';
};
window.deleteService = (id) => {
  services = services.filter(s => s.id !== id);
  save(STORAGE_KEYS.services, services);
  renderServices();
};
window.editPromotion = (id) => {
  const item = promotions.find(p => p.id === id);
  if (!item) return;
  document.getElementById('promotionId').value = item.id;
  document.getElementById('promotionTitle').value = item.title;
  document.getElementById('promotionDescription').value = item.description;
  document.getElementById('promotionExpiry').value = item.expiry;
};
window.deletePromotion = (id) => {
  promotions = promotions.filter(p => p.id !== id);
  save(STORAGE_KEYS.promotions, promotions);
  renderPromotions();
};
window.editClient = (id) => {
  const c = clients.find(x => x.id === id);
  if (!c) return;
  document.getElementById('clientId').value = c.id;
  document.getElementById('fullName').value = c.fullName;
  document.getElementById('whatsapp').value = c.whatsapp;
  document.getElementById('photoUrl').value = c.photoUrl;
  document.getElementById('paymentStatus').value = c.paymentStatus;
  document.getElementById('installments').value = c.installments || '';
  document.getElementById('lastVisit').value = c.lastVisit || '';
  document.getElementById('notes').value = c.notes || '';
};
window.deleteClient = (id) => {
  clients = clients.filter(c => c.id !== id);
  save(STORAGE_KEYS.clients, clients);
  renderClients();
};

renderServices();
renderPromotions();
renderClients();
