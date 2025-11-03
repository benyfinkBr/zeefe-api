const API_BASE = 'api';
let roomsCache = [];
let companiesCache = [];
let currentReservations = [];
let currentVisitors = [];
let activeClient = null;
let bookingVisitorIds = [];
const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '20:00';
const authSection = document.getElementById('authContainer');
const portalRoot = document.querySelector('.client-portal');
const bodyEl = document.body;
const prefersReducedMotionQuery = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;
const authActions = document.getElementById('authActions');
const authScreens = {
  login: document.getElementById('authLogin'),
  register: document.getElementById('authRegister'),
  recovery: document.getElementById('authRecovery')
};
const authViewButtons = Array.from(document.querySelectorAll('button[data-view]'));
const portalLoginForm = document.getElementById('portalLoginForm');
const portalRegisterForm = document.getElementById('portalRegisterForm');
const portalRecoveryForm = document.getElementById('portalRecoveryForm');
const authMessage = document.getElementById('authMessage');
const registerCompanySelect = document.getElementById('registerCompany');
const clientPanels = document.getElementById('clientPanels');
const clientNameEl = document.getElementById('clientName');
const clientCompanyEl = document.getElementById('clientCompany');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');
const bookingForm = document.getElementById('reservationBookForm');
const visitorForm = document.getElementById('visitorForm');
const bookingFormTitle = document.getElementById('bookingFormTitle');
const visitorFormTitle = document.getElementById('visitorFormTitle');
const cancelReservationEditBtn = document.getElementById('cancelReservationEdit');
const cancelVisitorEditBtn = document.getElementById('cancelVisitorEdit');
const reservationsContainer = document.getElementById('reservationsContainer');
const visitorsContainer = document.getElementById('visitorsContainer');
const newReservationBtn = document.getElementById('newReservationBtn');
const newVisitorBtn = document.getElementById('newVisitorBtn');
const reservationIdInput = bookingForm?.querySelector('input[name="id"]');
const visitorIdInput = visitorForm.querySelector('input[name="id"]');
const bookingVisitorSelector = document.getElementById('bookingVisitorSelector');
const bookingMessage = document.getElementById('bookingMessage');
const openVisitorsPanelBtn = document.getElementById('openVisitorsPanel');
const loginIdentifierInput = document.getElementById('portalLoginIdentifier');
const loginPasswordInput = document.getElementById('portalLoginPassword');
const rememberMeCheckbox = document.getElementById('portalRememberMe');
const portalNavButtons = Array.from(document.querySelectorAll('.portal-nav [data-panel]'));
const portalSections = {
  book: document.getElementById('panel-book'),
  reservations: document.getElementById('panel-reservations'),
  visitors: document.getElementById('panel-visitors'),
  profile: document.getElementById('panel-profile')
};
const profileNameEl = document.getElementById('profileName');
const profileEmailEl = document.getElementById('profileEmail');
const profileLoginEl = document.getElementById('profileLogin');
const profileCpfEl = document.getElementById('profileCpf');
const profileCompanyEl = document.getElementById('profileCompany');

function isReducedMotionPreferred() {
  return Boolean(prefersReducedMotionQuery && typeof prefersReducedMotionQuery.matches === 'boolean' && prefersReducedMotionQuery.matches);
}

function setBodyAuthState(isAuthenticated) {
  if (!bodyEl) return;
  bodyEl.classList.toggle('client-authenticated', isAuthenticated);
  bodyEl.classList.toggle('client-logged-out', !isAuthenticated);
}

function hideAuthOverlay() {
  if (!authSection) return;
  const finalize = () => {
    authSection.classList.remove('fade-out');
    authSection.classList.add('is-hidden');
    authSection.hidden = true;
    authSection.removeEventListener('animationend', finalize);
  };
  authSection.classList.remove('fade-in', 'is-hidden');
  authSection.hidden = false;
  authSection.setAttribute('aria-hidden', 'true');
  if (isReducedMotionPreferred()) {
    finalize();
    return;
  }
  authSection.classList.add('fade-out');
  authSection.addEventListener('animationend', finalize, { once: true });
}

