const API_BASE = 'api';
const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '20:00';

let roomsCache = [];
let companiesCache = [];
let currentReservations = [];
let currentVisitors = [];
let activeClient = null;
let bookingVisitorIds = [];
let allReservationsCache = [];
let bookingStepIndex = 0;
let bookingCurrentMonth = new Date();
const bookingToday = new Date();
const bookingTodayISO = toISODate(bookingToday);

const bodyEl = document.body;
const prefersReducedMotionQuery = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

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
const passwordHint = document.getElementById('passwordHint');
const registerPasswordInput = document.getElementById('registerPassword');
const registerPasswordConfirmInput = document.getElementById('registerPasswordConfirm');
const registerEmailInput = document.getElementById('registerEmail');
const registerCpfInput = document.getElementById('registerCpf');
const registerPhoneInput = document.getElementById('registerPhone');
const passwordIndicators = document.getElementById('passwordIndicators');
const passwordStrengthIndicator = document.querySelector('[data-password-strength]');
const passwordMatchIndicator = document.querySelector('[data-password-match]');
const cpfHintEl = document.getElementById('cpfHint');
const loginIdentifierInput = document.getElementById('portalLoginIdentifier');
const loginPasswordInput = document.getElementById('portalLoginPassword');
const rememberMeCheckbox = document.getElementById('portalRememberMe');
// Auth scope toggle on login card
const authScopePFBtn = document.getElementById('authScopePFBtn');
const authScopeCompanyBtn = document.getElementById('authScopeCompanyBtn');
let desiredScope = 'pf';

const clientPanels = document.getElementById('clientPanels');
const clientNameEl = document.getElementById('clientName');
const clientCompanyEl = document.getElementById('clientCompany');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');

const bookingForm = document.getElementById('reservationBookForm');
const bookingFormTitle = document.getElementById('bookingFormTitle');
const bookingMessage = document.getElementById('bookingMessage');
const reservationIdInput = bookingForm?.querySelector('input[name="id"]');
const bookingDateInput = document.getElementById('bookingDateInput');
const bookingRoomHiddenInput = document.getElementById('bookingRoomId');
const bookingVisitorSelector = document.getElementById('bookingVisitorSelector');
const cancelReservationEditBtn = document.getElementById('cancelReservationEdit');
const newReservationBtn = document.getElementById('newReservationBtn');
const openVisitorsPanelBtn = document.getElementById('openVisitorsPanel');
const bookingRoomOptions = document.getElementById('bookingRoomOptions');
const bookingRoomFeedback = document.getElementById('bookingRoomFeedback');
const bookingStepperItems = Array.from(document.querySelectorAll('.booking-stepper-item'));
const bookingStepSections = Array.from(document.querySelectorAll('.booking-step'));
const bookingPrevBtn = document.getElementById('bookingPrevBtn');
const bookingNextBtn = document.getElementById('bookingNextBtn');
const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');
const bookingCalendarGrid = document.getElementById('bookingCalendarGrid');
const bookingCalendarLabel = document.getElementById('bookingCalendarLabel');
const bookingPrevMonthBtn = document.getElementById('bookingPrevMonth');
const bookingNextMonthBtn = document.getElementById('bookingNextMonth');
const bookingCompanyToggle = document.getElementById('bookingCompanyToggle');
const companyBookingRow = document.getElementById('companyBookingRow');
// Filtros removidos do portal para simplificação
const bookingRoomSearchInput = null;
const bookingCityFilterInput = null;
const bookingStateFilterInput = null;
const bookingAmenityFilters = null;
const bookingClearFiltersBtn = null;
let bookingSelectedAmenities = new Set();
const bookingTitleInput = bookingForm?.querySelector('input[name="title"]');
const bookingDescriptionInput = bookingForm?.querySelector('textarea[name="description"]');

const reservationsContainer = document.getElementById('reservationsContainer');
// Modal de ações da reserva
const reservationActionsModal = document.getElementById('reservationActionsModal');
const reservationActionsClose = document.getElementById('reservationActionsClose');
const reservationActionsTitle = document.getElementById('reservationActionsTitle');
const reservationActionsMeta = document.getElementById('reservationActionsMeta');
const reservationActionsButtons = document.getElementById('reservationActionsButtons');

const visitorForm = document.getElementById('visitorForm');
const visitorFormTitle = document.getElementById('visitorFormTitle');
const visitorIdInput = visitorForm?.querySelector('input[name="id"]');
const cancelVisitorEditBtn = document.getElementById('cancelVisitorEdit');
const newVisitorBtn = document.getElementById('newVisitorBtn');
const visitorsContainer = document.getElementById('visitorsContainer');
const visitorFormWrapper = document.getElementById('visitorFormWrapper');

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

// Modal de edição de perfil
const profileEditModal = document.getElementById('profileEditModal');
const profileEditClose = document.getElementById('profileEditClose');
const profileEditCancel = document.getElementById('profileEditCancel');
const profileEditForm = document.getElementById('profileEditForm');
const profileEditMessage = document.getElementById('profileEditMessage');
const editName = document.getElementById('editName');
const editLogin = document.getElementById('editLogin');
const editEmail = document.getElementById('editEmail');
const editCpf = document.getElementById('editCpf');
const editPhone = document.getElementById('editPhone');
const editWhatsapp = document.getElementById('editWhatsapp');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const newPasswordConfirmInput = document.getElementById('newPasswordConfirm');
const pwdStrengthIndicator = document.getElementById('pwdStrengthIndicator');
const pwdMatchIndicator = document.getElementById('pwdMatchIndicator');

const portalNavButtons = Array.from(document.querySelectorAll('.portal-nav [data-panel]'));
const portalSections = {
  book: document.getElementById('panel-book'),
  reservations: document.getElementById('panel-reservations'),
  visitors: document.getElementById('panel-visitors'),
  profile: document.getElementById('panel-profile'),
  company: document.getElementById('panel-company')
};
const companyTabButton = document.getElementById('companyTab');
// Company sub-tabs
const companyTabs = Array.from(document.querySelectorAll('.company-tab'));
const companyPanels = {
  overview: document.getElementById('companyTab-overview'),
  users: document.getElementById('companyTab-users'),
  reservations: document.getElementById('companyTab-reservations'),
  finance: document.getElementById('companyTab-finance')
};
const companyInviteCpf = document.getElementById('companyInviteCpf');
const companyInviteRole = document.getElementById('companyInviteRole');
const companyInviteBtn = document.getElementById('companyInviteBtn');
const companyCsvInput = document.getElementById('companyCsvInput');
const companyXlsxInput = document.getElementById('companyXlsxInput');
const companyInviteEmail = document.getElementById('companyInviteEmail');
const companyResendBtn = document.getElementById('companyResendBtn');
const quickActionsContainer = document.querySelector('#companyTab-overview .quick-actions');
// Finance controls
const finFromInput = document.getElementById('finFrom');
const finToInput = document.getElementById('finTo');
const finApplyBtn = document.getElementById('finApply');
const finPresetButtons = Array.from(document.querySelectorAll('.finance-preset'));
// Scope switch (PF vs Empresa) at header
let currentScope = 'pf';
const scopePFBtn = document.getElementById('scopePFBtn');
const scopeCompanyBtn = document.getElementById('scopeCompanyBtn');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
  initialize();
}

