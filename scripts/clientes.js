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
const currentUrl = new URL(window.location.href);
const hasPaymentToken = currentUrl.searchParams.has('pagarmetoken') || currentUrl.searchParams.has('token');
const isPaymentReturn = hasPaymentToken;

if (isPaymentReturn) {
  console.log('[ZEEFE] Pagamento: ignorando auto-login');
}

// Helper: parse JSON safely to avoid "Unexpected end of JSON input"
async function parseJsonSafe(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch (_) {
    throw new Error(text || `Resposta inválida (HTTP ${res.status})`);
  }
}

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
const headerAccountWrap = document.getElementById('clientHeaderAccount');
const headerAccountBtn = document.getElementById('clientHeaderAccountBtn');
const headerScopePFHeaderBtn = document.getElementById('clientHeaderScopePF');
const headerScopeCompanyBtn = document.getElementById('clientHeaderScopeCompany');
const headerReservationsBtn = document.getElementById('clientHeaderReservations');
const headerProfileBtn = document.getElementById('clientHeaderProfile');
const headerMessagesBtn = document.getElementById('clientHeaderMessages');
const headerLogoutBtn = document.getElementById('clientHeaderLogout');

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
const bookingRoomsMapEl = document.getElementById('bookingRoomsMap');
let bookingMap = null;
let bookingMarkersLayer = null;
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
const bookingVoucherInput = document.getElementById('bookingVoucherCode');
const bookingVoucherApplyBtn = document.getElementById('bookingVoucherApply');
const bookingVoucherResult = document.getElementById('bookingVoucherResult');
let bookingVoucherApplied = null; // { code, discount, payable }
let bookingSelectedDates = [];
let bookingDateMulti = false;
let availableCoursesCache = [];
let clientCoursesCache = [];
const workshopDetailsCache = new Map();
let courseModalContext = { courseId: null, course: null, enrollment: null, voucher: null, voucherData: null, focusEnroll: false };
let headerMenuOpen = false;
let portalRefreshTimer = null;

const reservationsContainer = document.getElementById('reservationsContainer');
// Modal de ações da reserva
const reservationActionsModal = document.getElementById('reservationActionsModal');
// Empresa/Membros modais
const inviteMemberModal = document.getElementById('inviteMemberModal');
const inviteMemberClose = document.getElementById('inviteMemberClose');
const inviteMemberCancel = document.getElementById('inviteMemberCancel');
const inviteCpfInput = document.getElementById('inviteCpf');
const inviteEmailInput = document.getElementById('inviteEmail');
const inviteRoleSelect = document.getElementById('inviteRole');
const inviteLookupBtn = document.getElementById('inviteLookupBtn');
const inviteLookupResult = document.getElementById('inviteLookupResult');
const inviteMemberSend = document.getElementById('inviteMemberSend');

const manualMembersModal = document.getElementById('manualMembersModal');
const manualMembersClose = document.getElementById('manualMembersClose');
const manualMembersCancel = document.getElementById('manualMembersCancel');
const manualMembersTBody = document.getElementById('manualMembersTBody');
const manualAddRowBtn = document.getElementById('manualAddRow');
const manualMembersSubmit = document.getElementById('manualMembersSubmit');

const importContactsModal = document.getElementById('importContactsModal');
const importContactsClose = document.getElementById('importContactsClose');
const importPickFileBtn = document.getElementById('importPickFile');
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
const coursesPanel = document.getElementById('panel-courses');
const clientCoursesList = document.getElementById('clientCoursesList');
const clientCoursesMessage = document.getElementById('clientCoursesMessage');
const availableCoursesGrid = document.getElementById('availableCoursesGrid');
const availableCoursesMessage = document.getElementById('availableCoursesMessage');
const coursesFeedback = document.getElementById('coursesFeedback');
const courseModal = document.getElementById('courseDetailsModal');
const courseModalClose = document.getElementById('courseDetailsClose');
const courseModalTitle = document.getElementById('courseDetailsTitle');
const courseModalMeta = document.getElementById('courseDetailsMeta');
const courseModalActions = document.getElementById('courseDetailsActions');
const courseModalCoverWrapper = document.getElementById('courseDetailsCoverWrapper');
const courseModalCover = document.getElementById('courseDetailsCover');
const courseModalDescription = document.getElementById('courseDetailsDescription');
const courseModalWhen = document.getElementById('courseDetailsWhen');
const courseModalWhere = document.getElementById('courseDetailsWhere');
const courseModalPrice = document.getElementById('courseDetailsPrice');
const courseModalSeats = document.getElementById('courseDetailsSeats');
const courseModalStatus = document.getElementById('courseDetailsStatus');
const courseEnrollArea = document.getElementById('courseEnrollArea');
const courseModalVoucherInput = document.getElementById('courseDetailsVoucher');
const courseModalVoucherApply = document.getElementById('courseDetailsVoucherApply');
const courseModalVoucherResult = document.getElementById('courseDetailsVoucherResult');
const courseModalConfirmBtn = document.getElementById('courseDetailsConfirm');
const courseCheckoutOpen = document.getElementById('courseCheckoutOpen');
const courseTicketSection = document.getElementById('courseTicketSection');
const courseTicketCode = document.getElementById('courseTicketCode');
const courseTicketQr = document.getElementById('courseTicketQr');
const courseTicketInfo = document.getElementById('courseTicketInfo');

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
  company: document.getElementById('profileCompanyInput'),
  street: document.getElementById('profileStreetInput'),
  number: document.getElementById('profileNumberInput'),
  complement: document.getElementById('profileComplementInput'),
  zip_code: document.getElementById('profileZipInput'),
  city: document.getElementById('profileCityInput'),
  state: document.getElementById('profileStateInput'),
  country: document.getElementById('profileCountryInput')
};

// Modal de edição de perfil
const profileEditModal = document.getElementById('profileEditModal');
const profileEditClose = document.getElementById('profileEditClose');
const profileEditCancel = document.getElementById('profileEditCancel');
const profileEditForm = document.getElementById('profileEditForm');
const profileEditMessage = document.getElementById('profileEditMessage');
const openPasswordModalBtn = document.getElementById('openPasswordModalBtn');
const passwordChangeModal = document.getElementById('passwordChangeModal');
const passwordChangeClose = document.getElementById('passwordChangeClose');
const passwordChangeCancel = document.getElementById('passwordChangeCancel');
const passwordChangeForm = document.getElementById('passwordChangeForm');
const passwordChangeMessage = document.getElementById('passwordChangeMessage');
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
const editStreet = document.getElementById('editStreet');
const editNumber = document.getElementById('editNumber');
const editComplement = document.getElementById('editComplement');
const editZip = document.getElementById('editZip');
const editCity = document.getElementById('editCity');
const editState = document.getElementById('editState');
const editCountry = document.getElementById('editCountry');
const profileZip = document.getElementById('profileZipInput');

