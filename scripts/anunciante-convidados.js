const API_BASE = 'api';

const workshopSelect = document.getElementById('workshopSelect');
const guestSearch = document.getElementById('guestSearch');
const checkinFilter = document.getElementById('checkinFilter');
const paymentFilter = document.getElementById('paymentFilter');
const guestList = document.getElementById('guestList');
const guestMessage = document.getElementById('guestMessage');
const refreshGuests = document.getElementById('refreshGuests');
const cancelWorkshopBtn = document.getElementById('cancelWorkshop');
const backToHome = document.getElementById('backToHome');

const resultModal = document.getElementById('guestResultModal');
const resultText = document.getElementById('guestResultText');
const resultClose = document.getElementById('guestResultClose');
const resultOk = document.getElementById('guestResultOk');

let advertiser = null;
let workshops = [];
let enrollments = [];

function showResult(message) {
  if (resultText) resultText.textContent = message;
  resultModal?.classList.add('show');
  resultModal?.setAttribute('aria-hidden', 'false');
}

function closeResult() {
  resultModal?.classList.remove('show');
  resultModal?.setAttribute('aria-hidden', 'true');
}

function statusPill(label, type) {
  const span = document.createElement('span');
  span.className = `status-pill ${type || ''}`.trim();
  span.textContent = label;
  return span;
}

function formatCheckinStatus(value) {
  if (value === 'lido') return { label: 'Check-in realizado', type: 'success' };
  if (value === 'cancelado') return { label: 'Check-in negado', type: 'danger' };
  return { label: 'Check-in pendente', type: 'warn' };
}

function formatPaymentStatus(value) {
  if (value === 'pago') return { label: 'Pagamento realizado', type: 'success' };
  if (value === 'cancelado') return { label: 'Pagamento cancelado', type: 'danger' };
  return { label: 'Pagamento pendente', type: 'warn' };
}

function renderGuestList() {
  if (!guestList || !guestMessage) return;
  guestList.innerHTML = '';

  const searchTerm = (guestSearch?.value || '').trim().toLowerCase();
  const checkinVal = checkinFilter?.value || 'all';
  const paymentVal = paymentFilter?.value || 'all';

  const filtered = enrollments.filter((e) => {
    const name = (e.participant_name || '').toLowerCase();
    if (searchTerm && !name.includes(searchTerm)) return false;
    if (checkinVal !== 'all' && e.checkin_status !== checkinVal) return false;
    if (paymentVal !== 'all' && e.payment_status !== paymentVal) return false;
    return true;
  });

  if (!filtered.length) {
    guestMessage.textContent = 'Nenhum convidado encontrado.';
    return;
  }

  guestMessage.textContent = '';
  filtered.forEach((e) => {
    const card = document.createElement('div');
    card.className = 'guest-card';
    const name = e.participant_name || 'Convidado';
    const cpf = e.participant_cpf || '--';
    const email = e.participant_email || '--';
    const phone = e.participant_phone || '--';

    const checkin = formatCheckinStatus(e.checkin_status);
    const payment = formatPaymentStatus(e.payment_status);

    card.innerHTML = `
      <h3>${name}</h3>
      <p class="guest-meta">CPF: ${cpf}</p>
      <p class="guest-meta">E-mail: ${email}</p>
      <p class="guest-meta">Telefone: ${phone}</p>
    `;

    const metaRow = document.createElement('div');
    metaRow.style.display = 'flex';
    metaRow.style.flexWrap = 'wrap';
    metaRow.style.gap = '6px';
    metaRow.appendChild(statusPill(payment.label, payment.type));
    metaRow.appendChild(statusPill(checkin.label, checkin.type));
    card.appendChild(metaRow);

    if (e.payment_status === 'pago' && e.checkin_status !== 'lido') {
      const actions = document.createElement('div');
      actions.className = 'mobile-inline-actions';
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'btn-confirm';
      confirmBtn.type = 'button';
      confirmBtn.textContent = 'Confirmar check-in';
      confirmBtn.addEventListener('click', () => updateCheckin(e.id, 'confirm'));
      actions.appendChild(confirmBtn);
      card.appendChild(actions);
    }

    guestList.appendChild(card);
  });
}

