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
const advShowRegister = document.getElementById('advShowRegister');
const advShowRecovery = document.getElementById('advShowRecovery');
const advRegisterScreen = document.getElementById('advRegister');
const advRecoveryScreen = document.getElementById('advRecovery');
const advLoginScreen = document.getElementById('authLogin');
const advBackToLogin1 = document.getElementById('advBackToLogin1');
const advBackToLogin2 = document.getElementById('advBackToLogin2');
const advRegisterForm = document.getElementById('advRegisterForm');
const advRegName = document.getElementById('advRegName');
const advRegEmail = document.getElementById('advRegEmail');
const advRegPassword = document.getElementById('advRegPassword');
const advRegPasswordConfirm = document.getElementById('advRegPasswordConfirm');
const advRegisterMessage = document.getElementById('advRegisterMessage');
const advRecoveryForm = document.getElementById('advRecoveryForm');
const advRecEmail = document.getElementById('advRecEmail');
const advRecoveryMessage = document.getElementById('advRecoveryMessage');
const loginIdInput = document.getElementById('advLoginIdentifier');
const loginPwInput = document.getElementById('advLoginPassword');
const rememberMe = document.getElementById('advRememberMe');
const authMsg = document.getElementById('advAuthMessage');

const panelsWrap = document.getElementById('advPanels');
// Navegação lateral + atalhos no header (mesmo callback)
const navButtons = Array.from(document.querySelectorAll('.portal-nav-links button, .quick-actions button[data-panel]'));
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
const advChatModal = document.getElementById('advChatModal');
const advChatClose = document.getElementById('advChatClose');
const openAdvChatBtn = document.getElementById('openAdvChatBtn');
// Reservation details modal
const advResModal = document.getElementById('advReservationModal');
const advResContent = document.getElementById('advResContent');
const advResMessage = document.getElementById('advResMessage');
const advResClose = document.getElementById('advResClose');
const advResConfirm = document.getElementById('advResConfirm');
const advResDeny = document.getElementById('advResDeny');
const advResCancel = document.getElementById('advResCancel');
const advResOpenChat = document.getElementById('advResOpenChat');
let advResCurrentId = null;
// Room details modal
const advRoomDetModal = document.getElementById('advRoomDetailsModal');
const advRoomDetClose = document.getElementById('advRoomDetClose');
const advRoomDetCancel = document.getElementById('advRoomDetCancel');
const advRoomDetForm = document.getElementById('advRoomDetailsForm');
const advRoomDetId = document.getElementById('advRoomDetId');
const advRoomDetName = document.getElementById('advRoomDetName');
const advRoomDetRate = document.getElementById('advRoomDetRate');
const advRoomDetStatus = document.getElementById('advRoomDetStatus');
const advRoomDetCityUf = document.getElementById('advRoomDetCityUf');
const advRoomDetMsg = document.getElementById('advRoomDetMsg');
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
// extra admin-like fields
const dailyRate = document.getElementById('dailyRate');
const facilitatedAccess = document.getElementById('facilitatedAccess');
const portariaInteligente = document.getElementById('portariaInteligente');
const streetInput = document.getElementById('street');
const complementInput = document.getElementById('complement');
const cepInput = document.getElementById('cep');
const respNome = document.getElementById('responsavelNome');
const respFone = document.getElementById('responsavelTelefone');
const respEmail = document.getElementById('responsavelEmail');
const portariaFone = document.getElementById('portariaTelefone');
const portariaEmail = document.getElementById('portariaEmail');
const locationInternal = document.getElementById('locationInternal');
const maintenanceStart = document.getElementById('maintenanceStart');
const maintenanceEnd = document.getElementById('maintenanceEnd');
const deactivatedFrom = document.getElementById('deactivatedFrom');
// payout form
const bankCodeInput = document.getElementById('bankCode');
const bankNameInput = document.getElementById('bankName');
const accountTypeInput = document.getElementById('accountType');
const agencyNumberInput = document.getElementById('agencyNumber');
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
    const res = await fetch(`${API_BASE}/advertiser_login.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ login: id, password: pw }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha no login');
    advClient = json.advertiser; // anunciante autenticado
    await afterLogin();
  } catch (err) {
    authMsg.textContent = err.message || 'Erro ao autenticar.';
  }
}

async function afterLogin() {
  setAuthVisible(false);
  if (panelsWrap) panelsWrap.hidden = false;
  // Preenche direto a partir do anunciante autenticado
  myAdvertiser = advClient || null;
  if (myAdvertiser?.display_name) {
    advDisplay.textContent = myAdvertiser.display_name;
  } else {
    advDisplay.textContent = 'Anunciante';
  }
  advOwner.textContent = myAdvertiser?.email || '';
  // Preenche payout se existir
  bankCodeInput && (bankCodeInput.value = myAdvertiser?.bank_code || '');
  bankNameInput && (bankNameInput.value = myAdvertiser?.bank_name || '');
  accountTypeInput && (accountTypeInput.value = myAdvertiser?.account_type || '');
  agencyNumberInput && (agencyNumberInput.value = myAdvertiser?.agency_number || '');
  accountNumberInput && (accountNumberInput.value = myAdvertiser?.account_number || '');
  pixKeyInput && (pixKeyInput.value = myAdvertiser?.pix_key || '');

  await Promise.all([loadRooms(), loadReservations(), loadFinance(), loadOverview(), loadReviews(), loadThreads()]);
  setActivePanel('overview');
}

async function loadAdvertiser() {
  // Mantido apenas por compatibilidade; já atribuímos myAdvertiser em afterLogin.
  return;
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
    // Eventos dos botões de sala
    roomsContainer.querySelectorAll('button[data-room][data-act="details"]').forEach(btn => btn.addEventListener('click', () => openRoomDetailsModal(btn.getAttribute('data-room'))));
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
        <td><button class="btn btn-secondary btn-sm" data-res="${r.id}" data-act="open">Ações</button></td>
      </tr>
    `).join('');
    resContainer.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Data</th><th>Sala</th><th>Status</th><th>Pagamento</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:16px">Nenhuma reserva.</td></tr>'}</tbody>
      </table>`;
    resContainer.querySelectorAll('button[data-res][data-act="open"]').forEach(btn => btn.addEventListener('click', () => openReservationModal(btn.getAttribute('data-res'))));
  } catch (e) {
    resContainer.innerHTML = '<div class="rooms-message">Falha ao carregar reservas.</div>';
  }
}

// Finance helpers
function parseDateOnly(s) { if (!s) return null; const d = new Date(s.replace(' ','T')); return isNaN(d) ? null : d; }
function formatMoney(n){ return 'R$ ' + Number(n||0).toFixed(2); }
function exportCSV(rows){
  const header = ['#','Tipo','Valor','Status','Disponível em','Criado em'];
  const data = rows.map(l => [l.id, l.type, Number(l.amount||0).toFixed(2), l.status, (l.available_at||''), (l.created_at||'')]);
  const csv = [header].concat(data).map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'financeiro.csv'; a.click(); URL.revokeObjectURL(url);
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

    // Apply filters by created_at
    const fromEl = document.getElementById('advFinFrom');
    const toEl = document.getElementById('advFinTo');
    const fromDate = fromEl?.value ? new Date(fromEl.value+'T00:00:00') : null;
    const toDate = toEl?.value ? new Date(toEl.value+'T23:59:59') : null;
    let filtered = rows;
    if (fromDate || toDate) {
      filtered = rows.filter(r => {
        const created = parseDateOnly(r.created_at) || parseDateOnly(r.available_at) || null;
        if (!created) return false;
        if (fromDate && created < fromDate) return false;
        if (toDate && created > toDate) return false;
        return true;
      });
    }

    // Totals by status
    const sum = { pendente:0, disponivel:0, pago:0, bloqueado:0 };
    filtered.forEach(l => { const st = String(l.status||'').toLowerCase(); if (sum.hasOwnProperty(st)) sum[st] += Number(l.amount||0); });

    const body = filtered.map(l => `
      <tr>
        <td>${escapeHtml(l.id)}</td>
        <td>${escapeHtml(l.type)}</td>
        <td>${formatMoney(l.amount)}</td>
        <td>${escapeHtml(l.status)}</td>
        <td>${escapeHtml(l.available_at || '')}</td>
      </tr>
    `).join('');

    const summary = `
      <div class="finance-summary" style="display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 12px">
        <span class="chip">Pendente: ${formatMoney(sum.pendente)}</span>
        <span class="chip">Disponível: ${formatMoney(sum.disponivel)}</span>
        <span class="chip">Pago: ${formatMoney(sum.pago)}</span>
      </div>
      <div style="display:flex; gap:10px; justify-content:flex-end; margin-bottom:6px">
        <button type="button" class="btn btn-secondary btn-sm" id="advFinExport">Exportar CSV</button>
      </div>`;

    finContainer.innerHTML = summary + `
      <table>
        <thead><tr><th>#</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Disponível em</th></tr></thead>
        <tbody>${body || '<tr><td colspan="5" style="text-align:center;padding:16px">Sem lançamentos.</td></tr>'}</tbody>
      </table>`;

    document.getElementById('advFinExport')?.addEventListener('click', ()=> exportCSV(filtered));

    // Hook presets
    document.querySelectorAll('.adv-finance-preset').forEach(btn => {
      btn.onclick = () => {
        const days = Number(btn.dataset.range||'0');
        const to = new Date();
        const from = new Date(); from.setDate(to.getDate() - days);
        if (fromEl) fromEl.value = from.toISOString().slice(0,10);
        if (toEl) toEl.value = to.toISOString().slice(0,10);
        loadFinance();
      };
    });
    document.getElementById('advFinApply')?.addEventListener('click', ()=> loadFinance());

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
      bank_code: bankCodeInput?.value || '',
      bank_name: bankNameInput?.value || '',
      account_type: accountTypeInput?.value || '',
      agency_number: agencyNumberInput?.value || '',
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
document.getElementById('advQuickRegisterBtn')?.addEventListener('click', ()=>{
  // manda para a tela de registro direto
  document.getElementById('authLogin').hidden = true;
  document.getElementById('advRegister').hidden = false;
  setAuthVisible(true);
});
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
      description: (roomDesc?.value||'').trim(),
      capacity: roomCap?.value ? parseInt(roomCap.value,10) : null,
      daily_rate: dailyRate?.value ? Number(dailyRate.value) : null,
      facilitated_access: facilitatedAccess?.value || null,
      portaria_inteligente: portariaInteligente?.value || null,
      street: (streetInput?.value||'').trim(),
      complement: (complementInput?.value||'').trim(),
      cep: (cepInput?.value||'').trim(),
      state: (roomState?.value||'').trim(),
      city: (roomCity?.value||'').trim(),
      responsavel_nome: (respNome?.value||'').trim(),
      responsavel_telefone: (respFone?.value||'').trim(),
      responsavel_email: (respEmail?.value||'').trim(),
      portaria_telefone: (portariaFone?.value||'').trim(),
      portaria_email: (portariaEmail?.value||'').trim(),
      location: (locationInternal?.value||'').trim(),
      status: (roomStatus?.value||'ativo').trim(),
      maintenance_start: (maintenanceStart?.value||'') || null,
      maintenance_end: (maintenanceEnd?.value||'') || null,
      deactivated_from: (deactivatedFrom?.value||'') || null,
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
// Drawer chat
openAdvChatBtn?.addEventListener('click', openAdvChatDrawer);
document.querySelector('.portal-nav-links button[data-panel="messages"]')?.addEventListener('click', openAdvChatDrawer);
advChatClose?.addEventListener('click', closeAdvChatDrawer);
advChatModal?.addEventListener('click', (e)=> { if (e.target === advChatModal) closeAdvChatDrawer(); });

function openAdvChatDrawer(){
  advChatModal?.classList.add('show');
  advChatModal?.setAttribute('aria-hidden','false');
  loadThreads();
}
function closeAdvChatDrawer(){ stopChatPolling(); advChatModal?.classList.remove('show'); advChatModal?.setAttribute('aria-hidden','true'); }
// View toggles
advShowRegister?.addEventListener('click', () => { advLoginScreen.hidden = true; advRecoveryScreen.hidden = true; advRegisterScreen.hidden = false; authMsg.textContent=''; avaliarSenhaAdv(); });
advShowRecovery?.addEventListener('click', () => { advLoginScreen.hidden = true; advRegisterScreen.hidden = true; advRecoveryScreen.hidden = false; authMsg.textContent=''; });
advBackToLogin1?.addEventListener('click', () => { advLoginScreen.hidden = false; advRegisterScreen.hidden = true; });
advBackToLogin2?.addEventListener('click', () => { advLoginScreen.hidden = false; advRecoveryScreen.hidden = true; });

advRegisterForm?.addEventListener('submit', async (e) => {
  e.preventDefault(); advRegisterMessage.textContent='';
  const name = (advRegName?.value||'').trim();
  const email = (advRegEmail?.value||'').trim();
  const cpfDigits = advRegCpf ? (advRegCpf.value||'').replace(/\D/g,'') : '';
  const phoneDigits = advRegPhone ? (advRegPhone.value||'').replace(/\D/g,'') : '';
  if (advRegCpf) advRegCpf.value = formatCPFAdv(cpfDigits);
  if (advRegPhone) advRegPhone.value = formatPhoneAdv(phoneDigits);
  const pw = advRegPassword?.value || '';
  const pw2 = advRegPasswordConfirm?.value || '';
  if (!name || !email || !pw || !pw2) { advRegisterMessage.textContent='Preencha todos os campos obrigatórios.'; return; }
  if (cpfDigits && !cpfValidoAdv(cpfDigits)) { advRegisterMessage.textContent='CPF inválido.'; atualizarFeedbackCPFAdv(cpfDigits, true); return; }
  if (!validarSenhaForteAdv(pw)) { advRegisterMessage.textContent='A senha deve ter letras, números e símbolos (mín. 8).'; return; }
  if (pw !== pw2) { advRegisterMessage.textContent='As senhas não conferem.'; return; }
  try {
    const publicName = (document.getElementById('advRegPublicName')?.value || '').trim() || name;
    const res = await fetch(`${API_BASE}/advertiser_register.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ full_name: name, display_name: publicName, login_email: email, login_cpf: cpfDigits || null, phone: phoneDigits || null, password: pw }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao criar conta.');
    advRegisterMessage.textContent = 'Cadastro realizado! Enviamos um e‑mail para confirmação.';
    setTimeout(()=>{ advLoginScreen.hidden=false; advRegisterScreen.hidden=true; }, 2000);
  } catch (err) { advRegisterMessage.textContent = err.message || 'Erro ao criar conta.'; }
});