const portalNavButtons = Array.from(document.querySelectorAll('.portal-nav [data-panel]'));
const portalSections = {
  book: document.getElementById('panel-book'),
  reservations: document.getElementById('panel-reservations'),
  visitors: document.getElementById('panel-visitors'),
  courses: document.getElementById('panel-courses'),
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
const companyManualBtn = document.getElementById('companyManualBtn');
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

// Fluxo de busca (datas primeiro vs salas primeiro)
let bookingSearchMode = 'date'; // 'date' | 'room' (room em breve)
const bookingModeDateBtn = document.getElementById('bookingModeDate');
const bookingModeRoomBtn = document.getElementById('bookingModeRoom');
const bookingModeHint = document.getElementById('bookingModeHint');
const dateModeSingleBtn = document.getElementById('dateModeSingle');
const dateModeMultiBtn = document.getElementById('dateModeMulti');
const multiDateSummaryEl = document.getElementById('multiDateSummary');
const bookingSummaryEl = document.getElementById('bookingSummary');

// Stepper labels (Data/Salas) para ajustar conforme o fluxo
const bookingStepperItemsEls = Array.from(document.querySelectorAll('.booking-stepper-item'));
const stepLabelData = bookingStepperItemsEls[0]?.querySelector('strong');
const stepLabelRooms = bookingStepperItemsEls[1]?.querySelector('strong');

// Modal de aviso sobre visitantes
const bookingVisitorsModal = document.getElementById('bookingVisitorsModal');
const bookingVisitorsMessage = document.getElementById('bookingVisitorsMessage');
const bookingVisitorsClose = document.getElementById('bookingVisitorsClose');
const bookingVisitorsAddBtn = document.getElementById('bookingVisitorsAddBtn');
const bookingVisitorsContinueBtn = document.getElementById('bookingVisitorsContinueBtn');
let bookingVisitorsModalMode = null; // 'noVisitors' | 'invites'
let bookingPendingRecord = null;
let bookingPendingFormData = null;

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
  if (hasPaymentToken) {
    console.log('[Portal] Retorno de pagamento: mantendo portal e aplicando auto-login memorizado.');
  }
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

  courseModalClose?.addEventListener('click', closeCourseModal);
  courseModal?.addEventListener('click', (event) => { if (event.target === courseModal) closeCourseModal(); });
  courseModalVoucherApply?.addEventListener('click', () => applyCourseVoucher());
  courseModalConfirmBtn?.addEventListener('click', () => submitCourseEnrollment());
  courseCheckoutOpen?.addEventListener('click', () => {
    if (courseModalContext.checkoutUrl) {
      window.open(courseModalContext.checkoutUrl, '_blank', 'noopener');
    }
  });

  // Debounce helper para evitar gravações frequentes
  function debounce(fn, delay = 600) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  // Checkbox de lembrar login: agora só liga/desliga a preferência; o salvamento efetivo é feito após login bem-sucedido
  rememberMeCheckbox?.addEventListener('change', () => {
    if (!rememberMeCheckbox.checked) {
      registrarPreferenciaLogin(false);
    }
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
  bookingPrevBtn?.addEventListener('click', () => goToPrevBookingStep());
  bookingNextBtn?.addEventListener('click', () => {
    if (validateBookingStep(bookingStepIndex)) {
      goToNextBookingStep();
    }
  });
  bookingPrevMonthBtn?.addEventListener('click', () => changeCalendarMonth(-1));
  bookingNextMonthBtn?.addEventListener('click', () => changeCalendarMonth(1));
  bookingRoomSearchInput?.addEventListener('input', () => renderRoomOptions(bookingDateInput?.value || ''));
  // Sem filtros no portal
  bookingTitleInput?.addEventListener('input', onBookingDetailsChange);
  bookingDescriptionInput?.addEventListener('input', onBookingDetailsChange);
  bookingVoucherInput?.addEventListener('input', () => { if (bookingVoucherResult) bookingVoucherResult.textContent=''; bookingVoucherApplied = null; });
  bookingVoucherApplyBtn?.addEventListener('click', onApplyVoucherClick);

  // Modal de visitantes (confirmação antes de enviar)
  bookingVisitorsClose?.addEventListener('click', () => hideBookingVisitorsModal());
  bookingVisitorsModal?.addEventListener('click', (e) => { if (e.target === bookingVisitorsModal) hideBookingVisitorsModal(); });
  bookingVisitorsAddBtn?.addEventListener('click', () => {
    hideBookingVisitorsModal();
    // leva o usuário para a etapa de Visitantes
    bookingStepIndex = 3;
    setBookingStep(bookingStepIndex);
    setActivePanel('book');
  });
  bookingVisitorsContinueBtn?.addEventListener('click', () => {
    hideBookingVisitorsModal(true);
    if (bookingPendingRecord && bookingPendingFormData) {
      finalizeBookingSubmission(bookingPendingRecord, bookingPendingFormData).catch(err => {
        console.error(err);
        if (bookingMessage) bookingMessage.textContent = err.message || 'Não foi possível salvar a reserva.';
      });
    }
  });

  // Modo de datas: simples x múltiplas
  dateModeSingleBtn?.addEventListener('click', () => {
    bookingDateMulti = false;
    dateModeSingleBtn.classList.add('active');
    if (dateModeMultiBtn) dateModeMultiBtn.classList.remove('active');
    // Mantém apenas a primeira data selecionada
    if (bookingSelectedDates.length > 0) {
      bookingSelectedDates = [bookingSelectedDates[0]];
    }
    if (bookingDateInput) bookingDateInput.value = bookingSelectedDates[0] || '';
    updateMultiDateSummary();
    renderBookingCalendar(bookingCurrentMonth);
  });
  dateModeMultiBtn?.addEventListener('click', () => {
    bookingDateMulti = true;
    dateModeMultiBtn.classList.add('active');
    if (dateModeSingleBtn) dateModeSingleBtn.classList.remove('active');
    updateMultiDateSummary();
  });

  // Modo de busca (datas primeiro)
  bookingModeDateBtn?.addEventListener('click', () => {
    bookingSearchMode = 'date';
    bookingModeDateBtn.classList.add('active');
    if (bookingModeRoomBtn) bookingModeRoomBtn.classList.remove('active');
    if (bookingModeHint) bookingModeHint.textContent = 'Buscar por Data: selecione um ou mais dias no calendário e depois escolha a sala.';
    if (stepLabelData) stepLabelData.textContent = 'DATA';
    if (stepLabelRooms) stepLabelRooms.textContent = 'SALAS';
    // Datas primeiro: começa escolhendo datas (etapa 0)
    bookingStepIndex = 0;
    setBookingStep(bookingStepIndex);
    if (roomPickerInline) roomPickerInline.hidden = true;
  });
  bookingModeRoomBtn?.addEventListener('click', () => {
    bookingSearchMode = 'room';
    bookingModeRoomBtn.classList.add('active');
    if (bookingModeDateBtn) bookingModeDateBtn.classList.remove('active');
    bookingSelectedDates = [];
    if (bookingDateInput) bookingDateInput.value = '';
    // Buscar por Local: passo 1 SALAS, passo 2 DATA
    bookingStepIndex = 0;
    setBookingStep(bookingStepIndex);
    renderRoomOptions('');
    if (bookingModeHint) bookingModeHint.textContent = 'Buscar por Local: escolha a sala primeiro, depois veja as datas disponíveis no calendário.';
    if (stepLabelData) stepLabelData.textContent = 'SALAS';
    if (stepLabelRooms) stepLabelRooms.textContent = 'DATA';
  });

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
  editZip?.addEventListener('input', () => { editZip.value = formatCEP(editZip.value); });
  editZip?.addEventListener('blur', () => { autoFillAddressFromCEP(editZip.value, 'edit'); });
  profileZip?.addEventListener('input', () => { profileZip.value = formatCEP(profileZip.value); });
  profileZip?.addEventListener('blur', () => { autoFillAddressFromCEP(profileZip.value, 'profile'); });
  openPasswordModalBtn?.addEventListener('click', openPasswordChangeModal);
  passwordChangeClose?.addEventListener('click', closePasswordChangeModal);
  passwordChangeCancel?.addEventListener('click', closePasswordChangeModal);
  passwordChangeModal?.addEventListener('click', (e) => { if (e.target === passwordChangeModal) closePasswordChangeModal(); });
  passwordChangeForm?.addEventListener('submit', onPasswordChangeSubmit);

  // Client chat modal events
  clientChatClose?.addEventListener('click', closeClientChat);
  clientChatModal?.addEventListener('click', (e)=>{ if (e.target === clientChatModal) closeClientChat(); });
  clientChatForm?.addEventListener('submit', onClientChatSubmit);
  // Botão de Mensagens (suporte)
  openSupportChatBtn?.addEventListener('click', () => {
    openClientSupportChat();
  });
  clientSupportThreadItem?.addEventListener('click', () => { openClientSupportChat(); });
  openReportProblemBtn?.addEventListener('click', openReportProblemModal);
  reportProblemClose?.addEventListener('click', closeReportProblemModal);
  reportProblemCancel?.addEventListener('click', closeReportProblemModal);
  reportProblemModal?.addEventListener('click', (e) => { if (e.target === reportProblemModal) closeReportProblemModal(); });
  reportProblemForm?.addEventListener('submit', onReportProblemSubmit);

  // Empresa/Membros modais
  document.getElementById('openInviteModal')?.addEventListener('click', openInviteMemberModal);
  document.getElementById('openManualModal')?.addEventListener('click', openManualMembersModal);
  document.getElementById('openImportModal')?.addEventListener('click', openImportContactsModal);
  document.getElementById('openManageInvites')?.addEventListener('click', () => {
    const block = document.getElementById('companyInvitesBlock');
    if (block) { block.hidden = false; }
    setCompanySubtab('users');
    document.getElementById('companyInvitesBlock')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('companyInvitesClose')?.addEventListener('click', () => {
    const block = document.getElementById('companyInvitesBlock');
    if (block) block.hidden = true;
  });
  inviteMemberClose?.addEventListener('click', closeInviteMemberModal);
  inviteMemberCancel?.addEventListener('click', closeInviteMemberModal);
  inviteMemberModal?.addEventListener('click', (e) => { if (e.target === inviteMemberModal) closeInviteMemberModal(); });
  inviteLookupBtn?.addEventListener('click', onInviteLookup);
  inviteMemberSend?.addEventListener('click', onInviteSend);

  manualMembersClose?.addEventListener('click', closeManualMembersModal);
  manualMembersCancel?.addEventListener('click', closeManualMembersModal);
  manualMembersModal?.addEventListener('click', (e)=>{ if (e.target===manualMembersModal) closeManualMembersModal(); });
  manualAddRowBtn?.addEventListener('click', () => addManualRow());
  manualMembersSubmit?.addEventListener('click', onManualMembersSubmit);

  importContactsClose?.addEventListener('click', closeImportContactsModal);
  importContactsModal?.addEventListener('click', (e)=>{ if (e.target===importContactsModal) closeImportContactsModal(); });
  importPickFileBtn?.addEventListener('click', ()=> document.getElementById('companyXlsxInput')?.click());

  // Scope buttons
  scopePFBtn?.addEventListener('click', () => setPortalScope('pf'));
  scopeCompanyBtn?.addEventListener('click', () => setPortalScope('company'));

  // Company tab buttons
  companyTabs.forEach(b => b.addEventListener('click', () => setCompanySubtab(b.dataset.companyTab)));
  companyInviteBtn?.addEventListener('click', onCompanyInviteSubmit);
  companyCsvInput?.addEventListener('change', onCompanyCsvSelected);
  companyXlsxInput?.addEventListener('change', onCompanyXlsxSelected);
  companyResendBtn?.addEventListener('click', onCompanyResendLookup);
  companyManualBtn?.addEventListener('click', () => showXlsxPreviewModal(null, []));

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
  setupHeaderMenu();

  bookingCurrentMonth = new Date(bookingToday.getFullYear(), bookingToday.getMonth(), 1);
  renderBookingCalendar(bookingCurrentMonth);

  // Detect invite token from URL to drive registration flow
  if (!hasPaymentToken) {
    const inviteToken = currentUrl.searchParams.get('invite');
    if (inviteToken) {
      window.pendingInviteToken = inviteToken;
      showAuthOverlay();
      setAuthView('register');
      if (authMessage) authMessage.textContent = 'Convite recebido: conclua seu cadastro para aceitar o vínculo com a empresa.';
    }
  }
  renderVisitorChecklist();
  setBookingStep(0);
  renderRoomOptions(bookingDateInput?.value || '');
  updateBookingNavigation();
  if (hasPaymentToken) {
    setBodyAuthState(true);
    hideAuthOverlay();
    if (clientPanels) clientPanels.hidden = false;
    if (authSection) authSection.hidden = true;
  } else {
    setBodyAuthState(false);
    showAuthOverlay();
  }
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

function setupHeaderMenu() {
  if (!headerAccountWrap || !headerAccountBtn) return;
  headerAccountBtn.addEventListener('click', (event) => {
    event.preventDefault();
    setHeaderMenuState(!headerMenuOpen);
  });
  headerReservationsBtn?.addEventListener('click', () => {
    setActivePanel('reservations');
    closeHeaderMenu();
  });
  headerProfileBtn?.addEventListener('click', () => {
    setActivePanel('profile');
    closeHeaderMenu();
  });
  headerMessagesBtn?.addEventListener('click', () => {
    closeHeaderMenu();
    openSupportChatBtn?.click();
  });
  headerLogoutBtn?.addEventListener('click', () => {
    closeHeaderMenu();
    fazerLogout();
  });
  headerScopePFHeaderBtn?.addEventListener('click', () => {
    setPortalScope('pf');
    closeHeaderMenu();
  });
  headerScopeCompanyBtn?.addEventListener('click', () => {
    if (!activeClient?.company_id) return;
    setPortalScope('company');
    closeHeaderMenu();
  });
  document.addEventListener('click', (event) => {
    if (!headerMenuOpen || !headerAccountWrap) return;
    if (!headerAccountWrap.contains(event.target)) {
      setHeaderMenuState(false);
    }
  });
  headerAccountWrap?.addEventListener('mouseenter', () => setHeaderMenuState(true));
  headerAccountWrap?.addEventListener('mouseleave', () => setHeaderMenuState(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setHeaderMenuState(false);
  });
  syncHeaderScopeButtons();
}

function setHeaderMenuState(open) {
  headerMenuOpen = Boolean(open);
  headerAccountWrap?.classList.toggle('open', headerMenuOpen);
  headerAccountBtn?.setAttribute('aria-expanded', headerMenuOpen ? 'true' : 'false');
}

function closeHeaderMenu() {
  setHeaderMenuState(false);
}

function syncHeaderScopeButtons() {
  if (headerScopePFHeaderBtn) {
    headerScopePFHeaderBtn.classList.toggle('active', currentScope === 'pf');
  }
  if (headerScopeCompanyBtn) {
    const canUseCompany = Boolean(activeClient?.company_id);
    headerScopeCompanyBtn.hidden = !canUseCompany;
    headerScopeCompanyBtn.disabled = !canUseCompany;
    headerScopeCompanyBtn.classList.toggle('active', canUseCompany && currentScope === 'company');
  }
}

function startPortalAutoRefresh() {
  stopPortalAutoRefresh();
  portalRefreshTimer = setInterval(() => {
    if (!activeClient) return;
    carregarReservasGlobais().catch(() => {});
    carregarCursosCliente();
  }, 60000);
}

function stopPortalAutoRefresh() {
  if (portalRefreshTimer) {
    clearInterval(portalRefreshTimer);
    portalRefreshTimer = null;
  }
}

function sanitizeCourseHtml(html) {
  if (!html) return '';
  const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'UL', 'OL', 'LI', 'DIV']);
  const container = document.createElement('div');
  container.innerHTML = html;
  const walk = (node) => {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowed.has(child.tagName)) {
          while (child.firstChild) {
            node.insertBefore(child.firstChild, child);
          }
          node.removeChild(child);
          continue;
        }
        while (child.attributes.length > 0) {
          child.removeAttribute(child.attributes[0].name);
        }
        walk(child);
      } else {
        node.removeChild(child);
      }
    }
  };
  walk(container);
  return container.innerHTML;
}

function getCourseFromCaches(workshopId) {
  const id = Number(workshopId);
  return availableCoursesCache.find(item => Number(item.id) === id)
    || workshopDetailsCache.get(id)
    || null;
}

async function fetchCheckoutIntent(context, contextId) {
  try {
    const url = `api/payment_intent_lookup.php?context=${encodeURIComponent(context)}&context_id=${encodeURIComponent(contextId)}`;
    const res = await fetch(url, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) return null;
    const intent = json.intent;
    if (intent && intent.checkout_url && String(intent.status || '').toLowerCase() === 'pending') {
      return intent.checkout_url;
    }
  } catch (err) {
    console.warn('Não foi possível consultar intent de pagamento', err);
  }
  return null;
}

async function fetchWorkshopDetails(workshopId) {
  try {
    const res = await fetch(`api/workshops_list.php?id=${encodeURIComponent(workshopId)}&upcoming=0&include_past=1`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || !json.data.length) return null;
    const workshop = json.data[0];
    workshopDetailsCache.set(Number(workshopId), workshop);
    return workshop;
  } catch (err) {
    console.error('Erro ao buscar detalhes do curso', err);
    return null;
  }
}

async function openCourseModal(workshopId, options = {}) {
  if (!workshopId) return;
  let course = getCourseFromCaches(workshopId);
  if (!course) {
    course = await fetchWorkshopDetails(workshopId);
  }
  if (!course) {
    alert('Não foi possível carregar os detalhes do curso.');
    return;
  }
  const enrollment = options.enrollment
    || clientCoursesCache.find(item => Number(item.workshop_id) === Number(workshopId))
    || null;
  courseModalContext = {
    courseId: Number(workshopId),
    course,
    enrollment,
    voucher: null,
    voucherData: null,
    focusEnroll: Boolean(options.focusEnroll),
    checkoutUrl: options.checkoutUrl || null
  };
  if (courseModalVoucherInput) courseModalVoucherInput.value = '';
  if (courseModalVoucherResult) courseModalVoucherResult.textContent = '';
  updateCourseModalView();
  if (!courseModal) return;
  courseModal.classList.add('show');
  courseModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    if (courseModalContext.focusEnroll && courseEnrollArea && courseEnrollArea.style.display !== 'none') {
      courseModalVoucherInput?.focus();
    }
    courseModalContext.focusEnroll = false;
  }, 250);
}

function closeCourseModal() {
  if (!courseModal) return;
  courseModal.classList.remove('show');
  courseModal.setAttribute('aria-hidden', 'true');
  courseModalContext.focusEnroll = false;
  const enrollmentStatus = String(enrollment?.payment_status || '').toLowerCase();
  if (!courseModalContext.checkoutUrl && enrollment && enrollmentStatus !== 'pago') {
    fetchCheckoutIntent('workshop', enrollment.id || enrollment.enrollment_id || enrollment.workshop_id)
      .then((url) => {
        if (url) {
          courseModalContext.checkoutUrl = url;
          updateCourseModalView();
        }
      });
  }
}