function showAuthOverlay() {
  if (!authSection) return;
  const finalize = () => {
    authSection.classList.remove('fade-in');
    authSection.removeEventListener('animationend', finalize);
  };
  authSection.classList.remove('fade-out', 'is-hidden');
  authSection.hidden = false;
  authSection.removeAttribute('aria-hidden');
  if (isReducedMotionPreferred()) {
    finalize();
    return;
  }
  authSection.classList.add('fade-in');
  authSection.addEventListener('animationend', finalize, { once: true });
}

initialize();

async function initialize() {
  setBodyAuthState(false);
  if (authSection) {
    authSection.classList.remove('fade-in', 'fade-out', 'is-hidden');
    authSection.hidden = false;
    authSection.removeAttribute('aria-hidden');
  }
  await Promise.all([carregarSalas(), carregarEmpresas()]);

  authViewButtons.forEach(btn => {
    btn.addEventListener('click', () => setAuthView(btn.dataset.view));
  });
  setAuthView('login');
  aplicarLoginMemorizado();

  if (portalLoginForm) {
    portalLoginForm.addEventListener('submit', onPortalLoginSubmit);
  }
  if (portalRegisterForm) {
    portalRegisterForm.addEventListener('submit', onPortalRegisterSubmit);
  }
  if (portalRecoveryForm) {
    portalRecoveryForm.addEventListener('submit', onPortalRecoverySubmit);
  }

  logoutBtn.addEventListener('click', fazerLogout);
  refreshBtn.addEventListener('click', atualizarPainel);
  if (bookingForm) {
    bookingForm.addEventListener('submit', onBookingSubmit);
    const startInput = bookingForm.querySelector('input[name="time_start"]');
    const endInput = bookingForm.querySelector('input[name="time_end"]');
    [startInput, endInput].forEach(input => {
      if (!input) return;
      input.readOnly = true;
      input.classList.add('input-readonly');
    });
    if (startInput && !startInput.value) startInput.value = DEFAULT_START_TIME;
    if (endInput && !endInput.value) endInput.value = DEFAULT_END_TIME;
  }
  visitorForm.addEventListener('submit', onVisitorSubmit);
  cancelReservationEditBtn.addEventListener('click', resetBookingForm);
  cancelVisitorEditBtn.addEventListener('click', resetVisitorForm);
  newReservationBtn.addEventListener('click', () => {
    resetBookingForm();
    setActivePanel('book');
    bookingForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  newVisitorBtn.addEventListener('click', () => {
    resetVisitorForm();
    visitorForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  if (openVisitorsPanelBtn) {
    openVisitorsPanelBtn.addEventListener('click', () => {
      setActivePanel('visitors');
      visitorForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  renderVisitorChecklist();

  portalNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.panel;
      setActivePanel(panel);
      if (!activeClient) return;
      if (panel === 'reservations') {
        carregarReservas(activeClient.id);
      } else if (panel === 'visitors') {
        carregarVisitantes(activeClient.id);
      } else if (panel === 'profile') {
        renderProfile();
      }
    });
  });

  setActivePanel('book');
}

function setAuthView(viewName) {
  Object.entries(authScreens).forEach(([key, screen]) => {
    if (screen) screen.hidden = key !== viewName;
  });
  authViewButtons.forEach(btn => {
    const isPrimary = btn.closest('#authActions');
    btn.classList.toggle('active', isPrimary && btn.dataset.view === viewName);
  });
  if (portalLoginForm) portalLoginForm.hidden = viewName !== 'login';
  if (portalRegisterForm) portalRegisterForm.hidden = viewName !== 'register';
  if (portalRecoveryForm) portalRecoveryForm.hidden = viewName !== 'recovery';
  if (authActions) authActions.hidden = viewName !== 'login';
  if (authMessage) authMessage.textContent = '';
  if (viewName !== 'register' && portalRegisterForm) portalRegisterForm.reset();
  if (viewName !== 'recovery' && portalRecoveryForm) portalRecoveryForm.reset();
  if (viewName === 'login') {
    if (loginPasswordInput) loginPasswordInput.value = '';
    if (!authSection || !authSection.hidden) {
      if (loginIdentifierInput) {
        loginIdentifierInput.focus();
      } else if (loginPasswordInput) {
        loginPasswordInput.focus();
      }
    }
  }
}

function setActivePanel(panelName = 'reservations') {
  const target = portalSections[panelName] ? panelName : 'book';
  portalNavButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === target);
  });
  Object.entries(portalSections).forEach(([key, section]) => {
    if (!section) return;
    section.hidden = key !== target;
  });
  if (target === 'book') {
    renderVisitorChecklist();
  }
}