async function initialize() {
  try {
    await Promise.all([carregarSalas(), carregarEmpresas(), carregarComodidades()]);
    await carregarReservasGlobais();
  } catch (err) {
    console.error('Falha ao carregar dados iniciais:', err);
  }

  authViewButtons.forEach(btn => btn.addEventListener('click', () => setAuthView(btn.dataset.view)));
  setAuthView('login');

  aplicarLoginMemorizado();
  portalLoginForm?.addEventListener('submit', onPortalLoginSubmit);
  portalRegisterForm?.addEventListener('submit', onPortalRegisterSubmit);
  portalRecoveryForm?.addEventListener('submit', onPortalRecoverySubmit);

  registerPasswordInput?.addEventListener('input', () => avaliarForcaSenha(registerPasswordInput.value, registerPasswordConfirmInput?.value || ''));
  registerPasswordConfirmInput?.addEventListener('input', () => avaliarForcaSenha(registerPasswordInput?.value || '', registerPasswordConfirmInput.value));
  registerCpfInput?.addEventListener('input', onCpfInputChange);
  registerCpfInput?.addEventListener('blur', () => atualizarFeedbackCPF(somenteDigitos(registerCpfInput?.value)));
  registerPhoneInput?.addEventListener('input', () => {
    const digits = somenteDigitos(registerPhoneInput.value).slice(0, 11);
    registerPhoneInput.value = formatPhone(digits);
  });

  // Auth scope buttons
  authScopePFBtn?.addEventListener('click', () => setAuthScope('pf'));
  authScopeCompanyBtn?.addEventListener('click', () => setAuthScope('company'));

  // Debounce helper para evitar gravações frequentes
  function debounce(fn, delay = 600) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  // Grava cookie apenas quando o usuário marca/desmarca a opção
  rememberMeCheckbox?.addEventListener('change', () => {
    const value = loginIdentifierInput?.value.trim() || '';
    if (rememberMeCheckbox.checked && value) {
      registrarPreferenciaLogin(true, value);
    } else {
      registrarPreferenciaLogin(false, '');
    }
  });

  // No input, apenas persiste em localStorage com debounce (sem tocar em cookie)
  const saveLoginDebounced = debounce((val) => {
    try {
      if (val) localStorage.setItem('portalRememberLogin', val);
    } catch (_) {}
  }, 600);

  loginIdentifierInput?.addEventListener('input', () => {
    const val = loginIdentifierInput.value.trim();
    if (val) saveLoginDebounced(val);
  });

  if (passwordIndicators) {
    avaliarForcaSenha('', '');
  }
  if (registerCpfInput) {
    atualizarFeedbackCPF(somenteDigitos(registerCpfInput.value));
  }

  logoutBtn?.addEventListener('click', fazerLogout);
  refreshBtn?.addEventListener('click', () => {
    if (activeClient) atualizarPainel();
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', onBookingSubmit);
    const startInput = bookingForm.querySelector('input[name="time_start"]');
    const endInput = bookingForm.querySelector('input[name="time_end"]');
    [startInput, endInput].forEach(input => {
      if (!input) return;
      input.value = input.name === 'time_start' ? DEFAULT_START_TIME : DEFAULT_END_TIME;
    });
  }
  bookingDateInput?.addEventListener('change', onBookingDateChange);
  bookingDateInput?.addEventListener('input', onBookingDateChange);
  bookingPrevBtn?.addEventListener('click', () => changeBookingStep(-1));
  bookingNextBtn?.addEventListener('click', () => {
    if (validateBookingStep(bookingStepIndex)) {
      changeBookingStep(1);
    }
  });
  bookingPrevMonthBtn?.addEventListener('click', () => changeCalendarMonth(-1));
  bookingNextMonthBtn?.addEventListener('click', () => changeCalendarMonth(1));
  bookingRoomSearchInput?.addEventListener('input', () => renderRoomOptions(bookingDateInput?.value || ''));
  // Sem filtros no portal
  bookingTitleInput?.addEventListener('input', onBookingDetailsChange);
  bookingDescriptionInput?.addEventListener('input', onBookingDetailsChange);

  cancelReservationEditBtn?.addEventListener('click', () => resetBookingForm());
  newReservationBtn?.addEventListener('click', () => {
    resetBookingForm();
    setActivePanel('book');
    bookingForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  openVisitorsPanelBtn?.addEventListener('click', () => {
    setActivePanel('visitors');
    visitorsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Modal actions listeners
  reservationActionsClose?.addEventListener('click', closeReservationActions);
  reservationActionsModal?.addEventListener('click', (e) => { if (e.target === reservationActionsModal) closeReservationActions(); });

  visitorForm?.addEventListener('submit', onVisitorSubmit);
  cancelVisitorEditBtn?.addEventListener('click', resetVisitorForm);
  newVisitorBtn?.addEventListener('click', () => {
    resetVisitorForm();
    openVisitorForm();
  });

  profileForm?.addEventListener('submit', onProfileSubmit);
  // Abre modal de edição ao invés de editar inline
  editProfileBtn?.addEventListener('click', openProfileEditModal);
  cancelProfileEditBtn?.addEventListener('click', () => {
    renderProfile();
    setProfileEditing(false);
  });

  // Modal profile edit events
  profileEditClose?.addEventListener('click', closeProfileEditModal);
  profileEditCancel?.addEventListener('click', closeProfileEditModal);
  profileEditModal?.addEventListener('click', (e) => { if (e.target === profileEditModal) closeProfileEditModal(); });
  profileEditForm?.addEventListener('submit', onProfileEditSubmit);
  newPasswordInput?.addEventListener('input', updateModalPasswordIndicators);
  newPasswordConfirmInput?.addEventListener('input', updateModalPasswordIndicators);
  editPhone?.addEventListener('input', () => { const d = somenteDigitos(editPhone.value).slice(0,11); editPhone.value = formatPhone(d); });
  editWhatsapp?.addEventListener('input', () => { const d = somenteDigitos(editWhatsapp.value).slice(0,11); editWhatsapp.value = formatPhone(d); });

  // Scope buttons
  scopePFBtn?.addEventListener('click', () => setPortalScope('pf'));
  scopeCompanyBtn?.addEventListener('click', () => setPortalScope('company'));

  // Company tab buttons
  companyTabs.forEach(b => b.addEventListener('click', () => setCompanySubtab(b.dataset.companyTab)));
  companyInviteBtn?.addEventListener('click', onCompanyInviteSubmit);
  companyCsvInput?.addEventListener('change', onCompanyCsvSelected);
  companyXlsxInput?.addEventListener('change', onCompanyXlsxSelected);
  companyResendBtn?.addEventListener('click', onCompanyResendLookup);

  // Quick actions in overview
  if (quickActionsContainer) {
    quickActionsContainer.querySelectorAll('button[data-panel]')
      .forEach(btn => btn.addEventListener('click', () => {
        const panel = btn.getAttribute('data-panel');
        setCompanySubtab(panel);
      }));
  }

  // Finance filters
  finPresetButtons.forEach(b => b.addEventListener('click', () => setFinancePreset(parseInt(b.dataset.range, 10) || 30)));
  finApplyBtn?.addEventListener('click', () => loadCompanyFinance());

  portalNavButtons.forEach(btn => {
    btn.addEventListener('click', () => setActivePanel(btn.dataset.panel));
  });

  bookingCurrentMonth = new Date(bookingToday.getFullYear(), bookingToday.getMonth(), 1);
  renderBookingCalendar(bookingCurrentMonth);
  renderVisitorChecklist();
  setBookingStep(0);
  renderRoomOptions(bookingDateInput?.value || '');
  updateBookingNavigation();
  setBodyAuthState(false);
  showAuthOverlay();
  setActivePanel('book');
}

function isReducedMotionPreferred() {
  return Boolean(prefersReducedMotionQuery && prefersReducedMotionQuery.matches);
}

function setBodyAuthState(isAuthenticated) {
  if (!bodyEl) return;
  bodyEl.classList.toggle('client-authenticated', Boolean(isAuthenticated));
  bodyEl.classList.toggle('client-logged-out', !isAuthenticated);
}

function setAuthScope(scope) {
  desiredScope = scope === 'company' ? 'company' : 'pf';
  authScopePFBtn?.classList.toggle('active', desiredScope === 'pf');
  authScopeCompanyBtn?.classList.toggle('active', desiredScope === 'company');
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
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  if (authActions) authActions.hidden = viewName !== 'login';
  if (authMessage) authMessage.textContent = '';
  if (portalRegisterForm && viewName !== 'register') portalRegisterForm.reset();
  if (portalRecoveryForm && viewName !== 'recovery') portalRecoveryForm.reset();
  if (viewName !== 'login') portalLoginForm?.reset();
  if (viewName === 'login') {
    aplicarLoginMemorizado();
    if (loginPasswordInput) loginPasswordInput.value = '';
    if (loginIdentifierInput && !loginIdentifierInput.value) {
      loginIdentifierInput.focus();
    }
  }
}

function setActivePanel(panelName = 'book') {
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
    renderRoomOptions(bookingDateInput?.value || '');
    setBookingStep(bookingStepIndex);
    renderBookingCalendar(bookingCurrentMonth);
  } else if (target === 'reservations' && activeClient) {
    carregarReservasGlobais().finally(() => carregarReservas(activeClient.id));
  } else if (target === 'visitors' && activeClient) {
    carregarVisitantes(activeClient.id);
  } else if (target === 'profile') {
    renderProfile();
  } else if (target === 'company' && activeClient) {
    if (!activeClient.company_master) {
      // fallback caso alguém force via hash/URL
      setPortalScope('pf');
      return;
    }
    carregarEmpresaOverview();
    // default subtab
    setCompanySubtab('overview');
  }
}

function setPortalScope(scope) {
  currentScope = scope === 'company' ? 'company' : 'pf';
  if (scopePFBtn) scopePFBtn.classList.toggle('active', currentScope === 'pf');
  if (scopeCompanyBtn) scopeCompanyBtn.classList.toggle('active', currentScope === 'company');
  if (currentScope === 'company') {
    setActivePanel('company');
  } else {
    // return to the main PF flow (keep current selection if not company)
    setActivePanel('book');
  }
}

async function carregarEmpresaOverview() {
  // Placeholder simples: computa métricas básicas das reservas do cliente.
  try {
    const ativas = (currentReservations || []).filter(r => ['confirmada','pagamento_pendente','pagamento_confirmado','em_andamento'].includes(String(r.status||'').toLowerCase())).length;
    const proximos7 = (currentReservations || []).filter(r => {
      if (!r.date) return false; const d = new Date(r.date); const now = new Date(); const diff = (d - now)/(1000*60*60*24); return diff >= 0 && diff <= 7;
    }).length;
    const pendPag = (currentReservations || []).filter(r => String(r.payment_status||'').toLowerCase() === 'pendente').length;
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = String(v); };
    set('coActive', ativas);
    set('coNext', proximos7);
    set('coPay', pendPag);

    // Lista próximas 3 reservas da empresa
    const cid = activeClient?.company_id;
    const proximas = (currentReservations || [])
      .filter(r => String(r.company_id) === String(cid))
      .filter(r => r.date && new Date(r.date) >= new Date())
      .sort((a,b)=> new Date(a.date) - new Date(b.date))
      .slice(0,3);
    const box = document.getElementById('companyOverviewNext');
    if (box) {
      if (!proximas.length) {
        box.innerHTML = '<div class="rooms-message">Sem reservas futuras.</div>';
      } else {
        box.innerHTML = proximas.map(r => {
          const room = buscarSala(r.room_id);
          const roomName = escapeHtml(r.room_name || room?.name || `Sala #${r.room_id}`);
          const date = escapeHtml(formatDate(r.date));
          const time = escapeHtml(formatTimeRange(r.time_start, r.time_end));
          const status = (r.status||'').toLowerCase();
          const chipClass = status === 'confirmada' ? 'success' : (status === 'pendente' ? 'pending' : (status === 'cancelada' ? 'warn' : ''));
          const chipLabel = escapeHtml(statusLabel(r.status));
          return `<div class="list-next-item"><span class="date">${date}</span><span class="room">${roomName} · ${time}</span><span class="chip ${chipClass}" style="margin-left:auto">${chipLabel}</span></div>`;
        }).join('');
      }
    }
  } catch (_) {}
}

function setCompanySubtab(tab) {
  const key = ['overview','users','reservations','finance'].includes(tab) ? tab : 'overview';
  companyTabs.forEach(b => b.classList.toggle('active', b.dataset.companyTab === key));
  Object.entries(companyPanels).forEach(([k, el]) => { if (el) el.hidden = (k !== key); });
  if (!activeClient || !activeClient.company_master) return;
  if (key === 'users') loadCompanyUsers();
  if (key === 'users') loadCompanyInvites();
  if (key === 'reservations') loadCompanyReservations();
  if (key === 'finance') loadCompanyFinance();
}

async function loadCompanyUsers() {
  const wrap = document.getElementById('companyUsersContainer');
  if (!wrap) return;
  try {
    wrap.innerHTML = '<div class="rooms-message">Carregando membros…</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=clients`, { credentials: 'include' });
    const json = await res.json();
    const cid = activeClient?.company_id;
    const users = (json.success ? (json.data || []) : []).filter(u => String(u.company_id) === String(cid));
    if (!users.length) { wrap.innerHTML = '<div class="rooms-message">Nenhum membro encontrado.</div>'; return; }
    const rows = users.map(u => `
      <tr>
        <td>${escapeHtml(u.name || '--')}</td>
        <td>${escapeHtml(u.email || '--')}</td>
        <td>${escapeHtml(u.login || '--')}</td>
        <td>${escapeHtml(u.company_role || '-')}</td>
        <td><button class="btn btn-secondary btn-sm" data-act="remove" data-id="${u.id}">Remover</button></td>
      </tr>
    `).join('');
    wrap.innerHTML = `
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Login</th><th>Papel</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    wrap.querySelectorAll('button[data-act="remove"]').forEach(btn => btn.addEventListener('click', () => removeCompanyUser(btn.dataset.id)));
  } catch (e) {
    wrap.innerHTML = '<div class="rooms-message">Falha ao carregar membros.</div>';
  }
}

async function loadCompanyInvites(){
  const wrap = document.getElementById('companyInvitesContainer');
  if (!wrap) return;
  try {
    wrap.innerHTML = '<div class="rooms-message">Carregando convites…</div>';
    const cid = activeClient?.company_id;
    const [invRes, cliRes] = await Promise.all([
      fetch(`${API_BASE}/apiget.php?table=company_invitations`, { credentials:'include' }),
      fetch(`${API_BASE}/apiget.php?table=clients`, { credentials:'include' })
    ]);
    const invJson = await invRes.json();
    const cliJson = await cliRes.json();
    const allCli = cliJson.success ? (cliJson.data || []) : [];
  const list = (invJson.success ? (invJson.data || []) : []).filter(i => String(i.company_id) === String(cid));
  const rows = list.sort((a,b)=> new Date(b.created_at||0) - new Date(a.created_at||0)).map(i => {
      const c = allCli.find(x => String(x.id) === String(i.client_id));
      const name = escapeHtml(i.invite_name || c?.name || '--');
      const email = escapeHtml(i.invite_email || c?.email || '--');
      const cpf = formatCPF(c?.cpf || i.cpf || '');
      const role = escapeHtml(i.role || 'membro');
      const status = escapeHtml(i.status || 'pendente');
      const when = escapeHtml(i.created_at ? formatDate(String(i.created_at).slice(0,10)) : '--');
      const statusLower = String(i.status||'').toLowerCase();
      const canCancel = (statusLower === 'pendente');
      const canResend = (statusLower === 'pendente' || statusLower === 'expirado');
      const actions = `
        ${canResend ? `<button class="btn btn-secondary btn-sm" data-invite-resend="${i.id}">Reenviar</button>` : ''}
        ${canCancel ? `<button class="btn btn-secondary btn-sm" data-invite-cancel="${i.id}">Cancelar</button>` : ''}
      `;
      return `<tr>
        <td>${name}</td><td>${email}</td><td>${cpf}</td><td>${role}</td><td>${status}</td><td>${when}</td><td>${actions}</td>
      </tr>`;
    }).join('');
    wrap.innerHTML = `
      <h4 style="margin:10px 0 6px">Convites</h4>
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>CPF</th><th>Papel</th><th>Status</th><th>Enviado em</th><th>Ações</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:20px">Nenhum convite encontrado.</td></tr>'}</tbody>
      </table>`;

    // bind cancel/resend buttons
    wrap.querySelectorAll('button[data-invite-cancel]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-invite-cancel'), 10);
        if (!id) return;
        if (!confirm('Cancelar este convite?')) return;
        try {
          const res = await fetch(`${API_BASE}/company_cancel_invite.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.error || 'Falha ao cancelar.');
          await loadCompanyInvites();
        } catch (e) {
          alert(e.message || 'Erro ao cancelar convite.');
        }
      });
    });
    wrap.querySelectorAll('button[data-invite-resend]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-invite-resend'), 10);
        if (!id) return;
        try {
          const res = await fetch(`${API_BASE}/company_resend_invite.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.error || 'Falha ao reenviar.');
          alert(json.message || 'Convite reenviado.');
          await loadCompanyInvites();
        } catch (e) {
          alert(e.message || 'Erro ao reenviar convite.');
        }
      });
    });
  } catch (e) {
    wrap.innerHTML = '<div class="rooms-message">Não foi possível carregar os convites.</div>';
  }
}

async function onCompanyInviteSubmit() {
  if (!activeClient?.company_id) return;
  const digits = somenteDigitos(companyInviteCpf?.value).slice(0,11);
  if (companyInviteCpf) companyInviteCpf.value = formatCPF(digits);
  if (digits.length !== 11) { alert('Informe um CPF válido.'); return; }
  const role = companyInviteRole?.value || 'membro';
  try {
    companyInviteBtn.disabled = true;
    const res = await fetch(`${API_BASE}/company_invite_user.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ company_id: activeClient.company_id, cpf: digits, email: (companyInviteEmail?.value||'').trim(), role })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível enviar o convite.');
    alert(json.message || 'Convite enviado.');
    await loadCompanyInvites();
  } catch (e) {
    alert(e.message || 'Falha ao convidar.');
  } finally { companyInviteBtn.disabled = false; }
}