function updateCourseModalView() {
  const { course, enrollment, voucherData } = courseModalContext;
  if (!course) return;
  const title = course.title || enrollment?.workshop_title || 'Curso';
  const dateLabel = formatDateRangeLabel(course.date || enrollment?.workshop_date, course.end_date || course.workshop_end_date || enrollment?.workshop_end_date);
  const timeLabel = formatTimeRange(course.time_start || enrollment?.workshop_time_start, course.time_end || enrollment?.workshop_time_end);
  const location = [course.room_city || enrollment?.room_city, course.room_state || enrollment?.room_state].filter(Boolean).join(' - ');
  const price = Number(course.price_per_seat || enrollment?.price_per_seat || 0);
  const maxSeats = Number(course.max_seats || enrollment?.max_seats || 0);
  const sold = Number(course.sold_seats || enrollment?.paid_seats || 0);
  const minSeats = Number(course.min_seats || enrollment?.min_seats || 0);
  const alreadyEnrolled = Boolean(enrollment);
  const paid = alreadyEnrolled && String(enrollment.payment_status || '').toLowerCase() === 'pago';

  if (courseModalActions) {
    courseModalActions.innerHTML = alreadyEnrolled
      ? '<span class="chip success">Inscrição ativa</span>'
      : '';
  }
  if (courseModalTitle) courseModalTitle.textContent = title;
  if (courseModalMeta) courseModalMeta.textContent = [dateLabel, timeLabel, location].filter(Boolean).join(' • ');
  if (courseModalDescription) {
    const desc = course.description || '';
    courseModalDescription.innerHTML = desc
      ? sanitizeCourseHtml(desc)
      : '<p class="rooms-message">O organizador ainda não adicionou a descrição completa.</p>';
  }
  if (courseModalCoverWrapper && courseModalCover) {
    if (course.banner_path) {
      courseModalCover.src = course.banner_path;
      courseModalCoverWrapper.hidden = false;
    } else {
      courseModalCoverWrapper.hidden = true;
    }
  }
  if (courseModalWhen) courseModalWhen.textContent = dateLabel ? `Datas: ${dateLabel}${timeLabel ? ` (${timeLabel})` : ''}` : '';
  if (courseModalWhere) courseModalWhere.textContent = location ? `Local: ${location}` : '';
  let priceLine = price > 0 ? `Ingresso: ${formatCurrency(price)}` : 'Ingresso gratuito';
  if (price > 0 && voucherData?.discount) {
    const payable = Math.max(0, price - voucherData.discount);
    priceLine += ` • Após voucher: ${formatCurrency(payable)}`;
  }
  if (courseModalPrice) courseModalPrice.textContent = priceLine;
  const seatParts = [];
  if (maxSeats > 0) seatParts.push(`${sold} de ${maxSeats} vagas confirmadas`);
  if (minSeats > 0) seatParts.push(`Pagamento confirma com ${minSeats} participante${minSeats > 1 ? 's' : ''}`);
  if (courseModalSeats) courseModalSeats.textContent = seatParts.join(' • ');

  if (courseModalStatus) {
    if (alreadyEnrolled) {
      if (paid) {
        courseModalStatus.textContent = 'Pagamento confirmado! Seu ingresso está disponível abaixo.';
      } else {
        courseModalStatus.textContent = minSeats > 0
          ? `Inscrição registrada. Confirmaremos o pagamento ao atingir ${minSeats} participante${minSeats > 1 ? 's' : ''}.`
          : 'Inscrição registrada. Aguardando confirmação do pagamento.';
      }
    } else {
      courseModalStatus.textContent = 'Vagas disponíveis. Confirme sua participação para receber o ingresso.';
    }
  }

  if (courseEnrollArea) {
    courseEnrollArea.style.display = alreadyEnrolled ? 'none' : 'block';
  }
  if (courseCheckoutOpen) {
    const hasLink = Boolean(courseModalContext.checkoutUrl);
    courseCheckoutOpen.hidden = !hasLink;
    courseCheckoutOpen.disabled = !hasLink;
    if (hasLink && courseModalStatus) {
      courseModalStatus.textContent = 'Pagamento pendente. Clique em "Abrir checkout de pagamento" para finalizar.';
    }
  }

  if (courseTicketSection) {
    if (paid && enrollment?.public_code) {
      courseTicketSection.hidden = false;
      renderCourseTicket(enrollment, course);
    } else {
      courseTicketSection.hidden = true;
    }
  }
}

function renderCourseTicket(enrollment, course) {
  if (!enrollment || !enrollment.public_code) return;
  if (courseTicketCode) {
    courseTicketCode.textContent = `Código do ingresso: ${enrollment.public_code}`;
  }
  if (courseTicketInfo) {
    courseTicketInfo.textContent = `Apresente o QR Code para validar sua participação em "${course?.title || enrollment.workshop_title || 'Curso'}".`;
  }
  if (courseTicketQr) {
    const origin = (window.location && window.location.origin) || '';
    const base = origin ? origin.replace(/\/$/, '') : '';
    const checkinUrl = `${base}/api/workshop_checkin.php?code=${encodeURIComponent(enrollment.public_code)}`;
    const safe = encodeURIComponent(checkinUrl);
    courseTicketQr.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${safe}" alt="QR Code do ingresso">`;
  }
}

async function applyCourseVoucher() {
  const { course } = courseModalContext;
  if (!course || !courseModalVoucherInput || !courseModalVoucherResult) return;
  const code = courseModalVoucherInput.value.trim().toUpperCase();
  if (!code) {
    courseModalVoucherResult.textContent = 'Informe o código do voucher.';
    return;
  }
  courseModalVoucherResult.textContent = 'Validando voucher...';
  try {
    const payload = {
      code,
      room_id: course.room_id || null,
      advertiser_id: course.advertiser_id || null,
      amount: Number(course.price_per_seat || 0)
    };
    const res = await fetch(`${API_BASE}/validate_voucher.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Voucher inválido.');
    const discount = Number(json.voucher?.discount || 0);
    courseModalContext.voucherData = { code: json.voucher.code, discount };
    const payable = Math.max(0, (Number(course.price_per_seat || 0)) - discount);
    courseModalVoucherResult.textContent = discount > 0
      ? `Voucher ${json.voucher.code} aplicado. Desconto de ${formatCurrency(discount)}. Valor previsto: ${formatCurrency(payable)}.`
      : `Voucher ${json.voucher.code} válido.`;
    updateCourseModalView();
  } catch (err) {
    courseModalContext.voucherData = null;
    courseModalVoucherResult.textContent = err.message || 'Não foi possível aplicar o voucher.';
  }
}

async function submitCourseEnrollment() {
  if (!activeClient || !courseModalContext.course) return;
  const course = courseModalContext.course;
  const voucherCode = courseModalContext.voucherData?.code || (courseModalVoucherInput?.value.trim() || '');
  const payload = {
    workshop_id: course.id || courseModalContext.courseId,
    name: activeClient.name || activeClient.login || 'Cliente Ze.EFE',
    email: activeClient.email,
    cpf: activeClient.cpf || '',
    phone: activeClient.phone || activeClient.whatsapp || '',
    voucher_code: voucherCode || undefined
  };
  if (!payload.email) {
    courseModalStatus.textContent = 'Atualize seu e-mail no perfil antes de se inscrever.';
    return;
  }
  try {
    if (courseModalConfirmBtn) {
      courseModalConfirmBtn.disabled = true;
      courseModalConfirmBtn.textContent = 'Processando...';
    }
    const res = await fetch(`${API_BASE}/workshop_enroll.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível concluir a inscrição.');
    if (coursesFeedback) {
      coursesFeedback.textContent = json.payment_status === 'pago'
        ? 'Inscrição confirmada! Seu ingresso está disponível.'
        : 'Inscrição registrada! Finalize o pagamento para garantir a vaga.';
    }
    if (json.warning) {
      courseModalStatus.textContent = json.warning;
    }
    if (json.checkout_url) {
      courseModalContext.checkoutUrl = json.checkout_url;
      const abrir = confirm('Geramos o checkout de pagamento. Deseja abrir em uma nova aba?');
      if (abrir) window.open(json.checkout_url, '_blank', 'noopener');
    }
    await carregarCursosCliente();
    courseModalContext.enrollment = clientCoursesCache.find(item => Number(item.workshop_id) === Number(course.id));
    updateCourseModalView();
  } catch (err) {
    courseModalStatus.textContent = err.message || 'Erro ao realizar a inscrição.';
  } finally {
    if (courseModalConfirmBtn) {
      courseModalConfirmBtn.disabled = false;
      courseModalConfirmBtn.textContent = 'Confirmar inscrição';
    }
  }
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
  } else if (target === 'courses' && activeClient) {
    if (coursesFeedback) coursesFeedback.textContent = '';
    carregarCursosCliente();
  } else if (target === 'profile') {
    renderProfile();
  } else if (target === 'company' && activeClient) {
    if (!activeClient.company_id) {
      // fallback caso alguém force via hash/URL
      setPortalScope('pf');
      return;
    }
    carregarEmpresaOverview();
    // default subtab
    setCompanySubtab('users');
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
  syncHeaderScopeButtons();
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
  if (!activeClient || !activeClient.company_id) return;
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
    let users = (json.success ? (json.data || []) : []).filter(u => String(u.company_id) === String(cid));
    const renderUsers = (list, sortKey='name', dir='asc') => {
      const collator = new Intl.Collator('pt-BR', { sensitivity:'base' });
      list = list.slice().sort((a,b)=>{
        const va = (a[sortKey]||'').toString().toLowerCase();
        const vb = (b[sortKey]||'').toString().toLowerCase();
        const r = collator.compare(va, vb);
        return dir==='asc' ? r : -r;
      });
      const rows = list.map(u => `
        <tr>
          <td>${escapeHtml(u.name || '--')}</td>
          <td>${escapeHtml(u.email || '--')}</td>
          <td>${escapeHtml(u.login || '--')}</td>
          <td>${escapeHtml(u.company_role || '-')}</td>
          <td><button class="btn btn-secondary btn-sm" data-act="remove" data-id="${u.id}">Remover</button></td>
        </tr>`).join('');
      wrap.innerHTML = `
        <table>
          <thead>
            <tr>
              <th data-sort="name">Nome</th>
              <th data-sort="email">E-mail</th>
              <th data-sort="login">Login</th>
              <th data-sort="company_role">Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:14px">Nenhum membro encontrado.</td></tr>'}</tbody>
        </table>`;
      wrap.querySelectorAll('button[data-act="remove"]').forEach(btn => btn.addEventListener('click', () => removeCompanyUser(btn.dataset.id)));
      wrap.querySelectorAll('th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
          const key = th.getAttribute('data-sort');
          const newDir = (dir==='asc') ? 'desc' : 'asc';
          renderUsers(users, key, newDir);
        };
      });
    };
    renderUsers(users);
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
    let list = (invJson.success ? (invJson.data || []) : []).filter(i => String(i.company_id) === String(cid));
    const renderInvites = (arr, sortKey='created_at', dir='desc') => {
      arr = arr.slice().sort((a,b)=>{
        const va = (a[sortKey]||'').toString();
        const vb = (b[sortKey]||'').toString();
        let r = 0;
        if (sortKey==='created_at') r = new Date(va) - new Date(vb); else r = va.localeCompare(vb,'pt-BR',{ sensitivity:'base' });
        return dir==='asc'? r : -r;
      });
      const rows = arr.map(i => {
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
          <button class="btn btn-secondary btn-sm" data-invite-delete="${i.id}">Excluir</button>
        `;
        return `<tr>
          <td>${name}</td><td>${email}</td><td>${cpf}</td><td>${role}</td><td>${status}</td><td>${when}</td><td>${actions}</td>
        </tr>`;
      }).join('');
      wrap.innerHTML = `
        <table>
          <thead><tr>
            <th data-sort="invite_name">Nome</th>
            <th data-sort="invite_email">E-mail</th>
            <th data-sort="cpf">CPF</th>
            <th data-sort="role">Papel</th>
            <th data-sort="status">Status</th>
            <th data-sort="created_at">Enviado em</th>
            <th>Ações</th>
          </tr></thead>
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
            const json = await parseJsonSafe(res);
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
            const json = await parseJsonSafe(res);
            if (!json.success) throw new Error(json.error || 'Falha ao reenviar.');
            alert(json.message || 'Convite reenviado.');
            await loadCompanyInvites();
          } catch (e) {
            alert(e.message || 'Erro ao reenviar convite.');
          }
        });
      });
      wrap.querySelectorAll('button[data-invite-delete]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = parseInt(btn.getAttribute('data-invite-delete'), 10);
          if (!id) return;
          if (!confirm('Excluir este convite?')) return;
          try {
            let ok=false; let lastErr='';
            try {
              const res = await fetch(`${API_BASE}/company_delete_invite.php`, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ id, company_id: activeClient.company_id, actor_id: activeClient.id })
              });
              if (res.ok) { const j=await parseJsonSafe(res); ok = !!j.success; if(!ok) lastErr=j.error||''; }
              else { lastErr = `HTTP ${res.status}`; }
            } catch (err) { lastErr = err.message || 'erro'; }
            if (!ok) {
              const res2 = await fetch(`${API_BASE}/company_cancel_invite.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
              const j2 = await parseJsonSafe(res2);
              if (!j2.success) throw new Error(j2.error || `Falha ao excluir (${lastErr})`);
            }
            await loadCompanyInvites();
          } catch (e) {
            alert(e.message || 'Erro ao excluir convite.');
          }
        });
      });
      
      wrap.querySelectorAll('th[data-sort]').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
          const key = th.getAttribute('data-sort');
          const currentDir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
          th.dataset.dir = currentDir;
          renderInvites(list, key, currentDir);
        };
      });
    };
    renderInvites(list);
  } catch (e) {
    wrap.innerHTML = '<div class="rooms-message">Não foi possível carregar os convites.</div>';
  }
}

async function onCompanyInviteSubmit() {
  if (!activeClient?.company_id) return;
  const digits = somenteDigitos(companyInviteCpf?.value).slice(0,11);
  if (companyInviteCpf) companyInviteCpf.value = formatCPF(digits);
  if (digits.length !== 11) { alert('Informe um CPF válido.'); return; }
  const role = 'membro';
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
    const role = 'membro';
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
    // 1) Pré-visualização
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch(`${API_BASE}/company_parse_xlsx.php`, { method:'POST', body: fd });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao ler XLSX.');
    showXlsxPreviewModal(file, json.rows || []);
  } catch (e) {
    alert(e.message || 'Não foi possível processar o XLSX.');
  } finally {
    evt.target.value = '';
  }
}

// Pré-visualização de XLSX
let xlsxPreviewFile = null;
function showXlsxPreviewModal(file, rows) {
  xlsxPreviewFile = file;
  const modal = document.getElementById('xlsxPreviewModal');
  const tableWrap = document.getElementById('xlsxPreviewTable');
  const closeBtn = document.getElementById('xlsxPreviewClose');
  const cancelBtn = document.getElementById('xlsxPreviewCancel');
  const confirmBtn = document.getElementById('xlsxPreviewConfirm');
  const addBtn = document.getElementById('xlsxPreviewAdd');
  if (!modal || !tableWrap) return;

  // Editable state
  let state = Array.isArray(rows) ? rows.map(r => ({
    pos: r.pos ?? 0,
    excel_row: r.excel_row ?? 0,
    name: r.name || '',
    email: r.email || '',
    cpf_raw: r.cpf_raw || r.cpf_digits || '',
    cpf_digits: r.cpf_digits || '',
    valid: !!r.valid,
    reasons: Array.isArray(r.reasons) ? r.reasons.slice() : [],
    duplicate: false
  })) : [];

  const render = () => {
    const header = `
      <table>
        <thead><tr>
          <th><input type=\"checkbox\" id=\"xlsxCheckAll\"></th>
          <th>Linha</th><th>Nome</th><th>E‑mail</th><th>CPF</th><th>Status</th><th></th>
        </tr></thead>
        <tbody id=\"xlsxPreviewTBody\"></tbody>
      </table>`;
    tableWrap.innerHTML = header;
    const tbody = document.getElementById('xlsxPreviewTBody');
    const checkAll = document.getElementById('xlsxCheckAll');

    const validateRow = (i) => {
      const row = state[i]; if (!row) return;
      const digits = somenteDigitos(row.cpf_raw||'');
      row.cpf_digits = digits;
      const reasons = [];
      if (!row.name || !row.name.trim()) reasons.push('nome vazio');
      if (!row.email || !/^\S+@\S+\.\S+$/.test(row.email)) reasons.push('e‑mail inválido');
      if (digits.length!==11) reasons.push('CPF inválido');
      if (row.duplicate) reasons.push('duplicado');
      row.valid = reasons.length===0; row.reasons = reasons;
      const tr = tbody.children[i]; if (!tr) return;
      tr.style.background = row.valid ? '' : '#FFF3CD';
      const statusCell = tr.querySelector('.status-cell');
      statusCell.textContent = row.valid ? 'ok' : ('Inválido: ' + reasons.join(', '));
    };

    const recomputeDuplicates = () => {
      const seenEmail = new Map();
      const seenCpf = new Map();
      state.forEach(r => { r.duplicate = false; });
      state.forEach((r, idx) => {
        const e = (r.email || '').toLowerCase();
        const c = r.cpf_digits || '';
        if (e && !seenEmail.has(e)) seenEmail.set(e, idx); else if (e) r.duplicate = true;
        if (c && !seenCpf.has(c)) seenCpf.set(c, idx); else if (c) r.duplicate = true;
      });
      state.forEach((_,i)=>validateRow(i));
    };

    tbody.innerHTML = '';
    state.forEach((r, idx) => {
      const tr = document.createElement('tr');
      const status = r.valid ? 'ok' : ('Inválido: ' + (Array.isArray(r.reasons)? r.reasons.join(', ') : ''));
      tr.innerHTML = `
        <td><input type=\"checkbox\" data-idx=\"${idx}\" ${r.valid? 'checked':''} ${r.valid? '':'disabled'}></td>
        <td>${r.excel_row || (idx+1)}</td>
        <td><input type=\"text\" data-field=\"name\" data-idx=\"${idx}\" value=\"${escapeHtml(r.name)}\"/></td>
        <td><input type=\"email\" data-field=\"email\" data-idx=\"${idx}\" value=\"${escapeHtml(r.email)}\"/></td>
        <td><input type=\"text\" data-field=\"cpf\" data-idx=\"${idx}\" value=\"${escapeHtml(formatCPF(r.cpf_digits||r.cpf_raw||''))}\"/></td>
        <td class=\"status-cell\">${escapeHtml(status)}</td>
        <td><button type=\"button\" class=\"btn btn-secondary btn-sm\" data-remove=\"${idx}\">Remover</button></td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input[data-field]').forEach(inp => {
      inp.addEventListener('input', () => {
        const i = parseInt(inp.getAttribute('data-idx'),10);
        const field = inp.getAttribute('data-field');
        if (field==='name') state[i].name = inp.value;
        else if (field==='email') state[i].email = inp.value.trim();
        else if (field==='cpf') { state[i].cpf_raw = inp.value; state[i].cpf_digits = somenteDigitos(inp.value); inp.value = formatCPF(state[i].cpf_digits); }
        validateRow(i);
        recomputeDuplicates();
      });
    });
    tbody.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-remove'),10);
        state.splice(i,1); render();
      });
    });

    // Initial validation and duplicates
    state.forEach((_,i)=>validateRow(i));
    recomputeDuplicates();
    checkAll?.addEventListener('change', () => {
      tbody.querySelectorAll('input[type=\"checkbox\"]').forEach(ch => {
        const i = parseInt(ch.getAttribute('data-idx'),10);
        ch.checked = checkAll.checked && state[i]?.valid;
      });
    });
  };

  addBtn?.addEventListener('click', () => {
    state.push({ pos: state.length, excel_row: state.length+1, name:'', email:'', cpf_raw:'', cpf_digits:'', valid:false, reasons:['nome vazio','e‑mail inválido','CPF inválido'], duplicate:false });
    render();
  });

  render();

  const hide = () => { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); };
  closeBtn?.addEventListener('click', hide, { once:true });
  cancelBtn?.addEventListener('click', hide, { once:true });
  confirmBtn?.addEventListener('click', async () => {
    const tbody = document.getElementById('xlsxPreviewTBody');
    const selected = Array.from(tbody.querySelectorAll('input[type=\"checkbox\"]'))
      .map((ch,i)=>({ idx:i, checked: ch.checked }))
      .filter(s => s.checked && state[s.idx]?.valid)
      .map(s => ({ name: state[s.idx].name.trim(), email: state[s.idx].email.trim(), cpf: state[s.idx].cpf_digits }));
    if (!selected.length) { alert('Selecione ao menos uma linha válida.'); return; }
    try {
      confirmBtn.disabled = true;
      const role = 'membro';
      const payload = { company_id: activeClient.company_id, role, rows: selected };
      const res2 = await fetch(`${API_BASE}/company_import_xlsx.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const json2 = await res2.json();
      if (!json2.success) throw new Error(json2.error || 'Falha ao importar.');
      const errs = Array.isArray(json2.errors) && json2.errors.length ? `\nErros: \n- ${json2.errors.slice(0,5).join('\n- ')}${json2.errors.length>5?'\n…':''}` : '';
      alert(`Convites enviados: ${json2.sent || 0}. Falhas: ${json2.failed || 0}.${errs}`);
      hide();
      setCompanySubtab('users');
      await loadCompanyInvites();
    } catch (e) {
      alert(e.message || 'Erro ao finalizar importação.');
    } finally {
      confirmBtn.disabled = false;
    }
  }, { once:true });

  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}

async function removeCompanyUser(clientId){
  if (!activeClient?.company_id) return;
  if (!confirm('Remover vínculo deste usuário com a empresa?')) return;
  try {
    const res = await fetch(`${API_BASE}/company_remove_user.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ company_id: activeClient.company_id, client_id: Number(clientId), actor_id: Number(activeClient.id) })
    });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao remover.');
    loadCompanyUsers();
  } catch (e) { alert(e.message || 'Erro ao remover.'); }
}