async function carregarEmpresas() {
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=companies`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar empresas');
    companiesCache = json.data || [];
  } catch (err) {
    console.error(err);
  }
  preencherEmpresasSelect();
  renderProfile();
}

async function carregarSalas() {
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=rooms`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar salas');
    roomsCache = json.data || [];
    preencherSalasSelect();
  } catch (err) {
    console.error(err);
  }
}

function preencherSalasSelect() {
  const select = bookingForm?.querySelector('select[name="room_id"]');
  if (!select) return;
  select.innerHTML = '<option value="">-- Selecione --</option>' +
    roomsCache
      .filter(r => ['ativo', 'manutencao'].includes((r.status || '').toLowerCase()))
      .map(r => `<option value="${r.id}">${escapeHtml(r.name || `Sala #${r.id}`)}</option>`)
      .join('');
}

function preencherEmpresasSelect() {
  if (!registerCompanySelect) return;
  registerCompanySelect.innerHTML = '<option value="">-- Sem vínculo --</option>' +
    companiesCache
      .map(company => {
        const label = company.nome_fantasia || company.razao_social || `Empresa #${company.id}`;
        return `<option value="${company.id}">${escapeHtml(label)}</option>`;
      })
      .join('');
}

async function onPortalLoginSubmit(event) {
  event.preventDefault();
  if (!authMessage) return;
  authMessage.textContent = '';
  const identifier = loginIdentifierInput?.value.trim() || '';
  const password = loginPasswordInput?.value || '';
  if (!identifier || !password) {
    authMessage.textContent = 'Informe login e senha.';
    return;
  }
  const lembrar = rememberMeCheckbox?.checked;
  try {
    const res = await fetch(`${API_BASE}/client_portal_login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: identifier, password })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível autenticar.');
    registrarPreferenciaLogin(lembrar, identifier);
    portalLoginForm.reset();
    aplicarLoginMemorizado();
    aplicarClienteAtivo(json.client);
    authMessage.textContent = 'Login realizado com sucesso.';
  } catch (err) {
    authMessage.textContent = err.message || 'Erro ao autenticar.';
  }
}

async function onPortalRegisterSubmit(event) {
  event.preventDefault();
  if (!authMessage) return;
  authMessage.textContent = '';
  const payload = {
    name: document.getElementById('registerName')?.value.trim(),
    email: document.getElementById('registerEmail')?.value.trim(),
    login: document.getElementById('registerLogin')?.value.trim(),
    cpf: document.getElementById('registerCpf')?.value.trim(),
    phone: document.getElementById('registerPhone')?.value.trim(),
    password: document.getElementById('registerPassword')?.value || '',
    password_confirm: document.getElementById('registerPasswordConfirm')?.value || '',
    company_id: registerCompanySelect?.value || ''
  };

  if (!payload.name || !payload.email || !payload.login || !payload.password) {
    authMessage.textContent = 'Preencha todos os campos obrigatórios.';
    return;
  }
  if (payload.password !== payload.password_confirm) {
    authMessage.textContent = 'As senhas não conferem.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/client_register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível criar a conta.');
    portalRegisterForm.reset();
    aplicarClienteAtivo(json.client);
    authMessage.textContent = 'Conta criada com sucesso! Você já está logado.';
  } catch (err) {
    authMessage.textContent = err.message || 'Erro ao criar conta.';
  }
}

async function onPortalRecoverySubmit(event) {
  event.preventDefault();
  if (!authMessage) return;
  authMessage.textContent = '';
  const loginValue = document.getElementById('recoveryLogin')?.value.trim();
  if (!loginValue) {
    authMessage.textContent = 'Informe login ou e-mail.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/client_reset_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginValue })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível redefinir a senha.');
    portalRecoveryForm.reset();
    authMessage.textContent = json.message || 'Enviamos uma senha temporária para o e-mail cadastrado.';
  } catch (err) {
    authMessage.textContent = err.message || 'Erro ao solicitar redefinição.';
  }
}

function aplicarClienteAtivo(cliente) {
  if (!cliente) return;
  activeClient = cliente;
  setBodyAuthState(true);
  hideAuthOverlay();
  if (clientPanels) {
    clientPanels.hidden = false;
    clientPanels.classList.add('show');
    clientPanels.setAttribute('aria-hidden', 'false');
  }
  if (portalRoot) {
    portalRoot.classList.add('portal-active');
  }
  if (clientNameEl) {
    clientNameEl.textContent = activeClient.name || activeClient.login || 'Cliente';
  }
  const companyName = obterNomeEmpresa(activeClient.company_id);
  if (clientCompanyEl) {
    clientCompanyEl.textContent = companyName || (activeClient.company_id ? 'Empresa não localizada' : 'Cliente pessoa física');
  }
  renderProfile();
  resetBookingForm();
  setActivePanel('book');
  if (authMessage) authMessage.textContent = '';
  atualizarPainel();
}

function obterNomeEmpresa(companyId) {
  if (!companyId) return '';
  const empresa = companiesCache.find(c => String(c.id) === String(companyId));
  if (!empresa) return '';
  return empresa.nome_fantasia || empresa.razao_social || '';
}

function renderProfile() {
  if (!profileNameEl) return;
  if (!activeClient) {
    profileNameEl.textContent = '--';
    if (profileEmailEl) profileEmailEl.textContent = '--';
    if (profileLoginEl) profileLoginEl.textContent = '--';
    if (profileCpfEl) profileCpfEl.textContent = '--';
    if (profileCompanyEl) profileCompanyEl.textContent = '--';
    return;
  }
  profileNameEl.textContent = activeClient.name || '--';
  if (profileEmailEl) profileEmailEl.textContent = activeClient.email || '--';
  if (profileLoginEl) profileLoginEl.textContent = activeClient.login || '--';
  if (profileCpfEl) profileCpfEl.textContent = formatCPF(activeClient.cpf) || '--';
  if (profileCompanyEl) {
    profileCompanyEl.textContent = obterNomeEmpresa(activeClient.company_id) || (activeClient.company_id ? 'Empresa não localizada' : 'Cliente pessoa física');
  }
}

async function enviarConvites(reservationId, visitorIds) {
  const payload = visitorIds
    .map(id => Number(id))
    .filter(id => !Number.isNaN(id) && id > 0);
  if (!payload.length) return;
  try {
    await Promise.all(payload.map(visitorId => fetch(`${API_BASE}/send_visitor_invite.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reservation_id: reservationId, visitor_id: visitorId })
    }).then(res => res.json()).then(json => {
      if (!json.success) throw new Error(json.error || 'Falha ao enviar convite');
      return json;
    })));
  } catch (err) {
    console.warn('Convite para visitantes falhou:', err.message || err);
    throw err;
  }
}

