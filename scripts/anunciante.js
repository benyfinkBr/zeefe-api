const API_BASE = '/api';
const ADV_REMEMBER_KEY = 'advRememberToken';
const HEADER_COOKIE_NAME = 'ZEEFE_HEADER_SESSION';
const HEADER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function isHttps() {
  try {
    return window.location?.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function buildHeaderSessionCookie(value, ttlSeconds = HEADER_COOKIE_MAX_AGE) {
  const parts = [
    `${HEADER_COOKIE_NAME}=${value ? encodeURIComponent(value) : ''}`,
    'Domain=.zeefe.com.br',
    'Path=/',
    'SameSite=Lax'
  ];
  if (value) {
    parts.push(`Max-Age=${ttlSeconds}`);
  } else {
    parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    parts.push('Max-Age=0');
  }
  if (isHttps()) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

// Estado
let advClient = null; // dados do cliente logado
let myAdvertiser = null; // registro de advertisers do dono
let myRooms = [];
let myReservations = [];
let myWorkshops = [];
let currentThreadId = null;
let chatPollTimer = null;
let workshopSelectedDates = [];
let advHeaderMenuOpen = false;
let advEventsBound = false;
let advAutoRefreshTimer = null;

function persistHeaderSessionLocal(session) {
  try {
    if (session) {
      localStorage.setItem('zeefeHeaderSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('zeefeHeaderSession');
    }
  } catch (_) {}
  try {
    const raw = session ? JSON.stringify(session) : null;
    document.cookie = buildHeaderSessionCookie(raw);
  } catch (_) {}
}

function syncHeaderWithAdvertiserSession(advertiser) {
  if (advertiser) {
    const payload = {
      type: 'advertiser',
      name: advertiser.display_name || advertiser.full_name || advertiser.email || ''
    };
    window.ZEEFE_HEADER?.persistSession?.(payload);
    persistHeaderSessionLocal(payload);
  } else {
    window.ZEEFE_HEADER?.clearSession?.();
    persistHeaderSessionLocal(null);
  }
}

function readHeaderCookie() {
  try {
    const entry = document.cookie.split('; ').find(part => part.startsWith(`${HEADER_COOKIE_NAME}=`));
    if (!entry) return null;
    const raw = decodeURIComponent(entry.split('=')[1]);
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

(async function hydrateHeaderFromSession() {
  try {
    const res = await fetch(`${API_BASE}/advertiser_session.php`, { credentials: 'include' });
    const json = await res.json();
    if (json?.success && json.advertiser) {
      syncHeaderWithAdvertiserSession(json.advertiser);
      if (!advClient) {
        advClient = json.advertiser;
      }
      return;
    }
    const fallback = readHeaderCookie();
    if (fallback) {
      syncHeaderWithAdvertiserSession({
        display_name: fallback.name || '',
        full_name: fallback.name || '',
        email: fallback.name || ''
      });
    }
  } catch (_) {}
})();
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
if (rememberMe && !rememberMe.checked) {
  rememberMe.checked = true;
}
const authMsg = document.getElementById('advAuthMessage');

const panelsWrap = document.getElementById('advPanels');
// Navegação lateral + atalhos no header (mesmo callback)
const navButtons = Array.from(document.querySelectorAll('.portal-nav-links button, .quick-actions button[data-panel]'));
const logoutBtn = document.getElementById('advLogoutBtn');
const refreshBtn = document.getElementById('advRefreshBtn');
const advHeaderAccountWrap = document.getElementById('advHeaderAccount');
const advHeaderAccountBtn = document.getElementById('advHeaderAccountBtn');
const advHeaderReservationsBtn = document.getElementById('advHeaderReservations');
const advHeaderProfileBtn = document.getElementById('advHeaderProfile');
const advHeaderMessagesBtn = document.getElementById('advHeaderMessages');
const advHeaderLogoutBtn = document.getElementById('advHeaderLogout');

const advDisplay = document.getElementById('advDisplay');
const advOwner = document.getElementById('advOwner');
const advEditProfileBtn = document.getElementById('advEditProfileBtn');
const advEditProfileSideBtn = document.getElementById('advEditProfileSideBtn');

// Perfil / painel de visualização
const advProfileNameView = document.getElementById('advProfileNameView');
const advProfileEmailView = document.getElementById('advProfileEmailView');
const advProfilePhoneView = document.getElementById('advProfilePhoneView');
const advProfileFeeView = document.getElementById('advProfileFeeView');
const advProfileOpenEditBtn = document.getElementById('advProfileOpenEditBtn');
const advProfileCancelViewBtn = document.getElementById('advProfileCancelViewBtn');
const advProfileViewMsg = document.getElementById('advProfileViewMsg');

// Perfil / modal de edição
const advProfileModal = document.getElementById('advProfileModal');
const advProfileClose = document.getElementById('advProfileClose');
const advProfileForm = document.getElementById('advProfileForm');
const advProfileCancelBtn = document.getElementById('advProfileCancelBtn');
const advProfileDisplay = document.getElementById('advProfileDisplay');
const advProfilePhone = document.getElementById('advProfilePhone');
const advProfileMsg = document.getElementById('advProfileMsg');
const advOpenPasswordModalBtn = document.getElementById('advOpenPasswordModalBtn');
const advPasswordModal = document.getElementById('advPasswordModal');
const advPasswordClose = document.getElementById('advPasswordClose');
const advPasswordCancel = document.getElementById('advPasswordCancel');
const advPasswordForm = document.getElementById('advPasswordForm');
const advPasswordMsg = document.getElementById('advPasswordMsg');
const advCurrentPasswordInput = document.getElementById('advCurrentPassword');
const advNewPasswordInput = document.getElementById('advNewPassword');
const advNewPasswordConfirmInput = document.getElementById('advNewPasswordConfirm');
const advPwdStrengthIndicator = document.getElementById('advPwdStrengthIndicator');
const advPwdMatchIndicator = document.getElementById('advPwdMatchIndicator');

// Workshops
const advWorkshopModal = document.getElementById('advWorkshopModal');
const advWorkshopClose = document.getElementById('advWorkshopClose');
const advWorkshopForm = document.getElementById('advWorkshopForm');
const advWorkshopCancelBtn = document.getElementById('advWorkshopCancelBtn');
const advWorkshopMsg = document.getElementById('advWorkshopMsg');
const advWorkshopIdInput = document.getElementById('advWorkshopId');
const advWorkshopRoomSelect = document.getElementById('advWorkshopRoom');
const advWorkshopDateInput = document.getElementById('advWorkshopDate');
const advWorkshopEndDateInput = document.getElementById('advWorkshopEndDate');
const advWorkshopTimeStartInput = document.getElementById('advWorkshopTimeStart');
const advWorkshopTimeEndInput = document.getElementById('advWorkshopTimeEnd');
const advWorkshopStartHourSelect = document.getElementById('advWorkshopStartHour');
const advWorkshopStartMinuteSelect = document.getElementById('advWorkshopStartMinute');
const advWorkshopEndHourSelect = document.getElementById('advWorkshopEndHour');
const advWorkshopEndMinuteSelect = document.getElementById('advWorkshopEndMinute');
const advWorkshopTimeStartWrap = document.getElementById('advWorkshopTimeStartWrap');
const advWorkshopTimeEndWrap = document.getElementById('advWorkshopTimeEndWrap');
const advWorkshopTitleInput = document.getElementById('advWorkshopTitleInput');
const advWorkshopCategorySelect = document.getElementById('advWorkshopCategory');
const advWorkshopCategoryOtherInput = document.getElementById('advWorkshopCategoryOther');
const advWorkshopPriceInput = document.getElementById('advWorkshopPrice');
const advWorkshopMinSeatsInput = document.getElementById('advWorkshopMinSeats');
const advWorkshopMaxSeatsInput = document.getElementById('advWorkshopMaxSeats');
const advWorkshopShowBarSelect = document.getElementById('advWorkshopShowBar');
const advWorkshopStatusSelect = document.getElementById('advWorkshopStatus');
const advWorkshopSubtitleInput = document.getElementById('advWorkshopSubtitle');
const advWorkshopDescriptionEditor = document.getElementById('advWorkshopDescriptionEditor');
const advWorkshopDescriptionInput = document.getElementById('advWorkshopDescription');
const advWorkshopBannerInput = document.getElementById('advWorkshopBanner');
const advWorkshopDateSingle = document.getElementById('advWorkshopDateSingle');
const advWorkshopDateMulti = document.getElementById('advWorkshopDateMulti');
const advWorkshopSameTimeCheckbox = document.getElementById('advWorkshopSameTime');
const advWorkshopDescToolbar = document.getElementById('advWorkshopDescToolbar');
const advWorkshopAddDateWrap = document.getElementById('advWorkshopAddDateWrap');
const advWorkshopAddDateBtn = document.getElementById('advWorkshopAddDateBtn');
const advWorkshopDatesMultiWrap = document.getElementById('advWorkshopDatesMultiWrap');
const advWorkshopDatesList = document.getElementById('advWorkshopDatesList');
const advWorkshopDatesSummary = document.getElementById('advWorkshopDatesSummary');
const advWorkshopDatesJsonInput = document.getElementById('advWorkshopDatesJson');
const advWorkshopPerDayTimes = document.getElementById('advWorkshopPerDayTimes');

// Overview
const ovViews = document.getElementById('ovViews');
const ovUpcoming = document.getElementById('ovUpcoming');
const ovBalance = document.getElementById('ovBalance');
const ovNext = document.getElementById('ovNextReservations');

// Salas / Reservas / Financeiro / Mensagens / Reviews / Workshops
const roomsContainer = document.getElementById('advRoomsContainer');
const resContainer = document.getElementById('advReservationsContainer');
const finContainer = document.getElementById('advFinanceContainer');
const threadsContainer = document.getElementById('advThreadsContainer');
const reviewsContainer = document.getElementById('advReviewsContainer');
const workshopsContainer = document.getElementById('advWorkshopsContainer');
const enrollmentsContainer = document.getElementById('advEnrollmentsContainer');
const enrollmentsTitle = document.getElementById('advEnrollmentsTitle');
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
const advResCancelModal = document.getElementById('advResCancelModal');
const advResCancelClose = document.getElementById('advResCancelClose');
const advResCancelBack = document.getElementById('advResCancelBack');
const advResCancelConfirm = document.getElementById('advResCancelConfirm');
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
const roomIdHidden = document.getElementById('roomIdHidden');
const roomName = document.getElementById('roomName');
const roomCap = document.getElementById('roomCapacity');
const roomCity = document.getElementById('roomCity');
const roomState = document.getElementById('roomState');
const roomPrice = document.getElementById('roomPrice');
const roomStatus = document.getElementById('roomStatus');
const roomDesc = document.getElementById('roomDescription');
const roomDescEditor = document.getElementById('advRoomDescriptionEditor');
const roomDescToolbar = document.getElementById('advRoomDescToolbar');
const roomAmenitiesGrid = document.getElementById('advAmenitiesGrid');
const roomPhotosInput = document.getElementById('roomPhotos');
const roomPhotosPreview = document.getElementById('roomPhotosPreview');
const policyImmediateToggle = document.getElementById('policyImmediateToggle');
const policyImmediateBasePrice = document.getElementById('policyImmediateBasePrice');
const policyCancelToggle = document.getElementById('policyCancelToggle');
const policyCancelDays = document.getElementById('policyCancelDays');
const policyCancelFee = document.getElementById('policyCancelFee');
const policyCancelBasePrice = document.getElementById('policyCancelBasePrice');
const policyFreeToggle = document.getElementById('policyFreeToggle');
const policyFreeBasePrice = document.getElementById('policyFreeBasePrice');
const policyImmediateDate = document.getElementById('policyImmediateDate');
const policyImmediatePrice = document.getElementById('policyImmediatePrice');
const policyImmediateAdd = document.getElementById('policyImmediateAdd');
const policyImmediateList = document.getElementById('policyImmediateList');
const policyCancelDate = document.getElementById('policyCancelDate');
const policyCancelPrice = document.getElementById('policyCancelPrice');
const policyCancelAdd = document.getElementById('policyCancelAdd');
const policyCancelList = document.getElementById('policyCancelList');
const policyFreeDate = document.getElementById('policyFreeDate');
const policyFreePrice = document.getElementById('policyFreePrice');
const policyFreeAdd = document.getElementById('policyFreeAdd');
const policyFreeList = document.getElementById('policyFreeList');
// extra admin-like fields
const dailyRate = document.getElementById('dailyRate');
const dailyRateDisplay = document.getElementById('dailyRateDisplay');
const policyOptionsWarning = document.getElementById('policyOptionsWarning');
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
const maintenanceStartGroup = document.getElementById('maintenanceStartGroup');
const maintenanceEndGroup = document.getElementById('maintenanceEndGroup');
const deactivatedFromGroup = document.getElementById('deactivatedFromGroup');
const roomFutureReservationsWarning = document.getElementById('roomFutureReservationsWarning');
// payout form
const bankCodeInput = document.getElementById('bankCode');
const bankNameInput = document.getElementById('bankName');
const accountTypeInput = document.getElementById('accountType');
const agencyNumberInput = document.getElementById('agencyNumber');
const accountNumberInput = document.getElementById('accountNumber');
const pixKeyInput = document.getElementById('pixKey');
const savePayoutBtn = document.getElementById('savePayoutBtn');
const payoutMessage = document.getElementById('payoutMessage');
const advMessagesBadge = document.getElementById('advMessagesBadge');
const advStatusNoticeModal = document.getElementById('advStatusNoticeModal');
const advStatusNoticeText = document.getElementById('advStatusNoticeText');
const advStatusNoticeClose = document.getElementById('advStatusNoticeClose');
const advStatusNoticeOk = document.getElementById('advStatusNoticeOk');
const advStatusNoticeReservations = document.getElementById('advStatusNoticeReservations');

const BANKS_JSON_URL = '/data/banks_bacen.json';
const DEFAULT_BANKS = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '041', name: 'Banrisul' },
  { code: '070', name: 'BRB' },
  { code: '077', name: 'Banco Inter' },
  { code: '085', name: 'Ailos' },
  { code: '091', name: 'Unicred' },
  { code: '104', name: 'Caixa Economica Federal' },
  { code: '121', name: 'Agibank' },
  { code: '208', name: 'BTG Pactual' },
  { code: '212', name: 'Original' },
  { code: '237', name: 'Bradesco' },
  { code: '260', name: 'Nubank' },
  { code: '290', name: 'PagBank (PagSeguro)' },
  { code: '323', name: 'Mercado Pago' },
  { code: '336', name: 'C6 Bank' },
  { code: '341', name: 'Itau Unibanco' },
  { code: '364', name: 'Gerencianet' },
  { code: '399', name: 'HSBC' },
  { code: '422', name: 'Safra' },
  { code: '505', name: 'Credit Suisse' },
  { code: '637', name: 'Sofisa Direto' },
  { code: '655', name: 'Votorantim' },
  { code: '746', name: 'Modal' },
  { code: '748', name: 'Sicredi' },
  { code: '756', name: 'Sicoob' }
];
let banksCache = [...DEFAULT_BANKS];
const bankNameByCode = new Map();
const normalizeBankKey = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const bankCodeByName = new Map();

function hydrateBankMaps(list) {
  bankNameByCode.clear();
  bankCodeByName.clear();
  (list || []).forEach(({ code, name }) => {
    if (!code || !name) return;
    bankNameByCode.set(code, name);
    bankCodeByName.set(normalizeBankKey(name), code);
  });
}

function fillBankDatalists(list) {
  const codeList = document.getElementById('bankCodeList');
  const nameList = document.getElementById('bankNameList');
  if (!codeList || !nameList) return;
  codeList.innerHTML = '';
  nameList.innerHTML = '';
  (list || []).forEach(({ code, name }) => {
    if (!code || !name) return;
    const codeOpt = document.createElement('option');
    codeOpt.value = code;
    codeOpt.label = name;
    codeList.appendChild(codeOpt);
    const nameOpt = document.createElement('option');
    nameOpt.value = name;
    nameList.appendChild(nameOpt);
  });
}

async function initBankAutocomplete() {
  if (!bankCodeInput || !bankNameInput) return;
  try {
    const res = await fetch(BANKS_JSON_URL, { cache: 'no-store' });
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      banksCache = data;
    }
  } catch (_) {}
  hydrateBankMaps(banksCache);
  fillBankDatalists(banksCache);
}

let amenitiesCache = null;
let amenitiesRequest = null;
let currentRoomPhotoList = [];
let roomPoliciesState = {
  immediate: { enabled: false, prices: [] },
  cancel_window: { enabled: false, cancel_days: null, cancel_fee_pct: null, prices: [] },
  free_cancel: { enabled: false, prices: [] }
};
const REQUIRED_ROOM_FIELDS = [
  { el: roomName, label: 'Nome da sala' },
  { el: roomCap, label: 'Capacidade' },
  { el: roomCity, label: 'Cidade' },
  { el: roomState, label: 'Estado (UF)' }
];

function clearRoomFieldErrors() {
  REQUIRED_ROOM_FIELDS.forEach(({ el }) => {
    el?.classList.remove('field-error');
  });
}

if (bankCodeInput && bankNameInput) {
  bankCodeInput.addEventListener('input', () => {
    const code = bankCodeInput.value.trim();
    const name = bankNameByCode.get(code);
    if (name) bankNameInput.value = name;
  });
  bankNameInput.addEventListener('input', () => {
    const key = normalizeBankKey(bankNameInput.value);
    const code = bankCodeByName.get(key);
    if (code) bankCodeInput.value = code;
  });
  initBankAutocomplete();
}

function validateRequiredRoomFields() {
  const missing = [];
  REQUIRED_ROOM_FIELDS.forEach(({ el, label }) => {
    if (!el) return;
    const value = el.value?.trim();
    const isNumberField = el === roomCap;
    const valid = isNumberField ? Number(value) > 0 : Boolean(value);
    if (!valid) {
      el.classList.add('field-error');
      missing.push(label);
    }
  });
  return missing;
}

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

function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function maskCepValue(valor) {
  const digits = somenteDigitos(valor).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function handleCepInput(event) {
  if (!event?.target) return;
  const masked = maskCepValue(event.target.value);
  if (event.target.value !== masked) {
    event.target.value = masked;
  }
  if (somenteDigitos(masked).length === 8) {
    autoFillRoomAddressFromCep(masked);
  }
}

async function autoFillRoomAddressFromCep(value) {
  const digits = somenteDigitos(value);
  if (digits.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) throw new Error('CEP não encontrado');
    const data = await res.json();
    if (data.erro) throw new Error('CEP não encontrado');
    if (streetInput && data.logradouro && !streetInput.value) streetInput.value = data.logradouro;
    if (roomCity && data.localidade) roomCity.value = data.localidade;
    if (roomState && data.uf) roomState.value = data.uf;
    if (complementInput && data.complemento && !complementInput.value) complementInput.value = data.complemento;
  } catch (err) {
    console.warn('[CEP] Falha ao buscar endereço:', err.message || err);
  }
}

async function ensureAmenitiesLoaded() {
  if (amenitiesCache) return amenitiesCache;
  if (amenitiesRequest) return amenitiesRequest;
  amenitiesRequest = fetch(`${API_BASE}/apiget.php?table=amenities`, { credentials: 'include' })
    .then(res => res.json())
    .then(json => (json.success ? (json.data || []) : []))
    .catch(() => [])
    .finally(() => { amenitiesRequest = null; });
  amenitiesCache = await amenitiesRequest;
  return amenitiesCache;
}

async function renderRoomAmenities(selectedIds = []) {
  if (!roomAmenitiesGrid) return;
  const amenities = await ensureAmenitiesLoaded();
  roomAmenitiesGrid.innerHTML = '';
  if (!amenities.length) {
    roomAmenitiesGrid.innerHTML = '<p class="input-hint">Nenhuma comodidade cadastrada.</p>';
    return;
  }
  const selected = new Set((selectedIds || []).map(id => String(id)));
  const fragment = document.createDocumentFragment();
  amenities.forEach(item => {
    const wrapper = document.createElement('label');
    wrapper.className = 'amenity-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = item.id;
    checkbox.checked = selected.has(String(item.id));
    const span = document.createElement('span');
    span.textContent = item.name || `Comodidade ${item.id}`;
    wrapper.appendChild(checkbox);
    wrapper.appendChild(span);
    fragment.appendChild(wrapper);
  });
  roomAmenitiesGrid.appendChild(fragment);
}

function collectSelectedAmenities() {
  if (!roomAmenitiesGrid) return [];
  return Array.from(roomAmenitiesGrid.querySelectorAll('input[type="checkbox"]:checked'))
    .map(input => Number(input.value))
    .filter(id => Number.isFinite(id) && id > 0);
}

function parseRoomPhotoPaths(photoPathValue) {
  if (Array.isArray(photoPathValue)) {
    return photoPathValue.map(p => String(p || '').trim()).filter(Boolean).map(normalizePhotoPath);
  }
  if (typeof photoPathValue === 'string' && photoPathValue.length) {
    return photoPathValue.split(',').map(p => p.trim()).filter(Boolean).map(normalizePhotoPath);
  }
  return [];
}

function normalizePhotoPath(path) {
  const cleaned = String(path || '').trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('http') || cleaned.startsWith('/')) return cleaned;
  return `/${cleaned}`;
}

function getRoomPrimaryPhoto(room) {
  if (!room) return '';
  const paths = parseRoomPhotoPaths(room.photo_path);
  return paths.length ? paths[0] : '';
}

function renderRoomPhotosPreview(photoPathValue, options = {}) {
  if (!roomPhotosPreview) return;
  const { roomId = null, allowDelete = false } = options;
  const paths = parseRoomPhotoPaths(photoPathValue);
  currentRoomPhotoList = paths;
  if (!paths.length) {
    roomPhotosPreview.innerHTML = '<p class="input-hint">Nenhuma foto cadastrada.</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  paths.forEach(src => {
    const thumb = document.createElement('div');
    thumb.className = 'room-photo-thumb';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Foto da sala';
    thumb.appendChild(img);
    if (allowDelete && roomId) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'remove-photo-btn';
      btn.textContent = '×';
      btn.addEventListener('click', () => removeRoomPhoto(roomId, src, thumb));
      thumb.appendChild(btn);
    }
    fragment.appendChild(thumb);
  });
  roomPhotosPreview.innerHTML = '';
  roomPhotosPreview.appendChild(fragment);
}

