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

const portalNavButtons = Array.from(document.querySelectorAll('.portal-nav [data-panel]'));
const portalSections = {
  book: document.getElementById('panel-book'),
  reservations: document.getElementById('panel-reservations'),
  visitors: document.getElementById('panel-visitors'),
  profile: document.getElementById('panel-profile')
};

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

  visitorForm?.addEventListener('submit', onVisitorSubmit);
  cancelVisitorEditBtn?.addEventListener('click', resetVisitorForm);
  newVisitorBtn?.addEventListener('click', () => {
    resetVisitorForm();
    openVisitorForm();
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
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Selecione a data para visualizar as salas disponíveis.';
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
    // Mostrar sugestão das salas que combinam com os filtros, porém indisponíveis na data
    const allMatching = roomsCache.filter(room => {
      const name = normalize(room.name || `Sala #${room.id}`);
      const city = normalize(room.city || '');
      const state = normalize(room.state || room.uf || '');
      if (searchTerm && !name.includes(searchTerm)) return false;
      if (cityFilter && !city.includes(cityFilter)) return false;
      if (stateFilter && state !== stateFilter) return false;
      if (amenityIds.length && !amenityIds.every(id => (room.amenities || []).includes(Number(id)) || (room.amenities || []).includes(String(id)))) return false;
      return true;
    }).sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'));

    if (!allMatching.length) {
      if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Nenhuma sala encontrada com os filtros atuais.';
      return;
    }
    if (bookingRoomFeedback) bookingRoomFeedback.textContent = 'Todas as salas que combinam com os filtros estão indisponíveis para esta data:';
    allMatching.forEach(room => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'room-option disabled-room';
      button.disabled = true;
      const capacityText = room.capacity !== null && room.capacity !== undefined && room.capacity !== '' ? escapeHtml(room.capacity) : '--';
      const cityText = room.city ? escapeHtml(room.city) : '--';
      const stateText = room.state || room.uf ? escapeHtml((room.state || room.uf).toUpperCase()) : '--';
      const priceHtml = room.daily_rate ? `<span class=\"price\"><strong>${formatCurrency(room.daily_rate)}</strong> / diária</span>` : '';
      button.innerHTML = `
        <strong>${escapeHtml(room.name || `Sala #${room.id}`)}</strong>
        <span class=\"meta\">${cityText} - ${stateText} · ${capacityText} pessoas</span>
        ${priceHtml}
      `;
      bookingRoomOptions.appendChild(button);
    });
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
    const showCancel = ['pendente', 'confirmada'].includes(statusNormalized) && podeCancelar(reserva);
    const showInvite = Array.isArray(reserva.visitors) && reserva.visitors.length;
    const showPayment = ['pendente', 'confirmada'].includes(statusNormalized);
    const icsLink = `api/reservation_ics.php?reservation=${encodeURIComponent(reserva.id)}`;
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
            <a href=\"${icsLink}\" download class=\"btn-ghost\">ICS</a>
            <button type=\"button\" data-action=\"sendCalendar\" data-id=\"${reserva.id}\">Solicitar reunião</button>
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