// Validadores/formatadores (escopo anunciante)
function formatCPFAdv(value){ const d=(value||'').toString().replace(/\D/g,'').slice(0,11); if(!d) return ''; let f=d; f=f.replace(/^(\d{3})(\d)/,'$1.$2'); f=f.replace(/^(\d{3}\.\d{3})(\d)/,'$1.$2'); f=f.replace(/^(\d{3}\.\d{3}\.\d{3})(\d{1,2})$/,'$1-$2'); return f; }
function formatPhoneAdv(value){ const d=(value||'').toString().replace(/\D/g,''); if(!d) return ''; if(d.length<=2) return `(${d}`; const ddd=d.slice(0,2); const isMob=d.length>10; const mid=isMob?d.slice(2,7):d.slice(2,6); const end=isMob?d.slice(7):d.slice(6); return `(${ddd}) ${mid}${end?'-'+end:''}`; }
function cpfValidoAdv(cpf){ const digits=(cpf||'').replace(/\D/g,''); if(digits.length!==11) return false; if(/^(\d)\1{10}$/.test(digits)) return false; let sum=0; for(let i=0;i<9;i++){ sum+=Number(digits[i])*(10-i);} let check=(sum*10)%11; if(check===10) check=0; if(check!==Number(digits[9])) return false; sum=0; for(let i=0;i<10;i++){ sum+=Number(digits[i])*(11-i);} check=(sum*10)%11; if(check===10) check=0; return check===Number(digits[10]); }
function setIndicatorAdv(el,state,text){ if(!el) return; el.textContent=text; el.classList.remove('state-ok','state-warning','state-error','state-neutral'); el.classList.add(`state-${state}`); }
function validarSenhaForteAdv(s){ if(typeof s!=='string'||s.length<8) return false; return /[A-Za-z]/.test(s)&&/\d/.test(s)&&/[^A-Za-z0-9]/.test(s); }
function avaliarSenhaAdv(){ const s=advRegPassword?.value||''; const c=advRegPasswordConfirm?.value||''; let st='neutral',lbl='aguardando'; if(s){ const ok=validarSenhaForteAdv(s); st= ok?'ok':'error'; lbl= ok?'forte':'fraca'; } setIndicatorAdv(advPwStrength,st,`Força da senha: ${lbl}`); let ms='neutral',ml='aguardando'; if(s||c){ if(!c){ ms='warning'; ml='pendente'; } else if(s===c){ ms='ok'; ml='senhas combinam'; } else { ms='error'; ml='senhas diferentes'; } } setIndicatorAdv(advPwMatch,ms,`Confirmação: ${ml}`); if(advPasswordHint){ const invalid=(s && st!=='ok')||(c && s!==c); advPasswordHint.classList.toggle('invalid', invalid); } }
function atualizarFeedbackCPFAdv(cpfDigits, forceInvalid=false){ if(!advCpfHint) return; const d=(cpfDigits||'').toString().replace(/\D/g,''); if(!d){ setIndicatorAdv(advCpfHint,'neutral','Informe os 11 dígitos do CPF.'); return; } if(d.length<11){ setIndicatorAdv(advCpfHint,'warning',`Faltam ${11-d.length} dígitos.`); return; } if(!cpfValidoAdv(d)||forceInvalid){ setIndicatorAdv(advCpfHint,'error','CPF inválido.'); return; } setIndicatorAdv(advCpfHint,'ok','CPF válido.'); }
advRegCpf?.addEventListener('input', ()=> { const d=(advRegCpf.value||'').replace(/\D/g,'').slice(0,11); advRegCpf.value = formatCPFAdv(d); atualizarFeedbackCPFAdv(d); });
advRegPassword?.addEventListener('input', avaliarSenhaAdv);
advRegPasswordConfirm?.addEventListener('input', avaliarSenhaAdv);