function resetRoomPoliciesState() {
  roomPoliciesState = {
    immediate: { enabled: false, base_price: null, prices: [] },
    cancel_window: { enabled: false, base_price: null, cancel_days: null, cancel_fee_pct: null, prices: [] },
    free_cancel: { enabled: false, base_price: null, prices: [] }
  };
  if (policyImmediateToggle) policyImmediateToggle.checked = false;
  if (policyCancelToggle) policyCancelToggle.checked = false;
  if (policyFreeToggle) policyFreeToggle.checked = false;
  if (policyImmediateBasePrice) policyImmediateBasePrice.value = '';
  if (policyCancelBasePrice) policyCancelBasePrice.value = '';
  if (policyFreeBasePrice) policyFreeBasePrice.value = '';
  if (policyCancelDays) policyCancelDays.value = '';
  if (policyCancelFee) policyCancelFee.value = '';
  if (policyImmediateList) policyImmediateList.innerHTML = '';
  if (policyCancelList) policyCancelList.innerHTML = '';
  if (policyFreeList) policyFreeList.innerHTML = '';
  updateDailyRateFromPolicies();
}

function renderPolicyGrid(policyKey, listEl) {
  if (!listEl) return;
  const items = roomPoliciesState[policyKey]?.prices || [];
  if (!items.length) {
    listEl.innerHTML = '<div class="input-hint">Nenhuma data configurada.</div>';
    return;
  }
  listEl.innerHTML = items.map((item, idx) => `
    <div class="policy-grid-item">
      <div>${escapeHtml(item.date)} · R$ ${Number(item.price || 0).toFixed(2)}</div>
      <button type="button" class="btn btn-secondary btn-sm" data-policy="${policyKey}" data-index="${idx}">Remover</button>
    </div>
  `).join('');
  listEl.querySelectorAll('button[data-policy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-policy');
      const index = Number(btn.getAttribute('data-index'));
      if (!roomPoliciesState[key]) return;
      roomPoliciesState[key].prices.splice(index, 1);
      renderPolicyGrid(key, listEl);
    });
  });
}

function addPolicyPrice(policyKey, dateInput, priceInput, listEl) {
  const date = (dateInput?.value || '').trim();
  const price = priceInput?.value ? Number(priceInput.value) : null;
  if (!date || !price || price <= 0) {
    roomMsg.textContent = 'Informe data e preço válidos para o grid.';
    return;
  }
  roomMsg.textContent = '';
  if (!roomPoliciesState[policyKey]) return;
  const existing = roomPoliciesState[policyKey].prices.find(item => item.date === date);
  if (existing) {
    existing.price = price;
  } else {
    roomPoliciesState[policyKey].prices.push({ date, price });
    roomPoliciesState[policyKey].prices.sort((a, b) => a.date.localeCompare(b.date));
  }
  if (dateInput) dateInput.value = '';
  if (priceInput) priceInput.value = '';
  renderPolicyGrid(policyKey, listEl);
}