// ===== Empresa/Membros — Novos Modais e Fluxos =====
function openInviteMemberModal(){
  if (!activeClient?.company_id || !inviteMemberModal) return;
  inviteCpfInput && (inviteCpfInput.value = '');
  inviteEmailInput && (inviteEmailInput.value = '');
  inviteRoleSelect && (inviteRoleSelect.value = 'membro');
  if (inviteLookupResult) inviteLookupResult.textContent = '';
  inviteMemberModal.classList.add('show');
  inviteMemberModal.setAttribute('aria-hidden','false');
}
function closeInviteMemberModal(){
  inviteMemberModal?.classList.remove('show');
  inviteMemberModal?.setAttribute('aria-hidden','true');
}
async function onInviteLookup(){
  const cpf = somenteDigitos(inviteCpfInput?.value).slice(0,11);
  const email = (inviteEmailInput?.value || '').trim();
  if (!cpf && !email) { if (inviteLookupResult) inviteLookupResult.textContent = 'Informe CPF ou e‑mail.'; return; }
  try {
    const res = await fetch(`${API_BASE}/company_lookup_user.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cpf, email }) });
    const json = await parseJsonSafe(res);
    if (json.success && json.found) {
      inviteLookupResult.textContent = `Encontrado: ${json.client.name || json.client.email}`;
    } else {
      inviteLookupResult.textContent = 'Não encontrado. Será enviado convite de pré‑cadastro.';
    }
  } catch (e) {
    inviteLookupResult.textContent = 'Falha ao buscar.';
  }
}
async function onInviteSend(){
  if (!activeClient?.company_id) return;
  const cpf = somenteDigitos(inviteCpfInput?.value).slice(0,11);
  const email = (inviteEmailInput?.value || '').trim();
  const role = inviteRoleSelect?.value || 'membro';
  if (!cpf || cpf.length!==11) { alert('Informe um CPF válido.'); return; }
  try {
    inviteMemberSend.disabled = true;
    const res = await fetch(`${API_BASE}/company_invite_user.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ company_id: activeClient.company_id, cpf, email, role }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Não foi possível enviar o convite.');
    alert(json.message || 'Convite enviado.');
    closeInviteMemberModal();
    await loadCompanyInvites();
  } catch (e) { alert(e.message || 'Falha ao convidar.'); }
  finally { inviteMemberSend.disabled = false; }
}

function openManualMembersModal(){
  if (!activeClient?.company_id || !manualMembersModal || !manualMembersTBody) return;
  manualMembersTBody.innerHTML = '';
  for (let i=0;i<20;i++) addManualRow();
  manualMembersModal.classList.add('show');
  manualMembersModal.setAttribute('aria-hidden','false');
}
function closeManualMembersModal(){
  manualMembersModal?.classList.remove('show');
  manualMembersModal?.setAttribute('aria-hidden','true');
}
function addManualRow(){
  if (!manualMembersTBody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="Nome"/></td>
    <td><input type="email" placeholder="email@exemplo.com"/></td>
    <td><input type="text" placeholder="000.000.000-00"/></td>
    <td>
      <select>
        <option value="membro">Membro</option>
        <option value="gestor">Gestor</option>
        <option value="leitor">Leitor</option>
        <option value="admin">Admin</option>
      </select>
    </td>`;
  const cpfInput = tr.children[2].querySelector('input');
  cpfInput.addEventListener('input', ()=> { const d = somenteDigitos(cpfInput.value).slice(0,11); cpfInput.value = formatCPF(d); });
  manualMembersTBody.appendChild(tr);
}
async function onManualMembersSubmit(){
  if (!activeClient?.company_id) return;
  const rows = [];
  Array.from(manualMembersTBody?.children || []).forEach(tr => {
    const [nameEl, emailEl, cpfEl, roleEl] = [
      tr.children[0].querySelector('input'),
      tr.children[1].querySelector('input'),
      tr.children[2].querySelector('input'),
      tr.children[3].querySelector('select')
    ];
    const name = (nameEl?.value||'').trim();
    const email = (emailEl?.value||'').trim();
    const cpf = somenteDigitos(cpfEl?.value||'').slice(0,11);
    const role = roleEl?.value || 'membro';
    if (!name && !email && !cpf) return; // linha vazia
    if (!name || !email || cpf.length!==11) return; // ignora inválida
    rows.push({ name, email, cpf, role });
  });
  if (!rows.length) { alert('Preencha ao menos uma linha válida.'); return; }
  try {
    manualMembersSubmit.disabled = true;
    const res = await fetch(`${API_BASE}/company_import_xlsx.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ company_id: activeClient.company_id, rows }) });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao enviar convites.');
    const errs = Array.isArray(json.errors) && json.errors.length ? `\nErros: \n- ${json.errors.slice(0,5).join('\n- ')}${json.errors.length>5?'\n…':''}` : '';
    alert(`Convites enviados: ${json.sent || 0}. Falhas: ${json.failed || 0}.${errs}`);
    closeManualMembersModal();
    await loadCompanyInvites();
  } catch (e) { alert(e.message || 'Erro ao processar.'); }
  finally { manualMembersSubmit.disabled = false; }
}

function openImportContactsModal(){
  if (!importContactsModal) return;
  importContactsModal.classList.add('show');
  importContactsModal.setAttribute('aria-hidden','false');
}
function closeImportContactsModal(){
  importContactsModal?.classList.remove('show');
  importContactsModal?.setAttribute('aria-hidden','true');
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
  if (bookingSearchMode === 'date') {
    // Mantém sala já escolhida; datas podem ser múltiplas
  } else if (bookingRoomHiddenInput) {
    // Em modo sala, ao mexer na data não resetamos a sala
  }
  const selected = bookingDateInput.value;
  if (selected) {
    const parsed = new Date(selected);
    if (!Number.isNaN(parsed.getTime())) {
      bookingCurrentMonth = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    }
  }
  renderRoomOptions(selected);
  renderBookingCalendar(bookingCurrentMonth);
  updateBookingNavigation();
}

function changeBookingStep(delta) {
  setBookingStep(bookingStepIndex + delta);
}

function goToNextBookingStep() {
  if (bookingSearchMode === 'room') {
    if (bookingStepIndex === 0) {
      // Salas -> Data
      setBookingStep(1);
      return;
    }
    if (bookingStepIndex === 1) {
      // Data -> Detalhes
      setBookingStep(2);
      return;
    }
  }
  changeBookingStep(1);
}

function goToPrevBookingStep() {
  if (bookingSearchMode === 'room') {
    if (bookingStepIndex === 2) {
      // Detalhes -> Data
      setBookingStep(1);
      return;
    }
    if (bookingStepIndex === 1) {
      // Data -> Salas
      setBookingStep(0);
      return;
    }
  }
  changeBookingStep(-1);
}

