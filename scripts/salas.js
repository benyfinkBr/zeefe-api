const API_BASE = '/api';
let roomsData = [];
let amenitiesMap = {};

const roomsMessage = document.getElementById('rooms-message');
const roomsStrip = document.getElementById('rooms-strip-salas');
const navPrev = document.querySelector('.rooms-nav-prev');
const navNext = document.querySelector('.rooms-nav-next');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterQuerySalas = document.getElementById('filterQuerySalas');
const filterCapacitySalas = document.getElementById('filterCapacitySalas');
const filterCitySalas = document.getElementById('filterCitySalas');
const filterStateSalas = document.getElementById('filterStateSalas');
const clearFiltersSalas = document.getElementById('clearFiltersSalas');
const amenityFilters = document.getElementById('amenityFilters');
const openAdvancedFilters = document.getElementById('openAdvancedFilters');
const advancedFiltersModal = document.getElementById('advancedFiltersModal');
const advancedFiltersClose = document.getElementById('advancedFiltersClose');
const advancedFiltersApply = document.getElementById('advancedFiltersApply');
const advancedFiltersClear = document.getElementById('advancedFiltersClear');
const paymentFilters = document.getElementById('paymentFilters');
const formatFilters = document.getElementById('formatFilters');
const roomsMapEl = document.getElementById('rooms-map-salas');
let salasMap = null;
let salasMarkersLayer = null;
let selectedAmenities = new Set();
let selectedPaymentOptions = new Set();
let selectedFormats = new Set();
let roomPoliciesByRoom = new Map();
const sharePanels = new Set();

const closeSharePanels = (event) => {
  if (event && event.target.closest('.share-menu')) return;
  sharePanels.forEach(panel => {
    panel.hidden = true;
  });
};
document.addEventListener('click', closeSharePanels);

const openShareWindow = (url) => window.open(url, '_blank', 'noopener');
const createShareActions = (titleText, url) => {
  const wrap = document.createElement('div');
  wrap.className = 'card-share';

  const whatsappBtn = document.createElement('button');
  whatsappBtn.type = 'button';
  whatsappBtn.className = 'btn btn-secondary btn-sm btn-icon';
  whatsappBtn.setAttribute('aria-label', 'Compartilhar no WhatsApp');
  whatsappBtn.innerHTML = `
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M16 3C9.4 3 4 8.2 4 14.7c0 2.3.7 4.4 1.9 6.2L4 29l8.4-1.9c1.7.9 3.7 1.4 5.6 1.4 6.6 0 12-5.2 12-11.7C30 8.2 22.6 3 16 3zm0 21.3c-1.6 0-3.2-.4-4.6-1.2l-.7-.4-5 .9 1-4.7-.5-.8c-1-1.5-1.5-3.2-1.5-5 0-5 4.1-9 9.3-9 5.1 0 9.3 4 9.3 8.9s-4.1 9.3-9.3 9.3zm5.4-6.6c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 .9-.2.1-.4.1-.7 0-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.3-1.6-1.5-1.9-.1-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.1-.3.2-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-1 .9-1 2.3 0 1.3 1 2.6 1.1 2.8.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.7.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z"/>
    </svg>
  `;
  whatsappBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const text = encodeURIComponent(`${titleText} ${url}`);
    openShareWindow(`https://web.whatsapp.com/send?text=${text}`);
  });
  wrap.appendChild(whatsappBtn);

  const shareMenu = document.createElement('div');
  shareMenu.className = 'share-menu';
  const menuToggle = document.createElement('button');
  menuToggle.type = 'button';
  menuToggle.className = 'btn btn-secondary btn-sm btn-icon';
  menuToggle.setAttribute('aria-label', 'Compartilhar');
  menuToggle.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M18 16a2.9 2.9 0 0 0-1.8.7l-6.2-3.2a3 3 0 0 0 0-1l6.2-3.2A3 3 0 1 0 15 7a3 3 0 0 0 .1.7L9 10.9A3 3 0 1 0 9 14l6.1 3.2A3 3 0 1 0 18 16z"/>
    </svg>
  `;

  const menuPanel = document.createElement('div');
  menuPanel.className = 'share-menu-panel';
  menuPanel.hidden = true;
  sharePanels.add(menuPanel);

  const menuItems = [
    { key: 'x', label: 'X' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'email', label: 'E-mail' },
    { key: 'copy', label: 'Copiar link' }
  ];
  menuItems.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.share = item.key;
    btn.textContent = item.label;
    menuPanel.appendChild(btn);
  });

  menuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = menuPanel.hidden;
    closeSharePanels();
    menuPanel.hidden = !willOpen;
  });

  menuPanel.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-share]');
    if (!btn) return;
    const type = btn.dataset.share;
    const title = encodeURIComponent(titleText);
    const shareUrl = encodeURIComponent(url);
    if (type === 'x') {
      openShareWindow(`https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}`);
    } else if (type === 'facebook') {
      openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
    } else if (type === 'linkedin') {
      openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`);
    } else if (type === 'email') {
      window.location.href = `mailto:?subject=${title}&body=${shareUrl}`;
    } else if (type === 'copy') {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url);
      } else {
        window.prompt('Copie o link:', url);
      }
    }
    menuPanel.hidden = true;
  });

  shareMenu.appendChild(menuToggle);
  shareMenu.appendChild(menuPanel);
  wrap.appendChild(shareMenu);
  return wrap;
};

