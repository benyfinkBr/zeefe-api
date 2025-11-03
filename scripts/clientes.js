const API_BASE = 'api';
const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '20:00';

let companiesCache = [];
let roomsCache = [];
let reservationsCache = [];
let activeClient = null;

const bodyEl = document.body;
const authSection = document.getElementById('authContainer');
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
const loginIdentifierInput = document.getElementById('portalLoginIdentifier');
const loginPasswordInput = document.getElementById('portalLoginPassword');
const rememberMeCheckbox = document.getElementById('portalRememberMe');

const clientPanels = document.getElementById('clientPanels');
const clientNameEl = document.getElementById('clientName');
const clientCompanyEl = document.getElementById('clientCompany');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const reservationsContainer = document.getElementById('reservationsContainer');

const profileForm = document.getElementById('profileForm');
const profileMessageEl = document.getElementById('profileMessage');
const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelProfileEditBtn = document.getElementById('cancelProfileEditBtn');
const profileInputs = {
  name: document.getElementById('profileNameInput'),
  login: document.getElementById('profileLoginInput'),
  email: document.getElementById('profileEmailInput'),
  cpf: document.getElementById('profileCpfInput'),
  phone: document.getElementById('profilePhoneInput'),
  whatsapp: document.getElementById('profileWhatsappInput'),
  company: document.getElementById('profileCompanyInput')
};

const prefersReducedMotionQuery = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

initialize();

async function initialize() {
  try {
    await Promise.all([carregarEmpresas(), carregarSalas()]);
  } catch (err) {
    console.error('Falha ao carregar dados iniciais:', err);
  }

  authViewButtons.forEach(btn => {
    btn.addEventListener('click', () => setAuthView(btn.dataset.view));
  });

  setAuthView('login');
  aplicarLoginMemorizado();

  portalLoginForm?.addEventListener('submit', onPortalLoginSubmit);
  portalRegisterForm?.addEventListener('submit', onPortalRegisterSubmit);
  portalRecoveryForm?.addEventListener('submit', onPortalRecoverySubmit);
  logoutBtn?.addEventListener('click', fazerLogout);
  refreshBtn?.addEventListener('click', () => {
    if (activeClient) {
      carregarReservas(activeClient.id);
    }
  });
  profileForm?.addEventListener('submit', onProfileSubmit);
  editProfileBtn?.addEventListener('click', () => setProfileEditing(true));
  cancelProfileEditBtn?.addEventListener('click', () => {
    renderProfile();
    setProfileEditing(false);
  });

  setBodyAuthState(false);
  showAuthOverlay();
}

function isReducedMotionPreferred() {
  return Boolean(prefersReducedMotionQuery && prefersReducedMotionQuery.matches);
}

function setBodyAuthState(isAuthenticated) {
  if (!bodyEl) return;
  bodyEl.classList.toggle('client-authenticated', Boolean(isAuthenticated));
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

function setAuthView(viewName) {
  Object.entries(authScreens).forEach(([key, screen]) => {
    if (screen) screen.hidden = key !== viewName;
  });
  authViewButtons.forEach(btn => {
    const target = btn.dataset.view;
    btn.classList.toggle('active', target === viewName);
  });
  if (authActions) authActions.hidden = viewName !== 'login';
  if (authMessage) authMessage.textContent = '';
  if (portalRegisterForm && viewName !== 'register') portalRegisterForm.reset();
  if (portalRecoveryForm && viewName !== 'recovery') portalRecoveryForm.reset();
  if (viewName !== 'login') {
    portalLoginForm?.reset();
  }
  if (viewName === 'login') {
    aplicarLoginMemorizado();
    if (loginPasswordInput) loginPasswordInput.value = '';
    if (loginIdentifierInput && !loginIdentifierInput.value) {
      loginIdentifierInput.focus();
    }
  }
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
    aplicarClienteAtivo(json.client);
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
    authMessage.textContent = json.message || 'Enviamos uma senha temporária para o e-mail cadastrado.';
    portalRecoveryForm?.reset();
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
  }
  if (clientNameEl) {
    clientNameEl.textContent = activeClient.name || activeClient.login || 'Cliente';
  }
  if (clientCompanyEl) {
    clientCompanyEl.textContent = obterNomeEmpresa(activeClient.company_id) || (activeClient.company_id ? 'Empresa não localizada' : 'Cliente pessoa física');
  }
  renderProfile();
  carregarReservas(activeClient.id);
  if (authMessage) authMessage.textContent = '';
}