function setBookingStep(index) {
  if (!bookingStepSections.length) return;
  const maxIndex = bookingStepSections.length - 1;
  if (index < 0) index = 0;
  if (index > maxIndex) index = maxIndex;
  bookingStepIndex = index;
  const visibleIndex = (function() {
    if (bookingSearchMode === 'room') {
      if (bookingStepIndex === 0) return 1; // SALAS usa seção de salas
      if (bookingStepIndex === 1) return 0; // DATA usa seção de calendário
    }
    return bookingStepIndex;
  })();
  bookingStepSections.forEach((section, idx) => {
    if (!section) return;
    section.hidden = idx !== visibleIndex;
  });
  bookingStepperItems.forEach((item, idx) => {
    if (!item) return;
    item.classList.toggle('active', idx <= index);
  });
  updateBookingNavigation();
  if (bookingStepIndex === 1) {
    renderRoomOptions(bookingDateInput?.value || '');
  }
  // Se a seção visível é a de salas (índice 1 no DOM), força o Leaflet a recalcular o tamanho
  if (visibleIndex === 1 && bookingRoomsMapEl && typeof L !== 'undefined' && bookingMap) {
    setTimeout(() => {
      try { bookingMap.invalidateSize(); } catch (_) {}
    }, 200);
  }
  if (bookingStepIndex === 4) {
    renderBookingSummary();
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
    bookingSubmitBtn.textContent = 'Confirmar reserva';
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
      if (bookingSearchMode === 'room') {
        // SALAS primeiro: exige apenas sala
        return Boolean(bookingRoomHiddenInput?.value);
      }
      // Datas primeiro: exige data
      return Boolean(bookingDateInput?.value);
    case 1:
      if (bookingSearchMode === 'room') {
        // DATA no fluxo por sala: exige data
        return Boolean(bookingDateInput?.value);
      }
      // Datas primeiro: aqui exige sala
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
    if (bookingSearchMode === 'room') {
      if (!bookingRoomHiddenInput || !bookingRoomHiddenInput.value) {
        bookingMessage.textContent = 'Escolha a sala para continuar.';
        return false;
      }
    } else {
      if (!bookingDateInput || !bookingDateInput.value) {
        bookingMessage.textContent = 'Selecione a data da reserva antes de avançar.';
        return false;
      }
    }
  } else if (step === 1) {
    if (bookingSearchMode === 'room') {
      if (!bookingDateInput || !bookingDateInput.value) {
        bookingMessage.textContent = 'Selecione a data da reserva antes de avançar.';
        return false;
      }
    } else {
      if (!bookingRoomHiddenInput || !bookingRoomHiddenInput.value) {
        bookingMessage.textContent = 'Escolha uma sala disponível para continuar.';
        return false;
      }
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
  const optionsEl = bookingRoomOptions;
  const feedbackEl = bookingRoomFeedback;
  if (!optionsEl) return;
  optionsEl.innerHTML = '';
  if (feedbackEl) feedbackEl.textContent = '';
  if (!date) {
    if (!roomsCache.length) {
      ensureRoomsLoaded().then(() => renderRoomOptions(''));
      if (feedbackEl) feedbackEl.textContent = 'Carregando salas disponíveis...';
      return;
    }
    // Sem data: lista todas as salas para não travar o fluxo
    optionsEl.innerHTML = '';
    if (feedbackEl) feedbackEl.textContent = 'Selecione uma sala; a disponibilidade será validada no envio.';
    const roomsSorted = roomsCache.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));
    roomsSorted.forEach(room => {
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
      optionsEl.appendChild(button);
    });
    renderBookingMapMarkers(roomsSorted);
    return;
  }
  if (!roomsCache.length) {
    ensureRoomsLoaded().then(ok => {
      if (!ok) {
      if (feedbackEl) feedbackEl.textContent = 'Não foi possível carregar as salas no momento.';
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
      optionsEl.appendChild(button);
    });
    if (bookingRoomHiddenInput && selectedId && !hasSelected) {
      bookingRoomHiddenInput.value = '';
    }
    renderBookingMapMarkers(fallbackRooms);
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
    optionsEl.appendChild(button);
  });
  if (bookingRoomHiddenInput && selectedId && !hasSelected) {
    bookingRoomHiddenInput.value = '';
  }
  renderBookingMapMarkers(availableRooms);
  updateBookingNavigation();
}

function initBookingMapIfNeeded() {
  if (!bookingRoomsMapEl || typeof L === 'undefined') return;
  if (bookingMap) return;
  bookingMap = L.map(bookingRoomsMapEl).setView([-23.5505, -46.6333], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18
  }).addTo(bookingMap);
  bookingMarkersLayer = L.layerGroup().addTo(bookingMap);
}

function renderBookingMapMarkers(rooms) {
  if (!bookingRoomsMapEl || typeof L === 'undefined') return;
  initBookingMapIfNeeded();
  if (!bookingMap || !bookingMarkersLayer) return;
  bookingMarkersLayer.clearLayers();
  const bounds = [];
  (rooms || []).forEach(room => {
    const lat = Number(room.lat || room.latitude || room.latitud);
    const lon = Number(room.lon || room.lng || room.longitude);
    if (!isFinite(lat) || !isFinite(lon)) return;
    const marker = L.marker([lat, lon]);
    const name = escapeHtml(room.name || `Sala #${room.id}`);
    const city = escapeHtml(room.city || '');
    const uf = escapeHtml(room.state || room.uf || '');
    marker.bindPopup(`<strong>${name}</strong><br>${city}${uf ? ' - ' + uf : ''}`);
    marker.on('click', () => {
      selectRoomOption(room.id);
    });
    marker.addTo(bookingMarkersLayer);
    bounds.push([lat, lon]);
  });
  if (bounds.length) {
    bookingMap.fitBounds(bounds, { padding: [20, 20] });
  }
  // Ajusta o tamanho após atualizar marcadores (caso o container tenha sido redimensionado)
  if (bookingRoomsMapEl && typeof L !== 'undefined' && bookingMap) {
    setTimeout(() => {
      try { bookingMap.invalidateSize(); } catch (_) {}
    }, 200);
  }
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
  const selectedSet = new Set(bookingSelectedDates || []);
  const selectedRoomId = bookingRoomHiddenInput?.value ? String(bookingRoomHiddenInput.value) : null;
  const selectedRoom = selectedRoomId ? roomsCache.find(r => String(r.id) === selectedRoomId) : null;

  for (let day = 1; day <= monthEnd.getDate(); day++) {
    const currentDate = new Date(monthRef.getFullYear(), monthRef.getMonth(), day);
    const iso = toISODate(currentDate);

    let hasRooms;
    let totalSelectable;
    let availableRooms;

    if (bookingSearchMode === 'room' && selectedRoom) {
      hasRooms = true;
      totalSelectable = isRoomSelectable(selectedRoom, iso) ? 1 : 0;
      const ok = totalSelectable && isRoomAvailableOnDate(selectedRoom, iso, reservationIdInput?.value);
      availableRooms = ok ? [selectedRoom] : [];
    } else {
      hasRooms = Array.isArray(roomsCache) && roomsCache.length > 0;
      totalSelectable = hasRooms ? roomsCache.filter(room => isRoomSelectable(room, iso)).length : 1; // se não há dados de salas, não bloqueia
      availableRooms = hasRooms ? (totalSelectable ? getAvailableRoomsForDate(iso, reservationIdInput?.value) : []) : [{}];
    }

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
        // Datas primeiro: só permite múltiplas se bookingDateMulti estiver ativo
        if (bookingSearchMode === 'date' && bookingDateMulti) {
          const set = new Set(bookingSelectedDates || []);
          if (set.has(iso)) {
            set.delete(iso);
          } else {
            set.add(iso);
          }
          bookingSelectedDates = Array.from(set).sort();
        } else if (bookingSearchMode === 'room' && bookingDateMulti) {
          // Sala específica + vários dias: múltipla seleção permitida
          const set = new Set(bookingSelectedDates || []);
          if (set.has(iso)) {
            set.delete(iso);
          } else {
            set.add(iso);
          }
          bookingSelectedDates = Array.from(set).sort();
        } else {
          bookingSelectedDates = [iso];
        }
        if (bookingDateInput) {
          bookingDateInput.value = bookingSelectedDates[0] || '';
        }
        renderBookingCalendar(bookingCurrentMonth);
        if (bookingDateInput) {
          bookingDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        updateMultiDateSummary();
      });
    }

    if (selectedSet.has(iso)) {
      button.classList.add('selected');
    }

    bookingCalendarGrid.appendChild(button);
  }

  updateBookingNavigation();
}

function selectRoomOption(roomId) {
  if (!bookingRoomHiddenInput) return;
  bookingRoomHiddenInput.value = roomId;
  // alterando a sala: descarta voucher aplicado
  bookingVoucherApplied = null;
  if (bookingVoucherResult) bookingVoucherResult.textContent = '';
  if (bookingRoomOptions) {
    Array.from(bookingRoomOptions.querySelectorAll('.room-option')).forEach(option => {
      option.classList.toggle('selected', option.dataset.roomId === String(roomId));
    });
  }
  if (bookingMessage) bookingMessage.textContent = '';
  // Atualiza o calendário quando estiver filtrando por sala específica
  if (bookingCalendarGrid) {
    renderBookingCalendar(bookingCurrentMonth);
  }
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
      credentials: 'include',
      body: JSON.stringify({ login: identifier, password, remember: lembrar })
    });
    const json = await res.json();
    if (window.DEBUG) console.debug('[Portal] Resposta login', json);
    if (!json.success) throw new Error(json.error || 'Não foi possível autenticar.');
    if (lembrar && json.remember && json.remember.token) {
      registrarPreferenciaLogin(true, json.remember.token, identifier);
    } else if (!lembrar) {
      registrarPreferenciaLogin(false);
    }
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
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível criar a conta.');
    // Caso tenha vindo de um convite, tenta aceitar automaticamente após cadastrar
    if (window.pendingInviteToken) {
      try {
        await fetch(`${API_BASE}/company_accept_invite_json.php?token=${encodeURIComponent(window.pendingInviteToken)}`);
      } catch (_) {}
    }
    authMessage.textContent = 'Cadastro realizado! Enviamos um e-mail para confirmação.' + (window.pendingInviteToken ? ' Convite aceito. Faça login para continuar.' : ' Você será redirecionado ao início.');
    setTimeout(() => {
      if (window.pendingInviteToken) {
        window.location.href = 'clientes.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 2200);
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
  syncHeaderScopeButtons();
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
  const paymentClientIdInput = document.getElementById('clientId');
  if (paymentClientIdInput) paymentClientIdInput.value = activeClient.id || '';
  // Exibe a aba Empresa para qualquer usuário que pertença a uma empresa
  if (companyTabButton) {
    const showCompany = Boolean(activeClient.company_id);
    companyTabButton.hidden = !showCompany;
    if (!showCompany && portalSections.company) portalSections.company.hidden = true;
  }
  // Toggle scope switch buttons visibility
  if (scopeCompanyBtn) {
    const showCompany = Boolean(activeClient.company_id);
    scopeCompanyBtn.hidden = !showCompany;
  }
  // Exibe checkbox "Reserva pela empresa" para qualquer usuário com company_id
  if (companyBookingRow) {
    companyBookingRow.hidden = !Boolean(activeClient.company_id);
  }
  renderProfile();
  resetBookingForm();
  // Apply desired scope after login (fallback to PF if no company)
  const scopeToApply = (desiredScope === 'company' && activeClient.company_id) ? 'company' : 'pf';
  setPortalScope(scopeToApply);
  if (scopeToApply === 'company') setActivePanel('company'); else setActivePanel('book');
  atualizarPainel();
  if (authMessage) authMessage.textContent = '';
  // Checa convites pendentes na primeira entrada
  checkPendingCompanyInvites();
  startPortalAutoRefresh();
}

function fazerLogout() {
  activeClient = null;
  currentReservations = [];
  currentVisitors = [];
  bookingVisitorIds = [];
  const paymentClientIdInput = document.getElementById('clientId');
  if (paymentClientIdInput) paymentClientIdInput.value = '';
  closeHeaderMenu();
  setPortalScope('pf');
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
  stopPortalAutoRefresh();
  try {
    localStorage.removeItem('portalRememberToken');
  } catch (_) {}
}

function registrarPreferenciaLogin(lembrar, login, password) {
  try {
    if (lembrar && login) {
      const data = {
        token: login,        // aqui login representa o token opaco vindo da API
        loginHint: password || '',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24h
      };
      localStorage.setItem('portalRememberToken', JSON.stringify(data));
    } else {
      localStorage.removeItem('portalRememberToken');
    }
  } catch (_) {
    /* ignore storage errors */
  }
}

function aplicarLoginMemorizado() {
  if (!loginIdentifierInput || !loginPasswordInput || !rememberMeCheckbox) return;
  try {
    const raw = localStorage.getItem('portalRememberToken');
    if (!raw) {
      rememberMeCheckbox.checked = false;
      return;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      localStorage.removeItem('portalRememberToken');
      rememberMeCheckbox.checked = false;
      return;
    }
    const { token, loginHint, expiresAt } = data || {};
    if (!token || !expiresAt || Date.now() > Number(expiresAt)) {
      localStorage.removeItem('portalRememberToken');
      loginIdentifierInput.value = loginHint || '';
      loginPasswordInput.value = '';
      rememberMeCheckbox.checked = false;
      return;
    }
    if (loginHint) loginIdentifierInput.value = loginHint;
    rememberMeCheckbox.checked = true;
    // Tenta auto-login via token
    autoLoginWithToken(token).catch(() => {});
  } catch (_) {
    rememberMeCheckbox.checked = false;
  }
}

async function autoLoginWithToken(token) {
  try {
    const res = await fetch(`${API_BASE}/client_auto_login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const json = await res.json();
    if (!json.success || !json.client) {
      // token inválido/expirado
      try { localStorage.removeItem('portalRememberToken'); } catch (_) {}
      rememberMeCheckbox.checked = false;
      return;
    }
    aplicarClienteAtivo(json.client);
  } catch (e) {
    console.error('[Portal] auto-login falhou', e);
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
    const publicCode = reserva.public_code || reserva.code || '';
    const icsLink = publicCode
      ? `api/reservation_ics.php?code=${encodeURIComponent(publicCode)}`
      : `api/reservation_ics.php?reservation=${encodeURIComponent(reserva.id)}`;
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

  const cards = [];

  // Linha 1: ações principais (ordem fixa)
  cards.push(mkCard('Mensagem ao Anunciante', ()=> { openClientChatForReservation(reserva.id); }));
  if (showPayment) {
    cards.push(mkCard('Pagamento', ()=> { tratarAcaoReserva(reserva.id,'payment'); closeReservationActions(); }));
  }
  // Se pagamento já foi confirmado, exibir informação logo abaixo do meta
  if (paid) {
    try {
      const dt = (reserva.updated_at || reserva.payment_confirmed_at || '').slice(0,10).split('-').reverse().join('/');
      reservationActionsMeta.innerHTML = `${reservationActionsMeta.textContent}<br><span style=\"color:#8A7766\">Pagamento – realizado em ${dt || 'data não disponível'}</span>`;
    } catch (_) {}
  }
  const publicCode = reserva.public_code || reserva.code || '';
  const icsHref = publicCode
    ? `api/reservation_ics.php?code=${encodeURIComponent(publicCode)}`
    : `api/reservation_ics.php?reservation=${encodeURIComponent(reserva.id)}`;
  const ics = document.createElement('a');
  ics.href=icsHref;
  ics.className='action-card';
  ics.innerHTML=`<span class=\"icon\">${getActionIconSVG('Baixar convite')}</span><span class=\"label\">Baixar convite</span>`;
  ics.setAttribute('download','');
  cards.push(ics);

  // Enviar convite (e‑mail com ICS)
  cards.push(mkCard('Enviar convite (só para mim)', ()=> { tratarAcaoReserva(reserva.id,'sendCalendarSelf'); closeReservationActions(); }));
  cards.push(mkCard('Enviar convite (todos)', ()=> { tratarAcaoReserva(reserva.id,'sendCalendarAll'); closeReservationActions(); }));

  // Solicitar NF (apenas após pagamento)
  if (paid) {
    cards.push(mkCard('Solicitar NF', ()=> { alert('Solicitação de NF registrada. Em breve você receberá por e‑mail.'); closeReservationActions(); }));
  }

  // Ajustes: Editar e Cancelar
  cards.push(mkCard('Editar', ()=> { tratarAcaoReserva(reserva.id,'edit'); closeReservationActions(); }));
  if (showCancel) {
    cards.push(mkCard('Cancelar', ()=> { tratarAcaoReserva(reserva.id,'cancel'); closeReservationActions(); }, 'danger'));
  }

  // Render em grid único (duas linhas auto-fit)
  cards.forEach(card => reservationActionsButtons.appendChild(card));

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

// ===== Chat do cliente com anunciante =====
async function openClientChatForReservation(reservationId) {
  const reserva = currentReservations.find(r => String(r.id) === String(reservationId));
  if (!reserva) return;
  const sala = buscarSala(reserva.room_id);
  const advertiserId = sala?.advertiser_id || null;
  if (!advertiserId) {
    alert('Esta sala ainda não está vinculada a um anunciante.');
    return;
  }
  if (clientChatTitleEl) clientChatTitleEl.textContent = 'Mensagens';
  if (clientChatHeader) clientChatHeader.textContent = `${formatDate(reserva.date)} · ${(sala?.name || 'Sala #' + reserva.room_id)}`;
  clientChatMessages.innerHTML = '<div class="rooms-message">Conectando…</div>';
  clientChatForm.hidden = false;
  clientChatThreadId = null;
  try {
    // tenta localizar thread existente
    clientChatThreadsCache = await loadClientThreads();
    let t = clientChatThreadsCache.find(x => String(x.advertiser_id) === String(advertiserId) && String(x.reservation_id||'') === String(reserva.id));
    if (!t) {
      const res2 = await fetch(`${API_BASE}/messages_create_thread.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ room_id: reserva.room_id, reservation_id: reserva.id, client_id: activeClient.id, advertiser_id: advertiserId }) });
      const j2 = await res2.json();
      if (!j2.success) throw new Error(j2.error || 'Não foi possível iniciar a conversa.');
      clientChatThreadId = Number(j2.id);
    } else {
      clientChatThreadId = Number(t.id);
    }
    await buildClientChatSidebar(clientChatThreadId);
    showClientChatModal();
    await openClientChatByThreadId(clientChatThreadId);
  } catch (e) {
    clientChatMessages.innerHTML = `<div class="rooms-message">${e.message || 'Falha ao abrir conversa.'}</div>`;
  }
}

async function openClientSupportChat() {
  if (!activeClient) {
    showAuthOverlay();
    return;
  }
  if (clientChatTitleEl) clientChatTitleEl.textContent = 'Mensagens';
  if (clientChatHeader) clientChatHeader.textContent = 'Fale com a equipe Ze.EFE';
  clientChatMessages.innerHTML = '<div class="rooms-message">Conectando…</div>';
  if (clientChatForm) clientChatForm.hidden = false;
  clientChatThreadId = null;
  try {
    clientChatThreadsCache = await loadClientThreads();
    let t = clientChatThreadsCache.find(x => (!x.advertiser_id || Number(x.advertiser_id) === 0) && !x.room_id && !x.reservation_id);
    if (!t) {
      const res2 = await fetch(`${API_BASE}/messages_open_support_thread.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: activeClient.id })
      });
      const j2 = await res2.json();
      if (!j2.success) throw new Error(j2.error || 'Não foi possível iniciar a conversa com o suporte.');
      clientChatThreadId = Number(j2.id);
      clientChatThreadsCache.push({ id: clientChatThreadId, client_id: activeClient.id, advertiser_id: null, room_id: null, reservation_id: null });
    } else {
      clientChatThreadId = Number(t.id);
    }
    await buildClientChatSidebar(clientChatThreadId);
    showClientChatModal();
    await openClientChatByThreadId(clientChatThreadId);
  } catch (e) {
    clientChatMessages.innerHTML = `<div class="rooms-message">${e.message || 'Falha ao abrir conversa.'}</div>`;
  }
}

