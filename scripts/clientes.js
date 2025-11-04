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
const loginIdentifierInput = document.getElementById('portalLoginIdentifier');
const loginPasswordInput = document.getElementById('portalLoginPassword');
const rememberMeCheckbox = document.getElementById('portalRememberMe');

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
const bookingRoomSearchInput = document.getElementById('bookingRoomSearch');
const bookingCityFilterInput = document.getElementById('bookingCityFilter');
const bookingStateFilterInput = document.getElementById('bookingStateFilter');
const bookingTitleInput = bookingForm?.querySelector('input[name="title"]');
const bookingDescriptionInput = bookingForm?.querySelector('textarea[name="description"]');

const reservationsContainer = document.getElementById('reservationsContainer');

const visitorForm = document.getElementById('visitorForm');
const visitorFormTitle = document.getElementById('visitorFormTitle');
const visitorIdInput = visitorForm?.querySelector('input[name="id"]');
const cancelVisitorEditBtn = document.getElementById('cancelVisitorEdit');
const newVisitorBtn = document.getElementById('newVisitorBtn');
const visitorsContainer = document.getElementById('visitorsContainer');

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

const portalNavButtons = Array.from(document.querySelectorAll('.portal-nav [data-panel]'));
const portalSections = {
  book: document.getElementById('panel-book'),
  reservations: document.getElementById('panel-reservations'),
  visitors: document.getElementById('panel-visitors'),
  profile: document.getElementById('panel-profile')
};

initialize();