function fazerLogout() {
  activeClient = null;
  reservationsCache = [];
  if (clientPanels) {
    clientPanels.hidden = true;
  }
  if (reservationsContainer) {
    reservationsContainer.innerHTML = '';
  }
  setAuthView('login');
  setBodyAuthState(false);
  showAuthOverlay();
  portalLoginForm?.reset();
  portalRegisterForm?.reset();
  portalRecoveryForm?.reset();
  if (authMessage) authMessage.textContent = '';
  aplicarLoginMemorizado();
  renderProfile();
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
  try {
    const storedLogin = localStorage.getItem('portalRememberLogin');
    if (storedLogin) {
      loginIdentifierInput.value = storedLogin;
      rememberMeCheckbox.checked = true;
    } else {
      loginIdentifierInput.value = '';
      rememberMeCheckbox.checked = false;
    }
  } catch (_) {
    rememberMeCheckbox.checked = false;
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
    companiesCache = [];
  }
  preencherEmpresasSelect();
}

function preencherEmpresasSelect() {
  if (!registerCompanySelect) return;
  registerCompanySelect.innerHTML = '<option value=\"\">-- Sem vínculo --</option>' +
    companiesCache
      .map(company => {
        const label = company.nome_fantasia || company.razao_social || `Empresa #${company.id}`;
        return `<option value=\"${company.id}\">${escapeHtml(label)}</option>`;
      })
      .join('');
}