async function loadClientThreads() {
  if (!activeClient) return [];
  try {
    const res = await fetch(`${API_BASE}/messages_list_threads.php?client_id=${encodeURIComponent(activeClient.id)}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return [];
    const threads = json.data;
    // Atualiza indicador de novas mensagens no header
    const badge = document.getElementById('clientMessagesBadge');
    if (badge) {
      const hasUnread = threads.some(t => Number(t.unread_for_client || 0) > 0);
      badge.hidden = !hasUnread;
    }
    return threads;
  } catch {
    return [];
  }
}

async function buildClientChatSidebar(activeThreadId) {
  if (!clientChatThreadsList) return;
  clientChatThreadsList.innerHTML = '';
  const threads = clientChatThreadsCache || [];
  const reservationOptions = [];
  threads.filter(x => x.reservation_id).forEach(t => {
    const res = currentReservations.find(r => String(r.id) === String(t.reservation_id));
    const sala = res ? buscarSala(res.room_id) : null;
    const labelDate = res ? formatDate(res.date) : 'Reserva #' + t.reservation_id;
    const labelRoom = sala?.name || (res ? 'Sala #' + res.room_id : '');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-thread-item';
    const isActive = isReservationActiveForChat(res);
    if (!isActive) btn.classList.add('disabled');
    if (activeThreadId && String(activeThreadId) === String(t.id)) btn.classList.add('active');
    btn.dataset.threadId = String(t.id);
    btn.textContent = `${labelRoom ? labelRoom + ' · ' : ''}${labelDate}`;
    if (isActive) {
      btn.addEventListener('click', () => openClientChatByThreadId(t.id));
    }
    reservationOptions.push(btn);
  });
  reservationOptions.sort((a,b) => a.textContent.localeCompare(b.textContent,'pt-BR'));
  reservationOptions.forEach(btn => clientChatThreadsList.appendChild(btn));
}

async function openClientChatByThreadId(threadId) {
  clientChatThreadId = Number(threadId);
  const t = (clientChatThreadsCache || []).find(x => Number(x.id) === clientChatThreadId);
  if (!t) return;
  if (!t.reservation_id) {
    if (clientChatHeader) clientChatHeader.textContent = 'Fale com a equipe Ze.EFE';
  } else {
    const res = currentReservations.find(r => String(r.id) === String(t.reservation_id));
    const sala = res ? buscarSala(res.room_id) : null;
    if (clientChatHeader) clientChatHeader.textContent = `${res ? formatDate(res.date) : ''} · ${(sala?.name || (res ? 'Sala #' + res.room_id : 'Reserva #' + t.reservation_id))}`;
  }
  if (clientChatThreadsList) {
    clientChatThreadsList.querySelectorAll('.chat-thread-item').forEach(el => {
      el.classList.toggle('active', el.dataset.threadId === String(clientChatThreadId));
    });
  }
  await fetchClientChatMessages();
  startClientChatPolling();
}

function isReservationActiveForChat(reserva) {
  if (!reserva) return false;
  const status = String(reserva.status || '').toLowerCase();
  return !['cancelada','cancelado','concluida','concluída','finalizada'].includes(status);
}

function showClientChatModal(){
  clientChatModal?.classList.add('show');
  clientChatModal?.setAttribute('aria-hidden','false');
}
function closeClientChat(){
  stopClientChatPolling();
  clientChatModal?.classList.remove('show');
  clientChatModal?.setAttribute('aria-hidden','true');
}

async function fetchClientChatMessages(){
  if (!clientChatThreadId) return;
  try {
    const res = await fetch(`${API_BASE}/messages_list_messages.php?thread_id=${encodeURIComponent(clientChatThreadId)}`);
    const json = await res.json();
    const list = json.success ? (json.data || []) : [];
    if (!list.length) { clientChatMessages.innerHTML = '<div class="rooms-message">Nenhuma mensagem.</div>'; return; }
    clientChatMessages.innerHTML = list.map(m => {
      const me = (m.sender_type || '') === 'client';
      return `<div class="chat-bubble ${me ? 'me' : 'them'}"><div class="chat-text">${escapeHtml(m.body)}</div><div class="chat-time">${escapeHtml((m.created_at||'').toString().slice(0,16).replace('T',' '))}</div></div>`;
    }).join('');
    clientChatMessages.scrollTop = clientChatMessages.scrollHeight;
    try { await fetch(`${API_BASE}/messages_mark_read.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ thread_id: clientChatThreadId, who: 'client' }) }); } catch (_) {}
  } catch (_) {
    clientChatMessages.innerHTML = '<div class="rooms-message">Falha ao carregar mensagens.</div>';
  }
}

function startClientChatPolling(){ stopClientChatPolling(); clientChatPollTimer = setInterval(fetchClientChatMessages, 10000); }
function stopClientChatPolling(){ if (clientChatPollTimer) { clearInterval(clientChatPollTimer); clientChatPollTimer = null; } }

async function onClientChatSubmit(e){
  e.preventDefault();
  const text = (clientChatInput?.value || '').trim();
  if (!text || !clientChatThreadId) return;
  try {
    const res = await fetch(`${API_BASE}/messages_send.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ thread_id: clientChatThreadId, sender_type: 'client', body: text }) });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao enviar.');
    clientChatInput.value = '';
    await fetchClientChatMessages();
  } catch (err) {
    alert(err.message || 'Erro ao enviar.');
  }
}

function openReportProblemModal() {
  if (!reportProblemModal || !clientChatThreadId || !activeClient) return;
  if (reportProblemMessage) reportProblemMessage.textContent = '';
  if (reportIssueType) reportIssueType.value = 'reserva';
  if (reportIssueDescription) reportIssueDescription.value = '';
  reportProblemModal.classList.add('show');
  reportProblemModal.setAttribute('aria-hidden','false');
}

function closeReportProblemModal() {
  if (!reportProblemModal) return;
  reportProblemModal.classList.remove('show');
  reportProblemModal.setAttribute('aria-hidden','true');
}

async function onReportProblemSubmit(e) {
  e.preventDefault();
  if (!activeClient || !clientChatThreadId) return;
  const type = reportIssueType?.value || '';
  const desc = (reportIssueDescription?.value || '').trim();
  if (!type || !desc) {
    if (reportProblemMessage) reportProblemMessage.textContent = 'Preencha o tipo e a descrição do problema.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/messages_report_issue.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: clientChatThreadId,
        client_id: activeClient.id,
        issue_type: type,
        description: desc
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível enviar o relato.');
    if (reportProblemMessage) reportProblemMessage.textContent = 'Relato enviado para a equipe Ze.EFE.';
    closeReportProblemModal();
  } catch (err) {
    if (reportProblemMessage) reportProblemMessage.textContent = err.message || 'Falha ao enviar o relato.';
  }
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
      const resp = await enviarLinkPagamento(id);
      if (resp.checkout_url) {
        const abrir = confirm('Geramos um link de pagamento seguro. Deseja abrir agora em uma nova aba?');
        if (abrir) window.open(resp.checkout_url, '_blank', 'noopener');
      }
      alert('Link de pagamento enviado por e-mail.');
    } catch (err) {
      alert(err.message || 'Não foi possível enviar o link de pagamento.');
    }
    return;
  }
  if (action === 'sendCalendarSelf' || action === 'sendCalendarAll') {
    try {
      const res = await fetch(`${API_BASE}/send_calendar_invite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reservation_id: id, mode: action === 'sendCalendarSelf' ? 'client' : 'all' })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Falha ao enviar convite de calendário.');
      alert(action === 'sendCalendarSelf'
        ? 'Convite de calendário enviado para o seu e‑mail.'
        : 'Convite de calendário enviado para você e para todos os visitantes com e‑mail cadastrado.');
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
    const visitorsCount = Array.isArray(bookingVisitorIds) ? bookingVisitorIds.length : 0;
    const sendInvites = !!formData.get('send_invites');
    if (visitorsCount === 0) {
      bookingPendingRecord = record;
      bookingPendingFormData = formData;
      bookingVisitorsModalMode = 'noVisitors';
      showBookingVisitorsModal('Você não cadastrou nenhum visitante. Sem pré-cadastro, a recepção poderá levar mais tempo para validar documentos. Deseja adicionar convidados agora?');
      return;
    } else if (sendInvites) {
      bookingPendingRecord = record;
      bookingPendingFormData = formData;
      bookingVisitorsModalMode = 'invites';
      showBookingVisitorsModal('Após a confirmação da reserva, enviaremos por e-mail um convite para todos os visitantes selecionados. Deseja continuar?');
      return;
    }

    await finalizeBookingSubmission(record, formData);
  } catch (err) {
    console.error(err);
    bookingMessage.textContent = err.message || 'Não foi possível salvar a reserva.';
  }
}