async function initialize() {
  try {
    await Promise.all([carregarSalas(), carregarEmpresas()]);
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
  const passwordInput = document.getElementById('registerPassword');
  const confirmPasswordInput = document.getElementById('registerPasswordConfirm');
  passwordInput?.addEventListener('input', () => avaliarForcaSenha(passwordInput.value, confirmPasswordInput?.value || ''));
  confirmPasswordInput?.addEventListener('input', () => avaliarForcaSenha(passwordInput?.value || '', confirmPasswordInput.value));

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
  bookingCityFilterInput?.addEventListener('input', () => renderRoomOptions(bookingDateInput?.value || ''));
  bookingStateFilterInput?.addEventListener('input', () => renderRoomOptions(bookingDateInput?.value || ''));
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
    visitorForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  visitorForm?.addEventListener('submit', onVisitorSubmit);
  cancelVisitorEditBtn?.addEventListener('click', resetVisitorForm);
  newVisitorBtn?.addEventListener('click', () => {
    resetVisitorForm();
    visitorForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  profileForm?.addEventListener('submit', onProfileSubmit);
  editProfileBtn?.addEventListener('click', () => setProfileEditing(true));
  cancelProfileEditBtn?.addEventListener('click', () => {
    renderProfile();
    setProfileEditing(false);
  });

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
    roomsCache = [];
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
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Selecione a data para visualizar as salas disponíveis.';
    return;
  }
  if (!roomsCache.length) {
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Carregando salas disponíveis...';
    return;
  }
  const searchTerm = (bookingRoomSearchInput?.value || '').trim().toLowerCase();
  const cityFilter = (bookingCityFilterInput?.value || '').trim().toLowerCase();
  const stateFilter = (bookingStateFilterInput?.value || '').trim().toLowerCase();

  const availableRooms = getAvailableRoomsForDate(date, reservationIdInput?.value).filter(room => {
    const name = (room.name || `Sala #${room.id}`).toString().toLowerCase();
    const city = (room.city || '').toString().toLowerCase();
    const state = (room.state || room.uf || '').toString().toLowerCase();
    if (searchTerm && !name.includes(searchTerm)) return false;
    if (cityFilter && !city.includes(cityFilter)) return false;
    if (stateFilter && state !== stateFilter) return false;
    return true;
  }).sort((a, b) => {
    const nameA = (a.name || `Sala #${a.id}`).toString().toLowerCase();
    const nameB = (b.name || `Sala #${b.id}`).toString().toLowerCase();
    return nameA.localeCompare(nameB, 'pt-BR');
  });
  if (!availableRooms.length) {
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Nenhuma sala encontrada com os filtros atuais.';
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
    button.innerHTML = `
      <strong>${escapeHtml(room.name || `Sala #${room.id}`)}</strong>
      <span>Capacidade: ${capacityText} pessoas</span>
      <span>Local: ${cityText} - ${stateText}</span>
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
    const totalSelectable = roomsCache.filter(room => isRoomSelectable(room, iso)).length;
    const availableRooms = totalSelectable ? getAvailableRoomsForDate(iso, reservationIdInput?.value) : [];

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
    } else if (!totalSelectable) {
      statusClass = 'full';
      clickable = false;
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
    if (['cancelada', 'cancelado', 'negada'].includes(status)) return false;
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
  const cpfInput = document.getElementById('registerCpf');
  const phoneInput = document.getElementById('registerPhone');
  const passwordInput = document.getElementById('registerPassword');
  const confirmPasswordInput = document.getElementById('registerPasswordConfirm');
  const cpfDigits = somenteDigitos(cpfInput?.value);
  const phoneDigits = somenteDigitos(phoneInput?.value);
  if (cpfInput) cpfInput.value = formatCPF(cpfDigits);
  if (phoneInput) phoneInput.value = formatPhone(phoneDigits);
  const passwordValue = passwordInput?.value || '';
  const passwordConfirmValue = confirmPasswordInput?.value || '';
  const senhaForte = validarSenhaForte(passwordValue);
  avaliarForcaSenha(passwordValue, passwordConfirmValue);
  const payload = {
    name: document.getElementById('registerName')?.value.trim(),
    email: document.getElementById('registerEmail')?.value.trim(),
    login: document.getElementById('registerLogin')?.value.trim(),
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
  resetBookingForm();
  setActivePanel('book');
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
    const stored = localStorage.getItem('portalRememberLogin');
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
    const showCancel = ['pendente', 'confirmada'].includes(statusNormalized) && podeCancelar(reserva);
    const showInvite = Array.isArray(reserva.visitors) && reserva.visitors.length;
    const showPayment = ['pendente', 'confirmada'].includes(statusNormalized);
    return `
      <tr data-id=\"${reserva.id}\">
        <td>${formatDate(reserva.date)}</td>
        <td>${escapeHtml(roomName)}</td>
        <td>
          <span class=\"status-badge ${statusClass(reserva.status)}\">${statusLabel(reserva.status)}</span>
          ${renderReservationFlow(statusNormalized)}
        </td>
        <td>${escapeHtml(timeRange)}</td>
        <td>${visitorNames}</td>
        <td>${escapeHtml(reserva.title || '--')}</td>
        <td>
          <div class=\"table-actions\">
            ${showCancel ? `<button type=\"button\" data-action=\"cancel\" data-id=\"${reserva.id}\">Cancelar</button>` : ''}
            ${showPayment ? `<button type=\"button\" data-action=\"payment\" data-id=\"${reserva.id}\">Pagamento</button>` : ''}
            ${showInvite ? `<button type=\"button\" data-action=\"invite\" data-id=\"${reserva.id}\">Enviar convites</button>` : ''}
            <button type=\"button\" data-action=\"edit\" data-id=\"${reserva.id}\">Editar</button>
            <button type=\"button\" data-action=\"delete\" data-id=\"${reserva.id}\">Excluir</button>
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
          <th>Visitantes</th>
          <th>Título</th>
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
          ${v.email ? `<button type=\"button\" data-action=\"invite\" data-id=\"${v.id}\">Enviar convite</button>` : ''}
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

function resetVisitorForm() {
  visitorForm?.reset();
  if (visitorIdInput) visitorIdInput.value = '';
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

function validarSenhaForte(senha = '') {
  if (typeof senha !== 'string' || senha.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(senha);
  const hasNumber = /\d/.test(senha);
  const hasSpecial = /[^A-Za-z0-9]/.test(senha);
  return hasLetter && hasNumber && hasSpecial;
}

function avaliarForcaSenha(senha = '', confirmacao = '') {
  if (!passwordHint) return;
  const forte = validarSenhaForte(senha);
  const confere = !confirmacao || senha === confirmacao;
  passwordHint.classList.toggle('invalid', !forte || !confere);
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
