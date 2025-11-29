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
  const heroTabs = document.querySelectorAll('.hero-tab');
  const heroForm = document.getElementById('heroSearchForm');
  const heroLocation = document.getElementById('heroLocation');
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
    filtered.forEach(room => {
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

        if (room.description) {
          const description = document.createElement('p');
          description.className = 'room-description';
          description.textContent = truncateText(room.description, 180);
          info.appendChild(description);
        }

        const meta = document.createElement('div');
        meta.className = 'room-meta';
        const hasMap = (Number(room.lat||room.latitude) && Number(room.lon||room.lng||room.longitude));
        meta.innerHTML = `
          <span class="room-location">${room.location ? escapeHtml(room.location) : 'Localização não informada'} ${hasMap ? ' • <span title="Tem localização no mapa">📍</span>' : ''}</span>
          <span class="room-capacity">${room.capacity || 0} pessoas</span>
        `;
        info.appendChild(meta);

        if (room.daily_rate) {
          const price = document.createElement('div');
          price.className = 'room-price';
          price.innerHTML = `
            <strong>${formatCurrency(room.daily_rate)}</strong>
            <span>/ diária</span>
          `;
          info.appendChild(price);
        }

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
          <a class="btn btn-primary${available ? '' : ' disabled'}" ${available ? '' : 'aria-disabled="true" tabindex="-1"'} href="${available ? `clientes.html` : '#'}">${available ? 'Solicitar reserva' : 'Indisponível'}</a>
          <a class="btn btn-secondary" href="salas.html#sala-${room.id}">Ver detalhes</a>
        `;
        info.appendChild(actions);
        card.appendChild(info);
        roomsStrip.appendChild(card);
    });
    // Atualiza marcadores do mapa conforme filtros aplicados
    renderMapMarkers(filtered);
    requestAnimationFrame(() => updateCarouselNavState());
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
      const detailsLink = `salas.html#${r.id}`;
      const workshopsLink = `workshops.html?room_id=${r.id}`;
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
    if (!heroNewsMain) return;
    heroNewsMain.innerHTML = '';
    try {
      const res = await fetch('api/apiget.php?table=posts', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) return;
      let posts = json.data || [];
      posts = posts.filter(p => (p.status || '').toLowerCase() === 'publicado');
      if (!posts.length) {
        if (heroNewsMain) {
          const p = document.createElement('p');
          p.className = 'hero-news-subtitle';
          p.textContent = 'Nenhum conteúdo publicado ainda.';
          heroNewsMain.appendChild(p);
        }
        return;
      }
      posts.sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        if (db !== da) return db - da;
        return (b.id || 0) - (a.id || 0);
      });
      // Mantém apenas os 3 mais recentes para o carrossel
      const items = posts.slice(0, 3);
      let currentIndex = 0;

      const renderSlide = (idx) => {
        if (!heroNewsMain) return;
        const post = items[idx];
        heroNewsMain.innerHTML = '';
        const card = document.createElement('article');
        card.className = 'hero-news-card hero-news-card-main';
        if (post.cover_path) {
          const img = document.createElement('img');
          img.src = post.cover_path;
          img.alt = post.title || 'Imagem do conteúdo';
          card.appendChild(img);
        }

        const overlay = document.createElement('div');
        overlay.className = 'hero-news-overlay';

        const titleBar = document.createElement('div');
        titleBar.className = 'hero-news-title-bar';

        const titleEl = document.createElement('h4');
        const link = document.createElement('a');
        link.href = `conteudo-detalhe.html?id=${post.id}`;
        link.textContent = post.title || 'Conteúdo';
        titleEl.appendChild(link);
        titleBar.appendChild(titleEl);
        overlay.appendChild(titleBar);

        const meta = document.createElement('p');
        meta.className = 'hero-news-meta';
        const parts = [];
        if (post.category) parts.push(post.category);
        if (post.published_at) {
          const d = new Date(post.published_at);
          if (!Number.isNaN(d.getTime())) {
            parts.push(d.toLocaleDateString('pt-BR'));
          }
        }
        meta.textContent = parts.join(' • ');
        overlay.appendChild(meta);

        const summary = document.createElement('p');
        summary.textContent = (post.summary || '').slice(0, 160) || 'Leia mais sobre este conteúdo.';
        overlay.appendChild(summary);

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'hero-news-dots';
        items.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.className = 'hero-news-dot' + (i === idx ? ' active' : '');
          dotsWrap.appendChild(dot);
        });
        overlay.appendChild(dotsWrap);

        card.appendChild(overlay);
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

  heroTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      heroMode = tab.dataset.target === 'cursos' ? 'cursos' : 'salas';
      heroTabs.forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.tab-salas').forEach(el => el.classList.toggle('hidden', heroMode !== 'salas'));
      document.querySelectorAll('.tab-cursos').forEach(el => el.classList.toggle('hidden', heroMode !== 'cursos'));
      if (heroSubmit) heroSubmit.textContent = heroMode === 'salas' ? 'Buscar salas' : 'Ver cursos presenciais';
    });
  });

  heroForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (heroMode === 'salas') {
      if (filterType) filterType.value = 'rooms';
      if (filterQuery && heroLocation) filterQuery.value = heroLocation.value || '';
      renderRooms();
      document.getElementById('rooms-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const params = new URLSearchParams();
      const topic = (heroCourseTopic?.value || '').trim();
      const city = (heroCourseCity?.value || heroLocation?.value || '').trim();
      if (topic) params.set('q', topic);
      if (city) params.set('city', city);
      const url = params.toString() ? `workshops.html?${params.toString()}` : 'workshops.html';
      window.location.href = url;
    }
  });

  // Modal de escolha de entrada (cliente ou anunciante)
  openLoginChoiceBtn?.addEventListener('click', () => {
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
    if (!allWorkshops.length) {
      workshopsMessage.textContent = 'Nenhum curso disponível no momento.';
      return;
    }
    workshopsMessage.textContent = '';
    const items = allWorkshops.slice(0, 4);
    items.forEach(w => {
      const card = document.createElement('article');
      card.className = 'card workshop-card';

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
      btnDetails.href = 'workshops.html';
      btnDetails.className = 'btn btn-secondary btn-sm';
      btnDetails.textContent = 'Ver detalhes';
      actions.appendChild(btnDetails);
      const btnParticipar = document.createElement('a');
      btnParticipar.href = 'workshops.html';
      btnParticipar.className = 'btn btn-primary btn-sm';
      btnParticipar.textContent = 'Quero participar';
      actions.appendChild(btnParticipar);
      card.appendChild(actions);

      workshopsStrip.appendChild(card);
    });
  }
});
