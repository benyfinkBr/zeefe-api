document.addEventListener('DOMContentLoaded', () => {
  const benefitsContainer = document.getElementById('benefits-cards');
  const roomsStrip = document.getElementById('rooms-strip');
  const roomsMessage = document.getElementById('rooms-message');
  const navPrev = document.querySelector('.rooms-nav-prev');
  const navNext = document.querySelector('.rooms-nav-next');
  let amenitiesMap = {};
  let allRooms = [];
  const filterQuery = document.getElementById('filterQuery');
  const filterCapacity = document.getElementById('filterCapacity');
  const clearFiltersBtn = document.getElementById('clearFilters');

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

      if (!allRooms.length) {
        roomsMessage.textContent = 'Nenhuma sala cadastrada no momento.';
        return;
      }
      roomsMessage.textContent = '';
      renderRooms();
      requestAnimationFrame(() => updateCarouselNavState());
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
    const cap = Number(filterCapacity?.value || 0);
    const filtered = (allRooms || []).filter(room => {
      const okQuery = !query ||
        String(room.name || '').toLowerCase().includes(query) ||
        String(room.location || '').toLowerCase().includes(query);
      const okCap = !cap || (cap === 51 ? Number(room.capacity || 0) > 50 : Number(room.capacity || 0) <= cap);
      return okQuery && okCap;
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
        meta.innerHTML = `
          <span class="room-location">${room.location ? escapeHtml(room.location) : 'Localização não informada'}</span>
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
          <a class="btn btn-primary${available ? '' : ' disabled'}" ${available ? '' : 'aria-disabled="true" tabindex="-1"'} href="${available ? `pre-reserva.html?room=${room.id}` : '#'}">${available ? 'Solicitar reserva' : 'Indisponível'}</a>
          <a class="btn btn-secondary" href="salas.html#sala-${room.id}">Ver detalhes</a>
        `;
        info.appendChild(actions);
        card.appendChild(info);
        roomsStrip.appendChild(card);
    });
    requestAnimationFrame(() => updateCarouselNavState());
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
  filterCapacity?.addEventListener('change', () => renderRooms());
  clearFiltersBtn?.addEventListener('click', () => {
    if (filterQuery) filterQuery.value = '';
    if (filterCapacity) filterCapacity.value = '';
    renderRooms();
  });
});