function getRoomViewSessionId() {
  const key = 'zeefeRoomViewSession';
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = `rv_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    localStorage.setItem(key, id);
    return id;
  } catch (_) {
    return `rv_${Date.now().toString(36)}`;
  }
}

async function trackRoomView(roomId) {
  if (!roomId) return;
  try {
    await fetch(`${API_BASE}/room_view_track.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ room_id: roomId, session_id: getRoomViewSessionId() })
    });
  } catch (_) {}
}

function buildPolicyLabel(policy) {
  if (policy.label) return policy.label;
  if (policy.option_key === 'immediate') return 'Pagamento no momento da Reserva (Sem cancelamento)';
  if (policy.option_key === 'cancel_window') {
    const days = policy.cancel_days ?? 0;
    const fee = policy.cancel_fee_pct ?? 0;
    return `Cancelamento da Reserva (até ${days} dias · multa ${fee}%)`;
  }
  if (policy.option_key === 'free_cancel') return 'Sem taxa de cancelamento';
  return 'Opção de pagamento/cancelamento';
}

async function renderModalPolicies(roomId, reserveDisabled = false) {
  if (!modalPolicies) return;
  if (!reserveDisabled) {
    modalReserve.classList.remove('disabled');
    modalReserve.removeAttribute('aria-disabled');
  }
  modalPolicies.innerHTML = '<div class="rooms-message">Carregando opções de pagamento...</div>';
  try {
    const res = await fetch(`${API_BASE}/room_policies_list.php?room_id=${encodeURIComponent(roomId)}`, { credentials: 'include' });
    const json = await res.json();
    const policies = json.success ? (json.policies || []) : [];
    if (!policies.length) {
      modalPolicies.innerHTML = '<div class="rooms-message">Sala sem opções de pagamento/cancelamento configuradas.</div>';
      modalReserve.classList.add('disabled');
      modalReserve.setAttribute('aria-disabled', 'true');
      modalReserve.href = '/clientes.html';
      return;
    }
    modalPolicies.innerHTML = '<strong>Opções de pagamento/cancelamento</strong>';
    policies.forEach((policy, idx) => {
      const label = buildPolicyLabel(policy);
      const priceLabel = policy.base_price ? formatCurrency(policy.base_price) : '';
      const priceHtml = priceLabel ? `<div class="input-hint">Preço: ${escapeHtml(priceLabel)}</div>` : '';
      const item = document.createElement('label');
      item.className = 'policy-select-item';
      item.innerHTML = `
        <input type="radio" name="modalPolicyChoice" value="${policy.id}" ${idx === 0 ? 'checked' : ''} />
        <div>${label}${priceHtml}</div>
      `;
      item.querySelector('input')?.addEventListener('change', () => {
        modalReserve.href = `/clientes.html?room_id=${encodeURIComponent(roomId)}&policy_id=${encodeURIComponent(policy.id)}`;
      });
      modalPolicies.appendChild(item);
    });
    modalReserve.href = `/clientes.html?room_id=${encodeURIComponent(roomId)}&policy_id=${encodeURIComponent(policies[0].id)}`;
  } catch (_) {
    modalPolicies.innerHTML = '<div class="rooms-message">Não foi possível carregar opções de pagamento.</div>';
  }
}
const modalOverlay = document.getElementById('roomModal');
const modalCloseTop = document.getElementById('roomModalClose');
const modalCloseFooter = document.getElementById('roomModalCloseFooter');
const modalTitle = document.getElementById('roomModalTitle');
const modalDescription = document.getElementById('roomModalDescription');
const modalCapacity = document.getElementById('roomModalCapacity');
const modalStatus = document.getElementById('roomModalStatus');
const modalLocation = document.getElementById('roomModalLocation');
const modalRate = document.getElementById('roomModalRate');
const modalGallery = document.getElementById('roomModalGallery');
const modalAmenities = document.getElementById('roomModalAmenities');
const modalPolicies = document.getElementById('roomModalPolicies');
const modalReserve = document.getElementById('roomModalReserve');
const openLoginChoiceBtn = document.getElementById('openLoginChoice');
const entryChoiceModal = document.getElementById('entryChoiceModal');
const entryChoiceClose = document.getElementById('entryChoiceClose');

