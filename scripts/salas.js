const API_BASE = 'api';
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

init();

async function init() {
  try {
    const [rooms, amenities] = await Promise.all([fetchRooms(), fetchAmenities()]);
    roomsData = rooms;
    amenitiesMap = amenities;
    renderAmenityFilters();
    renderRooms('all');
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
  filterCitySalas?.addEventListener('input', () => renderRooms(getActiveFilter()));
  filterStateSalas?.addEventListener('input', () => renderRooms(getActiveFilter()));
  clearFiltersSalas?.addEventListener('click', () => {
    if (filterQuerySalas) filterQuerySalas.value = '';
    if (filterCapacitySalas) filterCapacitySalas.value = '';
    if (filterCitySalas) filterCitySalas.value = '';
    if (filterStateSalas) filterStateSalas.value = '';
    selectedAmenities.clear();
    amenityFilters?.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
    renderRooms(getActiveFilter());
  });
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
  requestAnimationFrame(updateCarouselNavState);
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
  card.appendChild(photoWrapper);

  const title = document.createElement('h4');
  title.textContent = room.name || '';
  card.appendChild(title);

  const capacity = document.createElement('p');
  capacity.textContent = `Capacidade: ${room.capacity || '-'} pessoas`;
  card.appendChild(capacity);

  const badge = document.createElement('span');
  badge.className = `status-badge ${statusClass}`;
  badge.textContent = statusLabel;
  card.appendChild(badge);

  if (room.daily_rate) {
    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `${formatCurrency(room.daily_rate)} por dia`;
    card.appendChild(price);
  }

  const actions = document.createElement('div');
  actions.className = 'room-actions';
  actions.innerHTML = `
      <button class="btn btn-secondary" type="button" data-room="${room.id}">Ver detalhes</button>
      <a href="pre-reserva.html?room=${encodeURIComponent(room.id)}" class="btn btn-primary${disabled ? ' disabled' : ''}" ${disabled ? 'tabindex="-1" aria-disabled="true"' : ''}>Reservar diária</a>
  `;
  card.appendChild(actions);

  card.querySelector('button[data-room]').addEventListener('click', () => openModal(room));
  return card;
}

function openModal(room) {
  modalTitle.textContent = room.name || '';
  modalDescription.textContent = room.description || 'Sem descrição cadastrada.';
  modalCapacity.textContent = `${room.capacity || '-'} pessoas`;
  modalStatus.textContent = statusLabel(room.status);
  modalLocation.textContent = room.location || 'Não informado';
  modalRate.textContent = formatCurrency(room.daily_rate) || '--';
  modalReserve.href = `pre-reserva.html?room=${encodeURIComponent(room.id)}`;
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