// ===== Reservation Modal logic =====
function openReservationModal(id){
  advResCurrentId = Number(id);
  if (!advResCurrentId){ return; }
  const r = (myReservations||[]).find(x => String(x.id) === String(id));
  if (!r){ advResContent.innerHTML = '<div class="rooms-message">Reserva não encontrada.</div>'; }
  else {
    const room = (myRooms||[]).find(rr => String(rr.id)===String(r.room_id));
    advResContent.innerHTML = `
      <table>
        <tbody>
          <tr><th style="text-align:left;width:160px">Reserva</th><td>#${escapeHtml(r.id)}</td></tr>
          <tr><th style="text-align:left">Data</th><td>${escapeHtml(r.date || '')}</td></tr>
          <tr><th style="text-align:left">Sala</th><td>${escapeHtml(room?.name || ('Sala #'+r.room_id))}</td></tr>
          <tr><th style="text-align:left">Status</th><td>${escapeHtml(r.status||'')}</td></tr>
          <tr><th style="text-align:left">Pagamento</th><td>${escapeHtml(r.payment_status||'')}</td></tr>
          <tr><th style="text-align:left">Título</th><td>${escapeHtml(r.title||'')}</td></tr>
          <tr><th style="text-align:left">Observações</th><td>${escapeHtml(r.description||'')}</td></tr>
        </tbody>
      </table>`;
  }
  advResMessage.textContent='';
  advResModal?.classList.add('show'); advResModal?.setAttribute('aria-hidden','false');
}
function closeReservationModal(){ advResModal?.classList.remove('show'); advResModal?.setAttribute('aria-hidden','true'); advResCurrentId=null; }
advResClose?.addEventListener('click', closeReservationModal);
advResCancel?.addEventListener('click', () => updateReservationStatus('cancel'));
advResDeny?.addEventListener('click', () => updateReservationStatus('deny'));
advResConfirm?.addEventListener('click', () => updateReservationStatus('confirm'));
advResOpenChat?.addEventListener('click', () => { closeReservationModal(); openAdvChatDrawer(); });

