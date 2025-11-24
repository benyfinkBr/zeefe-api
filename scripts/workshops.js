let workshopsCache = [];

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

      const items = json.data || [];
      workshopsCache = items;
      if (!items.length) {
        msgEl.textContent = 'Nenhum workshop disponível no momento.';
        return;
      }

      msgEl.textContent = '';
      listEl.innerHTML = '';

      items.forEach(w => {
        const card = document.createElement('article');
        card.className = 'card workshop-card';

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

        listEl.appendChild(card);
      });
    })
    .catch(() => {
      msgEl.textContent = 'Não foi possível carregar os workshops no momento.';
    });
});
