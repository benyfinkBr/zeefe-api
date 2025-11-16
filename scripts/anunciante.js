const API_BASE = 'api';

// Estado
let advClient = null; // dados do cliente logado
let myAdvertiser = null; // registro de advertisers do dono
let myRooms = [];
let myReservations = [];
let currentThreadId = null;
let chatPollTimer = null;

// Seletores
const authContainer = document.getElementById('authContainer');
const loginForm = document.getElementById('advLoginForm');
const loginIdInput = document.getElementById('advLoginIdentifier');
const loginPwInput = document.getElementById('advLoginPassword');
const rememberMe = document.getElementById('advRememberMe');
const authMsg = document.getElementById('advAuthMessage');

const panelsWrap = document.getElementById('advPanels');
const navButtons = Array.from(document.querySelectorAll('.portal-nav'));
const logoutBtn = document.getElementById('advLogoutBtn');
const refreshBtn = document.getElementById('advRefreshBtn');

const advDisplay = document.getElementById('advDisplay');
const advOwner = document.getElementById('advOwner');

// Overview
const ovViews = document.getElementById('ovViews');
const ovUpcoming = document.getElementById('ovUpcoming');
const ovBalance = document.getElementById('ovBalance');
const ovNext = document.getElementById('ovNextReservations');

// Salas / Reservas / Financeiro / Mensagens / Reviews
const roomsContainer = document.getElementById('advRoomsContainer');
const resContainer = document.getElementById('advReservationsContainer');
const finContainer = document.getElementById('advFinanceContainer');
const threadsContainer = document.getElementById('advThreadsContainer');
const reviewsContainer = document.getElementById('advReviewsContainer');
const chatArea = document.getElementById('advChatArea');
const chatHeader = document.getElementById('advChatHeader');
const chatMessages = document.getElementById('advChatMessages');
const chatForm = document.getElementById('advChatForm');
const chatInput = document.getElementById('advChatInput');
// Room modal
const newRoomBtn = document.getElementById('advNewRoomBtn');
const roomModal = document.getElementById('advRoomModal');
const roomClose = document.getElementById('advRoomClose');
const roomCancel = document.getElementById('advRoomCancel');
const roomForm = document.getElementById('advRoomForm');
const roomMsg = document.getElementById('advRoomMessage');
const roomName = document.getElementById('roomName');
const roomCap = document.getElementById('roomCapacity');
const roomCity = document.getElementById('roomCity');
const roomState = document.getElementById('roomState');
const roomPrice = document.getElementById('roomPrice');
const roomStatus = document.getElementById('roomStatus');
const roomDesc = document.getElementById('roomDescription');
// payout form
const bankNameInput = document.getElementById('bankName');
const accountTypeInput = document.getElementById('accountType');
const accountNumberInput = document.getElementById('accountNumber');
const pixKeyInput = document.getElementById('pixKey');
const savePayoutBtn = document.getElementById('savePayoutBtn');
const payoutMessage = document.getElementById('payoutMessage');

function setAuthVisible(show) {
  if (!authContainer) return;
  if (show) {
    document.body.classList.add('client-logged-out');
    document.body.classList.remove('client-authenticated');
    authContainer.hidden = false;
  } else {
    document.body.classList.add('client-authenticated');
    document.body.classList.remove('client-logged-out');
    authContainer.hidden = true;
  }
}

async function parseJsonSafe(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch (_) { throw new Error(text || `HTTP ${res.status}`); }
}

function setActivePanel(name) {
  const panels = ['overview','rooms','reservations','finance','messages','reviews'];
  panels.forEach(p => {
    const el = document.getElementById('panel-' + p);
    if (el) el.hidden = (p !== name);
  });
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === name));
}