async function updateReservationStatus(action){
  if (!advResCurrentId) return;
  advResMessage.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/update_reservation_status.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: advResCurrentId, action }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao atualizar.');
    advResMessage.textContent = json.message || 'Atualizado.';
    await loadReservations();
  } catch (e) {
    advResMessage.textContent = e.message || 'Erro ao atualizar.';
  }
}

// ===== Room Details Modal =====
function openRoomDetailsModal(roomId){
  const r = (myRooms||[]).find(x => String(x.id)===String(roomId));
  if (!r) return;
  advRoomDetId.value = r.id;
  advRoomDetName.value = r.name || '';
  advRoomDetRate.value = r.daily_rate || '';
  advRoomDetStatus.value = (r.status||'ativo');
  advRoomDetCityUf.value = `${r.city||''}${r.state? ' - '+r.state:''}`;
  advRoomDetMsg.textContent = '';
  advRoomDetModal?.classList.add('show'); advRoomDetModal?.setAttribute('aria-hidden','false');
}
function closeRoomDetailsModal(){ advRoomDetModal?.classList.remove('show'); advRoomDetModal?.setAttribute('aria-hidden','true'); }
advRoomDetClose?.addEventListener('click', closeRoomDetailsModal);
advRoomDetCancel?.addEventListener('click', closeRoomDetailsModal);
advRoomDetModal?.addEventListener('click', (e)=> { if (e.target === advRoomDetModal) closeRoomDetailsModal(); });
advResModal?.addEventListener('click', (e)=> { if (e.target === advResModal) closeReservationModal(); });