function applyPoliciesToUi() {
  if (policyImmediateToggle) policyImmediateToggle.checked = roomPoliciesState.immediate.enabled;
  if (policyCancelToggle) policyCancelToggle.checked = roomPoliciesState.cancel_window.enabled;
  if (policyFreeToggle) policyFreeToggle.checked = roomPoliciesState.free_cancel.enabled;
  if (policyImmediateBasePrice) policyImmediateBasePrice.value = roomPoliciesState.immediate.base_price ?? '';
  if (policyCancelBasePrice) policyCancelBasePrice.value = roomPoliciesState.cancel_window.base_price ?? '';
  if (policyFreeBasePrice) policyFreeBasePrice.value = roomPoliciesState.free_cancel.base_price ?? '';
  if (policyCancelDays) policyCancelDays.value = roomPoliciesState.cancel_window.cancel_days ?? '';
  if (policyCancelFee) policyCancelFee.value = roomPoliciesState.cancel_window.cancel_fee_pct ?? '';
  renderPolicyGrid('immediate', policyImmediateList);
  renderPolicyGrid('cancel_window', policyCancelList);
  renderPolicyGrid('free_cancel', policyFreeList);
  updateDailyRateFromPolicies();
}

function computeDailyRateFromPolicies() {
  const prices = [];
  if (roomPoliciesState.immediate.enabled && roomPoliciesState.immediate.base_price) {
    prices.push(Number(roomPoliciesState.immediate.base_price));
  }
  if (roomPoliciesState.cancel_window.enabled && roomPoliciesState.cancel_window.base_price) {
    prices.push(Number(roomPoliciesState.cancel_window.base_price));
  }
  if (roomPoliciesState.free_cancel.enabled && roomPoliciesState.free_cancel.base_price) {
    prices.push(Number(roomPoliciesState.free_cancel.base_price));
  }
  const valid = prices.filter(v => Number.isFinite(v) && v > 0);
  if (!valid.length) return null;
  return Math.min(...valid);
}

function updateDailyRateFromPolicies() {
  if (!dailyRate) return;
  const minValue = computeDailyRateFromPolicies();
  dailyRate.value = minValue != null ? String(minValue) : '';
  if (dailyRateDisplay) {
    dailyRateDisplay.textContent = minValue != null
      ? `R$ ${Number(minValue).toFixed(2).replace('.', ',')}`
      : '—';
  }
  if (policyOptionsWarning) {
    const anyEnabled = roomPoliciesState.immediate.enabled || roomPoliciesState.cancel_window.enabled || roomPoliciesState.free_cancel.enabled;
    policyOptionsWarning.hidden = anyEnabled;
  }
}

function updateRoomStatusFields(statusValue) {
  const status = (statusValue || '').toLowerCase();
  const showMaintenance = status === 'manutencao';
  const showDeactivated = status === 'desativada';
  const toggleGroup = (el, visible) => {
    if (!el) return;
    if (visible) {
      el.hidden = false;
      el.removeAttribute('hidden');
      el.style.display = 'flex';
    } else {
      el.hidden = true;
      el.setAttribute('hidden', '');
      el.style.display = 'none';
    }
  };
  toggleGroup(maintenanceStartGroup, showMaintenance);
  toggleGroup(maintenanceEndGroup, showMaintenance);
  toggleGroup(deactivatedFromGroup, showDeactivated);
  if (!showMaintenance) {
    if (maintenanceStart) maintenanceStart.value = '';
    if (maintenanceEnd) maintenanceEnd.value = '';
  }
  if (!showDeactivated) {
    if (deactivatedFrom) deactivatedFrom.value = '';
  }
}

function hasFutureReservations(roomId, fromDate = null) {
  if (!roomId) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cutoff = today;
  if (fromDate) {
    const parsed = new Date(fromDate);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      cutoff = parsed;
    }
  }
  return (myReservations || []).some(r => {
    if (String(r.room_id) !== String(roomId)) return false;
    const status = String(r.status || '').toLowerCase();
    if (['cancelada', 'negada', 'recusada'].includes(status)) return false;
    if (!r.date) return false;
    const resDate = new Date(r.date);
    if (Number.isNaN(resDate.getTime())) return false;
    resDate.setHours(0, 0, 0, 0);
    return resDate >= cutoff;
  });
}

function updateFutureReservationsWarning(roomId, fromDate = null) {
  if (!roomFutureReservationsWarning) return;
  roomFutureReservationsWarning.hidden = !hasFutureReservations(roomId, fromDate);
}

async function loadRoomPolicies(roomId) {
  if (!roomId) {
    resetRoomPoliciesState();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/room_policies_list.php?room_id=${encodeURIComponent(roomId)}`, { credentials: 'include' });
    const json = await parseJsonSafe(res);
    resetRoomPoliciesState();
    const policies = json.success ? (json.policies || []) : [];
    policies.forEach(policy => {
      if (policy.option_key === 'immediate') {
        roomPoliciesState.immediate.enabled = true;
        roomPoliciesState.immediate.base_price = policy.base_price ?? null;
        roomPoliciesState.immediate.prices = policy.prices || [];
      }
      if (policy.option_key === 'cancel_window') {
        roomPoliciesState.cancel_window.enabled = true;
        roomPoliciesState.cancel_window.base_price = policy.base_price ?? null;
        roomPoliciesState.cancel_window.cancel_days = policy.cancel_days;
        roomPoliciesState.cancel_window.cancel_fee_pct = policy.cancel_fee_pct;
        roomPoliciesState.cancel_window.prices = policy.prices || [];
      }
      if (policy.option_key === 'free_cancel') {
        roomPoliciesState.free_cancel.enabled = true;
        roomPoliciesState.free_cancel.base_price = policy.base_price ?? null;
        roomPoliciesState.free_cancel.prices = policy.prices || [];
      }
    });
    applyPoliciesToUi();
  } catch (_) {
    resetRoomPoliciesState();
  }
}

async function saveRoomPolicies(roomId) {
  const policies = [];
  if (roomPoliciesState.immediate.enabled) {
    policies.push({
      option_key: 'immediate',
      label: 'Pagamento no momento da Reserva (Sem cancelamento)',
      charge_timing: 'confirm',
      base_price: policyImmediateBasePrice?.value ? Number(policyImmediateBasePrice.value) : null,
      prices: []
    });
  }
  if (roomPoliciesState.cancel_window.enabled) {
    policies.push({
      option_key: 'cancel_window',
      label: 'Cancelamento da Reserva',
      base_price: policyCancelBasePrice?.value ? Number(policyCancelBasePrice.value) : null,
      cancel_days: policyCancelDays?.value ? Number(policyCancelDays.value) : 0,
      cancel_fee_pct: policyCancelFee?.value ? Number(policyCancelFee.value) : 0,
      charge_timing: 'cancel_window',
      prices: []
    });
  }
  if (roomPoliciesState.free_cancel.enabled) {
    policies.push({
      option_key: 'free_cancel',
      label: 'Sem taxa de cancelamento',
      charge_timing: 'day_before',
      base_price: policyFreeBasePrice?.value ? Number(policyFreeBasePrice.value) : null,
      prices: []
    });
  }
  const res = await fetch(`${API_BASE}/room_policies_save.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ room_id: roomId, policies })
  });
  const json = await parseJsonSafe(res);
  if (!json.success) throw new Error(json.error || 'Falha ao salvar políticas.');
}

