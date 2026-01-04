let workshopsCache = [];
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

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('workshopsList');
  const msgEl = document.getElementById('workshopsMessage');

  const detailsModal = document.getElementById('workshopDetailsModal');
  const detailsClose = document.getElementById('workshopDetailsClose');
  const detailsTitle = document.getElementById('workshopDetailsTitle');
  const detailsMeta = document.getElementById('workshopDetailsMeta');
  const detailsCoverWrapper = document.getElementById('workshopDetailsCoverWrapper');
  const detailsCover = document.getElementById('workshopDetailsCover');
  const detailsDescription = document.getElementById('workshopDetailsDescription');
  const detailsWhen = document.getElementById('workshopDetailsWhen');
  const detailsWhere = document.getElementById('workshopDetailsWhere');
  const detailsPrice = document.getElementById('workshopDetailsPrice');
  const detailsSeats = document.getElementById('workshopDetailsSeats');

  if (!listEl || !msgEl) return;

  const searchParams = new URLSearchParams(window.location.search || '');
  const roomIdFilter = searchParams.get('room_id');

  function sanitizeWorkshopHtml(html) {
    if (!html) return '';
    // Permite algumas tags básicas de formatação e blocos (inclui DIV para preservar quebras de linha do editor)
    const allowed = new Set(['B','STRONG','I','EM','U','BR','P','UL','OL','LI','DIV']);
    const container = document.createElement('div');
    container.innerHTML = html;

    const walk = (node) => {
      const childNodes = Array.from(node.childNodes);
      for (const child of childNodes) {
        if (child.nodeType === Node.TEXT_NODE) continue;
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowed.has(child.tagName)) {
            // substitui o elemento por seus filhos (mantém o texto)
            while (child.firstChild) {
              node.insertBefore(child.firstChild, child);
            }
            node.removeChild(child);
            continue;
          }
          // remove todos os atributos de tags permitidas
          while (child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
          }
          walk(child);
        } else {
          node.removeChild(child);
        }
      }
    };

    walk(container);
    return container.innerHTML;
  }

  function openDetailsModal(workshopId) {
    const ws = (workshopsCache || []).find(w => String(w.id) === String(workshopId));
    if (!ws || !detailsModal) return;

    const dateStr = ws.date || '';
    const endDateStr = ws.end_date || '';
    const rangeStr = endDateStr && endDateStr !== dateStr
      ? `${dateStr} até ${endDateStr}`
      : dateStr;
    const timeStart = (ws.time_start || '').slice(0,5);
    const timeEnd = (ws.time_end || '').slice(0,5);
    const locationParts = [];
    if (ws.room_city) locationParts.push(ws.room_city);
    if (ws.room_state) locationParts.push(ws.room_state);
    const locStr = locationParts.join(' - ');

    if (detailsTitle) detailsTitle.textContent = ws.title || 'Workshop';
    if (detailsMeta) detailsMeta.textContent = [rangeStr, [timeStart, timeEnd].filter(Boolean).join(' às '), locStr].filter(Boolean).join(' • ');

    if (ws.banner_path && detailsCover && detailsCoverWrapper) {
      detailsCover.src = ws.banner_path;
      detailsCoverWrapper.style.display = 'block';
    } else if (detailsCoverWrapper) {
      detailsCoverWrapper.style.display = 'none';
    }

    if (detailsDescription) {
      const desc = ws.description || 'O organizador ainda não adicionou uma descrição detalhada para este evento.';
      detailsDescription.innerHTML = sanitizeWorkshopHtml(desc);
    }

    if (detailsWhen) detailsWhen.textContent = rangeStr ? `Quando: ${rangeStr} (${[timeStart, timeEnd].filter(Boolean).join(' às ')})` : '';
    if (detailsWhere) detailsWhere.textContent = locStr ? `Onde: ${locStr}` : '';
    if (detailsPrice) {
      const raw = parseFloat(ws.price_per_seat || 0);
      detailsPrice.textContent = raw > 0
        ? `Investimento: ${raw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} por participante`
        : 'Investimento: evento gratuito';
    }
    if (detailsSeats) {
      const min = Number(ws.min_seats || 0);
      const max = Number(ws.max_seats || 0);
      const parts = [];
      if (min > 0) parts.push(`Mínimo de ${min} participantes`);
      if (max > 0) parts.push(`Máximo de ${max} participantes`);
      detailsSeats.textContent = parts.length ? parts.join(' • ') : '';
    }

    detailsModal.classList.add('show');
    detailsModal.setAttribute('aria-hidden','false');
  }

  function closeDetailsModal() {
    if (!detailsModal) return;
    detailsModal.classList.remove('show');
    detailsModal.setAttribute('aria-hidden','true');
  }

  detailsClose?.addEventListener('click', closeDetailsModal);
  detailsModal?.addEventListener('click', (e) => { if (e.target === detailsModal) closeDetailsModal(); });

  msgEl.textContent = 'Carregando workshops...';

  fetch('api/workshops_list.php?status=publicado&upcoming=1')
    .then(r => r.json())
    .then(json => {
      if (!json.success) {
        msgEl.textContent = 'Não foi possível carregar os workshops no momento.';
        return;
      }

      let items = json.data || [];
      workshopsCache = items;

      if (roomIdFilter) {
        const roomIdNum = Number(roomIdFilter);
        if (roomIdNum) {
          items = items.filter(w => Number(w.room_id) === roomIdNum);
        }
      }

      if (!items.length) {
        msgEl.textContent = roomIdFilter
          ? 'Nenhum workshop disponível neste local no momento.'
          : 'Nenhum workshop disponível no momento.';
        return;
      }

      msgEl.textContent = '';
      listEl.innerHTML = '';

      items.forEach(w => {
        const card = document.createElement('article');
        card.className = 'card workshop-card';
        card.id = `workshop-${w.id}`;

        if (w.banner_path) {
          const cover = document.createElement('div');
          cover.className = 'workshop-card-cover';
          const img = document.createElement('img');
          img.src = w.banner_path;
          img.alt = `Imagem do workshop ${w.title || ''}`.trim();
          cover.appendChild(img);
          cover.addEventListener('click', (e) => {
            e.preventDefault();
            openDetailsModal(w.id);
          });
          card.appendChild(cover);
        }

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

        if (w.subtitle) {
          const sub = document.createElement('p');
          sub.className = 'workshop-subtitle';
          sub.textContent = w.subtitle;
          card.appendChild(sub);
        }

        const price = document.createElement('p');
        price.className = 'workshop-price';
        const raw = parseFloat(w.price_per_seat || 0);
        price.textContent = raw > 0
          ? `Ingresso a partir de ${raw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
          : 'Ingresso gratuito';
        card.appendChild(price);

        if (parseInt(w.show_sold_bar, 10) === 1 && w.max_seats > 0) {
          const sold = parseInt(w.sold_seats || 0, 10);
          const max = parseInt(w.max_seats || 0, 10);
          const barWrap = document.createElement('div');
          barWrap.className = 'workshop-sold-bar';
          const barInner = document.createElement('div');
          barInner.className = 'workshop-sold-inner';
          const pct = Math.max(0, Math.min(100, Math.round((sold / max) * 100)));
          barInner.style.width = `${pct}%`;
          barWrap.appendChild(barInner);
          const barLabel = document.createElement('span');
          barLabel.className = 'workshop-sold-label';
          barLabel.textContent = `${sold} de ${max} vagas preenchidas`;
          barWrap.appendChild(barLabel);
          card.appendChild(barWrap);
        }

        const actions = document.createElement('div');
        actions.className = 'workshop-actions';

        const detailsBtn = document.createElement('a');
        detailsBtn.href = '#';
        detailsBtn.className = 'btn btn-secondary btn-sm';
        detailsBtn.textContent = 'Ver detalhes';
        detailsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openDetailsModal(w.id);
        });
        actions.appendChild(detailsBtn);

        const btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = 'Quero participar';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          openDetailsModal(w.id);
        });
        actions.appendChild(btn);

        card.appendChild(actions);
        const detailUrl = new URL(`/workshops.html#workshop-${w.id}`, window.location.href).toString();
        card.appendChild(createShareActions(w.title || 'Workshop Ze.EFE', detailUrl));

        listEl.appendChild(card);
      });
    })
    .catch(() => {
      msgEl.textContent = 'Não foi possível carregar os workshops no momento.';
    });
});