async function onLoginSubmit(e) {
  e.preventDefault();
  authMsg.textContent = '';
  const id = (loginIdInput?.value || '').trim();
  const pw = loginPwInput?.value || '';
  if (!id || !pw) { authMsg.textContent = 'Informe login e senha.'; return; }
  try {
    const res = await fetch(`${API_BASE}/client_portal_login.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ login: id, password: pw }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha no login');
    advClient = json.client;
    await afterLogin();
  } catch (err) {
    authMsg.textContent = err.message || 'Erro ao autenticar.';
  }
}

async function afterLogin() {
  setAuthVisible(false);
  if (panelsWrap) panelsWrap.hidden = false;
  advDisplay.textContent = advClient?.name || advClient?.login || 'Anunciante';
  advOwner.textContent = advClient?.email || '';

  await loadAdvertiser();
  await Promise.all([loadRooms(), loadReservations(), loadFinance(), loadOverview(), loadReviews(), loadThreads()]);
  setActivePanel('overview');
}

async function loadAdvertiser() {
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=advertisers`, { credentials:'include' });
    const json = await parseJsonSafe(res);
    const list = (json.success ? (json.data || []) : []);
    myAdvertiser = list.find(a => String(a.owner_type) === 'client' && String(a.owner_id) === String(advClient.id)) || null;
    if (!myAdvertiser) {
      advDisplay.textContent = 'Sem anunciante vinculado';
      advOwner.innerHTML = 'Acesse <a href="divulgue.html">Divulgue sua sala</a> para criar seu cadastro de anunciante.';
    } else {
      if (myAdvertiser.display_name) advDisplay.textContent = myAdvertiser.display_name;
      // Preenche dados de repasse
      bankNameInput && (bankNameInput.value = myAdvertiser.bank_name || '');
      accountTypeInput && (accountTypeInput.value = myAdvertiser.account_type || '');
      accountNumberInput && (accountNumberInput.value = myAdvertiser.account_number || '');
      pixKeyInput && (pixKeyInput.value = myAdvertiser.pix_key || '');
    }
  } catch (_) { /* silencioso */ }
}