async function enviarLinkPagamento(reservationId) {
  if (!reservationId) {
    throw new Error('Reserva inválida.');
  }
  const res = await fetch(`${API_BASE}/send_payment_link.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reservation_id: reservationId })
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Falha ao enviar link de pagamento.');
  }
  return json;
}

function fazerLogout() {
  activeClient = null;
  if (clientPanels) {
    clientPanels.classList.remove('show');
    clientPanels.hidden = true;
    clientPanels.setAttribute('aria-hidden', 'true');
  }
  setBodyAuthState(false);
  setAuthView('login');
  setActivePanel('book');
  showAuthOverlay();
  if (portalRoot) {
    portalRoot.classList.remove('portal-active');
  }
  if (portalLoginForm) portalLoginForm.reset();
  if (portalRegisterForm) portalRegisterForm.reset();
  if (portalRecoveryForm) portalRecoveryForm.reset();
  if (authMessage) authMessage.textContent = '';
  aplicarLoginMemorizado();
  renderProfile();
  resetBookingForm();
  resetVisitorForm();
  reservationsContainer.innerHTML = '';
  visitorsContainer.innerHTML = '';
}

function registrarPreferenciaLogin(lembrar, login) {
  try {
    if (lembrar && login) {
      localStorage.setItem('portalRememberLogin', login);
    } else {
      localStorage.removeItem('portalRememberLogin');
    }
  } catch (_) {
    /* ignore storage errors */
  }
}

function aplicarLoginMemorizado() {
  if (!loginIdentifierInput || !rememberMeCheckbox) return;
  if (loginPasswordInput) loginPasswordInput.value = '';
  try {
    const storedLogin = localStorage.getItem('portalRememberLogin');
    if (storedLogin) {
      loginIdentifierInput.value = storedLogin;
      rememberMeCheckbox.checked = true;
    } else {
      rememberMeCheckbox.checked = false;
    }
  } catch (_) {
    rememberMeCheckbox.checked = false;
  }
}

function atualizarPainel() {
  if (!activeClient) return;
  carregarReservas(activeClient.id);
  carregarVisitantes(activeClient.id);
}

async function carregarReservas(clientId) {
  try {
    reservationsContainer.innerHTML = '<div class="rooms-message">Carregando reservas...</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=reservations&client_id=${clientId}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar reservas');
    currentReservations = (json.data || []).map(item => ({
      ...item,
      visitors: Array.isArray(item.visitors) ? item.visitors.map(v => String(v)) : [],
      visitor_names: Array.isArray(item.visitor_names) ? item.visitor_names : []
    }));
    renderReservas(currentReservations);
  } catch (err) {
    console.error(err);
    reservationsContainer.innerHTML = '<div class="rooms-message">Erro ao carregar reservas.</div>';
  }
}

function renderReservas(reservas) {
  if (!reservas.length) {
    reservationsContainer.innerHTML = '<div class="rooms-message">Nenhuma reserva cadastrada.</div>';
    return;
  }
  const rows = reservas.map(r => {
    const statusNormalized = (r.status || '').toLowerCase();
    const room = buscarSala(r.room_id);
    const roomName = r.room_name || room?.name || `Sala #${r.room_id}`;
    const visitorNames = Array.isArray(r.visitor_names) && r.visitor_names.length
      ? r.visitor_names.map(name => `<span class="table-chip">${escapeHtml(name)}</span>`).join(' ')
      : '<span class="table-chip muted">Sem visitantes</span>';
    const showCancel = ['pendente', 'confirmada'].includes(statusNormalized) && podeCancelar(r);
    const showInvite = Array.isArray(r.visitors) && r.visitors.length;
    const showPayment = ['pendente', 'confirmada'].includes(statusNormalized);
    const timeStart = escapeHtml(r.time_start || DEFAULT_START_TIME);
    const timeEnd = escapeHtml(r.time_end || DEFAULT_END_TIME);
    return `
      <tr data-id="${r.id}">
        <td>${formatDate(r.date)}</td>
        <td>${escapeHtml(roomName)}</td>
        <td>
          <span class="status-badge ${statusClass(r.status)}">${statusLabel(r.status)}</span>
          ${renderReservationFlow(statusNormalized)}
        </td>
        <td>${timeStart} - ${timeEnd}</td>
        <td>${escapeHtml(r.title || '--')}</td>
        <td>${visitorNames}</td>
        <td>
          <div class="table-actions">
            ${showCancel ? `<button type="button" data-action="cancel" data-id="${r.id}">Cancelar</button>` : ''}
            ${showPayment ? `<button type="button" data-action="payment" data-id="${r.id}">Enviar pagamento</button>` : ''}
            ${showInvite ? `<button type="button" data-action="invite" data-id="${r.id}">Enviar convites</button>` : ''}
            <button type="button" data-action="edit" data-id="${r.id}">Editar</button>
            <button type="button" data-action="delete" data-id="${r.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  reservationsContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Sala</th>
          <th>Status</th>
          <th>Horário</th>
          <th>Título</th>
          <th>Visitantes</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  reservationsContainer.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => tratarAcaoReserva(btn.dataset.id, btn.dataset.action));
  });
}

async function tratarAcaoReserva(id, action) {
  if (!id) return;
  const reserva = currentReservations.find(r => String(r.id) === String(id));
  if (action === 'edit') {
    if (reserva) preencherFormReserva(reserva);
    return;
  }
  if (action === 'delete') {
    if (!confirm('Deseja excluir esta reserva?')) return;
    await excluirRegistro('reservations', id);
    atualizarPainel();
    return;
  }
  if (action === 'invite') {
    if (!reserva || !(reserva.visitors || []).length) {
      alert('Nenhum visitante vinculado a esta reserva.');
      return;
    }
    enviarConvites(Number(id), reserva.visitors).then(() => {
      alert('Convites enviados.');
    }).catch(() => {
      alert('Não foi possível enviar todos os convites.');
    });
    return;
  }

  if (action === 'cancel') {
    if (!reserva) return;
    if (!podeCancelar(reserva)) {
      alert('Cancelamento permitido apenas com 24 horas de antecedência.');
      return;
    }
    if (!confirm('Deseja cancelar esta reserva?')) return;
  }
  if (action === 'payment') {
    enviarLinkPagamento(id).then(() => {
      alert('Link de pagamento enviado por e-mail.');
    }).catch(err => {
      console.error(err);
      alert(err.message || 'Não foi possível enviar o link de pagamento.');
    });
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/update_reservation_status.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, action })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar status');
    atualizarPainel();
  } catch (err) {
    console.error(err);
    alert('Não foi possível atualizar o status.');
  }
}

function preencherFormReserva(item) {
  if (!bookingForm) return;
  setActivePanel('book');
  bookingFormTitle.textContent = 'Editar reserva';
  reservationIdInput.value = item.id || '';
  bookingForm.room_id.value = item.room_id || '';
  bookingForm.date.value = item.date || '';
  const startInput = bookingForm.querySelector('input[name="time_start"]');
  const endInput = bookingForm.querySelector('input[name="time_end"]');
  if (startInput) startInput.value = item.time_start || DEFAULT_START_TIME;
  if (endInput) endInput.value = item.time_end || DEFAULT_END_TIME;
  bookingForm.title.value = item.title || '';
  bookingForm.description.value = item.description || '';
  bookingVisitorIds = (item.visitors || []).map(String);
  renderVisitorChecklist(bookingVisitorIds);
  cancelReservationEditBtn.hidden = false;
  bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (bookingMessage) bookingMessage.textContent = '';
}

async function onBookingSubmit(event) {
  event.preventDefault();
  if (!activeClient) return;
  bookingMessage.textContent = '';
  const formData = new FormData(bookingForm);
  const record = Object.fromEntries(formData.entries());
  record.client_id = activeClient.id;
  if (!record.id) delete record.id;
  if (!record.date) {
    bookingMessage.textContent = 'Informe a data da reserva.';
    return;
  }
  if (!record.room_id) {
    bookingMessage.textContent = 'Selecione a sala.';
    return;
  }
  record.time_start = record.time_start || DEFAULT_START_TIME;
  record.time_end = record.time_end || DEFAULT_END_TIME;
  record.visitor_ids = bookingVisitorIds;
  try {
    const res = await fetch(`${API_BASE}/apisave.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ table: 'reservations', record })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao salvar reserva');
    const reservationId = record.id || json.insertId;
    let inviteWarn = false;
    if (formData.get('send_invites') && reservationId && bookingVisitorIds.length) {
      try {
        await enviarConvites(reservationId, bookingVisitorIds);
      } catch (inviteError) {
        inviteWarn = true;
      }
    }
    const baseMessage = record.id ? 'Reserva atualizada com sucesso.' : 'Reserva criada com sucesso.';
    resetBookingForm(true);
    bookingMessage.textContent = inviteWarn ? `${baseMessage} Porém, não foi possível enviar todos os convites.` : baseMessage;
    atualizarPainel();
  } catch (err) {
    console.error(err);
    bookingMessage.textContent = err.message || 'Não foi possível salvar a reserva.';
  }
}