async function onCompanyResendLookup(){
  if (!activeClient?.company_id) return;
  const cpfDigits = somenteDigitos(companyInviteCpf?.value).slice(0,11);
  const email = (companyInviteEmail?.value || '').trim();
  if (!cpfDigits && !email) { alert('Informe CPF ou e‑mail para reenviar.'); return; }
  try {
    companyResendBtn.disabled = true;
    const res = await fetch(`${API_BASE}/company_resend_invite_by_lookup.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: activeClient.company_id, cpf: cpfDigits, email })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao reenviar.');
    alert(json.message || 'Convite reenviado.');
    await loadCompanyInvites();
  } catch (e) {
    alert(e.message || 'Erro ao reenviar convite.');
  } finally { companyResendBtn.disabled = false; }
}

function parseCsv(text) {
  // Remove BOM, normalize EOLs
  const clean = text.replace(/^\uFEFF/, '');
  const rows = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!rows.length) return [];
  // Detect delimiter (pt-BR Excel often uses ';')
  const first = rows.shift();
  const delimiter = (first.match(/;/g)?.length || 0) >= (first.match(/,/g)?.length || 0) ? ';' : ',';
  const header = first.split(delimiter).map(h => h.trim().toLowerCase());
  const idxNome = header.indexOf('nome');
  const idxEmail = header.indexOf('e-mail') >= 0 ? header.indexOf('e-mail') : header.indexOf('email');
  const idxCpf = header.indexOf('cpf');
  if (idxNome < 0 || idxEmail < 0 || idxCpf < 0) return [];
  return rows.map(line => {
    const cols = line.split(delimiter).map(s => s.replace(/^\"|\"$/g, '').trim());
    return {
      name: (cols[idxNome] || '').trim(),
      email: (cols[idxEmail] || '').trim(),
      cpf: somenteDigitos(cols[idxCpf] || '').slice(0,11)
    };
  }).filter(r => r.name && r.email && r.cpf && r.cpf.length === 11);
}

async function onCompanyCsvSelected(evt){
  const file = evt.target?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const entries = parseCsv(text);
    if (!entries.length) { alert('CSV inválido. Use o modelo com Nome,E-mail,CPF.'); return; }
    if (!confirm(`Detectamos ${entries.length} linha(s). Enviar convites agora?`)) return;
    let ok = 0, fail = 0;
    const role = companyInviteRole?.value || 'membro';
    for (const row of entries) {
      try {
        const res = await fetch(`${API_BASE}/company_invite_user.php`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ company_id: activeClient.company_id, cpf: row.cpf, email: row.email || '', name: row.name || '', role })
        });
        const j = await res.json();
        if (!j.success) throw new Error();
        ok += 1;
      } catch (_) { fail += 1; }
    }
    alert(`Convites enviados: ${ok}. Falhas: ${fail}.`);
  } catch (e) {
    alert('Não foi possível ler o arquivo CSV.');
  } finally {
    evt.target.value = '';
  }
}

async function onCompanyXlsxSelected(evt){
  const file = evt.target?.files?.[0];
  if (!file) return;
  try {
    if (!/\.xlsx$/i.test(file.name)) { alert('Envie um arquivo .xlsx'); return; }
    if (!activeClient?.company_id) { alert('Empresa inválida.'); return; }
    const role = companyInviteRole?.value || 'membro';
    // Apenas uma confirmação simples
    if (!confirm('Importar este XLSX (máximo 50 linhas)? Os convites serão enviados por e‑mail.')) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('company_id', String(activeClient.company_id));
    fd.append('role', role);
    const res = await fetch(`${API_BASE}/company_import_xlsx.php`, { method:'POST', body: fd });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao importar XLSX.');
    const errs = Array.isArray(json.errors) && json.errors.length ? `\nErros: \n- ${json.errors.slice(0,5).join('\n- ')}${json.errors.length>5?'\n…':''}` : '';
    alert(`Convites enviados: ${json.sent || 0}. Falhas: ${json.failed || 0}.${errs}`);
    // Atualiza convites
    setCompanySubtab('users');
    await loadCompanyInvites();
  } catch (e) {
    alert(e.message || 'Não foi possível processar o XLSX.');
  } finally {
    evt.target.value = '';
  }
}

async function removeCompanyUser(clientId){
  if (!activeClient?.company_id) return;
  if (!confirm('Remover vínculo deste usuário com a empresa?')) return;
  try {
    const res = await fetch(`${API_BASE}/company_remove_user.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ company_id: activeClient.company_id, client_id: Number(clientId) })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao remover.');
    loadCompanyUsers();
  } catch (e) { alert(e.message || 'Erro ao remover.'); }
}

async function loadCompanyReservations(){
  const wrap = document.getElementById('companyReservationsContainer');
  if (!wrap) return;
  try {
    wrap.innerHTML = '<div class="rooms-message">Carregando reservas…</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=reservations`, { credentials: 'include' });
    const json = await res.json();
    const cid = activeClient?.company_id;
    const list = (json.success ? (json.data || []) : []).filter(r => String(r.company_id) === String(cid));
    if (!list.length) { wrap.innerHTML = '<div class="rooms-message">Nenhuma reserva para a empresa.</div>'; return; }
    const rows = list.map(r => {
      const room = buscarSala(r.room_id);
      const roomName = (r.room_name || room?.name || `Sala #${r.room_id}`);
      const date = formatDate(r.date);
      const time = formatTimeRange(r.time_start, r.time_end);
      const status = statusLabel(r.status);
      return `<tr><td>${escapeHtml(roomName)}</td><td>${escapeHtml(date)}</td><td>${escapeHtml(time)}</td><td>${escapeHtml(status)}</td></tr>`;
    }).join('');
    wrap.innerHTML = `
      <table>
        <thead><tr><th>Sala</th><th>Data</th><th>Horário</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (e) { wrap.innerHTML = '<div class="rooms-message">Falha ao carregar reservas.</div>'; }
}

async function loadCompanyFinance(){
  const wrap = document.getElementById('companyFinanceContainer');
  if (!wrap) return;
  try {
    wrap.innerHTML = '<div class="rooms-message">Carregando financeiro…</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=reservations`, { credentials: 'include' });
    const json = await res.json();
    const cid = activeClient?.company_id;
    let list = (json.success ? (json.data || []) : []).filter(r => String(r.company_id) === String(cid));
    // Apply date filters
    const range = getFinanceRange();
    if (range) {
      const fromT = range.from ? new Date(range.from).getTime() : null;
      const toT = range.to ? new Date(range.to).getTime() : null;
      list = list.filter(r => {
        const t = r.date ? new Date(r.date).getTime() : null;
        if (t === null) return false;
        if (fromT && t < fromT) return false;
        if (toT && t > toT) return false;
        return true;
      });
    }
    const sum = (arr, field) => arr.reduce((acc, it) => acc + (parseFloat(it[field] || 0) || 0), 0);
    const pend = list.filter(r => String(r.payment_status||'').toLowerCase() === 'pendente');
    const conf = list.filter(r => String(r.payment_status||'').toLowerCase() === 'confirmado');
    const totalPend = sum(pend, 'total_price');
    const totalConf = sum(conf, 'total_price');
    // Build summary + table
    const countByStatus = list.reduce((acc, r) => { const k=(r.status||'--').toLowerCase(); acc[k]=(acc[k]||0)+1; return acc; }, {});
    const rows = list.sort((a,b)=> new Date(b.date) - new Date(a.date)).map(r => {
      const room = buscarSala(r.room_id);
      const roomName = escapeHtml(r.room_name || room?.name || `Sala #${r.room_id}`);
      const date = escapeHtml(formatDate(r.date));
      const price = escapeHtml(formatCurrency(r.total_price || r.price || 0));
      const pstat = escapeHtml((r.payment_status || '—').replace('_',' '));
      const rstat = escapeHtml(statusLabel(r.status));
      return `<tr><td>${date}</td><td>${roomName}</td><td>${rstat}</td><td>${pstat}</td><td style="text-align:right">${price}</td></tr>`;
    }).join('');
    const statusSummary = Object.entries(countByStatus).map(([k,v])=>`<span class="chip" title="${v} reserva(s)">${statusLabel(k)}: ${v}</span>`).join(' ');
    wrap.innerHTML = `
      <div class="finance-summary grid-cards-3">
        <div class="stat-card"><div class="stat-text"><span class="stat-label">Pagamentos pendentes</span><span class="stat-value">${escapeHtml(formatCurrency(totalPend))}</span></div></div>
        <div class="stat-card"><div class="stat-text"><span class="stat-label">Pagamentos confirmados</span><span class="stat-value">${escapeHtml(formatCurrency(totalConf))}</span></div></div>
        <div class="stat-card"><div class="stat-text"><span class="stat-label">Reservas</span><span class="stat-value">${list.length}</span></div></div>
      </div>
      <div style="margin:6px 0 10px; display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:flex-start">
        ${statusSummary || ''}
        <button type="button" class="btn btn-secondary btn-sm" id="finExport">Exportar CSV</button>
      </div>
      <div class="finance-table">
        <table>
          <thead><tr><th>Data</th><th>Sala</th><th>Status</th><th>Pagamento</th><th style="text-align:right">Valor</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:20px">Nenhum registro no período.</td></tr>'}</tbody>
        </table>
      </div>`;
    const finExportBtn = document.getElementById('finExport');
    finExportBtn?.addEventListener('click', () => exportFinanceCSV(list));
  } catch (e) { wrap.innerHTML = '<div class="rooms-message">Falha ao carregar financeiro.</div>'; }
}

