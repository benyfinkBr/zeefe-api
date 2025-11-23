document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('workshopsList');
  const msgEl = document.getElementById('workshopsMessage');

  if (!listEl || !msgEl) return;

  msgEl.textContent = 'Carregando workshops...';

  fetch('api/workshops_list.php?status=publicado&upcoming=1')
    .then(r => r.json())
    .then(json => {
      if (!json.success) {
        msgEl.textContent = 'Não foi possível carregar os workshops no momento.';
        return;
      }

      const items = json.data || [];
      if (!items.length) {
        msgEl.textContent = 'Nenhum workshop disponível no momento.';
        return;
      }

      msgEl.textContent = '';
      listEl.innerHTML = '';

      items.forEach(w => {
        const card = document.createElement('article');
        card.className = 'card workshop-card';

        const title = document.createElement('h4');
        title.textContent = w.title || 'Workshop';
        card.appendChild(title);

        const meta = document.createElement('p');
        meta.className = 'workshop-meta';
        const dateStr = w.date || '';
        const timeStart = (w.time_start || '').slice(0, 5);
        const locationParts = [];
        if (w.room_city) locationParts.push(w.room_city);
        if (w.room_state) locationParts.push(w.room_state);
        const locStr = locationParts.join(' - ');
        meta.textContent = [dateStr, timeStart, locStr].filter(Boolean).join(' • ');
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
        const btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = 'Quero participar';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          alert('Fluxo de inscrição em workshops ainda em construção. Em breve você poderá se inscrever por aqui.');
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