openLoginChoiceBtn?.addEventListener('click', () => {
  const session = window.ZEEFE_HEADER?.getSession?.();
  if (session) {
    const destino = session.type === 'advertiser' ? '/anunciante.html' : '/clientes.html';
    window.location.href = destino;
    return;
  }
  if (!entryChoiceModal) return;
  entryChoiceModal.classList.add('show');
  entryChoiceModal.setAttribute('aria-hidden', 'false');
});

entryChoiceClose?.addEventListener('click', () => {
  if (!entryChoiceModal) return;
  entryChoiceModal.classList.remove('show');
  entryChoiceModal.setAttribute('aria-hidden', 'true');
});

entryChoiceModal?.addEventListener('click', (event) => {
  if (event.target === entryChoiceModal) {
    entryChoiceModal.classList.remove('show');
    entryChoiceModal.setAttribute('aria-hidden', 'true');
  }
});

document.querySelectorAll('.entry-choice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const destino = btn.getAttribute('data-destino');
    if (destino) window.location.href = destino;
  });
});

init();

async function init() {
  try {
    const [rooms, amenities, policies] = await Promise.all([fetchRooms(), fetchAmenities(), fetchRoomPolicies()]);
    roomsData = rooms;
    amenitiesMap = amenities;
    roomPoliciesByRoom = policies;
    renderAmenityFilters();
    hydrateUfAndCities();
    applyFiltersFromUrl();
    initMapIfNeeded();
    renderRooms('all');
    handleHashRoomOpen();
  } catch (err) {
    console.error(err);
    if (roomsMessage) roomsMessage.textContent = 'Erro ao carregar salas. Tente novamente mais tarde.';
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderRooms(button.dataset.filter);
    });
  });

  [modalCloseTop, modalCloseFooter].forEach(btn => btn.addEventListener('click', closeModal));
  modalOverlay.addEventListener('click', event => {
    if (event.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalOverlay.classList.contains('show')) {
      closeModal();
    }
    if (event.key === 'Escape' && advancedFiltersModal?.classList.contains('show')) {
      advancedFiltersModal.classList.remove('show');
      advancedFiltersModal.setAttribute('aria-hidden', 'true');
    }
  });

  // Filtros extras
  filterQuerySalas?.addEventListener('input', () => renderRooms(getActiveFilter()));
  filterCapacitySalas?.addEventListener('change', () => renderRooms(getActiveFilter()));
  filterStateSalas?.addEventListener('change', () => {
    hydrateCitiesForUf(filterStateSalas.value);
    renderRooms(getActiveFilter());
  });
  filterCitySalas?.addEventListener('change', () => renderRooms(getActiveFilter()));
  clearFiltersSalas?.addEventListener('click', () => {
    if (filterQuerySalas) filterQuerySalas.value = '';
    if (filterCapacitySalas) filterCapacitySalas.value = '';
    if (filterStateSalas) filterStateSalas.value = '';
    hydrateCitiesForUf('');
    if (filterCitySalas) filterCitySalas.value = '';
    selectedAmenities.clear();
    amenityFilters?.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
    selectedPaymentOptions.clear();
    selectedFormats.clear();
    paymentFilters?.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
    formatFilters?.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
    renderRooms(getActiveFilter());
  });

  openAdvancedFilters?.addEventListener('click', () => {
    if (!advancedFiltersModal) return;
    advancedFiltersModal.classList.add('show');
    advancedFiltersModal.setAttribute('aria-hidden', 'false');
  });
  [advancedFiltersClose].forEach(btn => {
    btn?.addEventListener('click', () => {
      advancedFiltersModal?.classList.remove('show');
      advancedFiltersModal?.setAttribute('aria-hidden', 'true');
    });
  });
  advancedFiltersModal?.addEventListener('click', event => {
    if (event.target === advancedFiltersModal) {
      advancedFiltersModal.classList.remove('show');
      advancedFiltersModal.setAttribute('aria-hidden', 'true');
    }
  });
  advancedFiltersApply?.addEventListener('click', () => {
    selectedAmenities = new Set(Array.from(amenityFilters?.querySelectorAll('input[type="checkbox"]:checked') || []).map(i => i.value));
    selectedPaymentOptions = new Set(Array.from(paymentFilters?.querySelectorAll('input[type="checkbox"]:checked') || []).map(i => i.value));
    selectedFormats = new Set(Array.from(formatFilters?.querySelectorAll('input[type="checkbox"]:checked') || []).map(i => i.value));
    renderRooms(getActiveFilter());
    advancedFiltersModal?.classList.remove('show');
    advancedFiltersModal?.setAttribute('aria-hidden', 'true');
  });
  advancedFiltersClear?.addEventListener('click', () => {
    selectedAmenities.clear();
    selectedPaymentOptions.clear();
    selectedFormats.clear();
    amenityFilters?.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
    paymentFilters?.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
    formatFilters?.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
  });

  window.addEventListener('hashchange', handleHashRoomOpen);
}

function applyFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search || '');
  const uf = (params.get('uf') || '').toLowerCase().trim();
  const city = (params.get('city') || '').toLowerCase().trim();
  const bairro = (params.get('bairro') || params.get('neighborhood') || '').toLowerCase().trim();
  const q = (params.get('q') || '').toLowerCase().trim();
  if (filterStateSalas && uf) {
    filterStateSalas.value = uf;
  }
  hydrateCitiesForUf(filterStateSalas?.value || '');
  if (filterCitySalas && city) {
    filterCitySalas.value = city;
  }
  if (filterQuerySalas) {
    filterQuerySalas.value = bairro || q || '';
  }
}

async function fetchRooms() {
  const res = await fetch(`${API_BASE}/apiget.php?table=rooms`, { credentials: 'include' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Falha ao consultar salas');
  return json.data || [];
}

async function fetchAmenities() {
  const res = await fetch(`${API_BASE}/apiget.php?table=amenities`, { credentials: 'include' });
  const json = await res.json();
  if (!json.success) return {};
  const map = {};
  (json.data || []).forEach(item => {
    map[item.id] = item.name;
  });
  return map;
}

async function fetchRoomPolicies() {
  try {
    const res = await fetch(`${API_BASE}/room_policies_all.php`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) return new Map();
    const map = new Map();
    (json.data || []).forEach(policy => {
      if (!policy?.room_id || !policy?.option_key) return;
      const key = String(policy.room_id);
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(String(policy.option_key));
    });
    return map;
  } catch (_) {
    return new Map();
  }
}

function renderRooms(filter) {
  if (!roomsStrip) return;
  roomsStrip.innerHTML = '';
  let filtered = [...roomsData];
  switch (filter) {
    case 'up-to-10':
      filtered = filtered.filter(r => Number(r.capacity) <= 10);
      break;
    case '11-20':
      filtered = filtered.filter(r => Number(r.capacity) >= 11 && Number(r.capacity) <= 20);
      break;
    case 'over-20':
      filtered = filtered.filter(r => Number(r.capacity) > 20);
      break;
  }
  // Aplicar filtros extras
  const q = (filterQuerySalas?.value || '').toLowerCase().trim();
  const cap = Number(filterCapacitySalas?.value || 0);
  const city = (filterCitySalas?.value || '').toLowerCase().trim();
  const uf = (filterStateSalas?.value || '').toLowerCase().trim();
  const amenityIds = Array.from(selectedAmenities);
  const paymentOptions = Array.from(selectedPaymentOptions);
  const formats = Array.from(selectedFormats);

  filtered = filtered.filter(room => {
    const name = (room.name || '').toLowerCase();
    const loc = (room.location || '').toLowerCase();
    const cityRoom = (room.city || '').toLowerCase();
    const stateRoom = (room.state || room.uf || '').toLowerCase();
    const okQuery = !q || name.includes(q) || loc.includes(q) || cityRoom.includes(q);
    const okCap = !cap || (cap === 51 ? Number(room.capacity || 0) > 50 : Number(room.capacity || 0) <= cap);
    const okCity = !city || cityRoom.includes(city);
    const okState = !uf || (stateRoom === uf);
    const okAmenities = !amenityIds.length || amenityIds.every(id => (room.amenities || []).includes(Number(id)) || (room.amenities || []).includes(String(id)));
    let okPayments = true;
    if (paymentOptions.length) {
      const policies = roomPoliciesByRoom.get(String(room.id));
      okPayments = !!policies && paymentOptions.some(option => policies.has(option));
    }
    let okFormats = true;
    if (formats.length) {
      const roomFormats = String(room.room_formats || '')
        .split(',')
        .map(val => val.trim().toLowerCase())
        .filter(Boolean);
      okFormats = roomFormats.length && formats.some(val => roomFormats.includes(val));
    }
    return okQuery && okCap && okCity && okState && okAmenities && okPayments && okFormats;
  });

  if (!filtered.length) {
    if (roomsMessage) roomsMessage.textContent = 'Nenhuma sala encontrada com os filtros atuais.';
    renderMapMarkersSalas([]);
    return;
  }
  if (roomsMessage) roomsMessage.textContent = '';
  filtered.forEach(room => roomsStrip.appendChild(createRoomCard(room)));
  renderMapMarkersSalas(filtered);
  requestAnimationFrame(updateCarouselNavState);
}

function hydrateUfAndCities() {
  if (!roomsData || !roomsData.length) return;
  const ufs = Array.from(new Set(roomsData.map(r => String(r.state || r.uf || '').toUpperCase()).filter(Boolean))).sort();
  if (filterStateSalas) {
    filterStateSalas.innerHTML = '<option value="">UF (todas)</option>' + ufs.map(uf => `<option value="${uf.toLowerCase()}">${uf}</option>`).join('');
  }
  hydrateCitiesForUf(filterStateSalas?.value || '');
}

function hydrateCitiesForUf(ufValue) {
  if (!filterCitySalas) return;
  const normalized = String(ufValue || '').toLowerCase();
  let cities = roomsData
    .filter(r => !normalized || String(r.state || r.uf || '').toLowerCase() === normalized)
    .map(r => String(r.city || '').trim())
    .filter(Boolean);
  cities = Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  filterCitySalas.innerHTML = '<option value="">Cidade (todas)</option>' + cities.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('');
}

function createRoomCard(room) {
  const card = document.createElement('article');
  card.className = 'room-card carousel-room-card';
  card.id = `sala-${room.id}`;
  const photos = getPhotos(room.photo_path);
  const status = (room.status || '').toLowerCase();
  const statusLabel = status === 'manutencao'
    ? 'Em manutenção'
    : status === 'desativada'
    ? 'Desativada'
    : status === 'inativo'
    ? 'Indisponível'
    : 'Disponível';
  const statusClass = status === 'manutencao'
    ? 'status-pendente'
    : status === 'desativada' || status === 'inativo'
    ? 'status-cancelada'
    : 'status-ativo';

  const disabled = ['manutencao', 'desativada', 'inativo'].includes(status);

  const photoWrapper = document.createElement('div');
  photoWrapper.className = 'photo';
  if (photos.length && window.createImageCarousel) {
    const carousel = window.createImageCarousel({
      images: photos,
      altPrefix: `Sala ${room.name || ''}`
    });
    photoWrapper.appendChild(carousel.element);
  } else {
    photoWrapper.classList.add('photo-empty');
    photoWrapper.innerHTML = '<div class="room-photo-placeholder">Sem imagens cadastradas</div>';
  }
  // Wrap photo to allow overlay pills like no index
  const media = document.createElement('div');
  media.className = 'room-card-media';
  media.appendChild(photoWrapper);

  // Overlay: status pill e nota de disponibilidade
  const availableToday = isRoomAvailableOnDay(room, new Date().toISOString().split('T')[0]);
  const meta = getStatusMeta(room, availableToday);
  const statusPill = document.createElement('span');
  statusPill.className = `room-status-pill ${meta.className}`;
  statusPill.textContent = meta.label;
  media.appendChild(statusPill);

  const availabilityNote = document.createElement('span');
  availabilityNote.className = `room-availability-note ${availableToday ? 'available' : 'blocked'}`;
  availabilityNote.textContent = getAvailabilityNote(room, availableToday);
  media.appendChild(availabilityNote);

  card.appendChild(media);

  const info = document.createElement('div');
  info.className = 'room-info';

  const header = document.createElement('div');
  header.className = 'room-header';
  header.innerHTML = `<h4>${escapeHtml(room.name || '')}</h4><span class="status-badge ${meta.className}">${meta.label}</span>`;
  info.appendChild(header);

  const metaRow = document.createElement('div');
  metaRow.className = 'room-meta';
  metaRow.innerHTML = `
    <span class="room-location">${room.city ? escapeHtml(room.city) : 'Local não informado'}${room.state ? ' - ' + escapeHtml(String(room.state).toUpperCase()) : ''}</span>
    <span class="room-capacity">${room.capacity || 0} pessoas</span>
  `;
  info.appendChild(metaRow);

  if (room.daily_rate) {
    const price = document.createElement('div');
    price.className = 'room-price';
    price.innerHTML = `<strong>${formatCurrency(room.daily_rate)}</strong><span>/ diária</span>`;
    info.appendChild(price);
  }

  const actions = document.createElement('div');
  actions.className = 'room-actions';
  const disabledCta = !availableToday;
  actions.innerHTML = `
    <button class="btn btn-secondary" type="button" data-room="${room.id}">Ver detalhes</button>
    <a class="btn btn-primary${disabledCta ? ' disabled' : ''}" ${disabledCta ? 'aria-disabled=\"true\" tabindex=\"-1\"' : ''} href="${disabledCta ? '#' : `/clientes.html`}">${disabledCta ? 'Indisponível' : 'Reservar diária'}</a>`;
  info.appendChild(actions);
  const detailUrl = new URL(`/salas.html#sala-${room.id}`, window.location.href).toString();
  info.appendChild(createShareActions(room.name || 'Sala Ze.EFE', detailUrl));

  card.appendChild(info);

  card.querySelector('button[data-room]').addEventListener('click', () => openModal(room));
  return card;
}

function initMapIfNeeded() {
  if (!roomsMapEl || typeof L === 'undefined') return;
  if (salasMap) return;
  salasMap = L.map(roomsMapEl).setView([-23.5505, -46.6333], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18
  }).addTo(salasMap);
  salasMarkersLayer = L.layerGroup().addTo(salasMap);
}

function renderMapMarkersSalas(rooms) {
  if (!salasMap || !salasMarkersLayer) return;
  salasMarkersLayer.clearLayers();
  const bounds = [];
  (rooms || []).forEach(room => {
    const lat = Number(room.lat || room.latitude || room.latitud);
    const lon = Number(room.lon || room.lng || room.longitude);
    if (!isFinite(lat) || !isFinite(lon)) return;
    const marker = L.marker([lat, lon]);
    const name = escapeHtml(room.name || `Sala #${room.id}`);
    const city = escapeHtml(room.city || '');
    const uf = escapeHtml(room.state || room.uf || '');
    const popupHtml =
      `<strong>${name}</strong><br>${city}${uf ? ' - ' + uf : ''}<br>` +
      `<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">` +
      `<button type="button" class="btn btn-secondary btn-sm" data-room-popup="${room.id}">Ver detalhes</button>` +
      `<a class="btn btn-primary btn-sm" href="/clientes.html">Solicitar reserva</a>` +
      `</div>`;
    marker.bindPopup(popupHtml);
    marker.addTo(salasMarkersLayer);
    marker.on('popupopen', e => {
      const popupEl = e.popup.getElement();
      if (!popupEl) return;
      const btn = popupEl.querySelector(`button[data-room-popup="${room.id}"]`);
      if (btn) {
        btn.addEventListener('click', () => openModal(room), { once: true });
      }
    });
    bounds.push([lat, lon]);
  });
  if (bounds.length) {
    salasMap.fitBounds(bounds, { padding: [20, 20] });
  }
}

function openModal(room) {
  modalTitle.textContent = room.name || '';
  modalDescription.textContent = room.description || 'Sem descrição cadastrada.';
  modalCapacity.textContent = `${room.capacity || '-'} pessoas`;
  modalStatus.textContent = statusLabel(room.status);
  modalLocation.textContent = room.location || 'Não informado';
  modalRate.textContent = formatCurrency(room.daily_rate) || '--';
  modalReserve.href = `/clientes.html`;
  modalReserve.classList.toggle('disabled', ['manutencao', 'desativada', 'inativo'].includes((room.status || '').toLowerCase()));
  if (modalReserve.classList.contains('disabled')) {
    modalReserve.setAttribute('aria-disabled', 'true');
  } else {
    modalReserve.removeAttribute('aria-disabled');
  }

  renderGallery(room.photo_path);
  renderAmenities(room.amenities);
  renderModalPolicies(room.id, modalReserve.classList.contains('disabled'));
  trackRoomView(room.id);

  modalOverlay.classList.add('show');
  modalOverlay.setAttribute('aria-hidden', 'false');
}

function handleHashRoomOpen() {
  if (!roomsData || !roomsData.length) return;
  const hash = window.location.hash || '';
  if (!hash.startsWith('#')) return;
  const idStr = hash.slice(1);
  const idNum = Number(idStr);
  if (!idNum) return;
  const room = roomsData.find(r => Number(r.id) === idNum);
  if (!room) return;
  openModal(room);
}

function closeModal() {
  modalOverlay.classList.remove('show');
  modalOverlay.setAttribute('aria-hidden', 'true');
}

function getActiveFilter() {
  const active = document.querySelector('.filter-btn.active');
  return active ? active.dataset.filter : 'all';
}

function renderAmenityFilters() {
  if (!amenityFilters || !amenitiesMap) return;
  amenityFilters.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const title = document.createElement('span');
  title.textContent = 'Comodidades:';
  title.style.fontWeight = '600';
  fragment.appendChild(title);

  Object.entries(amenitiesMap)
    .sort(([, aName], [, bName]) => String(aName).localeCompare(String(bName), 'pt-BR'))
    .forEach(([id, name]) => {
    const label = document.createElement('label');
    label.style.display = 'inline-flex';
    label.style.alignItems = 'center';
    label.style.gap = '6px';
    label.style.marginRight = '12px';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = String(id);
    label.appendChild(input);
    const span = document.createElement('span');
    span.textContent = name;
    label.appendChild(span);
    fragment.appendChild(label);
  });
  amenityFilters.appendChild(fragment);
}

// Helpers para disponibilidade/labels iguais ao index
function isRoomAvailableOnDay(room, dateISO) {
  const status = (room.status || '').toLowerCase();
  if (status === 'inativo') return false;
  if (status === 'desativada') {
    if (!room.deactivated_from) return false;
    return room.deactivated_from > dateISO;
  }
  if (status === 'manutencao') {
    const start = room.maintenance_start || null;
    const end = room.maintenance_end || null;
    const started = !start || start <= dateISO;
    const notFinished = !end || end >= dateISO;
    if (started && notFinished) return false;
  }
  return status === 'ativo' || status === 'manutencao' || !status;
}

function getStatusMeta(room, available) {
  const status = (room.status || '').toLowerCase();
  if (!available) {
    if (status === 'manutencao') return { label: 'Em manutenção', className: 'status-manutencao' };
    if (status === 'desativada') return { label: 'Desativada', className: 'status-cancelada' };
    if (status === 'inativo') return { label: 'Indisponível', className: 'status-cancelada' };
    return { label: 'Indisponível', className: 'status-cancelada' };
  }
  if (status === 'manutencao') return { label: 'Disponível em breve', className: 'status-pendente' };
  return { label: 'Disponível', className: 'status-ativo' };
}

function getAvailabilityNote(room, available) {
  const status = (room.status || '').toLowerCase();
  if (available) return 'Pronta para reservar.';
  if (status === 'manutencao') return room.maintenance_end ? `Em manutenção até ${formatDateDisplay(room.maintenance_end)}.` : 'Em manutenção temporária.';
  if (status === 'desativada') return room.deactivated_from ? `Desativada a partir de ${formatDateDisplay(room.deactivated_from)}.` : 'Desativada temporariamente.';
  if (status === 'inativo') return 'Sala indisponível para reservas.';
  return 'Indisponível para a data atual.';
}

function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

// Navegação do carrossel (igual ao index)
function updateCarouselNavState() {
  if (!roomsStrip) return;
  const { scrollLeft, scrollWidth, clientWidth } = roomsStrip;
  const atStart = scrollLeft <= 0;
  const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  if (navPrev) {
    navPrev.disabled = atStart;
    navPrev.classList.toggle('disabled', atStart);
  }
  if (navNext) {
    navNext.disabled = atEnd;
    navNext.classList.toggle('disabled', atEnd);
  }
}

roomsStrip?.addEventListener('scroll', updateCarouselNavState, { passive: true });
navPrev?.addEventListener('click', () => roomsStrip?.scrollBy({ left: -(roomsStrip.clientWidth || 0), behavior: 'smooth' }));
navNext?.addEventListener('click', () => roomsStrip?.scrollBy({ left: (roomsStrip.clientWidth || 0), behavior: 'smooth' }));

function renderGallery(photoPath) {
  modalGallery.innerHTML = '';
  const photos = getPhotos(photoPath);

  if (!photos.length) {
    modalGallery.innerHTML = '<div class="rooms-message">Nenhuma foto cadastrada.</div>';
    return;
  }

  if (window.createImageCarousel) {
    const carousel = window.createImageCarousel({
      images: photos,
      altPrefix: modalTitle.textContent || 'Sala',
      showThumbnails: true,
      allowLightbox: true
    });
    modalGallery.appendChild(carousel.element);
  } else {
    photos.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = modalTitle.textContent || 'Sala';
      modalGallery.appendChild(img);
    });
  }
}

function renderAmenities(amenities) {
  modalAmenities.innerHTML = '';
  const items = Array.isArray(amenities) ? amenities : (amenities ? String(amenities).split(',') : []);
  const names = items
    .map(id => amenitiesMap[id] || amenitiesMap[String(id)] || null)
    .filter(Boolean);

  if (!names.length) {
    modalAmenities.innerHTML = '<span>Nenhuma comodidade cadastrada.</span>';
    return;
  }

  names.forEach(name => {
    const chip = document.createElement('span');
    chip.textContent = name;
    modalAmenities.appendChild(chip);
  });
}

function statusLabel(status) {
  const map = {
    ativo: 'Disponível',
    manutencao: 'Em manutenção',
    desativada: 'Desativada',
    inativo: 'Indisponível'
  };
  return map[(status || '').toLowerCase()] || status || '--';
}

function getPhotos(path) {
  if (!path) return [];
  return path
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => (p.startsWith('http') ? p : `/${p}`));
}

function formatCurrency(value) {
  const number = Number(value);
  if (!number) return '';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