function setFinancePreset(days){
  const today = new Date();
  const from = new Date(today.getTime() - (days*24*60*60*1000));
  if (finFromInput) finFromInput.value = toISODate(from);
  if (finToInput) finToInput.value = toISODate(today);
  loadCompanyFinance();
}

function getFinanceRange(){
  if (!finFromInput || !finToInput) return null;
  const from = finFromInput.value || '';
  const to = finToInput.value || '';
  if (!from && !to) return null;
  // Limit personalizável a 6 meses
  try {
    if (from && to) {
      const ms = new Date(to).getTime() - new Date(from).getTime();
      const max = 183 * 24 * 60 * 60 * 1000; // ~6 meses
      if (ms > max) {
        alert('O período personalizado deve ter no máximo 6 meses.');
        return null;
      }
    }
  } catch (_) {}
  return { from, to };
}

function exportFinanceCSV(list){
  const header = ['Data','Sala','Status','Pagamento','Valor'];
  const rows = list.map(r => {
    const room = buscarSala(r.room_id);
    const roomName = (r.room_name || room?.name || `Sala #${r.room_id}`).replace(/;/g, ' ');
    return [
      formatDate(r.date||''),
      roomName,
      statusLabel(r.status||''),
      (r.payment_status||'').replace('_',' '),
      String(r.total_price || r.price || 0).replace('.', ',')
    ];
  });
  const csv = [header, ...rows].map(cols => cols.map(v => String(v)).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'financeiro_zeefe.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
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
}

async function carregarSalas() {
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=rooms`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar salas');
    roomsCache = Array.isArray(json.data) ? json.data : [];
    // Fallback: se vier vazio por algum motivo, tentar endpoint público
    if (!roomsCache.length) {
      try {
        const alt = await fetch(`${API_BASE}/public_rooms.php`, { credentials: 'include' });
        const altJson = await alt.json();
        if (altJson.success && Array.isArray(altJson.data)) {
          roomsCache = altJson.data.map(r => ({
            id: r.id,
            name: r.name,
            city: r.city || '',
            state: r.state || r.uf || '',
            location: r.location || '',
            capacity: r.capacity,
            status: r.status || 'ativo',
            maintenance_start: r.maintenance_start || null,
            maintenance_end: r.maintenance_end || null,
            deactivated_from: r.deactivated_from || null,
            daily_rate: r.daily_rate,
            photo_path: r.photo_path || '',
            amenities: r.amenities || []
          }));
        }
      } catch (_) {
        // ignora fallback
      }
    }
    preencherSalasSelect();
    hydrateUfAndCitiesBooking();
  } catch (err) {
    console.error(err);
    roomsCache = [];
  }
}

async function ensureRoomsLoaded() {
  if (Array.isArray(roomsCache) && roomsCache.length) return true;
  try {
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Carregando salas disponíveis...';
    await carregarSalas();
    return Array.isArray(roomsCache) && roomsCache.length > 0;
  } catch (_) {
    return false;
  }
}

function preencherSalasSelect() {
  renderRoomOptions(bookingDateInput?.value || '');
}

function onBookingDateChange() {
  if (!bookingDateInput) return;
  if (bookingRoomHiddenInput) bookingRoomHiddenInput.value = '';
  const selected = bookingDateInput.value;
  if (selected) {
    const parsed = new Date(selected);
    if (!Number.isNaN(parsed.getTime())) {
      bookingCurrentMonth = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    }
  }
  renderRoomOptions(selected);
  renderBookingCalendar(bookingCurrentMonth);
  if (bookingStepIndex > 1) {
    setBookingStep(1);
  }
  updateBookingNavigation();
}

function changeBookingStep(delta) {
  setBookingStep(bookingStepIndex + delta);
}

function setBookingStep(index) {
  if (!bookingStepSections.length) return;
  const maxIndex = bookingStepSections.length - 1;
  if (index < 0) index = 0;
  if (index > maxIndex) index = maxIndex;
  bookingStepIndex = index;
  bookingStepSections.forEach((section, idx) => {
    if (!section) return;
    section.hidden = idx !== index;
  });
  bookingStepperItems.forEach((item, idx) => {
    if (!item) return;
    item.classList.toggle('active', idx <= index);
  });
  updateBookingNavigation();
  if (bookingStepIndex === 1) {
    renderRoomOptions(bookingDateInput?.value || '');
  }
}

function updateBookingNavigation() {
  const lastIndex = bookingStepSections.length - 1;
  if (bookingPrevBtn) bookingPrevBtn.hidden = bookingStepIndex === 0;
  if (bookingNextBtn) {
    const isLast = bookingStepIndex >= lastIndex;
    bookingNextBtn.hidden = isLast;
    bookingNextBtn.disabled = isLast ? true : !isStepComplete(bookingStepIndex);
  }
  if (bookingSubmitBtn) {
    const isSubmitVisible = bookingStepIndex === lastIndex;
    bookingSubmitBtn.hidden = !isSubmitVisible;
    bookingSubmitBtn.textContent = 'Solicitar reserva';
    bookingSubmitBtn.disabled = isSubmitVisible ? !isStepComplete(lastIndex) : true;
  }
  if (cancelReservationEditBtn) {
    const isLast = bookingStepIndex === lastIndex;
    if (isLast) {
      cancelReservationEditBtn.hidden = false;
      cancelReservationEditBtn.textContent = 'Cancelar';
    } else {
      cancelReservationEditBtn.hidden = true;
    }
  }
}

function isStepComplete(step) {
  switch (step) {
    case 0:
      return Boolean(bookingDateInput?.value);
    case 1:
      return Boolean(bookingRoomHiddenInput?.value);
    case 2:
      return Boolean(bookingTitleInput && bookingTitleInput.value.trim());
    case 3:
    default:
      return true;
  }
}

function validateBookingStep(step) {
  if (!bookingMessage) return true;
  bookingMessage.textContent = '';
  if (step === 0) {
    if (!bookingDateInput || !bookingDateInput.value) {
      bookingMessage.textContent = 'Selecione a data da reserva antes de avançar.';
      return false;
    }
  } else if (step === 1) {
    if (!bookingRoomHiddenInput || !bookingRoomHiddenInput.value) {
      bookingMessage.textContent = 'Escolha uma sala disponível para continuar.';
      return false;
    }
  } else if (step === 2) {
    if (!bookingTitleInput || !bookingTitleInput.value.trim()) {
      bookingMessage.textContent = 'Informe um título para a reserva.';
      return false;
    }
  }
  return true;
}

function renderRoomOptions(date) {
  if (!bookingRoomOptions) return;
  bookingRoomOptions.innerHTML = '';
  if (bookingRoomFeedback) bookingRoomFeedback.textContent = '';
  if (!date) {
    if (!roomsCache.length) {
      ensureRoomsLoaded().then(() => renderRoomOptions(''));
      if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Carregando salas disponíveis...';
      return;
    }
    // Sem data: lista todas as salas para não travar o fluxo
    bookingRoomOptions.innerHTML = '';
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Selecione uma sala; a disponibilidade será validada no envio.';
    roomsCache.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR')).forEach(room => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'room-option';
      button.dataset.roomId = String(room.id);
      const capacityText = room.capacity != null && room.capacity !== '' ? escapeHtml(room.capacity) : '--';
      const cityText = room.city ? escapeHtml(room.city) : '--';
      const stateText = room.state || room.uf ? escapeHtml((room.state || room.uf).toUpperCase()) : '--';
      const priceHtml = room.daily_rate ? `<span class=\"price\"><strong>${formatCurrency(room.daily_rate)}</strong> / diária</span>` : '';
      button.innerHTML = `
        <strong>${escapeHtml(room.name || `Sala #${room.id}`)}</strong>
        <span class=\"meta\">${cityText} ${stateText ? ' - ' + stateText : ''} · ${capacityText} pessoas</span>
        ${priceHtml}
      `;
      button.addEventListener('click', () => selectRoomOption(room.id));
      bookingRoomOptions.appendChild(button);
    });
    return;
  }
  if (!roomsCache.length) {
    ensureRoomsLoaded().then(ok => {
      if (!ok) {
        if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Não foi possível carregar as salas no momento.';
      } else {
        renderRoomOptions(date);
      }
    });
    return;
  }
  const normalize = (v) => (v || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const searchTerm = normalize(bookingRoomSearchInput?.value || '');
  const cityFilter = normalize(bookingCityFilterInput?.value || '');
  const stateFilter = normalize(bookingStateFilterInput?.value || '');
  const amenityIds = Array.from(bookingSelectedAmenities);

  // Listar todas as salas disponíveis na data selecionada (sem filtros)

  const availableRooms = getAvailableRoomsForDate(date, reservationIdInput?.value).sort((a, b) => {
    const nameA = (a.name || `Sala #${a.id}`).toString().toLowerCase();
    const nameB = (b.name || `Sala #${b.id}`).toString().toLowerCase();
    return nameA.localeCompare(nameB, 'pt-BR');
  });
  if (!availableRooms.length) {
    // Segurança máxima: se não detectou disponibilidade, ainda assim mostro TODAS as salas cadastradas
    // para permitir solicitar a reserva e o admin confirmar. Isso evita a sensação de vazio.
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Nenhuma disponibilidade detectada nesta data. Você ainda pode selecionar uma sala e enviar a solicitação.';
    const fallbackRooms = roomsCache.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'));
    const selectedId = bookingRoomHiddenInput?.value ? String(bookingRoomHiddenInput.value) : '';
    let hasSelected = false;
    fallbackRooms.forEach(room => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'room-option';
      button.dataset.roomId = String(room.id);
      const capacityText = room.capacity != null && room.capacity !== '' ? escapeHtml(room.capacity) : '--';
      const cityText = room.city ? escapeHtml(room.city) : '--';
      const stateText = room.state || room.uf ? escapeHtml((room.state || room.uf).toUpperCase()) : '--';
      const priceHtml = room.daily_rate ? `<span class=\"price\"><strong>${formatCurrency(room.daily_rate)}</strong> / diária</span>` : '';
      button.innerHTML = `
        <strong>${escapeHtml(room.name || `Sala #${room.id}`)}</strong>
        <span class=\"meta\">${cityText} - ${stateText} · ${capacityText} pessoas</span>
        ${priceHtml}
      `;
      if (selectedId && selectedId === String(room.id)) {
        button.classList.add('selected');
        hasSelected = true;
      }
      button.addEventListener('click', () => selectRoomOption(room.id));
      bookingRoomOptions.appendChild(button);
    });
    if (bookingRoomHiddenInput && selectedId && !hasSelected) {
      bookingRoomHiddenInput.value = '';
    }
    return;
  }
  const selectedId = bookingRoomHiddenInput?.value ? String(bookingRoomHiddenInput.value) : '';
  let hasSelected = false;
  availableRooms.forEach(room => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'room-option';
    button.dataset.roomId = String(room.id);
    const capacityText = room.capacity !== null && room.capacity !== undefined && room.capacity !== ''
      ? escapeHtml(room.capacity)
      : '--';
    const cityText = room.city ? escapeHtml(room.city) : '--';
    const stateText = room.state || room.uf ? escapeHtml((room.state || room.uf).toUpperCase()) : '--';
    const priceHtml = room.daily_rate ? `<span class=\"price\"><strong>${formatCurrency(room.daily_rate)}</strong> / diária</span>` : '';
    const amenityNames = Array.isArray(room.amenities) ? room.amenities.slice(0,4).map(id => escapeHtml(String(id))).join(', ') : '';
    button.innerHTML = `
      <strong>${escapeHtml(room.name || `Sala #${room.id}`)}</strong>
      <span class=\"meta\">${cityText} - ${stateText} · ${capacityText} pessoas</span>
      ${priceHtml}
    `;
    if (selectedId && selectedId === String(room.id)) {
      button.classList.add('selected');
      hasSelected = true;
    }
    button.addEventListener('click', () => selectRoomOption(room.id));
    bookingRoomOptions.appendChild(button);
  });
  if (bookingRoomHiddenInput && selectedId && !hasSelected) {
    bookingRoomHiddenInput.value = '';
  }
  updateBookingNavigation();
}


function changeCalendarMonth(delta) {
  const minMonth = new Date(bookingToday.getFullYear(), bookingToday.getMonth(), 1);
  const candidate = new Date(bookingCurrentMonth.getFullYear(), bookingCurrentMonth.getMonth() + delta, 1);
  bookingCurrentMonth = candidate < minMonth ? minMonth : candidate;
  renderBookingCalendar(bookingCurrentMonth);
}

function renderBookingCalendar(referenceDate) {
  if (!bookingCalendarGrid || !bookingCalendarLabel) return;
  const monthRef = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  bookingCurrentMonth = monthRef;
  bookingCalendarGrid.innerHTML = '';
  bookingCalendarLabel.textContent = monthRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  weekdays.forEach(dayName => {
    const headerCell = document.createElement('div');
    headerCell.className = 'calendar-day disabled';
    headerCell.textContent = dayName;
    bookingCalendarGrid.appendChild(headerCell);
  });

  const startWeekday = monthRef.getDay();
  for (let i = 0; i < startWeekday; i++) {
    const filler = document.createElement('div');
    filler.className = 'calendar-day disabled';
    filler.tabIndex = -1;
    bookingCalendarGrid.appendChild(filler);
  }

  const monthEnd = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0);
  const selectedISO = bookingDateInput?.value;

  for (let day = 1; day <= monthEnd.getDate(); day++) {
    const currentDate = new Date(monthRef.getFullYear(), monthRef.getMonth(), day);
    const iso = toISODate(currentDate);
    const hasRooms = Array.isArray(roomsCache) && roomsCache.length > 0;
    const totalSelectable = hasRooms ? roomsCache.filter(room => isRoomSelectable(room, iso)).length : 1; // se não há dados de salas, não bloqueia
    const availableRooms = hasRooms ? (totalSelectable ? getAvailableRoomsForDate(iso, reservationIdInput?.value) : []) : [{}];

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(day);
    button.dataset.iso = iso;
    button.className = 'calendar-day';

    let statusClass = 'available';
    let clickable = true;

    if (iso < bookingTodayISO) {
      statusClass = 'disabled';
      clickable = false;
    } else if (!hasRooms) {
      // Sem dados de salas, não bloqueia; permite seleção para não travar o fluxo
      statusClass = 'available';
      clickable = true;
    } else if (!totalSelectable) {
      // Nenhuma sala marcada como selecionável para a data => trata como parcial (ainda permite conferir no passo 2)
      statusClass = 'partial';
      clickable = true;
    } else if (!availableRooms.length) {
      statusClass = 'full';
      clickable = false;
    } else if (availableRooms.length < totalSelectable) {
      statusClass = 'partial';
    }

    button.classList.add(statusClass);
    if (!clickable) {
      button.disabled = true;
    } else {
      button.addEventListener('click', () => {
        if (bookingDateInput) {
          bookingDateInput.value = iso;
          renderBookingCalendar(bookingCurrentMonth);
          bookingDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    if (selectedISO && iso === selectedISO) {
      button.classList.add('selected');
    }

    bookingCalendarGrid.appendChild(button);
  }

  updateBookingNavigation();
}

function selectRoomOption(roomId) {
  if (!bookingRoomHiddenInput) return;
  bookingRoomHiddenInput.value = roomId;
  if (bookingRoomOptions) {
    Array.from(bookingRoomOptions.querySelectorAll('.room-option')).forEach(option => {
      option.classList.toggle('selected', option.dataset.roomId === String(roomId));
    });
  }
  if (bookingMessage) bookingMessage.textContent = '';
  updateBookingNavigation();
}


function onBookingDetailsChange() {
  if (bookingStepIndex === 2) {
    updateBookingNavigation();
  }
}

function getAvailableRoomsForDate(date, reservationId) {
  if (!date) return [];
  return roomsCache.filter(room => isRoomSelectable(room, date) && isRoomAvailableOnDate(room, date, reservationId));
}

function isRoomSelectable(room, date) {
  if (!room) return false;
  const status = (room.status || '').toLowerCase();
  if (status === 'inativo') return false;
  if (status === 'desativada') {
    if (!room.deactivated_from) return false;
    return date < room.deactivated_from;
  }
  if (status === 'manutencao') {
    if (room.maintenance_start && room.maintenance_start <= date) {
      if (!room.maintenance_end || room.maintenance_end >= date) {
        return false;
      }
    }
  }
  return ['ativo', 'manutencao', ''].includes(status) || !status;
}

function isRoomAvailableOnDate(room, date, reservationId) {
  const roomId = String(room.id);
  return !allReservationsCache.some(res => {
    if (String(res.room_id) !== roomId) return false;
    if (reservationId && String(res.id) === String(reservationId)) return false;
    const status = (res.status || '').toLowerCase();
    // Apenas reservas efetivamente confirmadas devem bloquear a data.
    // Pendentes/negadas/canceladas não bloqueiam o calendário.
    if (!['confirmada', 'concluida'].includes(status)) return false;
    return res.date === date;
  });
}

async function carregarReservasGlobais() {
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=reservations`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar reservas.');
    allReservationsCache = json.data || [];
  } catch (err) {
    console.error(err);
    allReservationsCache = [];
  }
  renderRoomOptions(bookingDateInput?.value || '');
  renderBookingCalendar(bookingCurrentMonth);
}