async function carregarSalas() {
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=rooms`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar salas');
    roomsCache = json.data || [];
  } catch (err) {
    console.error(err);
    roomsCache = [];
  }
}

async function carregarReservas(clientId) {
  if (!reservationsContainer) return;
  try {
    reservationsContainer.innerHTML = '<div class=\"rooms-message\">Carregando reservas...</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=reservations&client_id=${clientId}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar reservas');
    reservationsCache = (json.data || []).map(item => ({
      ...item,
      visitors: Array.isArray(item.visitors) ? item.visitors.map(v => String(v)) : [],
      visitor_names: Array.isArray(item.visitor_names) ? item.visitor_names : []
    }));
    renderReservas(reservationsCache);
  } catch (err) {
    console.error(err);
    reservationsContainer.innerHTML = '<div class=\"rooms-message\">Não foi possível carregar as reservas no momento.</div>';
  }
}

function renderReservas(reservas) {
  if (!reservationsContainer) return;
  if (!reservas.length) {
    reservationsContainer.innerHTML = '<div class=\"rooms-message\">Nenhuma reserva cadastrada. As confirmações e ajustes são realizados pela equipe ZeefeAdmin.</div>';
    return;
  }

  const rows = reservas.map(reserva => {
    const statusNormalized = (reserva.status || '').toLowerCase();
    const room = buscarSala(reserva.room_id);
    const roomName = reserva.room_name || room?.name || `Sala #${reserva.room_id}`;
    const visitorNames = Array.isArray(reserva.visitor_names) && reserva.visitor_names.length
      ? reserva.visitor_names.map(name => `<span class=\"table-chip\">${escapeHtml(name)}</span>`).join(' ')
      : '<span class=\"table-chip muted\">Sem visitantes</span>';
    const timeRange = formatTimeRange(reserva.time_start, reserva.time_end);

    return `
      <tr>
        <td>${formatDate(reserva.date)}</td>
        <td>${escapeHtml(roomName)}</td>
        <td>
          <span class=\"status-badge ${statusClass(reserva.status)}\">${statusLabel(reserva.status)}</span>
          ${renderReservationFlow(statusNormalized)}
        </td>
        <td>${escapeHtml(timeRange)}</td>
        <td>${visitorNames}</td>
        <td>${escapeHtml(reserva.title || '--')}</td>
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
          <th>Visitantes</th>
          <th>Título</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderProfile() {
  if (!profileInputs.name) return;
  if (!activeClient) {
    Object.values(profileInputs).forEach(input => {
      if (input) input.value = '';
    });
    if (profileMessageEl) profileMessageEl.textContent = '';
    setProfileEditing(false);
    return;
  }
  profileInputs.name.value = activeClient.name || '';
  profileInputs.login.value = activeClient.login || '';
  profileInputs.email.value = activeClient.email || '';
  profileInputs.cpf.value = formatCPF(activeClient.cpf) || '';
  profileInputs.phone.value = formatPhone(activeClient.phone) || '';
  profileInputs.whatsapp.value = formatPhone(activeClient.whatsapp) || '';
  profileInputs.company.value = obterNomeEmpresa(activeClient.company_id) || (activeClient.company_id ? 'Empresa não localizada' : 'Cliente pessoa física');
  if (profileMessageEl) profileMessageEl.textContent = '';
  setProfileEditing(false);
}

function setProfileEditing(isEditing) {
  if (!profileForm) return;
  profileForm.classList.toggle('editing', Boolean(isEditing));
  Object.entries(profileInputs).forEach(([, input]) => {
    if (!input) return;
    const immutable = input.dataset.immutable === 'true';
    const readOnly = immutable || !isEditing;
    input.readOnly = readOnly;
    input.classList.toggle('input-readonly', readOnly);
  });
  if (editProfileBtn) editProfileBtn.hidden = Boolean(isEditing);
  if (saveProfileBtn) saveProfileBtn.hidden = !isEditing;
  if (cancelProfileEditBtn) cancelProfileEditBtn.hidden = !isEditing;
  if (isEditing && profileInputs.name) {
    profileInputs.name.focus();
  }
}

async function onProfileSubmit(event) {
  event.preventDefault();
  if (!activeClient || !profileInputs.name || !profileInputs.login) return;

  const name = profileInputs.name.value.trim();
  const login = profileInputs.login.value.trim();
  const phone = somenteDigitos(profileInputs.phone?.value);
  const whatsapp = somenteDigitos(profileInputs.whatsapp?.value);

  if (!name || !login) {
    if (profileMessageEl) profileMessageEl.textContent = 'Preencha nome e login.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/client_update_profile.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activeClient.id,
        name,
        login,
        phone,
        whatsapp
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar cadastro.');
    activeClient = { ...activeClient, ...json.client };
    if (clientNameEl) {
      clientNameEl.textContent = activeClient.name || activeClient.login || 'Cliente';
    }
    if (clientCompanyEl) {
      clientCompanyEl.textContent = obterNomeEmpresa(activeClient.company_id) || (activeClient.company_id ? 'Empresa não localizada' : 'Cliente pessoa física');
    }
    renderProfile();
    if (profileMessageEl) profileMessageEl.textContent = json.message || 'Dados atualizados.';
  } catch (err) {
    console.error(err);
    if (profileMessageEl) profileMessageEl.textContent = err.message || 'Não foi possível atualizar os dados.';
  }
}

function buscarSala(id) {
  return roomsCache.find(room => String(room.id) === String(id));
}

function obterNomeEmpresa(companyId) {
  if (!companyId) return '';
  const empresa = companiesCache.find(c => String(c.id) === String(companyId));
  if (!empresa) return '';
  return empresa.nome_fantasia || empresa.razao_social || '';
}

function statusClass(status) {
  const map = {
    ativo: 'status-ativo',
    pendente: 'status-pendente',
    confirmada: 'status-confirmada',
    cancelada: 'status-cancelada',
    concluida: 'status-concluida',
    manutencao: 'status-manutencao',
    pagamento_pendente: 'status-pendente',
    pagamento_confirmado: 'status-confirmada',
    negada: 'status-cancelada',
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
    pagamento_pendente: 'Pagamento pendente',
    pagamento_confirmado: 'Pagamento confirmado',
    negada: 'Negada',
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
    <div class=\"reservation-flow\">
      ${RESERVATION_FLOW_STAGES.map((stage, index) => `<span class=\"reservation-flow__stage flow-${states[index]}\">${stage.label}</span>`).join('')}
    </div>
  `;
}

function resolveReservationFlowStates(status) {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'cancelada':
    case 'negada':
      return ['stopped', 'stopped', 'stopped', 'stopped'];
    case 'confirmada':
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

function formatTimeRange(start, end) {
  const inicio = formatTime(start) || DEFAULT_START_TIME;
  const fim = formatTime(end) || DEFAULT_END_TIME;
  return `${inicio} - ${fim}`;
}

function formatTime(value) {
  if (!value) return '';
  const parts = value.split(':');
  if (!parts.length) return value;
  const hour = parts[0]?.padStart(2, '0') ?? '';
  const minute = parts[1]?.padStart(2, '0') ?? '00';
  return `${hour}:${minute}`;
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