function resetBookingForm(preserveMessage = false) {
  bookingForm?.reset();
  if (reservationIdInput) reservationIdInput.value = '';
  bookingFormTitle.textContent = 'Reservar uma sala';
  cancelReservationEditBtn.hidden = true;
  if (bookingForm) {
    const startInput = bookingForm.querySelector('input[name="time_start"]');
    const endInput = bookingForm.querySelector('input[name="time_end"]');
    if (startInput) startInput.value = DEFAULT_START_TIME;
    if (endInput) endInput.value = DEFAULT_END_TIME;
  }
  bookingVisitorIds = [];
  renderVisitorChecklist(bookingVisitorIds);
  if (bookingMessage && !preserveMessage) bookingMessage.textContent = '';
}

async function carregarVisitantes(clientId) {
  try {
    visitorsContainer.innerHTML = '<div class="rooms-message">Carregando visitantes...</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=visitors`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar visitantes');
    currentVisitors = (json.data || []).filter(v => String(v.client_id) === String(clientId));
    renderVisitantes(currentVisitors);
    renderVisitorChecklist();
  } catch (err) {
    console.error(err);
    visitorsContainer.innerHTML = '<div class="rooms-message">Erro ao carregar visitantes.</div>';
  }
}

function renderVisitantes(visitantes) {
  if (!visitantes.length) {
    visitorsContainer.innerHTML = '<div class="rooms-message">Nenhum visitante cadastrado.</div>';
    return;
  }
  const rows = visitantes.map(v => `
    <tr data-id="${v.id}">
      <td>${escapeHtml(v.name || '--')}</td>
      <td>${escapeHtml(formatCPF(v.cpf) || '--')}</td>
      <td>${escapeHtml(v.email || '--')}</td>
      <td>${escapeHtml(formatPhone(v.phone) || '--')}</td>
      <td>${escapeHtml(formatPhone(v.whatsapp) || '--')}</td>
      <td><span class="status-badge ${statusClass(v.status)}">${statusLabel(v.status)}</span></td>
      <td>
        <div class="table-actions">
          <button type="button" data-action="edit" data-id="${v.id}">Editar</button>
          ${v.email ? `<button type="button" data-action="invite" data-id="${v.id}">Enviar convite</button>` : ''}
          <button type="button" data-action="delete" data-id="${v.id}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
  visitorsContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>CPF</th>
          <th>E-mail</th>
          <th>Telefone</th>
          <th>WhatsApp</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  visitorsContainer.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => tratarAcaoVisitante(btn.dataset.id, btn.dataset.action));
  });
}

function renderVisitorChecklist(selectedIds = bookingVisitorIds) {
  if (!bookingVisitorSelector) return;
  const selectedSet = new Set((selectedIds || []).map(String));
  const available = new Set(currentVisitors.map(v => String(v.id)));
  Array.from(selectedSet).forEach(id => {
    if (!available.has(id)) selectedSet.delete(id);
  });
  bookingVisitorIds = Array.from(selectedSet);

  bookingVisitorSelector.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'visitor-multiselect-header';
  title.innerHTML = `Selecione os visitantes <span>${selectedSet.size} selecionado(s)</span>`;
  bookingVisitorSelector.appendChild(title);

  if (currentVisitors.length) {
    const help = document.createElement('p');
    help.className = 'visitor-multiselect-help';
    help.textContent = 'Marque os visitantes que participarão desta reserva.';
    bookingVisitorSelector.appendChild(help);
  }

  const list = document.createElement('div');
  list.className = 'visitor-multiselect-list';

  if (!currentVisitors.length) {
    list.innerHTML = '<div class="rooms-message">Nenhum visitante cadastrado. Cadastre visitantes na aba Visitantes.</div>';
  } else {
    currentVisitors.forEach(visitor => {
      const id = String(visitor.id);
      const label = document.createElement('label');
      label.className = 'visitor-multiselect-item';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = id;
      checkbox.checked = selectedSet.has(id);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) selectedSet.add(id);
        else selectedSet.delete(id);
        bookingVisitorIds = Array.from(selectedSet);
        title.innerHTML = `Selecione os visitantes <span>${selectedSet.size} selecionado(s)</span>`;
      });
      const name = document.createElement('div');
      name.className = 'visitor-multiselect-info';
      name.innerHTML = `<strong>${escapeHtml(visitor.name || '--')}</strong>${visitor.email ? `<span>${escapeHtml(visitor.email)}</span>` : ''}`;
      label.append(checkbox, name);
      list.appendChild(label);
    });
  }

  bookingVisitorSelector.appendChild(list);
}

function tratarAcaoVisitante(id, action) {
  if (action === 'edit') {
    const visitante = currentVisitors.find(v => String(v.id) === String(id));
    if (visitante) preencherFormVisitante(visitante);
    return;
  }
  if (action === 'invite') {
    enviarConvites(0, [id]).then(() => alert('Convite enviado.')).catch(() => alert('Falha ao enviar convite.'));
    return;
  }
  if (action === 'delete') {
    if (!confirm('Deseja excluir este visitante?')) return;
    excluirRegistro('visitors', id).then(() => atualizarPainel());
  }
}

function preencherFormVisitante(visitante) {
  visitorIdInput.value = visitante.id || '';
  visitorFormTitle.textContent = 'Editar Visitante';
  visitorForm.name.value = visitante.name || '';
  visitorForm.cpf.value = formatCPF(visitante.cpf) || '';
  visitorForm.rg.value = visitante.rg || '';
  visitorForm.email.value = visitante.email || '';
  visitorForm.phone.value = formatPhone(visitante.phone) || '';
  visitorForm.whatsapp.value = formatPhone(visitante.whatsapp) || '';
  visitorForm.status.value = visitante.status || 'ativo';
  cancelVisitorEditBtn.hidden = false;
  visitorForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function onVisitorSubmit(event) {
  event.preventDefault();
  if (!activeClient) return;
  const formData = new FormData(visitorForm);
  const record = Object.fromEntries(formData.entries());
  record.client_id = activeClient.id;
  if (activeClient.company_id) {
    record.company_id = activeClient.company_id;
  }
  record.cpf = somenteDigitos(record.cpf);
  record.phone = somenteDigitos(record.phone);
  record.whatsapp = somenteDigitos(record.whatsapp);
  if (!record.id) delete record.id;
  try {
    const res = await fetch(`${API_BASE}/apisave.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ table: 'visitors', record })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao salvar visitante');
    resetVisitorForm();
    atualizarPainel();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Não foi possível salvar o visitante.');
  }
}