function hydrateUfAndCitiesBooking() {
  if (!roomsCache || !roomsCache.length) return;
  const ufs = Array.from(new Set(roomsCache.map(r => String(r.state || r.uf || '').toUpperCase()).filter(Boolean))).sort();
  if (bookingStateFilterInput) {
    bookingStateFilterInput.innerHTML = '<option value="">UF (todas)</option>' + ufs.map(uf => `<option value="${uf.toLowerCase()}">${uf}</option>`).join('');
  }
  hydrateCitiesForUfBooking(bookingStateFilterInput?.value || '');
}

function hydrateCitiesForUfBooking(ufValue) {
  if (!bookingCityFilterInput) return;
  const normalized = String(ufValue || '').toLowerCase();
  let cities = roomsCache
    .filter(r => !normalized || String(r.state || r.uf || '').toLowerCase() === normalized)
    .map(r => String(r.city || '').trim())
    .filter(Boolean);
  cities = Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  bookingCityFilterInput.innerHTML = '<option value="">Cidade (todas)</option>' + cities.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('');
}

async function carregarComodidades() {
  try {
    const res = await fetch(`${API_BASE}/apiget.php?table=amenities`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar comodidades');
    const items = json.data || [];
    renderAmenityFiltersBooking(items);
  } catch (err) {
    console.error('Falha ao carregar comodidades:', err);
    renderAmenityFiltersBooking([]);
  }
}

function renderAmenityFiltersBooking(items) {
  if (!bookingAmenityFilters) return;
  bookingAmenityFilters.innerHTML = '';
  if (!items || !items.length) return;
  const title = document.createElement('strong');
  title.textContent = 'Comodidades:';
  bookingAmenityFilters.appendChild(title);
  const wrap = document.createElement('div');
  wrap.className = 'amenities-checklist';
  items.forEach((a) => {
    const label = document.createElement('label');
    label.style.display = 'inline-flex';
    label.style.alignItems = 'center';
    label.style.gap = '6px';
    label.style.marginRight = '12px';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = String(a.id);
    input.addEventListener('change', () => {
      if (input.checked) bookingSelectedAmenities.add(input.value);
      else bookingSelectedAmenities.delete(input.value);
      renderRoomOptions(bookingDateInput?.value || '');
    });
    label.appendChild(input);
    const span = document.createElement('span');
    span.textContent = a.name;
    label.appendChild(span);
    wrap.appendChild(label);
  });
  bookingAmenityFilters.appendChild(wrap);
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
    if (window.DEBUG) console.debug('[Portal] Enviando login', { identifier, lembrar });
    const res = await fetch(`${API_BASE}/client_portal_login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: identifier, password })
    });
    const json = await res.json();
    if (window.DEBUG) console.debug('[Portal] Resposta login', json);
    if (!json.success) throw new Error(json.error || 'Não foi possível autenticar.');
    registrarPreferenciaLogin(lembrar, identifier);
    aplicarClienteAtivo(json.client);
  } catch (err) {
    console.error('[Portal] Falha no login', err);
    const msg = err.message || 'Erro ao autenticar.';
    authMessage.textContent = msg;
    if (/confirme seu e-mail/i.test(msg) && loginIdentifierInput?.value) {
      renderResendVerification(loginIdentifierInput.value.trim());
    }
  }
}

function renderResendVerification(identifier) {
  let btn = document.getElementById('resendVerificationBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'resendVerificationBtn';
    btn.className = 'btn btn-secondary btn-sm';
    btn.style.marginTop = '8px';
    btn.textContent = 'Reenviar link de verificação';
    authMessage?.appendChild(document.createElement('br'));
    authMessage?.appendChild(btn);
  }
  btn.onclick = async () => {
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/client_resend_verification.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: identifier })
      });
      const json = await res.json();
      authMessage.textContent = json.message || (json.success ? 'Link reenviado.' : (json.error || 'Falha ao reenviar.'));
    } catch (e) {
      authMessage.textContent = 'Falha ao reenviar link.';
    } finally {
      btn.disabled = false;
    }
  };
}

async function onPortalRegisterSubmit(event) {
  event.preventDefault();
  if (!authMessage) return;
  authMessage.textContent = '';
  const cpfDigits = somenteDigitos(registerCpfInput?.value);
  const phoneDigits = somenteDigitos(registerPhoneInput?.value);
  if (registerCpfInput) registerCpfInput.value = formatCPF(cpfDigits);
  if (registerPhoneInput) registerPhoneInput.value = formatPhone(phoneDigits);
  const passwordValue = registerPasswordInput?.value || '';
  const passwordConfirmValue = registerPasswordConfirmInput?.value || '';
  const senhaForte = validarSenhaForte(passwordValue);
  avaliarForcaSenha(passwordValue, passwordConfirmValue);
  const nameValue = document.getElementById('registerName')?.value.trim();
  const emailValue = registerEmailInput?.value.trim() || '';
  const loginValue = emailValue || cpfDigits;
  const payload = {
    name: nameValue,
    email: emailValue,
    login: loginValue,
    cpf: cpfDigits,
    phone: phoneDigits,
    password: passwordValue,
    password_confirm: passwordConfirmValue
  };

  if (!payload.name || !payload.email || !payload.login || !payload.password || !payload.cpf) {
    authMessage.textContent = 'Preencha todos os campos obrigatórios.';
    return;
  }
  if (payload.cpf.length !== 11) {
    authMessage.textContent = 'Informe um CPF válido.';
    atualizarFeedbackCPF(payload.cpf);
    return;
  }
  if (!cpfValido(payload.cpf)) {
    authMessage.textContent = 'CPF inválido. Verifique os números digitados.';
    atualizarFeedbackCPF(payload.cpf, true);
    return;
  }
  if (!senhaForte) {
    authMessage.textContent = 'A senha precisa ter ao menos 8 caracteres, com letras, números e símbolos.';
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
    // Não fazer login automático. Orientar verificação de e-mail e redirecionar para o index.
    authMessage.textContent = 'Cadastro realizado! Enviamos um e-mail para confirmação. Você será redirecionado ao início.';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2500);
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
  // Exibe a aba Empresa somente se houver company_id
  if (companyTabButton) {
    const showCompany = Boolean(activeClient.company_master);
    companyTabButton.hidden = !showCompany;
    if (!showCompany && portalSections.company) portalSections.company.hidden = true;
  }
  // Toggle scope switch buttons visibility
  if (scopeCompanyBtn) {
    const showCompany = Boolean(activeClient.company_master);
    scopeCompanyBtn.hidden = !showCompany;
  }
  // Exibe checkbox "Reserva pela empresa" para qualquer usuário com company_id
  if (companyBookingRow) {
    companyBookingRow.hidden = !Boolean(activeClient.company_id);
  }
  renderProfile();
  resetBookingForm();
  // Apply desired scope after login (fallback to PF if no company)
  const scopeToApply = (desiredScope === 'company' && activeClient.company_master) ? 'company' : 'pf';
  setPortalScope(scopeToApply);
  if (scopeToApply === 'company') setActivePanel('company'); else setActivePanel('book');
  atualizarPainel();
  if (authMessage) authMessage.textContent = '';
}

function fazerLogout() {
  activeClient = null;
  currentReservations = [];
  currentVisitors = [];
  bookingVisitorIds = [];
  if (clientPanels) {
    clientPanels.hidden = true;
  }
  setBodyAuthState(false);
  setAuthView('login');
  showAuthOverlay();
  reservationsContainer.innerHTML = '';
  visitorsContainer.innerHTML = '';
  bookingForm?.reset();
  visitorForm?.reset();
  setActivePanel('book');
  renderProfile();
}

function registrarPreferenciaLogin(lembrar, login) {
  try {
    if (lembrar && login) {
      localStorage.setItem('portalRememberLogin', login);
      setCookie('portalRememberLogin', login, 60);
    } else if (!lembrar) {
      localStorage.removeItem('portalRememberLogin');
      deleteCookie('portalRememberLogin');
    }
  } catch (_) {
    /* ignore storage errors */
  }
}

function aplicarLoginMemorizado() {
  if (!loginIdentifierInput || !rememberMeCheckbox) return;
  try {
    let stored = localStorage.getItem('portalRememberLogin');
    if (!stored) {
      stored = getCookie('portalRememberLogin');
    }
    if (stored) {
      loginIdentifierInput.value = stored;
      rememberMeCheckbox.checked = true;
    } else {
      loginIdentifierInput.value = '';
      rememberMeCheckbox.checked = false;
    }
  } catch (_) {
    rememberMeCheckbox.checked = false;
  }
}

async function atualizarPainel() {
  if (!activeClient) return;
  await carregarReservasGlobais();
  await Promise.all([
    carregarReservas(activeClient.id),
    carregarVisitantes(activeClient.id)
  ]);
}

async function carregarReservas(clientId) {
  if (!reservationsContainer) return;
  try {
    reservationsContainer.innerHTML = '<div class=\"rooms-message\">Carregando reservas...</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=reservations&client_id=${clientId}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar reservas');
    currentReservations = (json.data || []).map(item => ({
      ...item,
      visitors: Array.isArray(item.visitors) ? item.visitors.map(v => String(v)) : [],
      visitor_names: Array.isArray(item.visitor_names) ? item.visitor_names : []
    }));
    renderReservas(currentReservations);
    renderRoomOptions(bookingDateInput?.value || '');
  } catch (err) {
    console.error(err);
    reservationsContainer.innerHTML = '<div class=\"rooms-message\">Não foi possível carregar as reservas.</div>';
  }
}

function renderReservas(reservas) {
  if (!reservationsContainer) return;
  if (!reservas.length) {
    reservationsContainer.innerHTML = '<div class=\"rooms-message\">Nenhuma reserva cadastrada.</div>';
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
    const icsLink = `api/reservation_ics.php?reservation=${encodeURIComponent(reserva.id)}`;
    const stage = renderStageIcons(reserva);
    return `
      <tr data-id=\"${reserva.id}\">
        <td>${formatDate(reserva.date)}</td>
        <td>${escapeHtml(roomName)}</td>
        <td>${stage}</td>
        <td>${escapeHtml(timeRange)}</td>
        <td>${visitorNames}</td>
        <td>${escapeHtml(reserva.title || '--')}</td>
        <td>
          <div class=\"table-actions\">
            <button type=\"button\" data-action=\"openActions\" data-id=\"${reserva.id}\" aria-label=\"Ações\">⋯</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const legend = (() => {
  const items = [
    { i:0, label:'Pré‑reserva' },
    { i:1, label:'Reserva' },
    { i:2, label:'Pagamento' },
    { i:3, label:'Realizado' }
    ].map(x => `<span class=\"legend-item inactive\"><span class=\"legend-icon\">${getStageIconSVG(x.i,'inactive',20)}</span>${x.label}</span>`).join('');
  return `<div class=\"legend-inline\">${items}</div>`;
})();

  reservationsContainer.innerHTML = legend + `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Sala</th>
          <th>Status</th>
          <th>Horário</th>
          <th>Visitantes</th>
          <th>Título</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  reservationsContainer.querySelectorAll('button[data-action="openActions"]').forEach(btn => {
    btn.addEventListener('click', () => openReservationActions(btn.dataset.id));
  });
}

function renderStageIcons(res) {
  const stages = ['Pré‑reserva', 'Reserva', 'Pagamento', 'Realizado'];
  const status = (res.status || '').toLowerCase();
  const pay = (res.payment_status || '').toLowerCase();
  let idx = 0;
  if (status === 'pendente') idx = 0;
  else if (status === 'confirmada') idx = pay === 'confirmado' ? 3 : 2;
  else if (status === 'concluida') idx = 3;
  else if (status === 'cancelada') idx = -1;
  else idx = 0;

  const items = stages.map((label, i) => {
    let state = 'inactive';
    if (idx === -1) state = 'cancelled';
    else if (i < idx) state = 'done';
    else if (i === idx) state = 'active';
    return `<span class=\"stage-icon\" title=\"${label}\">${getStageIconSVG(i, state, 20)}</span>`;
  }).join('');
  return `<span class=\"stage-track\">${items}</span>`;
}