async function uploadRoomPhotos(roomId) {
  if (!roomId || !roomPhotosInput || !roomPhotosInput.files?.length) return null;
  const newFilesCount = roomPhotosInput.files.length;
  const existingCount = currentRoomPhotoList.length;
  if (existingCount + newFilesCount > 10) {
    roomMsg.textContent = 'Envie no máximo 10 fotos por sala.';
    return null;
  }
  const formData = new FormData();
  formData.append('id', roomId);
  if (myAdvertiser?.id) {
    formData.append('advertiser_id', myAdvertiser.id);
  }
  Array.from(roomPhotosInput.files).forEach(file => formData.append('files[]', file));
  const res = await fetch(`${API_BASE}/apiuploadroomphoto.php`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  const json = await parseJsonSafe(res);
  if (!json.success) throw new Error(json.error || 'Falha ao enviar fotos.');
  roomPhotosInput.value = '';
  renderRoomPhotosPreview(json.photo_path, { roomId, allowDelete: true });
  return json;
}

async function geocodeRoomLocation(roomId) {
  if (!roomId) return;
  try {
    const res = await fetch(`${API_BASE}/geocode_room.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ room_id: roomId })
    });
    await res.json();
  } catch (err) {
    console.warn('[Geocode] Falha ao atualizar localização da sala', err);
  }
}

function setupAdvHeaderMenu() {
  if (!advHeaderAccountWrap || !advHeaderAccountBtn) return;
  advHeaderAccountBtn.addEventListener('click', (event) => {
    event.preventDefault();
    setAdvHeaderMenuState(!advHeaderMenuOpen);
  });
  advHeaderReservationsBtn?.addEventListener('click', () => {
    setActivePanel('reservations');
    closeAdvHeaderMenu();
  });
  advHeaderProfileBtn?.addEventListener('click', () => {
    setActivePanel('profile');
    closeAdvHeaderMenu();
  });
  advHeaderMessagesBtn?.addEventListener('click', () => {
    closeAdvHeaderMenu();
    openAdvChatBtn?.click();
  });
  advHeaderLogoutBtn?.addEventListener('click', () => {
    closeAdvHeaderMenu();
    logoutBtn?.click();
  });
  document.addEventListener('click', (event) => {
    if (!advHeaderMenuOpen || !advHeaderAccountWrap) return;
    if (!advHeaderAccountWrap.contains(event.target)) {
      setAdvHeaderMenuState(false);
    }
  });
  advHeaderAccountWrap?.addEventListener('mouseenter', () => setAdvHeaderMenuState(true));
  advHeaderAccountWrap?.addEventListener('mouseleave', () => setAdvHeaderMenuState(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setAdvHeaderMenuState(false);
  });
}

function setAdvHeaderMenuState(open) {
  advHeaderMenuOpen = Boolean(open);
  advHeaderAccountWrap?.classList.toggle('open', advHeaderMenuOpen);
  advHeaderAccountBtn?.setAttribute('aria-expanded', advHeaderMenuOpen ? 'true' : 'false');
}

function closeAdvHeaderMenu() {
  setAdvHeaderMenuState(false);
}

async function parseJsonSafe(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch (_) { throw new Error(text || `HTTP ${res.status}`); }
}

function setActivePanel(name) {
  const panels = ['overview','rooms','workshops','reservations','finance','messages','reviews','profile'];
  panels.forEach(p => {
    const el = document.getElementById('panel-' + p);
    if (el) el.hidden = (p !== name);
  });
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === name));
}

function renderAdvProfileView() {
  if (!myAdvertiser) return;
  if (advProfileNameView) advProfileNameView.value = myAdvertiser.display_name || '';
  if (advProfileEmailView) advProfileEmailView.value = myAdvertiser.email || myAdvertiser.login_email || '';
  if (advProfilePhoneView) advProfilePhoneView.value = myAdvertiser.contact_phone || '';
  if (advProfileFeeView) {
    const fee = myAdvertiser.fee_pct != null ? Number(myAdvertiser.fee_pct) : 15;
    advProfileFeeView.value = `${fee.toFixed(2).replace('.' , ',')} %`;
  }
  if (advProfileViewMsg) advProfileViewMsg.textContent = '';
}

function openAdvProfileModal() {
  if (!advProfileModal) return;
  advProfileMsg && (advProfileMsg.textContent = '');
  if (advProfileDisplay) advProfileDisplay.value = myAdvertiser?.display_name || '';
  if (advProfilePhone) advProfilePhone.value = myAdvertiser?.contact_phone || '';
  advProfileModal.classList.add('show');
  advProfileModal.setAttribute('aria-hidden', 'false');
}

function closeAdvProfileModal() {
  if (!advProfileModal) return;
  advProfileModal.classList.remove('show');
  advProfileModal.setAttribute('aria-hidden', 'true');
}

async function onLoginSubmit(e) {
  e.preventDefault();
  authMsg.textContent = '';
  const id = (loginIdInput?.value || '').trim();
  const pw = loginPwInput?.value || '';
  if (!id || !pw) { authMsg.textContent = 'Informe login e senha.'; return; }
  const lembrar = rememberMe ? !!rememberMe.checked : true;
  try {
    const res = await fetch(`${API_BASE}/advertiser_login.php`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body: JSON.stringify({ login: id, password: pw, remember: lembrar })
    });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha no login');
    if (lembrar && json.remember && json.remember.token) {
      registrarPreferenciaLoginAdv(true, json.remember.token, id);
    } else if (!lembrar) {
      registrarPreferenciaLoginAdv(false);
    }
    advClient = json.advertiser; // anunciante autenticado
    // Marca header e entra no portal
    syncHeaderWithAdvertiserSession(advClient);
    await afterLogin();
    return;
  } catch (err) {
    authMsg.textContent = err.message || 'Erro ao autenticar.';
  }
}

async function refreshPortalData() {
  if (!myAdvertiser) return;
  await loadRooms();
  await loadReservations();
  await loadOverview();
  await Promise.all([loadFinance(), loadReviews(), loadThreads(), loadWorkshops()]);
}

function startAdvAutoRefresh() {
  stopAdvAutoRefresh();
  advAutoRefreshTimer = setInterval(() => {
    if (advClient) {
      refreshPortalData();
    }
  }, 60000);
}

function stopAdvAutoRefresh() {
  if (advAutoRefreshTimer) {
    clearInterval(advAutoRefreshTimer);
    advAutoRefreshTimer = null;
  }
}

async function afterLogin() {
  setAuthVisible(false);
  if (panelsWrap) panelsWrap.hidden = false;
  // Preenche direto a partir do anunciante autenticado
  myAdvertiser = advClient || null;
  syncHeaderWithAdvertiserSession(myAdvertiser);
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

  await refreshPortalData();
  setActivePanel('overview');
  startAdvAutoRefresh();

  if (!advEventsBound) {
    advEventsBound = true;
    // Eventos de perfil (somente após login)
    const goToProfile = () => {
      renderAdvProfileView();
      setActivePanel('profile');
    };
    advEditProfileBtn?.addEventListener('click', goToProfile);
    advEditProfileSideBtn?.addEventListener('click', goToProfile);
    advProfileOpenEditBtn?.addEventListener('click', openAdvProfileModal);
    advProfileCancelViewBtn?.addEventListener('click', () => setActivePanel('overview'));
    advProfileClose?.addEventListener('click', closeAdvProfileModal);
    advProfileCancelBtn?.addEventListener('click', closeAdvProfileModal);
    advProfileModal?.addEventListener('click', (e)=>{ if (e.target === advProfileModal) closeAdvProfileModal(); });
    advProfileForm?.addEventListener('submit', onAdvProfileSubmit);
    advOpenPasswordModalBtn?.addEventListener('click', openAdvPasswordModal);
    advPasswordClose?.addEventListener('click', closeAdvPasswordModal);
    advPasswordCancel?.addEventListener('click', closeAdvPasswordModal);
    advPasswordModal?.addEventListener('click', (e)=>{ if (e.target === advPasswordModal) closeAdvPasswordModal(); });
    advPasswordForm?.addEventListener('submit', onAdvPasswordSubmit);
  }

  // Mantem no portal do anunciante
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
    roomsContainer.innerHTML = myRooms.map(r => {
      const primaryPhoto = getRoomPrimaryPhoto(r);
      const photoSection = primaryPhoto
        ? `<div class="room-photo"><img src="${escapeHtml(primaryPhoto)}" alt="Foto da sala ${escapeHtml(r.name || '')}" loading="lazy"></div>`
        : `<div class="room-photo room-photo-empty"><div class="room-photo-placeholder">Sem foto cadastrada</div></div>`;
      return `
      <article class="room-card">
        ${photoSection}
        <div class="room-info">
          <h4>${escapeHtml(r.name || 'Sala')}</h4>
          <p class="room-meta">${escapeHtml(r.city || '')} - ${escapeHtml(r.state || '')} ${r.lat && r.lon ? ' • <span title="Tem localização no mapa">📍</span>' : ''}</p>
          <div class="room-actions">
            <button class="btn btn-secondary btn-sm" data-room="${r.id}" data-act="details">Ver detalhes</button>
          </div>
        </div>
      </article>
    `;
    }).join('');
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
    renderAdvReservations();
  } catch (e) {
    resContainer.innerHTML = '<div class="rooms-message">Falha ao carregar reservas.</div>';
  }
}

function getReservationFilters() {
  const statusEl = document.getElementById('advResStatusFilter');
  const payEl = document.getElementById('advResPaymentFilter');
  const orderEl = document.getElementById('advResOrder');
  return {
    status: statusEl?.value || '',
    payment: payEl?.value || '',
    order: orderEl?.value || 'date_asc'
  };
}

function renderAdvReservations() {
  if (!resContainer) return;
  const all = myReservations || [];
  if (!all.length) {
    resContainer.innerHTML = '<div class="rooms-message">Nenhuma reserva.</div>';
    return;
  }
  const { status, payment, order } = getReservationFilters();
  let list = all.slice();
  if (status) {
    list = list.filter(r => String(r.status || '').toLowerCase() === status.toLowerCase());
  }
  if (payment) {
    list = list.filter(r => String(r.payment_status || '').toLowerCase() === payment.toLowerCase());
  }
  list.sort((a,b) => {
    const da = new Date(a.date || '1970-01-01');
    const db = new Date(b.date || '1970-01-01');
    if (order === 'date_desc') return db - da;
    return da - db;
  });

  const rows = list.map(r => {
    const room = (myRooms||[]).find(rr => String(rr.id)===String(r.room_id));
    const roomName = r.room_name || room?.name || `Sala ${r.room_id}`;
    const clientName = r.client_name || '';
    const when = r.date ? escapeHtml(r.date) : '';
    return `
      <tr>
        <td>${when}</td>
        <td>${escapeHtml(roomName)}</td>
        <td>${escapeHtml(clientName)}</td>
        <td>${escapeHtml(r.status || '')}</td>
        <td>${escapeHtml(r.payment_status || '')}</td>
        <td><button class="btn btn-secondary btn-sm" data-res="${r.id}" data-act="open">Ações</button></td>
      </tr>
    `;
  }).join('');

  resContainer.innerHTML = `
      <div class="res-filters">
        <label>Status
          <select id="advResStatusFilter">
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="concluida">Concluída</option>
          </select>
        </label>
        <label>Pagamento
          <select id="advResPaymentFilter">
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="expirado">Expirado</option>
          </select>
        </label>
        <label>Ordenar por
          <select id="advResOrder">
            <option value="date_asc">Data (mais antiga primeiro)</option>
            <option value="date_desc">Data (mais recente primeiro)</option>
          </select>
        </label>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Sala</th><th>Cliente</th><th>Status</th><th>Pagamento</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:16px">Nenhuma reserva.</td></tr>'}</tbody>
      </table>`;

  resContainer.querySelectorAll('#advResStatusFilter,#advResPaymentFilter,#advResOrder').forEach(el => {
    el.addEventListener('change', renderAdvReservations);
  });
  resContainer.querySelectorAll('button[data-res][data-act="open"]').forEach(btn =>
    btn.addEventListener('click', () => openReservationModal(btn.getAttribute('data-res')))
  );
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
        <button type="button" class="btn btn-secondary btn-sm" id="advFinTransfer">Transferir</button>
        <button type="button" class="btn btn-secondary btn-sm" id="advFinExport">Exportar CSV</button>
      </div>`;

    finContainer.innerHTML = summary + `
      <table>
        <thead><tr><th>#</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Disponível em</th></tr></thead>
        <tbody>${body || '<tr><td colspan="5" style="text-align:center;padding:16px">Sem lançamentos.</td></tr>'}</tbody>
      </table>`;

    document.getElementById('advFinExport')?.addEventListener('click', ()=> exportCSV(filtered));
    document.getElementById('advFinTransfer')?.addEventListener('click', () => {
      finContainer.insertAdjacentHTML('afterbegin', '<div class="rooms-message" style="margin-bottom:8px;">Solicitações de transferência estarão disponíveis em breve.</div>');
    });

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

async function onAdvProfileSubmit(e) {
  e.preventDefault();
  if (!myAdvertiser) return;
  advProfileMsg && (advProfileMsg.textContent = '');
  const display = advProfileDisplay?.value.trim() || '';
  const phone = advProfilePhone?.value.trim() || '';
  try {
    const res = await fetch(`${API_BASE}/advertiser_update_profile.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: myAdvertiser.id,
        display_name: display,
        contact_phone: phone
      })
    });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Não foi possível atualizar o perfil.');
    myAdvertiser = json.advertiser || myAdvertiser;
    advClient = myAdvertiser;
    if (myAdvertiser.display_name) {
      advDisplay.textContent = myAdvertiser.display_name;
    }
    if (myAdvertiser.email) {
      advOwner.textContent = myAdvertiser.email;
    }
    advProfileMsg && (advProfileMsg.textContent = 'Perfil atualizado com sucesso.');
    closeAdvProfileModal();
  } catch (err) {
    advProfileMsg && (advProfileMsg.textContent = err.message || 'Falha ao salvar.');
  }
}

function avaliarForcaSenhaAdvertiser(senha, confirmacao) {
  let strengthText = 'Fraca';
  let strengthClass = 'state-weak';
  if (!senha) {
    strengthText = 'Aguardando';
    strengthClass = 'state-neutral';
  } else if (senha.length >= 8 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) {
    strengthText = 'Forte';
    strengthClass = 'state-strong';
  } else if (senha.length >= 8) {
    strengthText = 'Média';
    strengthClass = 'state-medium';
  }
  if (advPwdStrengthIndicator) {
    advPwdStrengthIndicator.textContent = 'Força da senha: ' + strengthText;
    advPwdStrengthIndicator.className = 'password-indicator ' + strengthClass;
  }
  let matchText = 'Aguardando';
  let matchClass = 'state-neutral';
  if (senha || confirmacao) {
    if (senha === confirmacao && senha) {
      matchText = 'OK';
      matchClass = 'state-strong';
    } else {
      matchText = 'Não confere';
      matchClass = 'state-weak';
    }
  }
  if (advPwdMatchIndicator) {
    advPwdMatchIndicator.textContent = 'Confirmação: ' + matchText;
    advPwdMatchIndicator.className = 'password-indicator ' + matchClass;
  }
}

function openAdvPasswordModal() {
  if (!advPasswordModal) return;
  if (advPasswordMsg) advPasswordMsg.textContent = '';
  if (advCurrentPasswordInput) advCurrentPasswordInput.value = '';
  if (advNewPasswordInput) advNewPasswordInput.value = '';
  if (advNewPasswordConfirmInput) advNewPasswordConfirmInput.value = '';
  avaliarForcaSenhaAdvertiser('', '');
  advPasswordModal.classList.add('show');
  advPasswordModal.setAttribute('aria-hidden', 'false');
}

function closeAdvPasswordModal() {
  if (!advPasswordModal) return;
  advPasswordModal.classList.remove('show');
  advPasswordModal.setAttribute('aria-hidden', 'true');
}

async function onAdvPasswordSubmit(e) {
  e.preventDefault();
  if (!myAdvertiser) return;
  if (advPasswordMsg) advPasswordMsg.textContent = '';
  const cur = advCurrentPasswordInput?.value || '';
  const np = advNewPasswordInput?.value || '';
  const npc = advNewPasswordConfirmInput?.value || '';
  try {
    if (!cur || !np || !npc) throw new Error('Preencha todos os campos de senha.');
    if (np !== npc) throw new Error('As senhas novas não conferem.');
    if (np.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    const res = await fetch(`${API_BASE}/advertiser_change_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: myAdvertiser.id, current_password: cur, new_password: np })
    });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Não foi possível alterar a senha.');
    if (advPasswordMsg) advPasswordMsg.textContent = 'Senha alterada com sucesso.';
    closeAdvPasswordModal();
  } catch (err) {
    if (advPasswordMsg) advPasswordMsg.textContent = err.message || 'Falha ao alterar senha.';
  }
}

async function loadOverview() {
  try {
    const today = new Date();
    const upcomingReservations = (myReservations || []).filter(r => {
      if (!r.date) return false;
      const status = String(r.status || '').toLowerCase();
      if (['cancelada', 'negada', 'recusada'].includes(status)) return false;
      return new Date(r.date) >= new Date(today.toDateString());
    });
    try {
      const resViews = await fetch(`${API_BASE}/room_views_count.php?advertiser_id=${encodeURIComponent(myAdvertiser?.id || '')}`, { credentials: 'include' });
      const jsonViews = await parseJsonSafe(resViews);
      if (jsonViews?.success && ovViews) {
        ovViews.textContent = jsonViews.count ?? '0';
      } else if (ovViews) {
        ovViews.textContent = '—';
      }
    } catch (_) {
      ovViews.textContent = '—';
    }
    ovUpcoming.textContent = upcomingReservations.length;
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

    const upcoming = upcomingReservations
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
    const res = await fetch(`${API_BASE}/messages_list_threads.php?advertiser_id=${encodeURIComponent(advId)}`, { credentials: 'include' });
    const json = await parseJsonSafe(res);
    let list = json.success ? (json.data || []) : [];
    const roomIds = new Set((myRooms || []).map(r => String(r.id)));
    // Mostra threads onde advertiser_id bate ou a sala pertence a este anunciante (para compatibilidade com dados antigos).
    list = list.filter(t =>
      String(t.advertiser_id || '') === String(advId) ||
      (t.room_id && roomIds.has(String(t.room_id)))
    );
    const hasUnread = list.some(t => Number(t.unread_for_advertiser || 0) > 0);
    if (advMessagesBadge) advMessagesBadge.hidden = !hasUnread;
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

// ===== Workshops (lista + modal) =====
async function loadWorkshops() {
  if (!workshopsContainer) return;
  workshopsContainer.innerHTML = '<div class="rooms-message">Carregando…</div>';
  try {
    const advId = myAdvertiser?.id;
    if (!advId) {
      workshopsContainer.innerHTML = '<div class="rooms-message">Sem anunciante vinculado.</div>';
      return;
    }
    const res = await fetch(`${API_BASE}/workshops_list.php?advertiser_id=${encodeURIComponent(advId)}&status=&upcoming=0`, { credentials: 'include' });
    const json = await parseJsonSafe(res);
    myWorkshops = json.success ? (json.data || []) : [];
    if (!myWorkshops.length) {
      workshopsContainer.innerHTML = '<div class="rooms-message">Nenhum workshop cadastrado. Clique em "Criar workshop".</div>';
      return;
    }
    const rows = myWorkshops.map(w => {
      const sold = Number(w.sold_seats || 0);
      const max = Number(w.max_seats || 0);
      const pct = max > 0 ? Math.round((sold / max) * 100) : 0;
      return `
        <tr>
          <td>${escapeHtml(w.title || 'Workshop')}</td>
          <td>${escapeHtml(w.date || '')}</td>
          <td>${escapeHtml((w.time_start || '').slice(0,5))}</td>
          <td>${escapeHtml(w.room_name || '')}</td>
          <td>${escapeHtml(w.status || '')}</td>
          <td>${max ? `${sold}/${max} (${pct}%)` : '—'}</td>
          <td>
            <button class="btn btn-secondary btn-sm" data-ws="${w.id}" data-act="edit">Editar</button>
            <button class="btn btn-secondary btn-sm" data-ws="${w.id}" data-act="enrollments">Ver inscritos</button>
          </td>
        </tr>
      `;
    }).join('');
    workshopsContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Data</th>
            <th>Início</th>
            <th>Sala</th>
            <th>Status</th>
            <th>Vagas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    workshopsContainer.querySelectorAll('button[data-ws]').forEach(btn => {
      const id = btn.getAttribute('data-ws');
      const act = btn.getAttribute('data-act');
      if (act === 'edit') {
        btn.addEventListener('click', () => openWorkshopModal(id));
      } else if (act === 'enrollments') {
        btn.addEventListener('click', () => loadWorkshopEnrollments(id));
      }
    });
  } catch (e) {
    workshopsContainer.innerHTML = '<div class="rooms-message">Falha ao carregar workshops.</div>';
  }
}

async function loadWorkshopEnrollments(workshopId) {
  if (!enrollmentsContainer) return;
  if (!myAdvertiser) return;
  enrollmentsContainer.innerHTML = '<div class="rooms-message">Carregando inscritos…</div>';
  if (enrollmentsTitle) {
    enrollmentsTitle.style.display = 'block';
  }
  try {
    const advId = myAdvertiser.id;
    const res = await fetch(`${API_BASE}/workshop_enrollments_list.php?advertiser_id=${encodeURIComponent(advId)}&workshop_id=${encodeURIComponent(workshopId)}`, { credentials: 'include' });
    const json = await parseJsonSafe(res);
    const list = json.success ? (json.data || []) : [];
    if (!list.length) {
      enrollmentsContainer.innerHTML = '<div class="rooms-message">Nenhum inscrito neste workshop.</div>';
      return;
    }
    const rows = list.map(e => `
      <tr>
        <td>${escapeHtml(e.participant_name || '')}</td>
        <td>${escapeHtml(e.participant_email || '')}</td>
        <td>${escapeHtml(e.participant_cpf || '')}</td>
        <td>${escapeHtml(e.payment_status || '')}</td>
        <td>${escapeHtml(e.checkin_status || '')}</td>
        <td>${escapeHtml(e.public_code || '')}</td>
      </tr>
    `).join('');
    enrollmentsContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Participante</th>
            <th>E-mail</th>
            <th>CPF</th>
            <th>Pagamento</th>
            <th>Check-in</th>
            <th>Código</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (e) {
    enrollmentsContainer.innerHTML = '<div class="rooms-message">Falha ao carregar inscritos.</div>';
  }
}

function openWorkshopModal(id) {
  if (!advWorkshopModal) return;
  advWorkshopMsg && (advWorkshopMsg.textContent = '');
  // Preenche combo de salas
  if (advWorkshopRoomSelect) {
    if (!myRooms || !myRooms.length) {
      advWorkshopRoomSelect.innerHTML = '<option value="">Nenhuma sala vinculada. Cadastre uma sala primeiro.</option>';
      advWorkshopRoomSelect.disabled = true;
    } else {
      advWorkshopRoomSelect.disabled = false;
      advWorkshopRoomSelect.innerHTML = (myRooms || []).map(r =>
        `<option value="${String(r.id)}">${escapeHtml(r.name || 'Sala')} — ${escapeHtml(r.city || '')}</option>`
      ).join('');
    }
  }
  let ws = null;
  if (id) {
    ws = (myWorkshops || []).find(w => String(w.id) === String(id));
  }
  if (ws) {
    advWorkshopIdInput.value = ws.id;
    advWorkshopRoomSelect.value = String(ws.room_id);
    advWorkshopDateInput.value = ws.date || '';
    advWorkshopEndDateInput.value = ws.end_date || '';
    const start = (ws.time_start || '').slice(0,5);
    const end = (ws.time_end || '').slice(0,5);
    advWorkshopTimeStartInput.value = start;
    advWorkshopTimeEndInput.value = end;
    if (start && advWorkshopStartHourSelect && advWorkshopStartMinuteSelect) {
      const [sh, sm] = start.split(':');
      advWorkshopStartHourSelect.value = sh || '';
      advWorkshopStartMinuteSelect.value = sm || '';
    }
    if (end && advWorkshopEndHourSelect && advWorkshopEndMinuteSelect) {
      const [eh, em] = end.split(':');
      advWorkshopEndHourSelect.value = eh || '';
      advWorkshopEndMinuteSelect.value = em || '';
    }
    advWorkshopTitleInput.value = ws.title || '';
    // Categoria: se for uma das opções do select, seleciona; senão, usa "Outros"
    if (advWorkshopCategorySelect) {
      const knownValues = Array.from(advWorkshopCategorySelect.options).map(o => o.value).filter(Boolean);
      if (ws.category && knownValues.includes(ws.category)) {
        advWorkshopCategorySelect.value = ws.category;
        if (advWorkshopCategoryOtherInput) advWorkshopCategoryOtherInput.value = '';
      } else if (ws.category) {
        advWorkshopCategorySelect.value = 'Outros';
        if (advWorkshopCategoryOtherInput) advWorkshopCategoryOtherInput.value = ws.category;
      } else {
        advWorkshopCategorySelect.value = '';
        if (advWorkshopCategoryOtherInput) advWorkshopCategoryOtherInput.value = '';
      }
    }
    advWorkshopPriceInput.value = ws.price_per_seat || '';
    advWorkshopMinSeatsInput.value = ws.min_seats || '';
    advWorkshopMaxSeatsInput.value = ws.max_seats || '';
    advWorkshopShowBarSelect.value = String(ws.show_sold_bar || 0);
    advWorkshopStatusSelect.value = ws.status || 'rascunho';
    advWorkshopSubtitleInput.value = ws.subtitle || '';
    if (advWorkshopDescriptionEditor) advWorkshopDescriptionEditor.innerHTML = ws.description || '';
    if (advWorkshopDescriptionInput) advWorkshopDescriptionInput.value = ws.description || '';
    // Modo de data (dia único x vários dias)
    if (advWorkshopDateSingle && advWorkshopDateMulti) {
      if (ws.end_date && ws.end_date !== ws.date) {
        advWorkshopDateMulti.checked = true;
        advWorkshopDateSingle.checked = false;
      } else {
        advWorkshopDateSingle.checked = true;
        advWorkshopDateMulti.checked = false;
      }
    }
    const titleEl = document.getElementById('advWorkshopTitle');
    if (titleEl) titleEl.textContent = 'Editar Workshop';
  } else {
    advWorkshopIdInput.value = '';
    advWorkshopDateInput.value = '';
    advWorkshopEndDateInput.value = '';
    advWorkshopTimeStartInput.value = '';
    advWorkshopTimeEndInput.value = '';
    if (advWorkshopStartHourSelect) advWorkshopStartHourSelect.value = '';
    if (advWorkshopStartMinuteSelect) advWorkshopStartMinuteSelect.value = '';
    if (advWorkshopEndHourSelect) advWorkshopEndHourSelect.value = '';
    if (advWorkshopEndMinuteSelect) advWorkshopEndMinuteSelect.value = '';
    advWorkshopTitleInput.value = '';
    if (advWorkshopCategorySelect) advWorkshopCategorySelect.value = '';
    if (advWorkshopCategoryOtherInput) advWorkshopCategoryOtherInput.value = '';
    advWorkshopPriceInput.value = '';
    advWorkshopMinSeatsInput.value = '';
    advWorkshopMaxSeatsInput.value = '';
    advWorkshopShowBarSelect.value = '0';
    advWorkshopStatusSelect.value = 'rascunho';
    advWorkshopSubtitleInput.value = '';
    if (advWorkshopDescriptionEditor) advWorkshopDescriptionEditor.innerHTML = '';
    if (advWorkshopDescriptionInput) advWorkshopDescriptionInput.value = '';
    if (advWorkshopDateSingle && advWorkshopDateMulti) {
      advWorkshopDateSingle.checked = true;
      advWorkshopDateMulti.checked = false;
    }
    const titleEl = document.getElementById('advWorkshopTitle');
    if (titleEl) titleEl.textContent = 'Novo Workshop';
  }
  advWorkshopModal.classList.add('show');
  advWorkshopModal.setAttribute('aria-hidden','false');
}

function closeWorkshopModal() {
  if (!advWorkshopModal) return;
  advWorkshopModal.classList.remove('show');
  advWorkshopModal.setAttribute('aria-hidden','true');
}

async function onWorkshopSubmit(e) {
  e.preventDefault();
  if (!myAdvertiser) return;
  if (advWorkshopMsg) advWorkshopMsg.textContent = '';
  const id = advWorkshopIdInput.value ? Number(advWorkshopIdInput.value) : null;
  const isMulti = advWorkshopDateMulti?.checked || false;
  // Monta horários a partir dos selects de hora/minuto
  const startHour = advWorkshopStartHourSelect?.value || '';
  const startMinute = advWorkshopStartMinuteSelect?.value || '';
  const endHour = advWorkshopEndHourSelect?.value || '';
  const endMinute = advWorkshopEndMinuteSelect?.value || '';
  const startTime = (startHour && startMinute) ? `${startHour}:${startMinute}` : '';
  const endTime = (endHour && endMinute) ? `${endHour}:${endMinute}` : '';
  if (advWorkshopTimeStartInput) advWorkshopTimeStartInput.value = startTime;
  if (advWorkshopTimeEndInput) advWorkshopTimeEndInput.value = endTime;
  // Categoria: usa select; se "Outros", pega o texto
  let category = '';
  if (advWorkshopCategorySelect) {
    const sel = advWorkshopCategorySelect.value || '';
    if (sel === 'Outros' && advWorkshopCategoryOtherInput) {
      category = (advWorkshopCategoryOtherInput.value || '').trim();
    } else {
      category = sel;
    }
  }
  // Garantir que o HTML do editor esteja sincronizado com o campo oculto
  const descHtml = advWorkshopDescriptionEditor
    ? (advWorkshopDescriptionEditor.innerHTML || '').trim()
    : (advWorkshopDescriptionInput?.value || '').trim();
  if (advWorkshopDescriptionInput) {
    advWorkshopDescriptionInput.value = descHtml;
  }

  // Se modo vários dias, monta lista ordenada e JSON de agenda
  let scheduleJson = null;
  if (isMulti) {
    // garante que a data atual também está na lista, se preenchida
    const baseDate = advWorkshopDateInput?.value || '';
    if (baseDate) {
      if (!workshopSelectedDates.includes(baseDate)) {
        workshopSelectedDates.push(baseDate);
      }
    }
    workshopSelectedDates = Array.from(new Set(workshopSelectedDates)).sort();
    if (advWorkshopDatesJsonInput) {
      const schedule = {};
      if (workshopSelectedDates.length) {
        if (advWorkshopSameTimeCheckbox?.checked) {
          workshopSelectedDates.forEach(d => {
            schedule[d] = { start: startTime, end: endTime };
          });
        } else if (advWorkshopPerDayTimes && advWorkshopPerDayTimes.querySelectorAll('tr[data-date]').length) {
          advWorkshopPerDayTimes.querySelectorAll('tr[data-date]').forEach(tr => {
            const d = tr.getAttribute('data-date');
            const sh = tr.querySelector('select[data-role="start-hour"]')?.value || '';
            const sm = tr.querySelector('select[data-role="start-minute"]')?.value || '';
            const eh = tr.querySelector('select[data-role="end-hour"]')?.value || '';
            const em = tr.querySelector('select[data-role="end-minute"]')?.value || '';
            if (d && sh && sm && eh && em) {
              schedule[d] = { start: `${sh}:${sm}`, end: `${eh}:${em}` };
            }
          });
        }
      }
      scheduleJson = JSON.stringify(schedule);
      advWorkshopDatesJsonInput.value = scheduleJson;
    }
  } else {
    workshopSelectedDates = [];
    if (advWorkshopDatesJsonInput) advWorkshopDatesJsonInput.value = '';
  }

  const payload = {
    id,
    advertiser_id: myAdvertiser.id,
    room_id: advWorkshopRoomSelect.value ? Number(advWorkshopRoomSelect.value) : null,
    title: advWorkshopTitleInput.value.trim(),
    subtitle: advWorkshopSubtitleInput.value.trim() || null,
    description: descHtml || null,
    category: category || null,
    date: advWorkshopDateInput.value,
    end_date: advWorkshopEndDateInput.value || null,
    time_start: startTime,
    time_end: endTime,
    price_per_seat: advWorkshopPriceInput.value ? Number(advWorkshopPriceInput.value) : 0,
    min_seats: advWorkshopMinSeatsInput.value ? Number(advWorkshopMinSeatsInput.value) : 0,
    max_seats: advWorkshopMaxSeatsInput.value ? Number(advWorkshopMaxSeatsInput.value) : 0,
    show_sold_bar: Number(advWorkshopShowBarSelect.value || 0),
    status: advWorkshopStatusSelect.value || 'rascunho'
  };
  try {
    if (!payload.room_id || !payload.date || !payload.time_start || !payload.time_end || !payload.title) {
      throw new Error('Preencha sala, data, horários e título.');
    }
    // Validação simples de linguagem inapropriada em título/descrição
    const badWords = ['porn', 'porno', 'put@', 'puta', 'foda-se', 'foder', 'fuck', 'shit'];
    const textToCheck = ((payload.title || '') + ' ' + (payload.description || '')).toLowerCase();
    if (badWords.some(w => textToCheck.includes(w))) {
      throw new Error('O título/descrição contém termos não permitidos. Ajuste o texto antes de salvar.');
    }
    const res = await fetch(`${API_BASE}/apisave.php`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      credentials:'include',
      body: JSON.stringify({ table: 'workshops', record: payload })
    });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Não foi possível salvar o workshop.');
    advWorkshopMsg && (advWorkshopMsg.textContent = 'Workshop salvo com sucesso.');

    // Upload de banner, se selecionado
    const wsId = payload.id || json.insertId;
    const fileInput = advWorkshopBannerInput;
    if (wsId && fileInput && fileInput.files && fileInput.files[0]) {
      const fd = new FormData();
      fd.append('id', String(wsId));
      fd.append('file', fileInput.files[0]);
      try {
        const upRes = await fetch(`${API_BASE}/upload_workshop_banner.php`, { method: 'POST', body: fd, credentials:'include' });
        const upJson = await parseJsonSafe(upRes);
        if (!upJson.success) {
          console.warn('Falha ao enviar banner do workshop:', upJson.error || 'erro');
        }
      } catch (_) {
        console.warn('Erro inesperado ao enviar banner do workshop');
      }
    }

    await loadWorkshops();
    setTimeout(closeWorkshopModal, 600);
  } catch (err) {
    advWorkshopMsg && (advWorkshopMsg.textContent = err.message || 'Erro ao salvar workshop.');
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
    const res = await fetch(`${API_BASE}/messages_list_messages.php?thread_id=${encodeURIComponent(currentThreadId)}`, { credentials: 'include' });
    const json = await parseJsonSafe(res);
    const list = json.success ? (json.data || []) : [];
    if (!list.length) {
      chatMessages.innerHTML = '<div class="rooms-message">Nenhuma mensagem.</div>';
      await loadThreads();
      return;
    }
    chatMessages.innerHTML = list.map(m => {
      const me = (m.sender_type || '') === 'advertiser';
      return `<div class="chat-bubble ${me ? 'me' : 'them'}"><div class="chat-text">${escapeHtml(m.body)}</div><div class="chat-time">${escapeHtml((m.created_at||'').toString().slice(0,16).replace('T',' '))}</div></div>`;
    }).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // marca como lida para o anunciante
    try { await fetch(`${API_BASE}/messages_mark_read.php`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ thread_id: currentThreadId, who: 'advertiser' }) }); } catch (_) {}
    await loadThreads();
  } catch (e) {
    chatMessages.innerHTML = '<div class="rooms-message">Falha ao carregar mensagens.</div>';
    await loadThreads();
  }
}

