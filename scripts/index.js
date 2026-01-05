document.addEventListener('DOMContentLoaded', () => {
  const benefitsContainer = document.getElementById('benefits-cards');
  const roomsStrip = document.getElementById('rooms-strip');
  const roomsMessage = document.getElementById('rooms-message');
  const roomsMapEl = document.getElementById('rooms-map');
  let map = null; let markersLayer = null;
  const navPrev = document.querySelector('.rooms-nav-prev');
  const navNext = document.querySelector('.rooms-nav-next');
  let amenitiesMap = {};
  let allRooms = [];
  let allWorkshops = [];
  let workshopsByRoom = new Map();
  const filterQuery = document.getElementById('filterQuery');
  const filterType = document.getElementById('filterType');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const workshopsStrip = document.getElementById('featured-workshops');
  const workshopsMessage = document.getElementById('workshops-message');
  const homeContentStrip = document.getElementById('home-content-cards');
  const contentMessage = document.getElementById('content-message');
  const heroTabs = document.querySelectorAll('.hero-tab');
  const heroForm = document.getElementById('heroSearchForm');
  const heroLocation = document.getElementById('heroLocation');
  const heroLocationField = document.querySelector('.hero-location-field');
  const heroDate = document.getElementById('heroDate');
  const heroCapacity = document.getElementById('heroCapacity');
  const heroCourseTopic = document.getElementById('heroCourseTopic');
  const heroCourseCity = document.getElementById('heroCourseCity');
  const heroSubmit = document.querySelector('.hero-submit');
  let heroMode = 'salas';
  const heroNewsMain = document.getElementById('heroNewsMain');
  const heroNewsSecondary = document.getElementById('heroNewsSecondary');
  const openLoginChoiceBtn = document.getElementById('openLoginChoice');
  const entryChoiceModal = document.getElementById('entryChoiceModal');
  const entryChoiceClose = document.getElementById('entryChoiceClose');
  const heroLocationModal = document.getElementById('heroLocationModal');
  const heroLocationClose = document.getElementById('heroLocationClose');
  const heroLocationCancel = document.getElementById('heroLocationCancel');
  const heroLocationConfirm = document.getElementById('heroLocationConfirm');
  const heroStateSelect = document.getElementById('heroStateSelect');
  const heroCitySelect = document.getElementById('heroCitySelect');
  const heroNeighborhoodSelect = document.getElementById('heroNeighborhoodSelect');
  const sharePanels = new Set();
  let locationIndex = new Map();

  const normalizeCoverPath = (path) => {
    const raw = String(path || '').trim();
    if (!raw) return '';
    if (raw.startsWith('data:')) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    const idx = raw.indexOf('/img/posts/');
    if (idx !== -1) return raw.slice(idx);
    if (raw.startsWith('img/')) return raw;
    if (raw.startsWith('/')) return raw;
    return '/' + raw;
  };

  const getPublishedPosts = (posts) => {
    const now = new Date();
    return (posts || []).filter(post => {
      const status = (post.status || '').toLowerCase();
      if (status !== 'publicado') return false;
      if (!post.published_at) return true;
      const scheduled = new Date(post.published_at);
      if (Number.isNaN(scheduled.getTime())) return true;
      return scheduled <= now;
    });
  };

  const closeSharePanels = (event) => {
    if (event && event.target.closest('.share-menu')) return;
    sharePanels.forEach(panel => {
      panel.hidden = true;
    });
  };
  document.addEventListener('click', closeSharePanels);

  const openShareWindow = (url) => window.open(url, '_blank', 'noopener');
  const createShareActions = (titleText, url, className = 'card-share') => {
    const wrap = document.createElement('div');
    wrap.className = className;

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

  const benefits = [
    { icon: '☕', title: 'Café, água e internet', description: 'Café premium, água e Wi-Fi ultra rápida inclusos' },
    { icon: '📽️', title: 'Multimídia inclusa', description: 'Projetor, TV 4K e sistema de som profissional' },
    { icon: '🖨️', title: 'Impressora e suporte', description: 'Impressora, scanner e suporte técnico no local' },
    { icon: '✓', title: 'Sem custos ocultos', description: 'Tudo incluído no preço da diária, sem surpresas' }
  ];

  if (benefitsContainer) {
    benefits.forEach(benefit => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <div class="icon">${benefit.icon}</div>
        <h4>${benefit.title}</h4>
        <p>${benefit.description}</p>
      `;
      benefitsContainer.appendChild(card);
    });
  }

  carregarSalas();

  async function carregarSalas() {
    if (!roomsStrip) return;
    roomsStrip.innerHTML = '';
    roomsMessage.textContent = 'Carregando salas...';
    try {
      const roomsResponse = await fetch('api/apiget.php?table=rooms', { credentials: 'include' });
      const roomsJson = await roomsResponse.json();
      if (!roomsJson.success) throw new Error(roomsJson.error || 'Falha ao consultar API');
      allRooms = roomsJson.data || [];

      try {
        const amenitiesResponse = await fetch('api/apiget.php?table=amenities', { credentials: 'include' });
        const amenitiesJson = await amenitiesResponse.json();
        if (amenitiesJson.success) {
          amenitiesMap = (amenitiesJson.data || []).reduce((acc, item) => {
            acc[item.id] = item.name;
            return acc;
          }, {});
        }
      } catch (amenitiesError) {
        console.warn('Falha ao carregar comodidades', amenitiesError);
        amenitiesMap = {};
      }

      // Carrega workshops futuros publicados
      try {
        const workshopsResponse = await fetch('api/workshops_list.php?status=publicado&upcoming=1');
        const workshopsJson = await workshopsResponse.json();
        if (workshopsJson.success) {
          allWorkshops = workshopsJson.data || [];
          workshopsByRoom = new Map();
          allWorkshops.forEach(w => {
            const roomId = Number(w.room_id);
            if (!roomId) return;
            if (!workshopsByRoom.has(roomId)) workshopsByRoom.set(roomId, []);
            workshopsByRoom.get(roomId).push(w);
          });
        }
      } catch (workErr) {
        console.warn('Falha ao carregar workshops', workErr);
        allWorkshops = [];
        workshopsByRoom = new Map();
      }

      if (!allRooms.length) {
        roomsMessage.textContent = 'Nenhuma sala cadastrada no momento.';
        return;
      }
      buildLocationIndex(allRooms);
      roomsMessage.textContent = '';
      renderRooms();
      initMapIfNeeded();
      renderMapMarkers(allRooms);
      renderFeaturedWorkshops();
      requestAnimationFrame(() => updateCarouselNavState());
      carregarPostsHero();
    } catch (err) {
      console.error(err);
      roomsMessage.textContent = 'Erro ao carregar salas. Tente novamente mais tarde.';
    }
  }

  function renderRooms() {
    if (!roomsStrip) return;
    roomsStrip.innerHTML = '';
    const today = formatDateISO(new Date());
    const query = (filterQuery?.value || '').toLowerCase().trim();
    const type = (filterType?.value || 'all');
    const filtered = (allRooms || []).filter(room => {
      const okQuery = !query ||
        String(room.name || '').toLowerCase().includes(query) ||
        String(room.location || '').toLowerCase().includes(query);
      let okType = true;
      if (type === 'workshops') {
        okType = workshopsByRoom.has(Number(room.id));
      }
      return okQuery && okType;
    });
    if (!filtered.length) {
      roomsMessage.textContent = 'Nenhuma sala encontrada com os filtros atuais.';
      return;
    }
    roomsMessage.textContent = '';
    const roomItems = filtered.slice(0, 4);
    roomItems.forEach(room => {
      const available = isRoomAvailable(room, today);
        const photos = getRoomPhotos(room.photo_path);
        const statusMeta = getStatusMeta(room, available);
        const amenities = getAmenityNames(room.amenities).slice(0, 4);
        const card = document.createElement('article');
        card.className = `room-card carousel-room-card${available ? '' : ' unavailable'}`;

        const media = document.createElement('div');
        media.className = 'room-card-media';

        const carouselContainer = document.createElement('div');
        carouselContainer.className = `room-photo${photos.length ? '' : ' room-photo-empty'}`;
        if (photos.length && window.createImageCarousel) {
          const carousel = window.createImageCarousel({
            images: photos,
            altPrefix: `Sala ${room.name || ''}`
          });
          carouselContainer.appendChild(carousel.element);
        } else if (photos.length) {
          const img = document.createElement('img');
          img.src = photos[0];
          img.alt = `Sala ${room.name || ''}`;
          carouselContainer.appendChild(img);
        } else {
          carouselContainer.innerHTML = '<span class="room-photo-placeholder">Sem imagens cadastradas</span>';
        }

        const statusPill = document.createElement('span');
        statusPill.className = `room-status-pill ${statusMeta.className}`;
        statusPill.textContent = statusMeta.label;

        const availabilityNote = document.createElement('span');
        availabilityNote.className = `room-availability-note ${available ? 'available' : 'blocked'}`;
        availabilityNote.textContent = getAvailabilityNote(room, available);

        const favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.className = 'room-favorite';
        favoriteButton.setAttribute('aria-label', 'Adicionar aos favoritos');

        media.appendChild(carouselContainer);
        media.appendChild(statusPill);
        media.appendChild(favoriteButton);
        media.appendChild(availabilityNote);
        card.appendChild(media);

        const info = document.createElement('div');
        info.className = 'room-info';
        const header = document.createElement('div');
        header.className = 'room-header';
        header.innerHTML = `
          <h4>${escapeHtml(room.name)}</h4>
          ${statusBadge(room, available)}
        `;
        info.appendChild(header);

        const description = document.createElement('p');
        description.className = 'room-description';
        if (room.description) {
          description.textContent = truncateText(room.description, 180);
        } else {
          description.textContent = ' ';
          description.classList.add('is-empty');
        }
        info.appendChild(description);

        const meta = document.createElement('div');
        meta.className = 'room-meta';
        const hasMap = (Number(room.lat||room.latitude) && Number(room.lon||room.lng||room.longitude));
        meta.innerHTML = `
          <span class="room-location">${room.location ? escapeHtml(room.location) : 'Localização não informada'} ${hasMap ? ' • <span title="Tem localização no mapa">📍</span>' : ''}</span>
          <span class="room-capacity">${room.capacity || 0} pessoas</span>
        `;
        info.appendChild(meta);

        const price = document.createElement('div');
        price.className = 'room-price';
        if (room.daily_rate) {
          price.innerHTML = `
            <strong>${formatCurrency(room.daily_rate)}</strong>
            <span>/ diária</span>
          `;
        } else {
          price.innerHTML = `<strong>—</strong><span>/ diária</span>`;
          price.classList.add('is-empty');
        }
        info.appendChild(price);

        if (amenities.length) {
          const amenityWrapper = document.createElement('div');
          amenityWrapper.className = 'room-amenities';
          amenities.forEach(name => {
            const chip = document.createElement('span');
            chip.textContent = name;
            amenityWrapper.appendChild(chip);
          });
          info.appendChild(amenityWrapper);
        }

        const actions = document.createElement('div');
        actions.className = 'room-actions';
        actions.innerHTML = `
          <a class="btn btn-primary${available ? '' : ' disabled'}" ${available ? '' : 'aria-disabled="true" tabindex="-1"'} href="${available ? `/clientes.html` : '#'}">${available ? 'Solicitar reserva' : 'Indisponível'}</a>
          <a class="btn btn-secondary" href="/salas.html#sala-${room.id}">Ver detalhes</a>
        `;
        info.appendChild(actions);
        const detailUrl = new URL(`/salas.html#sala-${room.id}`, window.location.href).toString();
        info.appendChild(createShareActions(room.name || 'Sala Ze.EFE', detailUrl));
        card.appendChild(info);
        roomsStrip.appendChild(card);
    });
    roomsStrip.appendChild(createRoomPromoCard());
    // Atualiza marcadores do mapa conforme filtros aplicados
    renderMapMarkers(filtered);
    requestAnimationFrame(() => updateCarouselNavState());
  }

  function createRoomPromoCard() {
    const card = document.createElement('article');
    card.className = 'room-card carousel-room-card promo-card promo-room-card';

    const media = document.createElement('div');
    media.className = 'room-card-media';

    const photo = document.createElement('div');
    photo.className = 'room-photo room-photo-empty promo-room-photo';
    photo.innerHTML = '<span class="room-photo-placeholder">Sua sala em destaque aqui</span>';

    const statusPill = document.createElement('span');
    statusPill.className = 'room-status-pill';
    statusPill.textContent = 'Convite';

    const availabilityNote = document.createElement('span');
    availabilityNote.className = 'room-availability-note available';
    availabilityNote.textContent = 'Mais reservas para o seu espaço.';

    media.appendChild(photo);
    media.appendChild(statusPill);
    media.appendChild(availabilityNote);
    card.appendChild(media);

    const info = document.createElement('div');
    info.className = 'room-info';

    const header = document.createElement('div');
    header.className = 'room-header';
    header.innerHTML = `
      <h4>Seja Anunciante Ze.EFE</h4>
      <span class="status-badge status-ativo">Anuncie aqui</span>
    `;
    info.appendChild(header);

    const description = document.createElement('p');
    description.className = 'room-description';
    description.textContent = 'Anuncie sua sala, receba reservas rápidas e aumente sua ocupação com clientes qualificados.';
    info.appendChild(description);

    const meta = document.createElement('div');
    meta.className = 'room-meta';
    meta.innerHTML = `
      <span class="room-location">Sua sala, novos clientes</span>
      <span class="room-capacity">Mais visibilidade</span>
    `;
    info.appendChild(meta);

    const price = document.createElement('div');
    price.className = 'room-price';
    price.innerHTML = `
      <strong>Cadastro gratuito</strong>
      <span>na plataforma</span>
    `;
    info.appendChild(price);

    const actions = document.createElement('div');
    actions.className = 'room-actions';
    actions.innerHTML = `
      <a class="btn btn-primary" href="/anunciante.html">Quero anunciar</a>
      <a class="btn btn-secondary" href="/anunciante.html">Saiba mais</a>
    `;
    info.appendChild(actions);

    const detailUrl = new URL('/anunciante.html', window.location.href).toString();
    info.appendChild(createShareActions('Seja anunciante Ze.EFE', detailUrl));

    card.appendChild(info);
    return card;
  }

  function buildLocationIndex(rooms) {
    locationIndex = new Map();
    (rooms || []).forEach(room => {
      const uf = String(room.state || room.uf || '').trim().toUpperCase();
      const city = String(room.city || '').trim();
      const neighborhood = String(room.location || '').trim();
      if (!uf || !city) return;
      if (!locationIndex.has(uf)) locationIndex.set(uf, new Map());
      const cityMap = locationIndex.get(uf);
      if (!cityMap.has(city)) cityMap.set(city, new Set());
      if (neighborhood) cityMap.get(city).add(neighborhood);
    });
    populateStateOptions();
  }

  function populateStateOptions() {
    if (!heroStateSelect) return;
    const states = Array.from(locationIndex.keys()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    heroStateSelect.innerHTML = '<option value="">Selecione um estado...</option>' +
      states.map(uf => `<option value="${uf}">${uf}</option>`).join('');
  }

  function populateCityOptions(uf) {
    if (!heroCitySelect) return;
    const cityMap = locationIndex.get(uf) || new Map();
    const cities = Array.from(cityMap.keys()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    heroCitySelect.innerHTML = '<option value="">Selecione uma cidade...</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
    heroCitySelect.disabled = !cities.length;
  }

  function populateNeighborhoodOptions(uf, city) {
    if (!heroNeighborhoodSelect) return;
    const cityMap = locationIndex.get(uf) || new Map();
    const neighborhoods = Array.from((cityMap.get(city) || new Set()).values())
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (!neighborhoods.length) {
      heroNeighborhoodSelect.innerHTML = '<option value="">Sem bairro disponível</option>';
      heroNeighborhoodSelect.disabled = true;
      return;
    }
    heroNeighborhoodSelect.innerHTML = '<option value="">Selecione um bairro...</option>' +
      neighborhoods.map(n => `<option value="${n}">${n}</option>`).join('');
    heroNeighborhoodSelect.disabled = false;
  }

  function openLocationModal() {
    if (!heroLocationModal) return;
    populateStateOptions();
    if (heroStateSelect) heroStateSelect.value = heroLocation?.dataset.uf || '';
    populateCityOptions(heroStateSelect?.value || '');
    if (heroCitySelect) heroCitySelect.value = heroLocation?.dataset.city || '';
    populateNeighborhoodOptions(heroStateSelect?.value || '', heroCitySelect?.value || '');
    if (heroNeighborhoodSelect) heroNeighborhoodSelect.value = heroLocation?.dataset.neighborhood || '';
    updateLocationConfirmState();
    heroLocationModal.classList.add('show');
    heroLocationModal.setAttribute('aria-hidden', 'false');
  }

  function closeLocationModal() {
    if (!heroLocationModal) return;
    heroLocationModal.classList.remove('show');
    heroLocationModal.setAttribute('aria-hidden', 'true');
  }

  function updateLocationConfirmState() {
    if (!heroLocationConfirm) return;
    const hasUf = heroStateSelect && heroStateSelect.value;
    const hasCity = heroCitySelect && heroCitySelect.value;
    const hasNeighborhood = heroNeighborhoodSelect && heroNeighborhoodSelect.value;
    heroLocationConfirm.disabled = !(hasUf && hasCity && hasNeighborhood);
  }

  function initMapIfNeeded() {
    if (!roomsMapEl || typeof L === 'undefined') return;
    if (map) return;
    map = L.map(roomsMapEl).setView([-14.235, -51.9253], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  function renderMapMarkers(rooms) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    const bounds = [];
    (rooms || []).forEach(r => {
      const lat = Number(r.lat || r.latitude || r.latitud);
      const lon = Number(r.lon || r.lng || r.longitude);
      if (!isFinite(lat) || !isFinite(lon)) return;
      const hasWorkshops = workshopsByRoom.has(Number(r.id));
      const name = escapeHtml(r.name || `Sala #${r.id}`);
      const city = escapeHtml(r.city || '');
      const uf = escapeHtml(r.state || r.uf || '');
      const coursesInfo = hasWorkshops
        ? 'Há cursos presenciais nesta sala.'
        : 'Sem cursos futuros nesta sala.';
      const detailsLink = `/salas.html#${r.id}`;
      const workshopsLink = `/workshops.html?room_id=${r.id}`;
      const m = L.marker([lat, lon], { opacity: hasWorkshops ? 1 : 0.4 });
      m.bindPopup(
        `<strong>${name}</strong><br>${city}${uf ? ' - '+uf : ''}<br>`+
        `<small>${coursesInfo}</small><br>`+
        `<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">`+
        `<a class="btn btn-secondary btn-sm" href="${detailsLink}">Ver detalhes</a>`+
        `<a class="btn btn-primary btn-sm" href="${workshopsLink}">Próximos cursos</a>`+
        `</div>`
      );
      m.addTo(markersLayer);
      bounds.push([lat, lon]);
    });
    if (bounds.length && map) map.fitBounds(bounds, { padding: [20, 20] });
  }

  function isRoomAvailable(room, today) {
    const status = (room.status || '').toLowerCase();
    if (status === 'inativo') return false;
    if (status === 'desativada') {
      if (!room.deactivated_from) return false;
      return room.deactivated_from > today;
    }
    if (status === 'manutencao') {
      const start = room.maintenance_start || null;
      const end = room.maintenance_end || null;
      const started = !start || start <= today;
      const notFinished = !end || end >= today;
      if (started && notFinished) return false;
    }
    return status === 'ativo' || status === 'manutencao';
  }

  function statusBadge(room, available) {
    const meta = getStatusMeta(room, available);
    return `<span class="status-badge ${meta.className}">${meta.label}</span>`;
  }

  function getStatusMeta(room, available) {
    const status = (room.status || '').toLowerCase();
    if (!available) {
      if (status === 'manutencao') {
        return { label: 'Em manutenção', className: 'status-manutencao' };
      }
      if (status === 'desativada') {
        return { label: 'Desativada', className: 'status-cancelada' };
      }
      if (status === 'inativo') {
        return { label: 'Indisponível', className: 'status-cancelada' };
      }
      return { label: 'Indisponível', className: 'status-cancelada' };
    }
    if (status === 'manutencao') {
      return { label: 'Disponível em breve', className: 'status-pendente' };
    }
    return { label: 'Disponível', className: 'status-ativo' };
  }

  function getAvailabilityNote(room, available) {
    const status = (room.status || '').toLowerCase();
    if (available) {
      return 'Pronta para reservar.';
    }
    if (status === 'manutencao') {
      if (room.maintenance_end) {
        return `Em manutenção até ${formatDateDisplay(room.maintenance_end)}.`;
      }
      return 'Em manutenção temporária.';
    }
    if (status === 'desativada') {
      if (room.deactivated_from) {
        return `Desativada a partir de ${formatDateDisplay(room.deactivated_from)}.`;
      }
      return 'Desativada temporariamente.';
    }
    if (status === 'inativo') {
      return 'Sala indisponível para reservas.';
    }
    return 'Indisponível para a data atual.';
  }

  function formatDateISO(date) {
    return date.toISOString().split('T')[0];
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getRoomPhotos(path) {
    if (!path) return [];
    return path
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(src => (src.startsWith('http') ? src : `/${src}`));
  }

  function getAmenityNames(amenities) {
    if (!amenitiesMap || !Array.isArray(amenities)) return [];
    const seen = new Set();
    return amenities
      .map(id => amenitiesMap[id])
      .filter(Boolean)
      .filter(name => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
  }

  function truncateText(text, limit) {
    const value = String(text || '').trim();
    if (value.length <= limit) return value;
    return `${value.slice(0, limit - 1).trim()}…`;
  }

  function formatCurrency(value) {
    const number = Number(value);
    if (!number || Number.isNaN(number)) return '';
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return dateString;
    return parsed.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

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

  if (roomsStrip) {
    roomsStrip.addEventListener('scroll', updateCarouselNavState, { passive: true });
  }
  if (navPrev && roomsStrip) {
    navPrev.addEventListener('click', () => roomsStrip.scrollBy({ left: -roomsStrip.clientWidth, behavior: 'smooth' }));
  }
  if (navNext && roomsStrip) {
    navNext.addEventListener('click', () => roomsStrip.scrollBy({ left: roomsStrip.clientWidth, behavior: 'smooth' }));
  }

  // Filtros
  filterQuery?.addEventListener('input', () => renderRooms());
  filterType?.addEventListener('change', () => renderRooms());
  clearFiltersBtn?.addEventListener('click', () => {
    if (filterQuery) filterQuery.value = '';
    if (filterType) filterType.value = 'all';
    renderRooms();
  });

  async function carregarPostsHero() {
    if (!heroNewsMain && !homeContentStrip) return;
    if (heroNewsMain) heroNewsMain.innerHTML = '';
    try {
      const res = await fetch('api/apiget.php?table=posts', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) return;
      let posts = json.data || [];
      posts = getPublishedPosts(posts);
      if (!posts.length) {
        if (heroNewsMain) {
          const p = document.createElement('p');
          p.className = 'hero-news-subtitle';
          p.textContent = 'Nenhum conteúdo publicado ainda.';
          heroNewsMain.appendChild(p);
        }
        renderHomeContentCards([]);
        return;
      }
      posts.sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        if (db !== da) return db - da;
        return (b.id || 0) - (a.id || 0);
      });
      renderHomeContentCards(posts);
      // Mantém apenas os 3 mais recentes para o carrossel
      const items = posts.slice(0, 3);
      let currentIndex = 0;

      const renderSlide = (idx) => {
        if (!heroNewsMain) return;
        const post = items[idx];
        heroNewsMain.innerHTML = '';
        const card = document.createElement('article');
        card.className = 'hero-news-card hero-news-card-main';

        const imgWrap = document.createElement('div');
        imgWrap.className = 'hero-news-image-wrap';

        const attachCover = (img, rawPath, wrap, alt) => {
          const primary = normalizeCoverPath(rawPath);
          if (!primary) return false;
          img.alt = alt;
          img.src = primary;
          let fallback = '';
          if (!/^https?:\/\//i.test(primary) && !primary.startsWith('data:')) {
            fallback = primary.startsWith('/') ? primary.slice(1) : '/' + primary;
          }
          img.addEventListener('error', () => {
            if (fallback) {
              img.src = fallback;
              fallback = '';
              return;
            }
            img.remove();
            wrap.classList.add('is-missing');
            wrap.textContent = 'Imagem indisponível';
          });
          return true;
        };
        if (post.cover_path) {
          const img = document.createElement('img');
          if (attachCover(img, post.cover_path, imgWrap, post.title || 'Imagem do conteúdo')) {
            imgWrap.appendChild(img);
          }
        }

        const titleBar = document.createElement('div');
        titleBar.className = 'hero-news-title-bar';

        const titleEl = document.createElement('h4');
        const link = document.createElement('a');
        link.href = `conteudo-detalhe.html?id=${post.id}`;
        link.textContent = post.title || 'Conteúdo';
        titleEl.appendChild(link);
        titleBar.appendChild(titleEl);
        imgWrap.appendChild(titleBar);

        card.appendChild(imgWrap);

        const textWrap = document.createElement('div');
        textWrap.className = 'hero-news-overlay';

        const meta = document.createElement('p');
        meta.className = 'hero-news-meta';
        const parts = [];
        if (post.category_name || post.category) parts.push(post.category_name || post.category);
        if (post.published_at) {
          const d = new Date(post.published_at);
          if (!Number.isNaN(d.getTime())) {
            parts.push(d.toLocaleDateString('pt-BR'));
          }
        }
        meta.textContent = parts.join(' • ');
        textWrap.appendChild(meta);

        const summary = document.createElement('p');
        summary.textContent = (post.summary || '').slice(0, 160) || 'Leia mais sobre este conteúdo.';
        textWrap.appendChild(summary);

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'hero-news-dots';
        items.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'hero-news-dot' + (i === idx ? ' active' : '');
          dot.addEventListener('click', () => {
            currentIndex = i;
            renderSlide(currentIndex);
          });
          dotsWrap.appendChild(dot);
        });
        textWrap.appendChild(dotsWrap);

        card.appendChild(textWrap);
        heroNewsMain.appendChild(card);
      };

      renderSlide(currentIndex);

      if (items.length > 1) {
        setInterval(() => {
          currentIndex = (currentIndex + 1) % items.length;
          renderSlide(currentIndex);
        }, 7000);
      }
    } catch (e) {
      console.error('Erro ao carregar conteúdos para o hero', e);
    }
  }

  function renderHomeContentCards(posts) {
    if (!homeContentStrip || !contentMessage) return;
    homeContentStrip.innerHTML = '';
    const items = (posts || []).slice(0, 5);
    if (!items.length) {
      contentMessage.textContent = 'Nenhum conteúdo publicado ainda.';
      return;
    }
    contentMessage.textContent = '';
    items.forEach(post => {
      const card = document.createElement('article');
      card.className = 'content-card';
      const media = document.createElement('div');
      media.className = 'content-media';
      const cover = normalizeCoverPath(post.cover_path);
      if (cover) {
        const img = document.createElement('img');
        img.alt = post.title || 'Conteúdo Ze.EFE';
        img.src = cover;
        img.addEventListener('error', () => {
          img.remove();
          media.classList.add('is-missing');
        }, { once: true });
        media.appendChild(img);
      }
      card.appendChild(media);

      const body = document.createElement('div');
      body.className = 'content-body';
      const tag = document.createElement('div');
      tag.className = 'content-tag';
      tag.textContent = post.category_name || post.category || 'Conteúdo';
      body.appendChild(tag);
      const title = document.createElement('h4');
      title.textContent = post.title || 'Conteúdo Ze.EFE';
      body.appendChild(title);
      const summary = document.createElement('p');
      summary.textContent = post.summary || 'Leia mais sobre este conteúdo na Ze.EFE.';
      body.appendChild(summary);
      const actions = document.createElement('div');
      actions.className = 'content-actions';
      actions.innerHTML = `<a class="btn btn-secondary btn-sm" href="conteudo-detalhe.html?id=${post.id}">Ler conteúdo</a>`;
      body.appendChild(actions);
      card.appendChild(body);
      homeContentStrip.appendChild(card);
    });
  }

  heroTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      heroMode = tab.dataset.target === 'cursos' ? 'cursos' : 'salas';
      heroTabs.forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.tab-salas').forEach(el => el.classList.toggle('hidden', heroMode !== 'salas'));
      document.querySelectorAll('.tab-cursos').forEach(el => el.classList.toggle('hidden', heroMode !== 'cursos'));
      if (heroSubmit) heroSubmit.textContent = heroMode === 'salas' ? 'Buscar salas' : 'Ver cursos presenciais';
    });
  });

  heroLocation?.addEventListener('click', () => {
    openLocationModal();
  });
  heroLocation?.addEventListener('focus', () => {
    openLocationModal();
  });
  heroLocation?.addEventListener('pointerdown', () => {
    openLocationModal();
  });
  heroLocationField?.addEventListener('click', (event) => {
    if (event.target === heroDate) return;
    openLocationModal();
  });
  heroLocation?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLocationModal();
    }
  });

  heroLocationClose?.addEventListener('click', closeLocationModal);
  heroLocationCancel?.addEventListener('click', closeLocationModal);
  heroLocationModal?.addEventListener('click', (event) => {
    if (event.target === heroLocationModal) closeLocationModal();
  });

  heroStateSelect?.addEventListener('change', () => {
    const uf = heroStateSelect.value;
    if (heroCitySelect) heroCitySelect.value = '';
    if (heroNeighborhoodSelect) heroNeighborhoodSelect.value = '';
    populateCityOptions(uf);
    populateNeighborhoodOptions(uf, '');
    updateLocationConfirmState();
  });

  heroCitySelect?.addEventListener('change', () => {
    const uf = heroStateSelect?.value || '';
    const city = heroCitySelect.value;
    if (heroNeighborhoodSelect) heroNeighborhoodSelect.value = '';
    populateNeighborhoodOptions(uf, city);
    updateLocationConfirmState();
  });

  heroNeighborhoodSelect?.addEventListener('change', updateLocationConfirmState);

  heroLocationConfirm?.addEventListener('click', () => {
    if (!heroLocation) return;
    const uf = heroStateSelect?.value || '';
    const city = heroCitySelect?.value || '';
    const neighborhood = heroNeighborhoodSelect?.value || '';
    if (!uf || !city || !neighborhood) return;
    heroLocation.value = `${neighborhood}, ${city}, ${uf}`;
    heroLocation.dataset.uf = uf;
    heroLocation.dataset.city = city;
    heroLocation.dataset.neighborhood = neighborhood;
    closeLocationModal();
  });

  heroForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const uf = heroLocation?.dataset.uf || '';
    const city = heroLocation?.dataset.city || '';
    const neighborhood = heroLocation?.dataset.neighborhood || '';
    if (uf) params.set('uf', uf);
    if (city) params.set('city', city);
    if (neighborhood) params.set('bairro', neighborhood);
    const url = params.toString() ? `/salas.html?${params.toString()}` : '/salas.html';
    window.location.href = url;
  });

  // Modal de escolha de entrada (cliente ou anunciante)
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

  entryChoiceModal?.addEventListener('click', (e) => {
    if (e.target === entryChoiceModal) {
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


  function renderFeaturedWorkshops() {
    if (!workshopsStrip || !workshopsMessage) return;
    workshopsStrip.innerHTML = '';
    const promo = createWorkshopPromoCard();
    workshopsStrip.appendChild(promo);
    if (!allWorkshops.length) {
      workshopsMessage.textContent = 'Nenhum curso disponível no momento.';
      return;
    }
    workshopsMessage.textContent = '';
    const items = allWorkshops.slice(0, 4);
    items.forEach(w => {
      const card = document.createElement('article');
      card.className = 'card workshop-card';
      card.id = `workshop-${w.id}`;

      const title = document.createElement('h4');
      title.textContent = w.title || 'Workshop';
      card.appendChild(title);

      const meta = document.createElement('p');
      meta.className = 'workshop-meta';
      const dateStr = w.date || '';
      const endDateStr = w.end_date || '';
      const rangeStr = endDateStr && endDateStr !== dateStr
        ? `${dateStr} até ${endDateStr}`
        : dateStr;
      const timeStart = (w.time_start || '').slice(0, 5);
      const locationParts = [];
      if (w.room_city) locationParts.push(w.room_city);
      if (w.room_state) locationParts.push(w.room_state);
      const locStr = locationParts.join(' - ');
      meta.textContent = [rangeStr, timeStart, locStr].filter(Boolean).join(' • ');
      card.appendChild(meta);

      const price = document.createElement('p');
      price.className = 'workshop-price';
      const raw = parseFloat(w.price_per_seat || 0);
      price.textContent = raw > 0
        ? `Ingresso a partir de ${raw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
        : 'Ingresso gratuito';
      card.appendChild(price);

      const actions = document.createElement('div');
      actions.className = 'workshop-actions';
      const btnDetails = document.createElement('a');
      btnDetails.href = '/workshops.html';
      btnDetails.className = 'btn btn-secondary btn-sm';
      btnDetails.textContent = 'Ver detalhes';
      actions.appendChild(btnDetails);
      const btnParticipar = document.createElement('a');
      btnParticipar.href = '/workshops.html';
      btnParticipar.className = 'btn btn-primary btn-sm';
      btnParticipar.textContent = 'Quero participar';
      actions.appendChild(btnParticipar);
      card.appendChild(actions);
      const detailUrl = new URL(`/workshops.html#workshop-${w.id}`, window.location.href).toString();
      card.appendChild(createShareActions(w.title || 'Workshop Ze.EFE', detailUrl));

      workshopsStrip.appendChild(card);
    });
  }

  function createWorkshopPromoCard() {
    const card = document.createElement('article');
    card.className = 'promo-card';
    card.innerHTML = `
      <h4>Você também pode oferecer cursos</h4>
      <p>Transforme sua sala em palco para workshops e monetize sua expertise com a Ze.EFE.</p>
      <button class="btn btn-secondary" type="button" data-destino="/anunciante.html">Quero oferecer cursos</button>
    `;
    card.querySelector('[data-destino]')?.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/anunciante.html';
    });
    return card;
  }

});