// Retorna SVG inline para cada etapa (0:pré,1:reserva,2:pagamento,3:realizado)
function getStageIconSVG(step, state='inactive', size=20) {
  // cores
  const on = { active: '#2F6F55', done: '#4A8070', cancelled: '#B54A3A' };
  const stroke = state === 'inactive' ? 'rgba(29,65,58,.35)' : (on[state] || on.active);
  const fill = state === 'inactive' ? 'none' : (on[state] || on.active);
  // fundo clarinho (bolha) sempre visível
  const bg = `<circle cx='12' cy='12' r='11' fill='rgba(29,65,58,.08)'/>`;
  const sw = 2;
  const common = `stroke=\"${stroke}\" fill=\"${fill}\" stroke-width=\"${sw}\"`;
  // desenha ícone menor centralizado
  const wrap = (inner) => `<svg viewBox='0 0 24 24' width='${size}' height='${size}'>${bg}<g transform='translate(0,0)'>${inner}</g></svg>`;
  switch (step) {
    case 0: // clock
      return wrap(`<circle cx='12' cy='12' r='7' ${common}/><path d='M12 9v4l3 2' ${common}/>`);
    case 1: // clipboard
      return wrap(`<rect x='7' y='7' width='10' height='12' rx='2' ${common}/><path d='M9 7h6v3H9z' ${common}/>`);
    case 2: // credit card
      return wrap(`<rect x='5' y='8' width='14' height='10' rx='2' ${common}/><path d='M5 11h14' ${common}/>`);
    case 3: // check
      return wrap(`<circle cx='12' cy='12' r='7' ${common}/><path d='M9 12l2 2 4-5' ${common}/>`);
    default:
      return wrap(`<circle cx='12' cy='12' r='7' ${common}/>`);
  }
}