function startChatPolling() {
  stopChatPolling();
  chatPollTimer = setInterval(fetchMessagesOnce, 10000);
}
function stopChatPolling() { if (chatPollTimer) { clearInterval(chatPollTimer); chatPollTimer = null; } }

function updateAdvMessagesBadge(hasUnread) {
  if (!advMessagesBadge) return;
  advMessagesBadge.hidden = !hasUnread;
}

chatForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = (chatInput?.value || '').trim();
  if (!text || !currentThreadId) return;
  try {
    const res = await fetch(`${API_BASE}/messages_send.php`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ thread_id: currentThreadId, sender_type: 'advertiser', body: text }) });
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

function registrarPreferenciaLoginAdv(lembrar, token, loginHint) {
  try {
    if (lembrar && token) {
      const data = {
        token,
        loginHint: loginHint || '',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24h
      };
      localStorage.setItem(ADV_REMEMBER_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(ADV_REMEMBER_KEY);
    }
  } catch (_) {}
}

function aplicarLoginMemorizadoAdv() {
  if (!loginIdInput || !rememberMe) return;
  try {
    const raw = localStorage.getItem(ADV_REMEMBER_KEY);
    if (!raw) { rememberMe.checked = false; return; }
    let data;
    try { data = JSON.parse(raw); }
    catch { localStorage.removeItem(ADV_REMEMBER_KEY); rememberMe.checked = false; return; }
    const { token, loginHint, expiresAt } = data || {};
    if (!token || !expiresAt || Date.now() > Number(expiresAt)) {
      localStorage.removeItem(ADV_REMEMBER_KEY);
      if (loginHint) loginIdInput.value = loginHint;
      rememberMe.checked = false;
      return;
    }
    if (loginHint) loginIdInput.value = loginHint;
    rememberMe.checked = true;
    autoLoginWithTokenAdv(token).catch(()=>{});
  } catch (_) {
    rememberMe.checked = false;
  }
}

async function autoLoginWithTokenAdv(token) {
  try {
    const res = await fetch(`${API_BASE}/advertiser_auto_login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    const json = await parseJsonSafe(res);
    if (!json.success || !json.advertiser) {
      try { localStorage.removeItem(ADV_REMEMBER_KEY); } catch (_) {}
      rememberMe && (rememberMe.checked = false);
      return;
    }
    advClient = json.advertiser;
    await afterLogin();
  } catch (e) {
    console.error('[Adv] auto-login falhou', e);
  }
}

async function hydrateAdvertiserSession() {
  if (advClient) return;
  try {
    const res = await fetch(`${API_BASE}/advertiser_session.php`, { credentials: 'include' });
    const json = await parseJsonSafe(res);
    if (json?.success && json.advertiser) {
      advClient = json.advertiser;
      await afterLogin();
    }
  } catch (_) {}
}

// Eventos UI
// Inicialização de remember-me
aplicarLoginMemorizadoAdv();
setupAdvHeaderMenu();
hydrateAdvertiserSession();

loginForm?.addEventListener('submit', onLoginSubmit);
logoutBtn?.addEventListener('click', () => {
  closeAdvHeaderMenu();
  const cleanup = () => {
    advClient = null; myAdvertiser = null; myRooms = []; myReservations = [];
    syncHeaderWithAdvertiserSession(null);
    registrarPreferenciaLoginAdv(false);
    stopAdvAutoRefresh();
    setAuthVisible(true);
  };
  fetch(`${API_BASE}/advertiser_logout.php`, { credentials: 'include' })
    .catch(() => {})
    .finally(cleanup);
});
refreshBtn?.addEventListener('click', () => { if (advClient) refreshPortalData(); });
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
    const res = await fetch(`${API_BASE}/advertiser_update_payment.php`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify(payload) });
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
newRoomBtn?.addEventListener('click', () => { openRoomModal(null); });
roomClose?.addEventListener('click', () => { closeRoomModal(); });
roomCancel?.addEventListener('click', () => { closeRoomModal(); });
roomModal?.addEventListener('click', (e)=> { if (e.target === roomModal) closeRoomModal(); });
roomForm?.addEventListener('submit', onRoomFormSubmit);
cepInput?.addEventListener('input', handleCepInput);
policyImmediateToggle?.addEventListener('change', () => {
  roomPoliciesState.immediate.enabled = !!policyImmediateToggle.checked;
  updateDailyRateFromPolicies();
});
policyCancelToggle?.addEventListener('change', () => {
  roomPoliciesState.cancel_window.enabled = !!policyCancelToggle.checked;
  updateDailyRateFromPolicies();
});
policyFreeToggle?.addEventListener('change', () => {
  roomPoliciesState.free_cancel.enabled = !!policyFreeToggle.checked;
  updateDailyRateFromPolicies();
});
policyImmediateBasePrice?.addEventListener('input', updateDailyRateFromPolicies);
policyCancelBasePrice?.addEventListener('input', updateDailyRateFromPolicies);
policyFreeBasePrice?.addEventListener('input', updateDailyRateFromPolicies);
deactivatedFrom?.addEventListener('change', () => {
  updateFutureReservationsWarning(roomIdHidden?.value || null, deactivatedFrom.value || null);
});
roomStatus?.addEventListener('change', () => {
  updateRoomStatusFields(roomStatus.value);
  updateFutureReservationsWarning(roomIdHidden?.value || null, deactivatedFrom?.value || null);
});
roomStatus?.addEventListener('input', () => {
  updateRoomStatusFields(roomStatus.value);
});
policyCancelDays?.addEventListener('input', () => {
  roomPoliciesState.cancel_window.cancel_days = policyCancelDays.value ? Number(policyCancelDays.value) : 0;
});
policyCancelFee?.addEventListener('input', () => {
  roomPoliciesState.cancel_window.cancel_fee_pct = policyCancelFee.value ? Number(policyCancelFee.value) : 0;
});
policyImmediateAdd?.addEventListener('click', () => addPolicyPrice('immediate', policyImmediateDate, policyImmediatePrice, policyImmediateList));
policyCancelAdd?.addEventListener('click', () => addPolicyPrice('cancel_window', policyCancelDate, policyCancelPrice, policyCancelList));
policyFreeAdd?.addEventListener('click', () => addPolicyPrice('free_cancel', policyFreeDate, policyFreePrice, policyFreeList));
cepInput?.addEventListener('blur', () => autoFillRoomAddressFromCep(cepInput?.value || ''));

async function removeRoomPhoto(roomId, photoPath, thumbEl) {
  if (!roomId || !photoPath) return;
  try {
    const res = await fetch(`${API_BASE}/apidelete_room_photo.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roomId, photo: photoPath })
    });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Não foi possível remover a foto.');
    roomMsg.textContent = 'Foto removida.';
    renderRoomPhotosPreview(json.photo_path, { roomId, allowDelete: true });
  } catch (err) {
    roomMsg.textContent = err.message || 'Erro ao remover foto.';
  }
}