async function finalizeBookingSubmission(record, formData) {
  try {
    const isMultiDate = bookingSearchMode === 'date' && Array.isArray(bookingSelectedDates) && bookingSelectedDates.length > 1;
    const datesToCreate = isMultiDate
      ? Array.from(new Set(bookingSelectedDates)).sort()
      : [record.date];

    // Confirmação amigável para múltiplas reservas
    if (datesToCreate.length > 1) {
      const resumoDatas = datesToCreate.map(d => formatDate(d)).join(', ');
      const ok = window.confirm(`Você está criando ${datesToCreate.length} reservas nas datas: ${resumoDatas}. Deseja confirmar?`);
      if (!ok) return;
      // Força sempre criar novas reservas quando há múltiplas datas
      delete record.id;
    }

    let totalCreated = 0;
    let voucherWarn = false;
    let inviteWarn = false;

    for (const date of datesToCreate) {
      const payloadRecord = { ...record, date };
      const res = await fetch(`${API_BASE}/apisave.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ table: 'reservations', record: payloadRecord })
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Erro ao salvar reserva.');
      }
      const reservationId = payloadRecord.id || json.insertId;
      if (reservationId) totalCreated++;

      // Aplica voucher por reserva, se houver
      if (bookingVoucherApplied && bookingVoucherApplied.code && reservationId) {
        try {
          const r = await fetch(`${API_BASE}/apply_voucher.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ reservation_id: reservationId, code: bookingVoucherApplied.code })
          });
          const j = await r.json();
          if (!j.success) throw new Error(j.error || 'Falha ao aplicar voucher');
        } catch (e) {
          voucherWarn = true;
        }
      }

      // Envia convites para cada reserva criada
      if (formData.get('send_invites') && reservationId && bookingVisitorIds.length) {
        try {
          await enviarConvites(reservationId, bookingVisitorIds);
        } catch (err) {
          inviteWarn = true;
          console.warn('Falha ao enviar convites:', err);
        }
      }
    }

    let baseMessage;
    if (record.id && datesToCreate.length === 1) {
      baseMessage = 'Reserva atualizada com sucesso.';
    } else if (datesToCreate.length > 1) {
      baseMessage = `Criamos ${totalCreated} reservas. Você receberá as confirmações e links de pagamento por e‑mail.`;
    } else {
      baseMessage = 'Sua solicitação de reserva foi enviada. Você receberá a confirmação e o link de pagamento por e‑mail.';
    }
    if (voucherWarn) baseMessage += ' Observação: uma ou mais reservas não aceitaram o voucher.';
    resetBookingForm(true);
    const finalMessage = inviteWarn
      ? `${baseMessage} Porém, não foi possível enviar todos os convites.`
      : baseMessage;
    mostrarAcoesPosReserva(finalMessage);
    atualizarPainel();
  } catch (err) {
    console.error(err);
    bookingMessage.textContent = err.message || 'Não foi possível salvar a reserva.';
  }
}