function openReservationActions(id) {
  const reserva = currentReservations.find(r => String(r.id) === String(id));
  if (!reserva || !reservationActionsModal) return;
  const room = buscarSala(reserva.room_id);
  const roomName = reserva.room_name || room?.name || `Sala #${reserva.room_id}`;
  reservationActionsTitle.textContent = 'Ações da reserva';
  reservationActionsMeta.textContent = `${formatDate(reserva.date)} · ${roomName} · ${formatTimeRange(reserva.time_start, reserva.time_end)}`;
  reservationActionsButtons.innerHTML = '';

  const statusNormalized = (reserva.status || '').toLowerCase();
  const payNormalized = (reserva.payment_status || '').toLowerCase();
  const paid = payNormalized === 'confirmado';
  const showCancel = ['pendente', 'confirmada'].includes(statusNormalized) && podeCancelar(reserva);
  const showPayment = !paid && ['pendente', 'confirmada'].includes(statusNormalized);
  const showInvite = Array.isArray(reserva.visitors) && reserva.visitors.length;

  const mkCard = (label, onclick, extraClass='') => {
    const d = document.createElement('div'); d.className = `action-card ${extraClass}`.trim();
    d.innerHTML = `<span class=\"icon\">${getActionIconSVG(label)}</span><span class=\"label\">${label}</span>`;
    d.addEventListener('click', () => { onclick(); });
    return d;
  };

  reservationActionsButtons.classList.add('actions-grid');
  reservationActionsButtons.innerHTML = '';

  if (showPayment) {
    reservationActionsButtons.appendChild(mkCard('Pagamento', ()=> { tratarAcaoReserva(reserva.id,'payment'); closeReservationActions(); }));
  }
  // Se pagamento já foi confirmado, exibir informação logo abaixo do meta
  if (paid) {
    try {
      const dt = (reserva.updated_at || reserva.payment_confirmed_at || '').slice(0,10).split('-').reverse().join('/');
      reservationActionsMeta.innerHTML = `${reservationActionsMeta.textContent}<br><span style=\"color:#8A7766\">Pagamento – realizado em ${dt || 'data não disponível'}</span>`;
    } catch (_) {}
  }
  // Baixar convite (ICS)
  const ics = document.createElement('a'); ics.href=`api/reservation_ics.php?reservation=${encodeURIComponent(reserva.id)}`; ics.className='action-card'; ics.innerHTML=`<span class=\"icon\">${getActionIconSVG('Baixar convite')}</span><span class=\"label\">Baixar convite</span>`; ics.setAttribute('download',''); reservationActionsButtons.appendChild(ics);
  // Enviar convite (e‑mail com ICS)
  reservationActionsButtons.appendChild(mkCard('Enviar convite', ()=> { tratarAcaoReserva(reserva.id,'sendCalendar'); closeReservationActions(); }));

  // Solicitar NF (apenas após pagamento)
  if (paid) {
    reservationActionsButtons.appendChild(mkCard('Solicitar NF', ()=> { alert('Solicitação de NF registrada. Em breve você receberá por e‑mail.'); closeReservationActions(); }));
  }

  // Linha inferior: Cancelar (vermelho) e Editar
  const bottom = document.createElement('div'); bottom.className='actions-bottom';
  if (showCancel) bottom.appendChild(mkCard('Cancelar', ()=> { tratarAcaoReserva(reserva.id,'cancel'); closeReservationActions(); }, 'danger'));
  bottom.appendChild(mkCard('Editar', ()=> { tratarAcaoReserva(reserva.id,'edit'); closeReservationActions(); }));
  reservationActionsButtons.appendChild(bottom);

  reservationActionsModal.classList.add('show');
  reservationActionsModal.setAttribute('aria-hidden','false');
}

function closeReservationActions(){
  reservationActionsModal?.classList.remove('show');
  reservationActionsModal?.setAttribute('aria-hidden','true');
}

function getActionIconSVG(label){
  const green = '#2F6F55';
  const stroke = `stroke=\"${green}\" fill=\"none\" stroke-width=\"2\"`;
  const map = {
    'Pagamento': `<svg viewBox='0 0 24 24'><rect x='3' y='6' width='18' height='12' rx='2' ${stroke}/><path d='M3 10h18' ${stroke}/></svg>`,
    'Baixar convite': `<svg viewBox='0 0 24 24'><path d='M12 3v12' ${stroke}/><path d='M7 10l5 5 5-5' ${stroke}/><path d='M5 19h14' ${stroke}/></svg>`,
    'Enviar convite': `<svg viewBox='0 0 24 24'><path d='M22 2L11 13' ${stroke}/><path d='M22 2l-7 20-4-9-9-4 20-7z' ${stroke}/></svg>`,
    'Cancelar': `<svg viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18' ${stroke}/></svg>`,
    'Editar': `<svg viewBox='0 0 24 24'><path d='M3 21h6l12-12-6-6L3 15v6z' ${stroke}/></svg>`,
    'Solicitar NF': `<svg viewBox='0 0 24 24'><path d='M6 3h12v18H6z' ${stroke}/><path d='M9 7h6M9 11h6M9 15h6' ${stroke}/></svg>`
  };
  return map[label] || `<svg viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' ${stroke}/></svg>`;
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
    try {
      await enviarConvites(Number(id), reserva.visitors);
      alert('Convites enviados.');
    } catch (err) {
      alert('Não foi possível enviar os convites.');
    }
    return;
  }
  if (action === 'payment') {
    try {
      await enviarLinkPagamento(id);
      alert('Link de pagamento enviado por e-mail.');
    } catch (err) {
      alert(err.message || 'Não foi possível enviar o link de pagamento.');
    }
    return;
  }
  if (action === 'sendCalendar') {
    try {
      const res = await fetch(`${API_BASE}/send_calendar_invite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reservation_id: id })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Falha ao enviar convite de calendário.');
      alert('Convite de calendário enviado para você e seus visitantes.');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Não foi possível enviar o convite de calendário.');
    }
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
  try {
    const res = await fetch(`${API_BASE}/update_reservation_status.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, action })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar status.');
    atualizarPainel();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Não foi possível atualizar o status.');
  }
}

function preencherFormReserva(reserva) {
  if (!bookingForm) return;
  setActivePanel('book');
  bookingFormTitle.textContent = 'Editar reserva';
  if (reservationIdInput) reservationIdInput.value = reserva.id || '';
  if (bookingRoomHiddenInput) bookingRoomHiddenInput.value = reserva.room_id || '';
  if (bookingDateInput) bookingDateInput.value = reserva.date || '';
  const startInput = bookingForm.querySelector('input[name="time_start"]');
  const endInput = bookingForm.querySelector('input[name="time_end"]');
  if (startInput) startInput.value = reserva.time_start || DEFAULT_START_TIME;
  if (endInput) endInput.value = reserva.time_end || DEFAULT_END_TIME;
  const titleInput = bookingForm.querySelector('input[name="title"]');
  if (titleInput) titleInput.value = reserva.title || '';
  const descriptionInput = bookingForm.querySelector('textarea[name="description"]');
  if (descriptionInput) descriptionInput.value = reserva.description || '';
  bookingVisitorIds = (reserva.visitors || []).map(String);
  renderVisitorChecklist();
  renderRoomOptions(bookingDateInput?.value || '');
  bookingStepIndex = 3;
  setBookingStep(bookingStepIndex);
  cancelReservationEditBtn.hidden = false;
  bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (bookingMessage) bookingMessage.textContent = '';
}

async function onBookingSubmit(event) {
  event.preventDefault();
  if (!activeClient || !bookingForm) return;
  bookingMessage.textContent = '';

  const formData = new FormData(bookingForm);
  const record = Object.fromEntries(formData.entries());
  record.client_id = activeClient.id;
  // Se usuário pertence a uma empresa e marcou o toggle, salva company_id
  if (activeClient.company_id && bookingCompanyToggle && bookingCompanyToggle.checked) {
    record.company_id = activeClient.company_id;
  } else {
    record.company_id = null;
  }
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
    if (!json.success) throw new Error(json.error || 'Erro ao salvar reserva.');

    const reservationId = record.id || json.insertId;
    let inviteWarn = false;
    if (formData.get('send_invites') && reservationId && bookingVisitorIds.length) {
      try {
        await enviarConvites(reservationId, bookingVisitorIds);
      } catch (err) {
        inviteWarn = true;
        console.warn('Falha ao enviar convites:', err);
      }
    }
    const baseMessage = record.id ? 'Reserva atualizada com sucesso.' : 'Sua solicitação de reserva foi enviada. Você receberá a confirmação e o link de pagamento por e‑mail.';
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
  const startInput = bookingForm?.querySelector('input[name=\"time_start\"]');
  const endInput = bookingForm?.querySelector('input[name=\"time_end\"]');
  if (startInput) startInput.value = DEFAULT_START_TIME;
  if (endInput) endInput.value = DEFAULT_END_TIME;
  if (bookingDateInput) bookingDateInput.value = '';
  if (bookingRoomHiddenInput) bookingRoomHiddenInput.value = '';
  bookingStepIndex = 0;
  setBookingStep(bookingStepIndex);
  bookingVisitorIds = [];
  renderVisitorChecklist();
  renderRoomOptions('');
  if (bookingMessage && !preserveMessage) bookingMessage.textContent = '';
  bookingCurrentMonth = new Date();
  if (bookingCalendarGrid) renderBookingCalendar(bookingCurrentMonth);
}