async function openRoomModal(roomData){
  if (!roomModal) return;
  roomMsg.textContent = '';
  clearRoomFieldErrors();

  const selectedAmenities = Array.isArray(roomData?.amenities) ? roomData.amenities : [];
  await renderRoomAmenities(selectedAmenities);
  const currentId = roomData?.id || null;
  renderRoomPhotosPreview(roomData?.photo_path || '', { roomId: currentId, allowDelete: Boolean(currentId) });
  await loadRoomPolicies(currentId);

  const isEdit = !!roomData;
  if (isEdit) {
    if (roomIdHidden) roomIdHidden.value = roomData.id;
    if (roomName) roomName.value = roomData.name || '';
    if (roomDesc) roomDesc.value = roomData.description || '';
    if (roomDescEditor) roomDescEditor.innerHTML = roomData.description || '';
    if (roomCap) roomCap.value = roomData.capacity != null ? String(roomData.capacity) : '';
    if (dailyRate) dailyRate.value = roomData.daily_rate != null ? String(roomData.daily_rate) : '';
    if (facilitatedAccess) facilitatedAccess.value = roomData.facilitated_access != null ? String(roomData.facilitated_access) : '0';
    if (portariaInteligente) portariaInteligente.value = roomData.portaria_inteligente || '';
    if (streetInput) streetInput.value = roomData.street || '';
    if (complementInput) complementInput.value = roomData.complement || '';
    if (cepInput) cepInput.value = roomData.cep ? maskCepValue(roomData.cep) : '';
    if (roomState) roomState.value = roomData.state || '';
    if (roomCity) roomCity.value = roomData.city || '';
    if (respNome) respNome.value = roomData.responsavel_nome || '';
    if (respFone) respFone.value = roomData.responsavel_telefone || '';
    if (respEmail) respEmail.value = roomData.responsavel_email || '';
    if (portariaFone) portariaFone.value = roomData.portaria_telefone || '';
    if (portariaEmail) portariaEmail.value = roomData.portaria_email || '';
    if (locationInternal) locationInternal.value = roomData.location || '';
    if (roomStatus) roomStatus.value = roomData.status || 'ativo';
    if (maintenanceStart) maintenanceStart.value = roomData.maintenance_start || '';
    if (maintenanceEnd) maintenanceEnd.value = roomData.maintenance_end || '';
    if (deactivatedFrom) deactivatedFrom.value = roomData.deactivated_from || '';
  } else {
    if (roomIdHidden) roomIdHidden.value = '';
    if (roomName) roomName.value = '';
    if (roomDesc) roomDesc.value = '';
    if (roomDescEditor) roomDescEditor.innerHTML = '';
    if (roomCap) roomCap.value = '';
    if (dailyRate) dailyRate.value = '';
    if (facilitatedAccess) facilitatedAccess.value = '0';
    if (portariaInteligente) portariaInteligente.value = 'Não';
    if (streetInput) streetInput.value = '';
    if (complementInput) complementInput.value = '';
    if (cepInput) cepInput.value = '';
    if (roomState) roomState.value = '';
    if (roomCity) roomCity.value = '';
    if (respNome) respNome.value = '';
    if (respFone) respFone.value = '';
    if (respEmail) respEmail.value = '';
    if (portariaFone) portariaFone.value = '';
    if (portariaEmail) portariaEmail.value = '';
    if (locationInternal) locationInternal.value = '';
    if (roomStatus) roomStatus.value = 'ativo';
    if (maintenanceStart) maintenanceStart.value = '';
    if (maintenanceEnd) maintenanceEnd.value = '';
    if (deactivatedFrom) deactivatedFrom.value = '';
  }

  if (roomPhotosInput) roomPhotosInput.value = '';
  updateDailyRateFromPolicies();
  updateRoomStatusFields(roomStatus?.value || '');
  updateFutureReservationsWarning(currentId || roomIdHidden?.value || null, deactivatedFrom?.value || null);

  roomModal.classList.add('show');
  roomModal.setAttribute('aria-hidden','false');
}
function closeRoomModal(){ roomModal?.classList.remove('show'); roomModal?.setAttribute('aria-hidden','true'); }

