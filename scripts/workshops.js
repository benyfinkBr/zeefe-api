let workshopsCache = [];

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('workshopsList');
  const msgEl = document.getElementById('workshopsMessage');

  const modal = document.getElementById('workshopEnrollModal');
  const modalClose = document.getElementById('workshopEnrollClose');
  const modalCancel = document.getElementById('workshopEnrollCancelBtn');
  const form = document.getElementById('workshopEnrollForm');
  const inputId = document.getElementById('workshopEnrollId');
  const inputName = document.getElementById('workshopEnrollName');
  const inputEmail = document.getElementById('workshopEnrollEmail');
  const inputCpf = document.getElementById('workshopEnrollCpf');
  const inputPhone = document.getElementById('workshopEnrollPhone');
  const inputVoucher = document.getElementById('workshopEnrollVoucher');
  const summaryEl = document.getElementById('workshopEnrollSummary');
  const msgEnroll = document.getElementById('workshopEnrollMsg');
  const codeBox = document.getElementById('workshopEnrollCodeBox');

  if (!listEl || !msgEl) return;

  function openEnrollModal(workshopId) {
    const ws = (workshopsCache || []).find(w => String(w.id) === String(workshopId));
    if (!ws || !modal) return;
    inputId.value = ws.id;
    inputName.value = '';
    inputEmail.value = '';
    inputCpf.value = '';
    inputPhone.value = '';
    inputVoucher.value = '';
    msgEnroll.textContent = '';
    codeBox.style.display = 'none';
    codeBox.innerHTML = '';
    const dateStr = ws.date || '';
    const timeStart = (ws.time_start || '').slice(0,5);
    const locationParts = [];
    if (ws.room_city) locationParts.push(ws.room_city);
    if (ws.room_state) locationParts.push(ws.room_state);
    const locStr = locationParts.join(' - ');
    summaryEl.textContent = [
      ws.title || 'Workshop',
      [dateStr, timeStart].filter(Boolean).join(' • '),
      locStr
    ].filter(Boolean).join(' | ');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  }

  function closeEnrollModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }

  modalClose?.addEventListener('click', closeEnrollModal);
  modalCancel?.addEventListener('click', closeEnrollModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeEnrollModal(); });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!inputId.value) return;
    msgEnroll.textContent = '';
    codeBox.style.display = 'none';
    codeBox.innerHTML = '';
    const payload = {
      workshop_id: Number(inputId.value),
      name: inputName.value.trim(),
      email: inputEmail.value.trim(),
      cpf: inputCpf.value.trim(),
      phone: inputPhone.value.trim(),
      voucher_code: inputVoucher.value.trim()
    };
    try {
      const res = await fetch('api/workshop_enroll.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Não foi possível registrar sua inscrição.');
      }
      const status = json.payment_status || 'pendente';
      const thresholdReached = !!json.threshold_reached;
      if (status === 'pago') {
        msgEnroll.textContent = 'Inscrição confirmada! Enviaremos as instruções para o seu e-mail.';
      } else {
        msgEnroll.textContent = 'Sua pré-reserva foi registrada. Assim que o número mínimo de participantes for atingido, sua inscrição será confirmada por e-mail.';
      }
      if (json.public_code && json.checkin_url) {
        const url = json.checkin_url;
        const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);
        codeBox.style.display = 'block';
        codeBox.innerHTML = `
          <strong>Seu código de acesso:</strong> ${json.public_code}<br>
          <small>Guarde este código. Ele será usado para validar sua entrada caso o curso seja confirmado.</small><br>
          <img src="${qrSrc}" alt="QR code do ingresso" style="margin-top:8px;"/>
        `;
      }
    } catch (err) {
      msgEnroll.textContent = err.message || 'Falha ao registrar inscrição.';
    }
  });

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
        const btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = 'Quero participar';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          openEnrollModal(w.id);
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