async function carregarVisitantes(clientId) {
  if (!visitorsContainer) return;
  try {
    visitorsContainer.innerHTML = '<div class=\"rooms-message\">Carregando visitantes...</div>';
    const res = await fetch(`${API_BASE}/apiget.php?table=visitors`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar visitantes');
    currentVisitors = (json.data || []).filter(v => String(v.client_id) === String(clientId));
    renderVisitantes(currentVisitors);
    renderVisitorChecklist();
  } catch (err) {
    console.error(err);
    visitorsContainer.innerHTML = '<div class=\"rooms-message\">Não foi possível carregar os visitantes.</div>';
  }
}

function renderVisitantes(visitantes) {
  if (!visitorsContainer) return;
  if (!visitantes.length) {
    visitorsContainer.innerHTML = '<div class=\"rooms-message\">Nenhum visitante cadastrado.</div>';
    return;
  }
  const rows = visitantes.map(v => `
    <tr data-id=\"${v.id}\">
      <td>${escapeHtml(v.name || '--')}</td>
      <td>${escapeHtml(formatCPF(v.cpf) || '--')}</td>
      <td>${escapeHtml(v.email || '--')}</td>
      <td>${escapeHtml(formatPhone(v.phone) || '--')}</td>
      <td>${escapeHtml(formatPhone(v.whatsapp) || '--')}</td>
      <td><span class=\"status-badge ${statusClass(v.status)}\">${statusLabel(v.status)}</span></td>
      <td>
        <div class=\"table-actions\">
          <button type=\"button\" data-action=\"edit\" data-id=\"${v.id}\">Editar</button>
          <button type=\"button\" data-action=\"delete\" data-id=\"${v.id}\">Excluir</button>
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
    list.innerHTML = '<div class=\"rooms-message\">Nenhum visitante cadastrado. Cadastre visitantes na aba Visitantes.</div>';
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
      const info = document.createElement('div');
      info.className = 'visitor-multiselect-info';
      info.innerHTML = `<strong>${escapeHtml(visitor.name || '--')}</strong>${visitor.email ? `<span>${escapeHtml(visitor.email)}</span>` : ''}`;
      label.append(checkbox, info);
      list.appendChild(label);
    });
  }

  bookingVisitorSelector.appendChild(list);
}

function tratarAcaoVisitante(id, action) {
  if (!id) return;
  if (action === 'edit') {
    const visitante = currentVisitors.find(v => String(v.id) === String(id));
    if (visitante) preencherFormVisitante(visitante);
    return;
  }
  if (action === 'delete') {
    // Soft delete: marcar como INATIVO em vez de remover o registro
    const confirmar = confirm('Deseja inativar este visitante? (o registro não será apagado)');
    if (!confirmar) return;
    setVisitorStatus(id, 'inativo').then(() => atualizarPainel());
  }
}

function preencherFormVisitante(visitante) {
  openVisitorForm();
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
}

async function onVisitorSubmit(event) {
  event.preventDefault();
  if (!activeClient) return;
  const formData = new FormData(visitorForm);
  const record = Object.fromEntries(formData.entries());
  record.client_id = activeClient.id;
  if (activeClient.company_id) record.company_id = activeClient.company_id;
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
    if (!json.success) throw new Error(json.error || 'Erro ao salvar visitante.');
    resetVisitorForm();
    atualizarPainel();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Não foi possível salvar o visitante.');
  }
}

async function setVisitorStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/apiupdate.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ table: 'visitors', data: { id: Number(id), status } })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao atualizar status.');
  } catch (err) {
    console.error(err);
    alert('Não foi possível atualizar o status do visitante.');
  }
}

function openVisitorForm() {
  if (!visitorFormWrapper) return;
  visitorFormWrapper.hidden = false;
  visitorFormWrapper.classList.remove('is-collapsed');
  const firstInput = visitorForm?.querySelector('input[name="name"]');
  firstInput?.focus();
  visitorFormWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetVisitorForm() {
  visitorForm?.reset();
  if (visitorIdInput) visitorIdInput.value = '';
  visitorFormTitle.textContent = 'Novo Visitante';
  cancelVisitorEditBtn.hidden = true;
  if (visitorFormWrapper) {
    visitorFormWrapper.classList.add('is-collapsed');
    visitorFormWrapper.hidden = true;
  }
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
    if (!json.success) throw new Error(json.error || 'Erro ao excluir registro');
  } catch (err) {
    console.error(err);
    alert('Não foi possível concluir a operação.');
  }
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
  setProfileEditing(false);
}

function openProfileEditModal() {
  if (!activeClient || !profileEditModal) return;
  // Preenche campos com dados atuais
  if (editName) editName.value = activeClient.name || '';
  if (editLogin) editLogin.value = activeClient.login || '';
  if (editEmail) editEmail.value = activeClient.email || '';
  if (editCpf) editCpf.value = formatCPF(activeClient.cpf) || '';
  if (editPhone) editPhone.value = formatPhone(activeClient.phone) || '';
  if (editWhatsapp) editWhatsapp.value = formatPhone(activeClient.whatsapp) || '';
  if (currentPasswordInput) currentPasswordInput.value = '';
  if (newPasswordInput) newPasswordInput.value = '';
  if (newPasswordConfirmInput) newPasswordConfirmInput.value = '';
  updateModalPasswordIndicators();
  if (profileEditMessage) profileEditMessage.textContent = '';
  profileEditModal.classList.add('show');
  profileEditModal.setAttribute('aria-hidden','false');
}

function closeProfileEditModal(){
  profileEditModal?.classList.remove('show');
  profileEditModal?.setAttribute('aria-hidden','true');
}

function updateModalPasswordIndicators(){
  const senha = newPasswordInput?.value || '';
  const confirm = newPasswordConfirmInput?.value || '';
  const level = calcularNivelSenha(senha);
  setIndicatorState(pwdStrengthIndicator, level.state, `Força da senha: ${level.label}`);
  let matchState = 'neutral';
  let matchText = 'Confirmação: aguardando';
  if (senha && !confirm) { matchState = 'warning'; matchText = 'Confirmação: pendente'; }
  else if (confirm && senha === confirm) { matchState = 'ok'; matchText = 'Confirmação: senhas combinam'; }
  else if (confirm) { matchState = 'error'; matchText = 'Confirmação: senhas diferentes'; }
  setIndicatorState(pwdMatchIndicator, matchState, matchText);
}

async function onProfileEditSubmit(event){
  event.preventDefault();
  if (!activeClient) return;
  if (profileEditMessage) profileEditMessage.textContent = '';
  const payload = {
    id: activeClient.id,
    name: editName?.value.trim() || '',
    login: editLogin?.value.trim() || '',
    phone: somenteDigitos(editPhone?.value),
    whatsapp: somenteDigitos(editWhatsapp?.value)
  };
  if (!payload.name || !payload.login) {
    if (profileEditMessage) profileEditMessage.textContent = 'Preencha nome e login.';
    return;
  }
  try {
    // Atualiza dados básicos
    const res = await fetch(`${API_BASE}/client_update_profile.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar cadastro.');
    activeClient = { ...activeClient, ...json.client };
    renderProfile();

    // Se senha foi informada, valida e atualiza
    const cur = currentPasswordInput?.value || '';
    const np = newPasswordInput?.value || '';
    const npc = newPasswordConfirmInput?.value || '';
    if (cur || np || npc) {
      if (!cur || !np || !npc) throw new Error('Para trocar a senha, preencha todos os campos de senha.');
      if (np !== npc) throw new Error('As senhas novas não conferem.');
      if (!validarSenhaForte(np)) throw new Error('A nova senha não atende os requisitos.');
      const r2 = await fetch(`${API_BASE}/client_change_password.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeClient.id, current_password: cur, new_password: np })
      });
      const j2 = await r2.json();
      if (!j2.success) throw new Error(j2.error || 'Não foi possível alterar a senha.');
    }
    if (profileEditMessage) profileEditMessage.textContent = 'Dados salvos com sucesso.';
    closeProfileEditModal();
  } catch (err) {
    if (profileEditMessage) profileEditMessage.textContent = err.message || 'Falha ao salvar.';
  }
}

async function onProfileSubmit(event) {
  event.preventDefault();
  if (!activeClient) return;
  const name = profileInputs.name?.value.trim();
  const login = profileInputs.login?.value.trim();
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
    if (clientNameEl) clientNameEl.textContent = activeClient.name || activeClient.login || 'Cliente';
    if (clientCompanyEl) clientCompanyEl.textContent = obterNomeEmpresa(activeClient.company_id) || (activeClient.company_id ? 'Empresa não localizada' : 'Cliente pessoa física');
    renderProfile();
    if (profileMessageEl) profileMessageEl.textContent = json.message || 'Dados atualizados.';
  } catch (err) {
    console.error(err);
    if (profileMessageEl) profileMessageEl.textContent = err.message || 'Não foi possível atualizar os dados.';
  }
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
  if (isEditing) profileInputs.name?.focus();
}

function buscarSala(id) {
  return roomsCache.find(room => String(room.id) === String(id));
}

function podeCancelar(reserva) {
  if (!reserva || !reserva.date) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataReserva = new Date(reserva.date);
  return dataReserva.getTime() - hoje.getTime() >= 24 * 60 * 60 * 1000;
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
  const [h = '00', m = '00'] = value.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

function somenteDigitos(value) {
  return (value || '').toString().replace(/\D/g, '');
}

function formatCPF(value) {
  const digits = somenteDigitos(value).slice(0, 11);
  if (!digits) return '';
  let formatted = digits;
  formatted = formatted.replace(/^(\d{3})(\d)/, '$1.$2');
  formatted = formatted.replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2');
  formatted = formatted.replace(/^(\d{3}\.\d{3}\.\d{3})(\d{1,2})$/, '$1-$2');
  return formatted;
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

function toISODate(value) {
  if (!value) return '';
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  date.setHours(0, 0, 0, 0);
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

function formatCurrency(value){
  const n=Number(value);
  if(!isFinite(n))return '';
  try{return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch(_){return 'R$ '+(Math.round(n*100)/100).toFixed(2).replace('.',',');}
}


function setCookie(name, value, days = 30) {
  try {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  } catch (_) {
    /* ignore cookie errors */
  }
}

function getCookie(name) {
  try {
    const entry = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
    if (!entry) return '';
    return decodeURIComponent(entry.split('=')[1]);
  } catch (_) {
    return '';
  }
}

function deleteCookie(name) {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  } catch (_) {
    /* ignore cookie errors */
  }
}

function cpfValido(cpf) {
  const digits = somenteDigitos(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(digits[i]) * (10 - i);
  }
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(digits[i]) * (11 - i);
  }
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(digits[10]);
}

function onCpfInputChange(event) {
  const digits = somenteDigitos(event.target.value).slice(0, 11);
  event.target.value = formatCPF(digits);
  atualizarFeedbackCPF(digits);
}

function atualizarFeedbackCPF(cpfDigits, forceInvalid = false) {
  if (!cpfHintEl) return;
  const digits = typeof cpfDigits === 'string' ? somenteDigitos(cpfDigits) : '';
  const remaining = 11 - digits.length;
  if (!digits) {
    setHintState(cpfHintEl, 'neutral', 'Informe os 11 dígitos do CPF.');
    return;
  }
  if (digits.length < 11) {
    setHintState(cpfHintEl, 'warning', `Faltam ${remaining} dígito${remaining === 1 ? '' : 's'}.`);
    return;
  }
  if (!cpfValido(digits) || forceInvalid) {
    setHintState(cpfHintEl, 'error', 'CPF inválido. Verifique os números.');
    return;
  }
  setHintState(cpfHintEl, 'ok', 'CPF válido.');
}

function setHintState(element, state, text) {
  if (!element) return;
  element.textContent = text;
  element.classList.remove('state-ok', 'state-warning', 'state-error');
  if (state && state !== 'neutral') {
    element.classList.add(`state-${state}`);
  }
}

function validarSenhaForte(senha = '') {
  if (typeof senha !== 'string' || senha.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(senha);
  const hasNumber = /\d/.test(senha);
  const hasSpecial = /[^A-Za-z0-9]/.test(senha);
  return hasLetter && hasNumber && hasSpecial;
}

function calcularNivelSenha(senha = '') {
  if (!senha) return { state: 'neutral', label: 'aguardando' };
  const length = senha.length;
  const hasLetter = /[A-Za-z]/.test(senha);
  const hasNumber = /\d/.test(senha);
  const hasSpecial = /[^A-Za-z0-9]/.test(senha);

  if (length >= 8 && hasLetter && hasNumber && hasSpecial) {
    return { state: 'ok', label: 'forte' };
  }
  if (length >= 6 && hasLetter && (hasNumber || hasSpecial)) {
    return { state: 'warning', label: 'média' };
  }
  return { state: 'error', label: 'fraca' };
}

function setIndicatorState(element, state, text) {
  if (!element) return;
  element.textContent = text;
  element.classList.remove('state-ok', 'state-warning', 'state-error', 'state-neutral');
  element.classList.add(`state-${state}`);
}

function avaliarForcaSenha(senha = '', confirmacao = '') {
  const level = calcularNivelSenha(senha);
  const matchState = (() => {
    if (!senha && !confirmacao) return { state: 'neutral', label: 'Confirmação: aguardando' };
    if (senha && !confirmacao) return { state: 'warning', label: 'Confirmação: pendente' };
    if (confirmacao && senha === confirmacao) return { state: 'ok', label: 'Confirmação: senhas combinam' };
    if (confirmacao) return { state: 'error', label: 'Confirmação: senhas diferentes' };
    return { state: 'neutral', label: 'Confirmação: aguardando' };
  })();

  setIndicatorState(passwordStrengthIndicator, level.state, `Força da senha: ${level.label}`);
  setIndicatorState(passwordMatchIndicator, matchState.state, matchState.label);

  if (passwordHint) {
    const invalid = (senha && level.state !== 'ok') || (confirmacao && senha !== confirmacao);
    passwordHint.classList.toggle('invalid', invalid);
  }
}

async function enviarConvites(reservationId, visitorIds) {
  const payload = visitorIds
    .map(id => Number(id))
    .filter(id => !Number.isNaN(id) && id > 0);
  if (!payload.length) return;
  try {
    await Promise.all(payload.map(visitorId =>
      fetch(`${API_BASE}/send_visitor_invite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reservation_id: reservationId, visitor_id: visitorId })
      }).then(res => res.json()).then(json => {
        if (!json.success) throw new Error(json.error || 'Falha ao enviar convite');
        return json;
      })
    ));
  } catch (err) {
    console.warn('Convite para visitantes falhou:', err.message || err);
    throw err;
  }
}

async function enviarLinkPagamento(reservationId) {
  if (!reservationId) throw new Error('Reserva inválida.');
  const res = await fetch(`${API_BASE}/send_payment_link.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reservation_id: reservationId })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Falha ao enviar link de pagamento.');
  return json;
}
