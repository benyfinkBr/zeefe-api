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
const roomsMapEl = document.getElementById('rooms-map-salas');
let salasMap = null;
let salasMarkersLayer = null;
let selectedAmenities = new Set();
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
const modalReserve = document.getElementById('roomModalReserve');
const openLoginChoiceBtn = document.getElementById('openLoginChoice');

openLoginChoiceBtn?.addEventListener('click', () => {
  const session = window.ZEEFE_HEADER?.getSession?.();
  if (session) {
    const destino = session.type === 'advertiser' ? 'anunciante.html' : 'clientes.html';
    window.location.href = destino;
    return;
  }
  window.location.href = 'clientes.html';
});

init();

async function init() {
  try {
    const [rooms, amenities] = await Promise.all([fetchRooms(), fetchAmenities()]);
    roomsData = rooms;
    amenitiesMap = amenities;
    renderAmenityFilters();
    hydrateUfAndCities();
    renderRooms('all');
    initMapIfNeeded();
    renderMapMarkersSalas(roomsData);
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
    renderRooms(getActiveFilter());
  });

  window.addEventListener('hashchange', handleHashRoomOpen);
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
    return okQuery && okCap && okCity && okState && okAmenities;
  });

  if (!filtered.length) {
    if (roomsMessage) roomsMessage.textContent = 'Nenhuma sala encontrada com os filtros atuais.';
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
    <a class="btn btn-primary${disabledCta ? ' disabled' : ''}" ${disabledCta ? 'aria-disabled=\"true\" tabindex=\"-1\"' : ''} href="${disabledCta ? '#' : `clientes.html`}">${disabledCta ? 'Indisponível' : 'Reservar diária'}</a>`;
  info.appendChild(actions);

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
      `<a class="btn btn-primary btn-sm" href="clientes.html">Solicitar reserva</a>` +
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
  modalReserve.href = `clientes.html`;
  modalReserve.classList.toggle('disabled', ['manutencao', 'desativada', 'inativo'].includes((room.status || '').toLowerCase()));
  if (modalReserve.classList.contains('disabled')) {
    modalReserve.setAttribute('aria-disabled', 'true');
  } else {
    modalReserve.removeAttribute('aria-disabled');
  }

  renderGallery(room.photo_path);
  renderAmenities(room.amenities);

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

  Object.entries(amenitiesMap).forEach(([id, name]) => {
    const label = document.createElement('label');
    label.style.display = 'inline-flex';
    label.style.alignItems = 'center';
    label.style.gap = '6px';
    label.style.marginRight = '12px';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = String(id);
    input.addEventListener('change', () => {
      if (input.checked) selectedAmenities.add(input.value);
      else selectedAmenities.delete(input.value);
      renderRooms(getActiveFilter());
    });
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