async function onRoomFormSubmit(e){
  e.preventDefault(); roomMsg.textContent = '';
  if (!myAdvertiser?.id) { roomMsg.textContent = 'Sem anunciante vinculado.'; return; }
  const isEdit = !!(roomIdHidden && roomIdHidden.value);
  const descHtml = roomDescEditor
    ? (roomDescEditor.innerHTML || '').trim()
    : (roomDesc?.value || '').trim();
  if (roomDesc) {
    roomDesc.value = descHtml;
  }
  roomPoliciesState.immediate.enabled = !!policyImmediateToggle?.checked;
  roomPoliciesState.cancel_window.enabled = !!policyCancelToggle?.checked;
  roomPoliciesState.free_cancel.enabled = !!policyFreeToggle?.checked;
  roomPoliciesState.immediate.base_price = policyImmediateBasePrice?.value ? Number(policyImmediateBasePrice.value) : null;
  roomPoliciesState.cancel_window.base_price = policyCancelBasePrice?.value ? Number(policyCancelBasePrice.value) : null;
  roomPoliciesState.free_cancel.base_price = policyFreeBasePrice?.value ? Number(policyFreeBasePrice.value) : null;
  roomPoliciesState.cancel_window.cancel_days = policyCancelDays?.value ? Number(policyCancelDays.value) : 0;
  roomPoliciesState.cancel_window.cancel_fee_pct = policyCancelFee?.value ? Number(policyCancelFee.value) : 0;
  if (!roomPoliciesState.immediate.enabled && !roomPoliciesState.cancel_window.enabled && !roomPoliciesState.free_cancel.enabled) {
    roomMsg.textContent = 'Selecione pelo menos uma opção de pagamento/cancelamento.';
    if (policyOptionsWarning) policyOptionsWarning.hidden = false;
    return;
  }
  const missingPrices = [];
  if (roomPoliciesState.immediate.enabled && (!roomPoliciesState.immediate.base_price || roomPoliciesState.immediate.base_price <= 0)) {
    missingPrices.push('Pagamento no momento da Reserva');
  }
  if (roomPoliciesState.cancel_window.enabled && (!roomPoliciesState.cancel_window.base_price || roomPoliciesState.cancel_window.base_price <= 0)) {
    missingPrices.push('Cancelamento da Reserva');
  }
  if (roomPoliciesState.free_cancel.enabled && (!roomPoliciesState.free_cancel.base_price || roomPoliciesState.free_cancel.base_price <= 0)) {
    missingPrices.push('Sem taxa de cancelamento');
  }
  if (missingPrices.length) {
    roomMsg.textContent = `Informe o preço base para: ${missingPrices.join(', ')}.`;
    return;
  }
  const statusValue = (roomStatus?.value || 'ativo').toLowerCase();
  if (statusValue === 'desativada' && !deactivatedFrom?.value) {
    roomMsg.textContent = 'Informe a data a partir da qual a sala será desativada.';
    return;
  }
  const roomIdForCheck = roomIdHidden?.value || null;
  if (statusValue === 'inativo' && hasFutureReservations(roomIdForCheck)) {
    roomMsg.textContent = 'Há reservas futuras. Cancele os agendamentos antes de inativar a sala.';
    return;
  }
  if (statusValue === 'desativada') {
    const cutoff = deactivatedFrom?.value || null;
    if (hasFutureReservations(roomIdForCheck, cutoff)) {
      roomMsg.textContent = 'Há reservas futuras após a data de desativação. Cancele os agendamentos antes de desativar.';
      return;
    }
  }

  if (statusValue !== 'manutencao') {
    if (maintenanceStart) maintenanceStart.value = '';
    if (maintenanceEnd) maintenanceEnd.value = '';
  }
  if (statusValue !== 'desativada') {
    if (deactivatedFrom) deactivatedFrom.value = '';
  }

  const computedDailyRate = computeDailyRateFromPolicies();
  if (computedDailyRate != null && dailyRate) {
    dailyRate.value = String(computedDailyRate);
  }
  const record = {
    name: (roomName?.value||'').trim(),
    description: descHtml,
    capacity: roomCap?.value ? parseInt(roomCap.value,10) : null,
    daily_rate: computedDailyRate != null ? Number(computedDailyRate) : null,
    facilitated_access: facilitatedAccess?.value || null,
    portaria_inteligente: portariaInteligente?.value || null,
    street: (streetInput?.value||'').trim(),
    complement: (complementInput?.value||'').trim(),
    cep: cepInput?.value ? maskCepValue(cepInput.value) : '',
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
    amenities: collectSelectedAmenities()
  };
  clearRoomFieldErrors();
  const requiredMissing = validateRequiredRoomFields();
  if (requiredMissing.length) {
    roomMsg.textContent = 'Preencha os campos obrigatórios destacados.';
    return;
  }
  if (!isEdit) {
    record.created_at = new Date().toISOString().slice(0,19).replace('T',' ');
  } else {
    record.id = Number(roomIdHidden.value);
  }
  const payload = { table: 'rooms', record };
  try {
    const res = await fetch(`${API_BASE}/apisave.php`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || (isEdit ? 'Falha ao salvar sala.' : 'Falha ao criar sala.'));
    const savedId = isEdit ? record.id : (json.insertId || record.id);
    if (roomPhotosInput?.files?.length && savedId) {
      try {
        await uploadRoomPhotos(savedId);
      } catch (uploadErr) {
        console.error('[Sala] Erro ao enviar fotos', uploadErr);
        roomMsg.textContent = 'Sala salva, mas houve erro ao enviar as fotos.';
      }
    }
    if (savedId) {
      try {
        await saveRoomPolicies(savedId);
      } catch (policyErr) {
        console.error('[Sala] Erro ao salvar políticas', policyErr);
        roomMsg.textContent = policyErr.message || 'Sala salva, mas houve erro ao salvar políticas.';
      }
    }
    if (savedId) {
      geocodeRoomLocation(savedId);
    }
    roomMsg.textContent = json.message || (isEdit ? 'Sala atualizada com sucesso!' : 'Sala criada com sucesso!');
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

// Aviso pós-atualização de reserva
advStatusNoticeClose?.addEventListener('click', closeAdvStatusNotice);
advStatusNoticeOk?.addEventListener('click', closeAdvStatusNotice);
advStatusNoticeModal?.addEventListener('click', (e)=>{ if (e.target === advStatusNoticeModal) closeAdvStatusNotice(); });
advStatusNoticeReservations?.addEventListener('click', () => {
  setActivePanel('reservations');
  closeAdvStatusNotice();
});

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
    const res = await fetch(`${API_BASE}/advertiser_register.php`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ full_name: name, display_name: publicName, login_email: email, login_cpf: cpfDigits || null, phone: phoneDigits || null, password: pw }) });
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
    const clientName = r.client_name || '';
    const clientEmail = r.client_email || '';
    const clientPhone = r.client_phone || '';
    advResContent.innerHTML = `
      <table>
        <tbody>
          <tr><th style="text-align:left">Data</th><td>${escapeHtml(r.date || '')}</td></tr>
          <tr><th style="text-align:left">Sala</th><td>${escapeHtml(room?.name || ('Sala #'+r.room_id))}</td></tr>
          <tr><th style="text-align:left">Cliente</th><td>${escapeHtml(clientName || '—')}</td></tr>
          <tr><th style="text-align:left">Contato</th><td>${escapeHtml(clientEmail || '—')}${clientPhone ? ' · '+escapeHtml(clientPhone) : ''}</td></tr>
          <tr><th style="text-align:left">Status</th><td>${escapeHtml(r.status||'')}</td></tr>
          <tr><th style="text-align:left">Pagamento</th><td>${escapeHtml(r.payment_status||'')}</td></tr>
          <tr><th style="text-align:left">Título</th><td>${escapeHtml(r.title||'')}</td></tr>
          <tr><th style="text-align:left">Observações</th><td>${escapeHtml(r.description||'')}</td></tr>
        </tbody>
      </table>`;
  }
  advResMessage.textContent='';
  const statusLower = (r?.status || '').toLowerCase();
  if (['confirmada', 'concluida'].includes(statusLower)) {
    setAdvResConfirmMode('close');
    if (advResDeny) advResDeny.hidden = true;
  } else {
    setAdvResConfirmMode('confirm');
    if (advResDeny) advResDeny.hidden = false;
  }
  advResModal?.classList.add('show'); advResModal?.setAttribute('aria-hidden','false');
}
function closeReservationModal(){ advResModal?.classList.remove('show'); advResModal?.setAttribute('aria-hidden','true'); advResCurrentId=null; }
advResClose?.addEventListener('click', closeReservationModal);
advResCancel?.addEventListener('click', () => {
  if (!advResCurrentId) return;
  advResCancelModal?.classList.add('show');
  advResCancelModal?.setAttribute('aria-hidden','false');
});
advResDeny?.addEventListener('click', () => updateReservationStatus('deny'));
function setAdvResConfirmMode(mode){
  if (!advResConfirm) return;
  if (mode === 'close') {
    advResConfirm.textContent = 'Fechar';
    advResConfirm.dataset.mode = 'close';
  } else {
    advResConfirm.textContent = 'Confirmar';
    advResConfirm.dataset.mode = 'confirm';
  }
}
advResConfirm?.addEventListener('click', () => {
  if (!advResConfirm) return;
  if (advResConfirm.dataset.mode === 'close') {
    closeReservationModal();
    setAdvResConfirmMode('confirm');
    return;
  }
  updateReservationStatus('confirm');
});
advResOpenChat?.addEventListener('click', () => { closeReservationModal(); openAdvChatDrawer(); });

function closeAdvResCancelModal() {
  advResCancelModal?.classList.remove('show');
  advResCancelModal?.setAttribute('aria-hidden','true');
}
advResCancelClose?.addEventListener('click', closeAdvResCancelModal);
advResCancelBack?.addEventListener('click', closeAdvResCancelModal);
advResCancelModal?.addEventListener('click', (e) => { if (e.target === advResCancelModal) closeAdvResCancelModal(); });
advResCancelConfirm?.addEventListener('click', () => {
  closeAdvResCancelModal();
  updateReservationStatus('cancel');
});