async function updateCheckin(enrollmentId, action) {
  try {
    const res = await fetch(`${API_BASE}/workshop_checkin_update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ enrollment_id: enrollmentId, action })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao atualizar check-in.');
    showResult(action === 'confirm' ? 'Check-in confirmado.' : 'Check-in negado.');
    await loadEnrollments();
  } catch (err) {
    showResult(err.message || 'Erro ao atualizar check-in.');
  }
}

async function loadEnrollments() {
  if (!advertiser || !workshopSelect) return;
  const workshopId = parseInt(workshopSelect.value, 10) || 0;
  if (!workshopId) {
    enrollments = [];
    guestMessage.textContent = 'Selecione um workshop para ver os convidados.';
    guestList.innerHTML = '';
    return;
  }
  guestMessage.textContent = 'Carregando convidados...';
  try {
    const res = await fetch(`${API_BASE}/workshop_enrollments_list.php?advertiser_id=${encodeURIComponent(advertiser.id)}&workshop_id=${encodeURIComponent(workshopId)}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao carregar convidados.');
    enrollments = json.data || [];
    renderGuestList();
  } catch (err) {
    guestMessage.textContent = err.message || 'Erro ao carregar convidados.';
  }
}

async function loadWorkshops() {
  if (!advertiser || !workshopSelect) return;
  workshopSelect.innerHTML = '<option value="">Carregando...</option>';
  try {
    const res = await fetch(`${API_BASE}/workshops_list.php?advertiser_id=${encodeURIComponent(advertiser.id)}&status=&upcoming=0`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar workshops.');
    workshops = json.data || [];
    if (!workshops.length) {
      workshopSelect.innerHTML = '<option value="">Nenhum workshop</option>';
      guestMessage.textContent = 'Nenhum workshop cadastrado.';
      return;
    }
    workshopSelect.innerHTML = '<option value="">Selecione um workshop</option>';
    workshops.forEach((w) => {
      const opt = document.createElement('option');
      opt.value = String(w.id);
      opt.textContent = `${w.title || 'Workshop'} (${w.date || ''})`;
      workshopSelect.appendChild(opt);
    });
    const params = new URLSearchParams(window.location.search);
    const preselect = params.get('workshop_id');
    if (preselect && workshops.some(w => String(w.id) === String(preselect))) {
      workshopSelect.value = String(preselect);
    }
    await loadEnrollments();
  } catch (err) {
    workshopSelect.innerHTML = '<option value="">Falha ao carregar</option>';
    guestMessage.textContent = err.message || 'Erro ao carregar workshops.';
  }
}

async function loadSession() {
  try {
    const res = await fetch(`${API_BASE}/advertiser_session.php`, { credentials: 'include' });
    const json = await res.json();
    if (json.success && json.advertiser) {
      advertiser = json.advertiser;
      await loadWorkshops();
      return;
    }
  } catch (err) {
    console.error('[Convidados] Falha ao carregar sessao', err);
  }
  window.location.href = 'anunciante-mobile.html';
}

async function cancelWorkshop() {
  if (!workshopSelect) return;
  const workshopId = parseInt(workshopSelect.value, 10) || 0;
  if (!workshopId) {
    showResult('Selecione um workshop para cancelar.');
    return;
  }
  if (!window.confirm('Deseja cancelar este workshop? Os inscritos serao notificados.')) {
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/workshop_cancel.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ workshop_id: workshopId })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao cancelar workshop.');
    showResult('Workshop cancelado. Os inscritos foram notificados.');
    await loadWorkshops();
  } catch (err) {
    showResult(err.message || 'Erro ao cancelar workshop.');
  }
}

workshopSelect?.addEventListener('change', loadEnrollments);
guestSearch?.addEventListener('input', renderGuestList);
checkinFilter?.addEventListener('change', renderGuestList);
paymentFilter?.addEventListener('change', renderGuestList);
refreshGuests?.addEventListener('click', loadEnrollments);
cancelWorkshopBtn?.addEventListener('click', cancelWorkshop);
resultClose?.addEventListener('click', closeResult);
resultOk?.addEventListener('click', closeResult);
resultModal?.addEventListener('click', (event) => { if (event.target === resultModal) closeResult(); });
backToHome?.addEventListener('click', () => { window.location.href = 'anunciante-mobile.html'; });

loadSession();