async function loadRooms() {
  roomsContainer.innerHTML = '<div class="rooms-message">Carregando…</div>';
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=rooms`, { credentials:'include' });
    const json = await parseJsonSafe(res);
    const all = json.success ? (json.data || []) : [];
    const advId = myAdvertiser?.id;
    myRooms = advId ? all.filter(r => String(r.advertiser_id) === String(advId)) : [];
    if (!myRooms.length) {
      roomsContainer.innerHTML = '<div class="rooms-message">Nenhuma sala vinculada. Use “Divulgar nova sala”.</div>';
      return;
    }
    roomsContainer.innerHTML = myRooms.map(r => `
      <article class="room-card">
        <div class="room-photo">📷</div>
        <div class="room-info">
          <h4>${escapeHtml(r.name || 'Sala')}</h4>
          <p class="room-meta">${escapeHtml(r.city || '')} - ${escapeHtml(r.state || '')}</p>
          <div class="room-actions">
            <button class="btn btn-secondary btn-sm" data-room="${r.id}" data-act="details">Ver detalhes</button>
          </div>
        </div>
      </article>
    `).join('');
  } catch (e) {
    roomsContainer.innerHTML = '<div class="rooms-message">Falha ao carregar salas.</div>';
  }
}

async function loadReservations() {
  resContainer.innerHTML = '<div class="rooms-message">Carregando…</div>';
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=reservations`, { credentials:'include' });
    const json = await parseJsonSafe(res);
    let all = json.success ? (json.data || []) : [];
    if (myRooms.length) {
      const roomIds = new Set(myRooms.map(r => String(r.id)));
      all = all.filter(x => roomIds.has(String(x.room_id)));
    } else {
      all = [];
    }
    myReservations = all;
    const rows = all.slice().sort((a,b)=> new Date(a.date) - new Date(b.date)).map(r => `
      <tr>
        <td>${escapeHtml(r.id)}</td>
        <td>${escapeHtml(r.date || '')}</td>
        <td>${escapeHtml(String(r.room_id))}</td>
        <td>${escapeHtml(r.status || '')}</td>
        <td>${escapeHtml(r.payment_status || '')}</td>
      </tr>
    `).join('');
    resContainer.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Data</th><th>Sala</th><th>Status</th><th>Pagamento</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:16px">Nenhuma reserva.</td></tr>'}</tbody>
      </table>`;
  } catch (e) {
    resContainer.innerHTML = '<div class="rooms-message">Falha ao carregar reservas.</div>';
  }
}

async function loadFinance() {
  finContainer.innerHTML = '<div class="rooms-message">Carregando…</div>';
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=ledger_entries`, { credentials:'include' });
    const json = await parseJsonSafe(res);
    const advId = myAdvertiser?.id;
    let rows = [];
    if (advId) {
      const list = json.success ? (json.data || []) : [];
      rows = list.filter(x => String(x.advertiser_id) === String(advId));
    }
    const body = rows.map(l => `
      <tr>
        <td>${escapeHtml(l.id)}</td>
        <td>${escapeHtml(l.type)}</td>
        <td>R$ ${Number(l.amount || 0).toFixed(2)}</td>
        <td>${escapeHtml(l.status)}</td>
        <td>${escapeHtml(l.available_at || '')}</td>
      </tr>
    `).join('');
    finContainer.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Disponível em</th></tr></thead>
        <tbody>${body || '<tr><td colspan="5" style="text-align:center;padding:16px">Sem lançamentos.</td></tr>'}</tbody>
      </table>`;
  } catch (e) {
    finContainer.innerHTML = '<div class="rooms-message">Falha ao carregar extrato.</div>';
  }
}

async function loadOverview() {
  // placeholders simples baseados em dados já carregados
  try {
    ovViews.textContent = '—'; // quando tracking estiver habilitado, calcular a partir de events
    ovUpcoming.textContent = (myReservations || []).filter(r => r.date && new Date(r.date) >= new Date()).length;
    // saldo disponível = ledger status 'disponivel'
    let bal = 0;
    try {
      const res = await fetch(`${API_BASE}/apiget.php?table=ledger_entries`, { credentials:'include' });
      const json = await parseJsonSafe(res);
      const advId = myAdvertiser?.id;
      const list = json.success ? (json.data || []) : [];
      list.filter(x => String(x.advertiser_id) === String(advId) && String(x.status).toLowerCase() === 'disponivel')
          .forEach(x => { bal += Number(x.amount || 0); });
    } catch (_) {}
    ovBalance.textContent = 'R$ ' + bal.toFixed(2);

    const upcoming = (myReservations || []).filter(r => r.date && new Date(r.date) >= new Date())
      .sort((a,b)=> new Date(a.date) - new Date(b.date)).slice(0,5);
    if (!upcoming.length) {
      ovNext.innerHTML = '<div class="rooms-message">Sem reservas futuras.</div>';
    } else {
      ovNext.innerHTML = upcoming.map(r => `<div class="list-next-item"><span class="date">${escapeHtml(r.date)}</span><span class="room">Sala #${escapeHtml(r.room_id)}</span><span class="chip">${escapeHtml(r.status || '')}</span></div>`).join('');
    }
  } catch (_) {}
}