function mostrarAcoesPosReserva(message) {
  if (!bookingMessage) return;
  bookingMessage.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = message || 'Reserva concluída.';
  bookingMessage.appendChild(p);

  const actionsWrap = document.createElement('div');
  actionsWrap.className = 'booking-success-actions';

  const btnReservations = document.createElement('button');
  btnReservations.type = 'button';
  btnReservations.className = 'btn btn-secondary btn-sm';
  btnReservations.textContent = 'Ver minhas reservas';
  btnReservations.addEventListener('click', () => {
    setActivePanel('reservations');
    document.getElementById('panel-reservations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const btnLogout = document.createElement('button');
  btnLogout.type = 'button';
  btnLogout.className = 'btn btn-secondary btn-sm';
  btnLogout.textContent = 'Sair';
  btnLogout.addEventListener('click', () => {
    const logoutBtnEl = document.getElementById('logoutBtn');
    if (logoutBtnEl) {
      logoutBtnEl.click();
    } else {
      window.location.href = 'index.html';
    }
  });

  actionsWrap.appendChild(btnReservations);
  actionsWrap.appendChild(btnLogout);
  bookingMessage.appendChild(actionsWrap);
}

async function onApplyVoucherClick() {
  if (!bookingVoucherInput || !bookingVoucherInput.value.trim()) { if (bookingVoucherResult) bookingVoucherResult.textContent = 'Informe um código.'; return; }
  const code = bookingVoucherInput.value.trim();
  const roomId = bookingRoomHiddenInput?.value ? Number(bookingRoomHiddenInput.value) : 0;
  if (!roomId) { if (bookingVoucherResult) bookingVoucherResult.textContent = 'Selecione a sala antes de aplicar o voucher.'; return; }
  const room = roomsCache.find(r => String(r.id) === String(roomId));
  const amount = room && room.daily_rate ? Number(room.daily_rate) : 0;
  try {
    const payload = { code, room_id: roomId, advertiser_id: room?.advertiser_id || null, amount };
    const res = await fetch(`${API_BASE}/validate_voucher.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Voucher inválido.');
    const v = json.voucher || {};
    const discount = Number(v.discount || 0);
    const payable = Math.max(0, amount - discount);
    bookingVoucherApplied = { code: v.code, discount, payable };
    if (bookingVoucherResult) bookingVoucherResult.textContent = `Voucher aplicado: -${formatCurrency(discount)}. Total previsto: ${formatCurrency(payable)}.`;
  } catch (err) {
    bookingVoucherApplied = null;
    if (bookingVoucherResult) bookingVoucherResult.textContent = err.message || 'Não foi possível validar o voucher.';
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
  bookingSelectedDates = [];
  bookingDateMulti = false;
  if (dateModeSingleBtn) dateModeSingleBtn.classList.add('active');
  if (dateModeMultiBtn) dateModeMultiBtn.classList.remove('active');
  updateMultiDateSummary();
  bookingSelectedDates = [];
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

function updateMultiDateSummary() {
  if (!multiDateSummaryEl) return;
  const total = Array.isArray(bookingSelectedDates) ? bookingSelectedDates.length : 0;
  if (!bookingDateMulti || total <= 1) {
    multiDateSummaryEl.hidden = true;
    return;
  }
  multiDateSummaryEl.hidden = false;
  multiDateSummaryEl.textContent = `Você selecionou ${total} dias.`;
}

function showBookingVisitorsModal(message) {
  if (!bookingVisitorsModal || !bookingVisitorsMessage) return;
  bookingVisitorsMessage.textContent = message;
  bookingVisitorsModal.classList.add('show');
  bookingVisitorsModal.setAttribute('aria-hidden', 'false');
}

function hideBookingVisitorsModal(continueFlag = false) {
  if (!bookingVisitorsModal) return;
  bookingVisitorsModal.classList.remove('show');
  bookingVisitorsModal.setAttribute('aria-hidden', 'true');
  // Quando continueFlag for true, onBookingSubmit continuará normalmente
}

function renderBookingSummary() {
  if (!bookingSummaryEl || !bookingForm) return;

  const roomId = bookingRoomHiddenInput?.value ? String(bookingRoomHiddenInput.value) : null;
  const room = roomId ? roomsCache.find(r => String(r.id) === roomId) : null;

  let dates = [];
  if (bookingSearchMode === 'date' && bookingDateMulti && bookingSelectedDates.length > 1) {
    dates = Array.from(new Set(bookingSelectedDates)).sort();
  } else if (bookingDateInput?.value) {
    dates = [bookingDateInput.value];
  }

  const datesLabel = dates.length
    ? dates.map(d => formatDate(d)).join(', ')
    : '--';

  const title = bookingTitleInput?.value?.trim() || '--';
  const desc = bookingDescriptionInput?.value?.trim() || '--';
  const useCompany = !!(activeClient && activeClient.company_name && bookingCompanyToggle && bookingCompanyToggle.checked);

  const visitorsCount = Array.isArray(bookingVisitorIds) ? bookingVisitorIds.length : 0;
  const visitorNames = visitorsCount && Array.isArray(currentVisitors)
    ? currentVisitors.filter(v => bookingVisitorIds.includes(String(v.id))).map(v => v.name || '').filter(Boolean)
    : [];

  const voucherInfo = bookingVoucherApplied
    ? `Voucher ${bookingVoucherApplied.code} aplicado. Desconto: ${formatCurrency(bookingVoucherApplied.discount || 0)}. Previsto: ${formatCurrency(bookingVoucherApplied.payable || 0)}.`
    : 'Nenhum voucher aplicado.';

  // Cálculo simples de custo total previsto
  let totalPrevisto = null;
  const dias = dates.length || 0;
  if (dias > 0) {
    let valorDia = 0;
    if (bookingVoucherApplied && typeof bookingVoucherApplied.payable === 'number') {
      valorDia = bookingVoucherApplied.payable;
    } else if (room && room.daily_rate) {
      valorDia = Number(room.daily_rate) || 0;
    }
    if (valorDia > 0) {
      totalPrevisto = valorDia * dias;
    }
  }

  bookingSummaryEl.innerHTML = `
    <div>
      <h5>Geral</h5>
      <ul>
        <li><strong>Datas:</strong> ${datesLabel}${dates.length > 1 ? ` (total ${dates.length} dias)` : ''}</li>
        <li><strong>Sala:</strong> ${room ? escapeHtml(room.name || `Sala #${room.id}`) : 'Não selecionada'}</li>
        <li><strong>Reserva pela empresa:</strong> ${useCompany ? (activeClient.company_name || 'Sim') : 'Não'}</li>
      </ul>
      <h5>Detalhes</h5>
      <ul>
        <li><strong>Título:</strong> ${escapeHtml(title)}</li>
        <li><strong>Observações:</strong> ${escapeHtml(desc)}</li>
        <li><strong>Voucher:</strong> ${escapeHtml(voucherInfo)}</li>
        <li><strong>Valor total previsto:</strong> ${totalPrevisto != null ? formatCurrency(totalPrevisto) : '—'}</li>
      </ul>
      <h5>Visitantes</h5>
      <ul>
        <li><strong>Quantidade:</strong> ${visitorsCount}</li>
        <li><strong>Nomes:</strong> ${visitorNames.length ? escapeHtml(visitorNames.join(', ')) : 'Nenhum selecionado'}</li>
      </ul>
    </div>
  `;
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

async function carregarCursosCliente() {
  if (!activeClient) return;
  let availableError = '';
  let myError = '';
  try {
    const [availableRes, myRes] = await Promise.all([
      fetch('api/workshops_list.php?status=publicado&upcoming=1', { credentials: 'include' }).then(r => r.json()),
      fetch(`${API_BASE}/client_workshop_enrollments.php?client_id=${encodeURIComponent(activeClient.id)}`, { credentials: 'include' }).then(r => r.json())
    ]);
    if (availableRes.success) {
      availableCoursesCache = availableRes.data || [];
    } else {
      availableCoursesCache = [];
      availableError = availableRes.error || 'Não foi possível carregar os cursos.';
    }
    if (myRes.success) {
      clientCoursesCache = myRes.data || [];
    } else {
      clientCoursesCache = [];
      myError = myRes.error || 'Não foi possível carregar suas inscrições.';
    }
  } catch (err) {
    console.error(err);
    availableCoursesCache = [];
    clientCoursesCache = [];
    availableError = 'Não foi possível carregar os cursos.';
    myError = 'Não foi possível carregar suas inscrições.';
  }
  renderAvailableCourses(availableError);
  renderClientCourses(myError);
}

function renderAvailableCourses(errorText = '') {
  if (!availableCoursesGrid || !availableCoursesMessage) return;
  availableCoursesGrid.innerHTML = '';
  if (errorText) {
    availableCoursesMessage.textContent = errorText;
    return;
  }
  if (!availableCoursesCache.length) {
    availableCoursesMessage.textContent = 'Nenhum curso publicado no momento.';
    return;
  }
  availableCoursesMessage.textContent = '';
  availableCoursesGrid.innerHTML = availableCoursesCache.map(course => {
    const dateLabel = formatDateRangeLabel(course.date, course.end_date);
    const timeLabel = formatTimeRange(course.time_start, course.time_end);
    const location = [course.room_city, course.room_state].filter(Boolean).join(' - ');
    const price = Number(course.price_per_seat || 0);
    const priceLabel = price > 0
      ? `Ingresso a partir de ${formatCurrency(price)}`
      : 'Ingresso gratuito';
    const maxSeats = Number(course.max_seats || 0);
    const soldSeats = Number(course.sold_seats || 0);
    const seatsLine = maxSeats > 0 ? `${soldSeats} de ${maxSeats} vagas confirmadas` : '';
    const minSeats = Number(course.min_seats || 0);
    const minNote = minSeats > 0
      ? `Pagamento confirmado ao chegar a ${minSeats} participante${minSeats > 1 ? 's' : ''}.`
      : 'Pagamento confirmado imediatamente após a liberação do curso.';
    const alreadyEnrolled = clientCoursesCache.some(item => Number(item.workshop_id) === Number(course.id));
    const imgHtml = course.banner_path
      ? `<div class="workshop-card-cover"><img src="${escapeHtml(course.banner_path)}" alt="Imagem do curso ${escapeHtml(course.title || '')}"></div>`
      : '';
    const disabled = alreadyEnrolled || !activeClient?.email;
    const enrollLabel = alreadyEnrolled ? 'Inscrito' : 'Quero<br>participar';
    const enrollBtn = `<button type="button" class="btn btn-primary btn-sm" data-course-enroll="${course.id}"${disabled ? ' disabled' : ''}>${enrollLabel}</button>`;
    const viewBtn = `<button type="button" class="btn btn-secondary btn-sm" data-course-view="${course.id}">Ver detalhes</button>`;
    let actions = '<div class="workshop-actions">';
    if (disabled) {
      if (alreadyEnrolled) actions += '<span class="chip pending">Inscrição registrada</span>';
      actions += viewBtn;
    } else {
      actions += enrollBtn + viewBtn;
    }
    actions += '</div>';
    return `
      <article class="card workshop-card">
        ${imgHtml}
        <h4>${escapeHtml(course.title || 'Curso')}</h4>
        <p class="workshop-meta">${escapeHtml([dateLabel, timeLabel, location].filter(Boolean).join(' • '))}</p>
        ${course.subtitle ? `<p class="workshop-subtitle">${escapeHtml(course.subtitle)}</p>` : ''}
        <p class="workshop-price">${escapeHtml(priceLabel)}</p>
        ${seatsLine ? `<p class="workshop-meta">${escapeHtml(seatsLine)}</p>` : ''}
        <p class="workshop-meta">${escapeHtml(minNote)}</p>
        ${actions}
      </article>
    `;
  }).join('');

  availableCoursesGrid.querySelectorAll('[data-course-enroll]').forEach(btn => {
    btn.addEventListener('click', () => openCourseModal(Number(btn.getAttribute('data-course-enroll')), { focusEnroll: true }));
  });
  availableCoursesGrid.querySelectorAll('[data-course-view]').forEach(btn => {
    btn.addEventListener('click', () => openCourseModal(Number(btn.getAttribute('data-course-view'))));
  });
}

function renderClientCourses(errorText = '') {
  if (!clientCoursesList || !clientCoursesMessage) return;
  clientCoursesList.innerHTML = '';
  if (errorText) {
    clientCoursesMessage.textContent = errorText;
    return;
  }
  if (!clientCoursesCache.length) {
    clientCoursesMessage.textContent = 'Você ainda não se inscreveu em cursos.';
    return;
  }
  clientCoursesMessage.textContent = '';
  clientCoursesList.innerHTML = clientCoursesCache.map(enrollment => {
    const dateLabel = formatDateRangeLabel(enrollment.workshop_date, enrollment.workshop_end_date);
    const timeLabel = formatTimeRange(enrollment.workshop_time_start, enrollment.workshop_time_end);
    const location = [enrollment.room_city, enrollment.room_state].filter(Boolean).join(' - ');
    const price = Number(enrollment.price_per_seat || 0);
    const priceLabel = price > 0
      ? `Ingresso: ${formatCurrency(price)}`
      : 'Ingresso gratuito';
    const maxSeats = Number(enrollment.max_seats || 0);
    const paidSeats = Number(enrollment.paid_seats || 0);
    const seatsLine = maxSeats > 0 ? `${paidSeats} de ${maxSeats} vagas confirmadas` : '';
    const statusInfo = mapCourseStatus(enrollment.payment_status, Number(enrollment.min_seats || 0));
    const imgHtml = enrollment.banner_path
      ? `<div class="workshop-card-cover"><img src="${escapeHtml(enrollment.banner_path)}" alt="Imagem do curso ${escapeHtml(enrollment.workshop_title || '')}"></div>`
      : '';
    const codeLine = enrollment.public_code
      ? `<p class="workshop-meta">Ingresso: ${escapeHtml(enrollment.public_code)}</p>`
      : '';
    return `
      <article class="card workshop-card">
        ${imgHtml}
        <h4>${escapeHtml(enrollment.workshop_title || 'Curso')}</h4>
        <p class="workshop-meta">${escapeHtml([dateLabel, timeLabel, location].filter(Boolean).join(' • '))}</p>
        ${enrollment.workshop_subtitle ? `<p class="workshop-subtitle">${escapeHtml(enrollment.workshop_subtitle)}</p>` : ''}
        <p class="workshop-price">${escapeHtml(priceLabel)}</p>
        ${seatsLine ? `<p class="workshop-meta">${escapeHtml(seatsLine)}</p>` : ''}
        ${codeLine}
        <div class="course-status">
          <strong>Status</strong>
          <span class="${statusInfo.className}">${escapeHtml(statusInfo.label)}</span>
        </div>
        ${statusInfo.note ? `<p class="workshop-meta">${escapeHtml(statusInfo.note)}</p>` : ''}
        <div class="workshop-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-course-view="${enrollment.workshop_id}" data-enrollment-id="${enrollment.id}">Ver detalhes</button>
        </div>
      </article>
    `;
  }).join('');

  clientCoursesList.querySelectorAll('[data-course-view]').forEach(btn => {
    const workshopId = Number(btn.getAttribute('data-course-view'));
    const enrollmentId = Number(btn.getAttribute('data-enrollment-id'));
    btn.addEventListener('click', () => {
      const enrollment = clientCoursesCache.find(item => Number(item.id) === enrollmentId)
        || clientCoursesCache.find(item => Number(item.workshop_id) === workshopId);
      openCourseModal(workshopId, { enrollment });
    });
  });
}

function mapCourseStatus(paymentStatus, minSeats) {
  const normalized = String(paymentStatus || '').toLowerCase();
  if (normalized === 'pago') {
    return {
      label: 'Pagamento confirmado',
      className: 'chip success',
      note: 'Sua vaga está garantida.'
    };
  }
  if (minSeats > 0) {
    return {
      label: 'Aguardando mínimo',
      className: 'chip pending',
      note: `O pagamento será processado quando o curso atingir ${minSeats} participante${minSeats > 1 ? 's' : ''}.`
    };
  }
  return {
    label: 'Pagamento pendente',
    className: 'chip pending',
    note: 'Confirmaremos o pagamento em breve.'
  };
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

function getActiveAddress() {
  if (!activeClient) return {};
  const addr = activeClient.address || activeClient.client_address || activeClient.address_data || {};
  return {
    street: addr.street || activeClient.street || '',
    number: addr.number || activeClient.number || '',
    complement: addr.complement || activeClient.complement || '',
    zip_code: addr.zip_code || addr.cep || activeClient.zip_code || '',
    city: addr.city || activeClient.city || '',
    state: addr.state || activeClient.state || '',
    country: addr.country || activeClient.country || 'BR'
  };
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
  const addr = getActiveAddress();
  if (profileInputs.street) profileInputs.street.value = addr.street || '';
  if (profileInputs.number) profileInputs.number.value = addr.number || '';
  if (profileInputs.complement) profileInputs.complement.value = addr.complement || '';
  if (profileInputs.zip_code) profileInputs.zip_code.value = formatCEP(addr.zip_code) || '';
  if (profileInputs.city) profileInputs.city.value = addr.city || '';
  if (profileInputs.state) profileInputs.state.value = addr.state || '';
  if (profileInputs.country) profileInputs.country.value = addr.country || 'BR';
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
  const addr = getActiveAddress();
  if (editStreet) editStreet.value = addr.street || '';
  if (editNumber) editNumber.value = addr.number || '';
  if (editComplement) editComplement.value = addr.complement || '';
  if (editZip) editZip.value = formatCEP(addr.zip_code) || '';
  if (editCity) editCity.value = addr.city || '';
  if (editState) editState.value = addr.state || '';
  if (editCountry) editCountry.value = addr.country || 'BR';
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
    whatsapp: somenteDigitos(editWhatsapp?.value),
    street: editStreet?.value.trim() || '',
    number: editNumber?.value.trim() || '',
    complement: editComplement?.value.trim() || '',
    zip_code: somenteDigitos(editZip?.value),
    city: editCity?.value.trim() || '',
    state: editState?.value.trim() || '',
    country: editCountry?.value.trim() || 'BR'
  };
  if (!payload.name || !payload.login) {
    if (profileEditMessage) profileEditMessage.textContent = 'Preencha nome e login.';
    return;
  }
  try {
    // Atualiza dados básicos
    const res = await fetch(`${API_BASE}/client_update_profile.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar cadastro.');
    const addressPayload = {
      street: payload.street,
      number: payload.number,
      complement: payload.complement,
      zip_code: payload.zip_code,
      city: payload.city,
      state: payload.state,
      country: payload.country
    };
    activeClient = { ...activeClient, ...json.client, address: { ...(activeClient.address || {}), ...addressPayload } };
    renderProfile();

    if (profileEditMessage) profileEditMessage.textContent = 'Dados salvos com sucesso.';
    closeProfileEditModal();
  } catch (err) {
    if (profileEditMessage) profileEditMessage.textContent = err.message || 'Falha ao salvar.';
  }
}

function openPasswordChangeModal() {
  if (!passwordChangeModal) return;
  if (passwordChangeMessage) passwordChangeMessage.textContent = '';
  if (currentPasswordInput) currentPasswordInput.value = '';
  if (newPasswordInput) newPasswordInput.value = '';
  if (newPasswordConfirmInput) newPasswordConfirmInput.value = '';
  updateModalPasswordIndicators();
  passwordChangeModal.classList.add('show');
  passwordChangeModal.setAttribute('aria-hidden', 'false');
}

function closePasswordChangeModal() {
  if (!passwordChangeModal) return;
  passwordChangeModal.classList.remove('show');
  passwordChangeModal.setAttribute('aria-hidden', 'true');
}

async function onPasswordChangeSubmit(event) {
  event.preventDefault();
  if (!activeClient) return;
  if (passwordChangeMessage) passwordChangeMessage.textContent = '';
  const cur = currentPasswordInput?.value || '';
  const np = newPasswordInput?.value || '';
  const npc = newPasswordConfirmInput?.value || '';
  try {
    if (!cur || !np || !npc) throw new Error('Preencha todos os campos de senha.');
    if (np !== npc) throw new Error('As senhas novas não conferem.');
    if (!validarSenhaForte(np)) throw new Error('A nova senha não atende os requisitos.');
    const r2 = await fetch(`${API_BASE}/client_change_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activeClient.id, current_password: cur, new_password: np })
    });
    const j2 = await r2.json();
    if (!j2.success) throw new Error(j2.error || 'Não foi possível alterar a senha.');
    if (passwordChangeMessage) passwordChangeMessage.textContent = 'Senha alterada com sucesso.';
    closePasswordChangeModal();
  } catch (err) {
    if (passwordChangeMessage) passwordChangeMessage.textContent = err.message || 'Falha ao alterar senha.';
  }
}

async function onProfileSubmit(event) {
  event.preventDefault();
  if (!activeClient) return;
  const name = profileInputs.name?.value.trim();
  const login = profileInputs.login?.value.trim();
  const phone = somenteDigitos(profileInputs.phone?.value);
  const whatsapp = somenteDigitos(profileInputs.whatsapp?.value);
  const addr = {
    street: profileInputs.street?.value.trim() || '',
    number: profileInputs.number?.value.trim() || '',
    complement: profileInputs.complement?.value.trim() || '',
    zip_code: somenteDigitos(profileInputs.zip_code?.value),
    city: profileInputs.city?.value.trim() || '',
    state: profileInputs.state?.value.trim() || '',
    country: profileInputs.country?.value.trim() || 'BR'
  };
  if (!name || !login) {
    if (profileMessageEl) profileMessageEl.textContent = 'Preencha nome e login.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/client_update_profile.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: activeClient.id,
        name,
        login,
        phone,
        whatsapp,
        ...addr
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar cadastro.');
    activeClient = { ...activeClient, ...json.client, address: { ...(activeClient.address || {}), ...addr } };
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

function formatDateRangeLabel(start, end) {
  if (!start) return '--';
  const inicio = formatDate(start);
  if (end && end !== start) {
    return `${inicio} até ${formatDate(end)}`;
  }
  return inicio;
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

function formatCEP(value) {
  const digits = somenteDigitos(value).slice(0, 8);
  if (!digits) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
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

function setAddressFields(target, data = {}) {
  const streetVal = data.logradouro || data.street || '';
  const cityVal = data.localidade || data.city || '';
  const stateVal = data.uf || data.state || '';
  const compVal = data.complemento || data.complement || '';
  const countryVal = data.country || 'BR';

  const apply = (field, value) => {
    if (field && value) field.value = value;
  };

  if (target === 'profile' || !target) {
    apply(profileInputs.street, streetVal);
    apply(profileInputs.city, cityVal);
    apply(profileInputs.state, stateVal);
    apply(profileInputs.complement, compVal);
    if (profileInputs.country && !profileInputs.country.value) profileInputs.country.value = countryVal;
  }
  if (target === 'edit' || !target) {
    apply(editStreet, streetVal);
    apply(editCity, cityVal);
    apply(editState, stateVal);
    apply(editComplement, compVal);
    if (editCountry && !editCountry.value) editCountry.value = countryVal;
  }
}

async function autoFillAddressFromCEP(cepValue, target = 'edit'){
  const cepDigits = somenteDigitos(cepValue);
  if (cepDigits.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
    if (!res.ok) throw new Error('CEP não encontrado');
    const data = await res.json();
    if (data.erro) throw new Error('CEP não encontrado');
    setAddressFields(target, data);
  } catch (err) {
    console.warn('Falha ao buscar CEP:', err.message || err);
  }
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
// Client chat modal elements
const clientChatModal = document.getElementById('clientChatModal');
const clientChatClose = document.getElementById('clientChatClose');
const clientChatHeader = document.getElementById('clientChatHeader');
const clientChatMessages = document.getElementById('clientChatMessages');
const clientChatForm = document.getElementById('clientChatForm');
const clientChatInput = document.getElementById('clientChatInput');
let clientChatThreadId = null;
let clientChatPollTimer = null;
const openSupportChatBtn = document.getElementById('openSupportChatBtn');
const clientChatTitleEl = document.getElementById('clientChatTitle');
const clientSupportThreadItem = document.getElementById('clientSupportThreadItem');
const clientChatThreadsList = document.getElementById('clientChatThreadsList');
const openReportProblemBtn = document.getElementById('openReportProblemBtn');
const reportProblemModal = document.getElementById('reportProblemModal');
const reportProblemClose = document.getElementById('reportProblemClose');
const reportProblemCancel = document.getElementById('reportProblemCancel');
const reportProblemForm = document.getElementById('reportProblemForm');
const reportIssueType = document.getElementById('reportIssueType');
const reportIssueDescription = document.getElementById('reportIssueDescription');
const reportProblemMessage = document.getElementById('reportProblemMessage');
let clientChatThreadsCache = [];