async function updateReservationStatus(action){
  if (!advResCurrentId) return;
  advResMessage.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/update_reservation_status.php`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ id: advResCurrentId, action }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao atualizar.');
    await loadReservations();
    // Aviso inline semelhante ao fluxo do cliente
    const msg = json.message || (action === 'confirm'
      ? 'A reserva foi confirmada. O cliente será notificado.'
      : 'Reserva atualizada.');
    if (advResMessage) {
      advResMessage.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = msg;
      advResMessage.appendChild(p);
      const actions = document.createElement('div');
      actions.className = 'booking-success-actions';
      const btnRes = document.createElement('button');
      btnRes.type = 'button';
      btnRes.className = 'btn btn-secondary btn-sm';
      btnRes.textContent = 'Ver reservas';
      btnRes.addEventListener('click', () => {
        closeReservationModal();
        setActivePanel('reservations');
      });
      const btnClose = document.createElement('button');
      btnClose.type = 'button';
      btnClose.className = 'btn btn-secondary btn-sm';
      btnClose.textContent = 'Fechar';
      btnClose.addEventListener('click', () => {
        closeReservationModal();
      });
      actions.appendChild(btnRes);
      actions.appendChild(btnClose);
      advResMessage.appendChild(actions);
    } else {
      // fallback simples
      closeReservationModal();
    }
    if (action === 'confirm') {
      setAdvResConfirmMode('close');
    }
  } catch (e) {
    advResMessage.textContent = e.message || 'Erro ao atualizar.';
  }
}

function openAdvStatusNotice(message){
  if (!advStatusNoticeModal) return;
  if (advStatusNoticeText) advStatusNoticeText.textContent = message || 'Reserva atualizada com sucesso.';
  advStatusNoticeModal.classList.add('show');
  advStatusNoticeModal.setAttribute('aria-hidden','false');
}

function closeAdvStatusNotice(){
  if (!advStatusNoticeModal) return;
  advStatusNoticeModal.classList.remove('show');
  advStatusNoticeModal.setAttribute('aria-hidden','true');
}

// ===== Room Details Modal =====
function openRoomDetailsModal(roomId){
  const r = (myRooms||[]).find(x => String(x.id)===String(roomId));
  if (!r) return;
  // Reutiliza o modal completo de sala para edição, com todos os campos
  openRoomModal(r);
}
function closeRoomDetailsModal(){ advRoomDetModal?.classList.remove('show'); advRoomDetModal?.setAttribute('aria-hidden','true'); }
advRoomDetClose?.addEventListener('click', closeRoomDetailsModal);
advRoomDetCancel?.addEventListener('click', closeRoomDetailsModal);
advRoomDetModal?.addEventListener('click', (e)=> { if (e.target === advRoomDetModal) closeRoomDetailsModal(); });
advResModal?.addEventListener('click', (e)=> { if (e.target === advResModal) closeReservationModal(); });

advRecoveryForm?.addEventListener('submit', async (e) => {
  e.preventDefault(); advRecoveryMessage.textContent='';
  const email = (advRecEmail?.value||'').trim();
  if (!email) { advRecoveryMessage.textContent='Informe o e‑mail.'; return; }
  try {
    const res = await fetch(`${API_BASE}/advertiser_reset_password.php`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ email }) });
    const json = await parseJsonSafe(res);
    if (!json.success) throw new Error(json.error || 'Falha ao enviar e‑mail.');
    advRecoveryMessage.textContent = json.message || 'Enviamos um e‑mail com instruções.';
  } catch (err) { advRecoveryMessage.textContent = err.message || 'Erro ao enviar.'; }
});

// Eventos de workshops (botões e modal)
const advNewWorkshopBtn = document.getElementById('advNewWorkshopBtn');
advNewWorkshopBtn?.addEventListener('click', () => openWorkshopModal(null));
advWorkshopClose?.addEventListener('click', closeWorkshopModal);
advWorkshopCancelBtn?.addEventListener('click', closeWorkshopModal);
advWorkshopModal?.addEventListener('click', (e) => { if (e.target === advWorkshopModal) closeWorkshopModal(); });
advWorkshopForm?.addEventListener('submit', onWorkshopSubmit);

// Atualiza visibilidade do campo "Categoria (outros)"
function updateWorkshopCategoryUI() {
  if (!advWorkshopCategorySelect || !advWorkshopCategoryOtherInput) return;
  const val = advWorkshopCategorySelect.value || '';
  const isOther = val === 'Outros';
  advWorkshopCategoryOtherInput.disabled = !isOther;
  advWorkshopCategoryOtherInput.style.opacity = isOther ? '1' : '0.4';
  // mostra/esconde o campo "Categoria (outros)" conforme seleção
  const wrap = advWorkshopCategoryOtherInput.closest('div');
  if (wrap) {
    wrap.style.display = isOther ? 'block' : 'none';
  }
}

advWorkshopCategorySelect?.addEventListener('change', updateWorkshopCategoryUI);
updateWorkshopCategoryUI();

// Atualiza UI de datas (dia único x vários dias)
function updateWorkshopDateModeUI() {
  if (!advWorkshopDateSingle || !advWorkshopDateMulti || !advWorkshopEndDateInput) return;
  const isMulti = advWorkshopDateMulti.checked;
  advWorkshopEndDateInput.disabled = !isMulti;
  advWorkshopEndDateInput.style.opacity = isMulti ? '1' : '0.4';
  if (advWorkshopAddDateWrap) advWorkshopAddDateWrap.style.display = isMulti ? 'block' : 'none';
  if (advWorkshopDatesMultiWrap) advWorkshopDatesMultiWrap.hidden = !isMulti;
  if (!isMulti) {
    workshopSelectedDates = [];
    if (advWorkshopDatesList) advWorkshopDatesList.innerHTML = '';
    if (advWorkshopDatesSummary) advWorkshopDatesSummary.textContent = '';
    if (advWorkshopDatesJsonInput) advWorkshopDatesJsonInput.value = '';
    if (advWorkshopPerDayTimes) advWorkshopPerDayTimes.hidden = true;
  }
  // Controle de visibilidade dos horários globais
  if (advWorkshopTimeStartWrap && advWorkshopTimeEndWrap) {
    const showGlobalTimes = !isMulti || (advWorkshopSameTimeCheckbox?.checked ?? true);
    advWorkshopTimeStartWrap.style.display = showGlobalTimes ? 'block' : 'none';
    advWorkshopTimeEndWrap.style.display = showGlobalTimes ? 'block' : 'none';
  }
}

function addWorkshopDate() {
  if (!advWorkshopDateInput) return;
  const val = advWorkshopDateInput.value;
  if (!val) return;
  if (!workshopSelectedDates.includes(val)) {
    workshopSelectedDates.push(val);
    workshopSelectedDates.sort();
  }
  renderWorkshopDatesUI();
}

function removeWorkshopDate(dateStr) {
  workshopSelectedDates = workshopSelectedDates.filter(d => d !== dateStr);
  renderWorkshopDatesUI();
}

function renderWorkshopDatesUI() {
  if (!advWorkshopDatesList || !advWorkshopDatesSummary) return;
  advWorkshopDatesList.innerHTML = '';
  if (!workshopSelectedDates.length) {
    advWorkshopDatesSummary.textContent = 'Nenhum dia adicional selecionado.';
    if (advWorkshopEndDateInput) advWorkshopEndDateInput.value = '';
    if (advWorkshopPerDayTimes) advWorkshopPerDayTimes.hidden = true;
    return;
  }
  workshopSelectedDates.forEach(d => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'multi-date-chip';
    chip.textContent = d.split('-').reverse().join('/');
    chip.addEventListener('click', () => removeWorkshopDate(d));
    advWorkshopDatesList.appendChild(chip);
  });
  const total = workshopSelectedDates.length;
  advWorkshopDatesSummary.textContent = `${total} dia${total>1?'s':''} selecionado${total>1?'s':''}. Clique em um dia para remover.`;
  if (advWorkshopEndDateInput) {
    const last = workshopSelectedDates[workshopSelectedDates.length - 1];
    advWorkshopEndDateInput.value = last;
  }
  if (advWorkshopDateMulti?.checked && !advWorkshopSameTimeCheckbox?.checked) {
    renderPerDayTimesTable();
  } else if (advWorkshopPerDayTimes) {
    advWorkshopPerDayTimes.hidden = true;
  }
}

function renderPerDayTimesTable() {
  if (!advWorkshopPerDayTimes) return;
  if (!workshopSelectedDates.length) {
    advWorkshopPerDayTimes.hidden = true;
    advWorkshopPerDayTimes.innerHTML = '';
    return;
  }
  const rowsHtml = workshopSelectedDates.map(d => {
    const label = d.split('-').reverse().join('/');
    return `
      <tr data-date="${d}">
        <td>${label}</td>
        <td>
          <div class="time-select-group">
            <select data-role="start-hour">
              <option value="">--</option>
              <option value="06">06</option>
              <option value="07">07</option>
              <option value="08">08</option>
              <option value="09">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
            </select>
            <span class="time-select-sep">:</span>
            <select data-role="start-minute">
              <option value="">--</option>
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
          </div>
        </td>
        <td>
          <div class="time-select-group">
            <select data-role="end-hour">
              <option value="">--</option>
              <option value="06">06</option>
              <option value="07">07</option>
              <option value="08">08</option>
              <option value="09">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
            </select>
            <span class="time-select-sep">:</span>
            <select data-role="end-minute">
              <option value="">--</option>
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
          </div>
        </td>
      </tr>`;
  }).join('');
  advWorkshopPerDayTimes.innerHTML = `
    <table class="per-day-table">
      <thead>
        <tr><th>Dia</th><th>Início</th><th>Fim</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;
  advWorkshopPerDayTimes.hidden = false;
}

advWorkshopAddDateBtn?.addEventListener('click', addWorkshopDate);
advWorkshopSameTimeCheckbox?.addEventListener('change', () => {
  if (advWorkshopDateMulti?.checked && !advWorkshopSameTimeCheckbox.checked) {
    renderPerDayTimesTable();
  } else if (advWorkshopPerDayTimes) {
    advWorkshopPerDayTimes.hidden = true;
  }
  // Atualiza visibilidade dos horários globais quando alterna "manter o mesmo horário"
  if (advWorkshopTimeStartWrap && advWorkshopTimeEndWrap) {
    const showGlobalTimes = !advWorkshopDateMulti?.checked || (advWorkshopSameTimeCheckbox.checked);
    advWorkshopTimeStartWrap.style.display = showGlobalTimes ? 'block' : 'none';
    advWorkshopTimeEndWrap.style.display = showGlobalTimes ? 'block' : 'none';
  }
});
advWorkshopDateSingle?.addEventListener('change', updateWorkshopDateModeUI);
advWorkshopDateMulti?.addEventListener('change', updateWorkshopDateModeUI);
updateWorkshopDateModeUI();

// Toolbar de edição simples para descrição do workshop (B, I, U, quebra de linha)
// Usamos mousedown para manter a seleção ativa dentro do editor rich-text
advWorkshopDescToolbar?.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('[data-tag]');
  if (!btn || !advWorkshopDescriptionEditor) return;
  const tag = btn.getAttribute('data-tag');
  if (!tag) return;
  e.preventDefault();
  advWorkshopDescriptionEditor.focus();

  // Garante que o comando seja aplicado somente se a seleção estiver dentro do editor
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!advWorkshopDescriptionEditor.contains(range.commonAncestorContainer)) {
    // Se a seleção não estiver dentro do editor, posiciona o cursor no final
    const node = advWorkshopDescriptionEditor;
    const lastChild = node.lastChild;
    const newRange = document.createRange();
    if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
      newRange.setStart(lastChild, lastChild.textContent.length);
    } else {
      newRange.selectNodeContents(node);
      newRange.collapse(false);
    }
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  if (tag === 'b') {
    document.execCommand('bold', false, null);
  } else if (tag === 'i') {
    document.execCommand('italic', false, null);
  } else if (tag === 'u') {
    document.execCommand('underline', false, null);
  } else if (tag === 'br') {
    document.execCommand('insertLineBreak', false, null);
  }

  // Sincroniza o HTML com o campo oculto
  if (advWorkshopDescriptionInput) {
    advWorkshopDescriptionInput.value = advWorkshopDescriptionEditor.innerHTML || '';
  }
});

roomDescToolbar?.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('[data-tag]');
  if (!btn || !roomDescEditor) return;
  const tag = btn.getAttribute('data-tag');
  if (!tag) return;
  e.preventDefault();
  roomDescEditor.focus();

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!roomDescEditor.contains(range.commonAncestorContainer)) {
    const node = roomDescEditor;
    const lastChild = node.lastChild;
    const newRange = document.createRange();
    if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
      newRange.setStart(lastChild, lastChild.textContent.length);
    } else {
      newRange.selectNodeContents(node);
      newRange.collapse(false);
    }
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  if (tag === 'b') {
    document.execCommand('bold', false, null);
  } else if (tag === 'i') {
    document.execCommand('italic', false, null);
  } else if (tag === 'u') {
    document.execCommand('underline', false, null);
  } else if (tag === 'br') {
    document.execCommand('insertLineBreak', false, null);
  }

  if (roomDesc) {
    roomDesc.value = roomDescEditor.innerHTML || '';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const openModals = Array.from(document.querySelectorAll('.modal-overlay.show'));
  if (!openModals.length) return;
  const topModal = openModals[openModals.length - 1];
  const closeBtn = topModal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.click();
    return;
  }
  topModal.classList.remove('show');
  topModal.setAttribute('aria-hidden', 'true');
});
