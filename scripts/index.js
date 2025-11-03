document.addEventListener('DOMContentLoaded', () => {
  const benefitsContainer = document.getElementById('benefits-cards');
  const roomsGrid = document.getElementById('rooms-grid');
  const roomsMessage = document.getElementById('rooms-message');

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
    if (!roomsGrid) return;
    roomsGrid.innerHTML = '';
    roomsMessage.textContent = 'Carregando salas...';
    try {
      const res = await fetch('api/apiget.php?table=rooms', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Falha ao consultar API');
      const rooms = json.data || [];
      if (!rooms.length) {
        roomsMessage.textContent = 'Nenhuma sala cadastrada no momento.';
        return;
      }
      roomsMessage.textContent = '';
      const today = formatDateISO(new Date());
      rooms.forEach(room => {
        const available = isRoomAvailable(room, today);
        const photos = getRoomPhotos(room.photo_path);
        const card = document.createElement('article');
        card.className = `room-card${available ? '' : ' unavailable'}`;

        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'room-photo';
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
        }

        card.innerHTML = '';
        card.appendChild(carouselContainer);

        const info = document.createElement('div');
        info.className = 'room-info';
        info.innerHTML = `
            <h4>${escapeHtml(room.name)}</h4>
            <div class="room-meta">
              ${room.location ? `<span>📍 ${escapeHtml(room.location)}</span>` : ''}
              <span>👥 ${room.capacity || 0} pessoas</span>
              <span>${statusBadge(room, available)}</span>
            </div>
            ${room.description ? `<p>${escapeHtml(room.description)}</p>` : ''}
            <div class="room-actions">
              <a class="btn" ${available ? '' : 'aria-disabled="true" tabindex="-1"'} href="${available ? `pre-reserva.html?room=${room.id}` : '#'}">${available ? 'Reservar diária' : 'Indisponível'}</a>
              <a class="btn btn-secondary" href="salas.html#sala-${room.id}">Detalhes</a>
            </div>
        `;
        card.appendChild(info);
        roomsGrid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      roomsMessage.textContent = 'Erro ao carregar salas. Tente novamente mais tarde.';
    }
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
    const status = (room.status || '').toLowerCase();
    let label = 'Disponível';
    let cls = 'status-ativo';
    if (!available) {
      cls = 'status-cancelada';
      if (status === 'manutencao') {
        cls = 'status-manutencao';
        label = 'Em manutenção';
      } else if (status === 'desativada') {
        label = 'Desativada';
      } else if (status === 'inativo') {
        label = 'Indisponível';
      }
    } else if (status === 'manutencao') {
      cls = 'status-pendente';
      label = 'Disponível em breve';
    }
    return `<span class="status-badge ${cls}">${label}</span>`;
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
});