advRoomDetForm?.addEventListener('submit', async (e) => {
  e.preventDefault(); advRoomDetMsg.textContent='';
  const id = Number(advRoomDetId.value||0);
  const data = { id, name: advRoomDetName.value.trim(), daily_rate: advRoomDetRate.value ? Number(advRoomDetRate.value) : null, status: advRoomDetStatus.value };
  try {
    const res = await fetch(`${API_BASE}/apiupdate.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ table:'rooms', data }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao salvar.');
    advRoomDetMsg.textContent = 'Sala atualizada.';
    await loadRooms();
    setTimeout(closeRoomDetailsModal, 600);
  } catch (err) {
    advRoomDetMsg.textContent = err.message || 'Erro ao salvar.';
  }
});

advRecoveryForm?.addEventListener('submit', async (e) => {
  e.preventDefault(); advRecoveryMessage.textContent='';
  const email = (advRecEmail?.value||'').trim();
  if (!email) { advRecoveryMessage.textContent='Informe o e‑mail.'; return; }
  try {
    const res = await fetch(`${API_BASE}/advertiser_reset_password.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao enviar e‑mail.');
    advRecoveryMessage.textContent = json.message || 'Enviamos um e‑mail com instruções.';
  } catch (err) { advRecoveryMessage.textContent = err.message || 'Erro ao enviar.'; }
});