async function loadThreads() {
  threadsContainer.innerHTML = '<div class="rooms-message">Carregando conversas…</div>';
  try {
    const advId = myAdvertiser?.id;
    if (!advId) { threadsContainer.innerHTML = '<div class="rooms-message">Sem anunciante vinculado.</div>'; return; }
    const res = await fetch(`${API_BASE}/messages_list_threads.php?advertiser_id=${encodeURIComponent(advId)}`);
    const json = await parseJsonSafe(res);
    const list = json.success ? (json.data || []) : [];
    if (!list.length) { threadsContainer.innerHTML = '<div class="rooms-message">Nenhuma conversa ainda.</div>'; return; }
    threadsContainer.innerHTML = list.map(t => `
      <button type="button" class="thread-item" data-thread-id="${t.id}">
        <div class="thread-title">${escapeHtml(t.room_id ? 'Sala #' + t.room_id : 'Conversa')}</div>
        <div class="thread-meta">${escapeHtml((t.last_message_at || t.created_at || '').toString().slice(0,16).replace('T',' '))}</div>
      </button>
    `).join('');
    threadsContainer.querySelectorAll('[data-thread-id]').forEach(btn => btn.addEventListener('click', () => openThread(btn.getAttribute('data-thread-id'))));
  } catch (e) {
    threadsContainer.innerHTML = '<div class="rooms-message">Falha ao carregar conversas.</div>';
  }
}

async function loadReviews() {
  reviewsContainer.innerHTML = '<div class="rooms-message">Carregando…</div>';
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=reviews`, { credentials:'include' });
    const json = await parseJsonSafe(res);
    let list = json.success ? (json.data || []) : [];
    const roomIds = new Set((myRooms || []).map(r => String(r.id)));
    list = list.filter(rv => roomIds.has(String(rv.room_id)));
    const rows = list.slice().sort((a,b)=> new Date(b.created_at||0) - new Date(a.created_at||0)).map(rv => `
      <tr>
        <td>${escapeHtml(rv.room_id)}</td>
        <td>${escapeHtml(rv.rating_benefits)}/${escapeHtml(rv.rating_ease)}/${escapeHtml(rv.rating_price)}</td>
        <td>${escapeHtml(rv.status || '')}</td>
        <td>${escapeHtml((rv.created_at||'').toString().slice(0,10))}</td>
      </tr>
    `).join('');
    reviewsContainer.innerHTML = `
      <table>
        <thead><tr><th>Sala</th><th>Notas (Ben/Fac/Pre)</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:16px">Sem avaliações.</td></tr>'}</tbody>
      </table>`;
  } catch (e) {
  reviewsContainer.innerHTML = '<div class="rooms-message">Falha ao carregar avaliações.</div>';
  }
}

async function openThread(threadId) {
  currentThreadId = Number(threadId);
  if (!currentThreadId) return;
  chatHeader.textContent = 'Conversando';
  chatMessages.innerHTML = '<div class="rooms-message">Carregando mensagens…</div>';
  chatForm.hidden = false;
  await fetchMessagesOnce();
  startChatPolling();
}

async function fetchMessagesOnce() {
  if (!currentThreadId) return;
  try {
    const res = await fetch(`${API_BASE}/messages_list_messages.php?thread_id=${encodeURIComponent(currentThreadId)}`);
    const json = await parseJsonSafe(res);
    const list = json.success ? (json.data || []) : [];
    if (!list.length) { chatMessages.innerHTML = '<div class="rooms-message">Nenhuma mensagem.</div>'; return; }
    chatMessages.innerHTML = list.map(m => {
      const me = (m.sender_type || '') === 'advertiser';
      return `<div class="chat-bubble ${me ? 'me' : 'them'}"><div class="chat-text">${escapeHtml(m.body)}</div><div class="chat-time">${escapeHtml((m.created_at||'').toString().slice(0,16).replace('T',' '))}</div></div>`;
    }).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // marca como lida para o anunciante
    try { await fetch(`${API_BASE}/messages_mark_read.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ thread_id: currentThreadId, who: 'advertiser' }) }); } catch (_) {}
  } catch (e) {
    chatMessages.innerHTML = '<div class="rooms-message">Falha ao carregar mensagens.</div>';
  }
}

function startChatPolling() {
  stopChatPolling();
  chatPollTimer = setInterval(fetchMessagesOnce, 10000);
}
function stopChatPolling() { if (chatPollTimer) { clearInterval(chatPollTimer); chatPollTimer = null; } }

chatForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = (chatInput?.value || '').trim();
  if (!text || !currentThreadId) return;
  try {
    const res = await fetch(`${API_BASE}/messages_send.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ thread_id: currentThreadId, sender_type: 'advertiser', body: text }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao enviar.');
    chatInput.value = '';
    await fetchMessagesOnce();
  } catch (err) {
    alert(err.message || 'Erro ao enviar mensagem.');
  }
});

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// Eventos UI
loginForm?.addEventListener('submit', onLoginSubmit);
logoutBtn?.addEventListener('click', () => { advClient = null; myAdvertiser=null; myRooms=[]; myReservations=[]; setAuthVisible(true); });
refreshBtn?.addEventListener('click', () => { if (advClient) afterLogin(); });
navButtons.forEach(btn => btn.addEventListener('click', () => setActivePanel(btn.dataset.panel)));
savePayoutBtn?.addEventListener('click', async () => {
  payoutMessage.textContent = '';
  try {
    const payload = {
      advertiser_id: myAdvertiser?.id || null,
      owner_type: 'client',
      owner_id: advClient?.id,
      bank_name: bankNameInput?.value || '',
      account_type: accountTypeInput?.value || '',
      account_number: accountNumberInput?.value || '',
      pix_key: pixKeyInput?.value || ''
    };
    const res = await fetch(`${API_BASE}/advertiser_update_payment.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao salvar.');
    myAdvertiser = json.advertiser || myAdvertiser;
    payoutMessage.textContent = 'Dados de repasse salvos.';
  } catch (e) {
    payoutMessage.textContent = e.message || 'Erro ao salvar.';
  }
});

// Inicialização
setAuthVisible(true);

// Modal Nova sala
newRoomBtn?.addEventListener('click', () => { openRoomModal(); });
roomClose?.addEventListener('click', () => { closeRoomModal(); });
roomCancel?.addEventListener('click', () => { closeRoomModal(); });
roomModal?.addEventListener('click', (e)=> { if (e.target === roomModal) closeRoomModal(); });
roomForm?.addEventListener('submit', onRoomFormSubmit);

function openRoomModal(){
  if (!roomModal) return;
  roomMsg.textContent = '';
  [roomName, roomCap, roomCity, roomState, roomPrice, roomStatus, roomDesc].forEach(el => { if (el) el.value = el.tagName==='SELECT' ? el.value : el.value; });
  roomModal.classList.add('show');
  roomModal.setAttribute('aria-hidden','false');
}
function closeRoomModal(){ roomModal?.classList.remove('show'); roomModal?.setAttribute('aria-hidden','true'); }

async function onRoomFormSubmit(e){
  e.preventDefault(); roomMsg.textContent = '';
  if (!myAdvertiser?.id) { roomMsg.textContent = 'Sem anunciante vinculado.'; return; }
  const payload = {
    table: 'rooms',
    data: {
      name: (roomName?.value||'').trim(),
      capacity: roomCap?.value ? parseInt(roomCap.value,10) : null,
      city: (roomCity?.value||'').trim(),
      state: (roomState?.value||'').trim(),
      price: roomPrice?.value ? Number(roomPrice.value) : null,
      status: (roomStatus?.value||'ativo').trim(),
      description: (roomDesc?.value||'').trim(),
      advertiser_id: myAdvertiser.id,
      created_at: new Date().toISOString().slice(0,19).replace('T',' ')
    }
  };
  if (!payload.data.name) { roomMsg.textContent = 'Informe o nome da sala.'; return; }
  try {
    const res = await fetch(`${API_BASE}/apiadd.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao criar sala.');
    roomMsg.textContent = 'Sala criada com sucesso!';
    await loadRooms();
    closeRoomModal();
    setActivePanel('rooms');
  } catch (err) {
    roomMsg.textContent = err.message || 'Erro ao salvar.';
  }
}