function resetVisitorForm() {
  visitorForm.reset();
  visitorIdInput.value = '';
  visitorFormTitle.textContent = 'Novo Visitante';
  cancelVisitorEditBtn.hidden = true;
}

async function excluirRegistro(table, id) {
  try {
    const res = await fetch(`${API_BASE}/apidelete.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ table, id })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao excluir');
  } catch (err) {
    console.error(err);
    alert('Não foi possível concluir a operação.');
  }
}

function buscarSala(id) {
  return roomsCache.find(r => String(r.id) === String(id));
}

function podeCancelar(reserva) {
  if (!reserva || !reserva.date) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataReserva = new Date(reserva.date);
  return dataReserva.getTime() - hoje.getTime() >= 24 * 60 * 60 * 1000;
}

function statusClass(status) {
  const map = {
    ativo: 'status-ativo',
    pendente: 'status-pendente',
    confirmada: 'status-confirmada',
    cancelada: 'status-cancelada',
    concluida: 'status-concluida',
    manutencao: 'status-manutencao',
    inativo: 'status-cancelada',
    desativada: 'status-cancelada'
  };
  return map[(status || '').toLowerCase()] || '';
}

function statusLabel(status) {
  const map = {
    ativo: 'Ativo',
    pendente: 'Pendente',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    concluida: 'Concluída',
    manutencao: 'Manutenção',
    inativo: 'Inativo',
    desativada: 'Desativada'
  };
  return map[(status || '').toLowerCase()] || status || '--';
}

const RESERVATION_FLOW_STAGES = [
  { key: 'pre', label: 'Pré-reserva' },
  { key: 'reserva', label: 'Reserva' },
  { key: 'pagamento', label: 'Pagamento' },
  { key: 'realizado', label: 'Realizado' }
];

function renderReservationFlow(status) {
  const states = resolveReservationFlowStates(status);
  return `
    <div class="reservation-flow">
      ${RESERVATION_FLOW_STAGES.map((stage, index) => `<span class="reservation-flow__stage flow-${states[index]}">${stage.label}</span>`).join('')}
    </div>
  `;
}

function resolveReservationFlowStates(status) {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'cancelada':
      return ['stopped', 'stopped', 'stopped', 'stopped'];
    case 'confirmada':
      return ['success', 'success', 'pending', 'upcoming'];
    case 'pagamento_pendente':
      return ['success', 'success', 'pending', 'upcoming'];
    case 'pagamento_confirmado':
    case 'em_andamento':
      return ['success', 'success', 'success', 'pending'];
    case 'concluida':
      return ['success', 'success', 'success', 'success'];
    case 'pendente':
    default:
      return ['pending', 'upcoming', 'upcoming', 'upcoming'];
  }
}

function formatDate(value) {
  if (!value) return '--';
  const [y, m, d] = value.split('-');
  return `${d}/${m}/${y}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function somenteDigitos(value) {
  return (value || '').toString().replace(/\D/g, '');
}

function formatCPF(value) {
  const digits = somenteDigitos(value);
  if (digits.length !== 11) return value || '';
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value) {
  const digits = somenteDigitos(value);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const isMobile = digits.length > 10;
  const mid = isMobile ? digits.slice(2, 7) : digits.slice(2, 6);
  const end = isMobile ? digits.slice(7) : digits.slice(6);
  return `(${ddd}) ${mid}${end ? '-' + end : ''}`;
}
