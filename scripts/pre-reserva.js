const API_BASE = 'api';

const calendarGrid = document.getElementById('calendarGrid');
const calendarLabel = document.getElementById('calendarLabel');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const stepRooms = document.getElementById('stepRooms');
const stepAuth = document.getElementById('stepAuth');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const roomCards = document.getElementById('roomCards');
const roomsFeedback = document.getElementById('roomsFeedback');
const authTabs = document.querySelectorAll('.auth-tabs button');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const formRecovery = document.getElementById('formRecovery');
const authForms = document.getElementById('authForms');
const authMessage = document.getElementById('authMessage');
const resumoReserva = document.getElementById('resumoReserva');
const resumoCliente = document.getElementById('resumoCliente');
const resumoData = document.getElementById('resumoData');
const resumoSala = document.getElementById('resumoSala');
const confirmarReservaBtn = document.getElementById('confirmarReserva');

let rooms = [];
let reservations = [];
let currentMonth = new Date();
let selectedDate = null;
let selectedRoomId = null;
let authenticatedClient = null;

init();

async function init() {
  try {
    const [roomsResp, reservationsResp] = await Promise.all([
      fetch(`${API_BASE}/apiget.php?table=rooms`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API_BASE}/apiget.php?table=reservations`, { credentials: 'include' }).then(r => r.json())
    ]);

    if (!roomsResp.success) throw new Error(roomsResp.error || 'Erro ao carregar salas');
    if (!reservationsResp.success) throw new Error(reservationsResp.error || 'Erro ao carregar reservas');

    rooms = roomsResp.data || [];
    reservations = (reservationsResp.data || []).filter(r => !['cancelada', 'negada'].includes((r.status || '').toLowerCase()));

    renderCalendar(currentMonth);
  } catch (err) {
    console.error(err);
    calendarGrid.innerHTML = `<div class="rooms-message">${err.message}</div>`;
  }

  prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn.addEventListener('click', () => changeMonth(1));

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });

  formLogin.addEventListener('submit', onLoginSubmit);
  formRegister.addEventListener('submit', onRegisterSubmit);
  formRecovery.addEventListener('submit', onRecoverySubmit);
  confirmarReservaBtn.addEventListener('click', confirmarReserva);
}

function renderCalendar(referenceDate) {
  calendarGrid.innerHTML = '';
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const weeksHeader = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  weeksHeader.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'calendar-day disabled';
    cell.textContent = day;
    calendarGrid.appendChild(cell);
  });

  calendarLabel.textContent = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const todayISO = formatISO(new Date());

  for (let i = 0; i < start.getDay(); i++) {
    const filler = document.createElement('div');
    filler.className = 'calendar-day disabled';
    calendarGrid.appendChild(filler);
  }

  for (let day = 1; day <= end.getDate(); day++) {
    const dateStr = formatISO(new Date(year, month, day));
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'calendar-day';
    cell.textContent = day;

    if (dateStr < todayISO) {
      cell.classList.add('disabled');
      cell.disabled = true;
    } else {
      const availability = availabilityForDate(dateStr);
      cell.classList.add(availability.className);
      cell.disabled = availability.className === 'full';
      if (!cell.disabled) {
        cell.addEventListener('click', () => selectDate(dateStr, cell));
      }
    }

    if (selectedDate === dateStr) {
      cell.classList.add('selected');
    }

    calendarGrid.appendChild(cell);
  }
}

function changeMonth(delta) {
  currentMonth.setMonth(currentMonth.getMonth() + delta);
  renderCalendar(currentMonth);
}

function selectDate(dateStr, cell) {
  selectedDate = dateStr;
  selectedRoomId = null;
  authenticatedClient = null;
  resumoReserva.hidden = true;
  confirmarReservaBtn.hidden = true;
  authMessage.textContent = '';
  document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
  cell.classList.add('selected');
  selectedDateLabel.textContent = `Data selecionada: ${formatDisplayDate(selectedDate)}`;
  stepRooms.hidden = false;
  stepAuth.hidden = true;
  renderRoomsForDate(dateStr);
}

function renderRoomsForDate(dateStr) {
  roomCards.innerHTML = '';
  roomsFeedback.textContent = '';

  const candidates = rooms.filter(r => isRoomConsidered(r));
  const available = candidates.filter(r => isRoomAvailableOnDate(r, dateStr));

  if (!candidates.length) {
    roomsFeedback.textContent = 'Nenhuma sala cadastrada.';
    return;
  }

  if (!available.length) {
    roomsFeedback.textContent = 'Nenhuma sala disponível para esta data. Escolha outra data.';
    return;
  }

  available.forEach(room => {
    const card = document.createElement('article');
    card.className = 'card room-card';
    if (selectedRoomId === room.id) card.classList.add('selected');

    const firstPhoto = getFirstPhoto(room.photo_path);
    card.innerHTML = `
      <div class="photo" style="height: 160px; background: linear-gradient(135deg, #1D413A 0%, #ABA198 100%);">
        ${firstPhoto ? `<img src="${firstPhoto}" alt="Sala ${escapeHtml(room.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:16px 16px 0 0;">` : ''}
      </div>
      <h4>${escapeHtml(room.name)}</h4>
      <p>Capacidade: ${room.capacity || '-'} pessoas</p>
      <p class="price">${formatCurrency(room.daily_rate)} por dia</p>
      <button type="button" class="btn btn-secondary" data-room="${room.id}">Selecionar</button>
    `;

    card.querySelector('button[data-room]').addEventListener('click', () => {
      document.querySelectorAll('#roomCards .room-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedRoomId = room.id;
      stepAuth.hidden = false;
      resumoReserva.hidden = true;
      confirmarReservaBtn.hidden = true;
      resumoSala.textContent = room.name || '';
      resumoData.textContent = formatDisplayDate(selectedDate);
    });

    roomCards.appendChild(card);
  });
}

function switchAuthTab(tabName) {
  authTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  formLogin.hidden = tabName !== 'login';
  formRegister.hidden = tabName !== 'register';
  formRecovery.hidden = tabName !== 'recovery';
  authMessage.textContent = '';
}

async function onLoginSubmit(event) {
  event.preventDefault();
  authMessage.textContent = '';
  const login = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!login || !password) {
    authMessage.textContent = 'Informe login e senha.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/client_portal_login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível autenticar.');
    authenticatedClient = json.client;
    resumoCliente.textContent = authenticatedClient.name || authenticatedClient.login || 'Cliente';
    resumoSala.textContent = getSelectedRoom()?.name || '';
    resumoData.textContent = formatDisplayDate(selectedDate);
    resumoReserva.hidden = false;
    confirmarReservaBtn.hidden = false;
    authMessage.textContent = 'Autenticado com sucesso.';
  } catch (err) {
    authMessage.textContent = err.message;
  }
}

async function onRegisterSubmit(event) {
  event.preventDefault();
  authMessage.textContent = '';
  const payload = {
    name: document.getElementById('registerName').value.trim(),
    email: document.getElementById('registerEmail').value.trim(),
    login: document.getElementById('registerLogin').value.trim(),
    cpf: document.getElementById('registerCpf').value.trim(),
    phone: document.getElementById('registerPhone').value.trim(),
    password: document.getElementById('registerPassword').value,
    password_confirm: document.getElementById('registerPasswordConfirm').value
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
    authenticatedClient = json.client;
    resumoCliente.textContent = authenticatedClient.name || authenticatedClient.login || 'Cliente';
    resumoSala.textContent = getSelectedRoom()?.name || '';
    resumoData.textContent = formatDisplayDate(selectedDate);
    resumoReserva.hidden = false;
    confirmarReservaBtn.hidden = false;
    authMessage.textContent = 'Conta criada com sucesso.';
    formRegister.reset();
  } catch (err) {
    authMessage.textContent = err.message;
  }
}

async function onRecoverySubmit(event) {
  event.preventDefault();
  authMessage.textContent = '';
  const login = document.getElementById('recoveryLogin').value.trim();
  if (!login) {
    authMessage.textContent = 'Informe login ou e-mail.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/client_reset_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível resetar a senha.');
    authMessage.textContent = json.message || 'Enviamos as instruções para redefinir a senha.';
    formRecovery.reset();
  } catch (err) {
    authMessage.textContent = err.message;
  }
}

async function confirmarReserva() {
  if (!authenticatedClient || !selectedDate || !selectedRoomId) return;
  const room = getSelectedRoom();
  if (!room) {
    authMessage.textContent = 'Selecione uma sala.';
    return;
  }
  if (!isRoomAvailableOnDate(room, selectedDate)) {
    authMessage.textContent = 'A sala não está mais disponível nesta data.';
    renderRoomsForDate(selectedDate);
    return;
  }
  try {
    const record = {
      client_id: authenticatedClient.id,
      room_id: room.id,
      date: selectedDate,
      status: 'pendente',
      title: `Reserva diária ${room.name}`
    };
    const res = await fetch(`${API_BASE}/apisave.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ table: 'reservations', record })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao salvar reserva.');
    authMessage.textContent = 'Pré-reserva enviada com sucesso! Entraremos em contato para confirmação.';
    confirmarReservaBtn.hidden = true;
    reservations.push({ room_id: room.id, date: selectedDate, status: 'pendente' });
    renderCalendar(currentMonth);
  } catch (err) {
    authMessage.textContent = err.message;
  }
}

function availabilityForDate(dateStr) {
  const candidates = rooms.filter(r => isRoomConsidered(r));
  const available = candidates.filter(r => isRoomAvailableOnDate(r, dateStr));
  if (!candidates.length || !available.length) return { className: 'full' };
  if (available.length === candidates.length) return { className: 'available' };
  return { className: 'partial' };
}

function isRoomConsidered(room) {
  if (!room) return false;
  const status = (room.status || '').toLowerCase();
  return !['inativo'].includes(status);
}

function isRoomAvailableOnDate(room, dateStr) {
  if (!room) return false;
  const status = (room.status || '').toLowerCase();
  if (status === 'inativo') return false;
  if (status === 'desativada') {
    if (!room.deactivated_from) return false;
    return dateStr < room.deactivated_from;
  }
  if (status === 'manutencao') {
    if (room.maintenance_start && room.maintenance_start <= dateStr) {
      if (!room.maintenance_end || room.maintenance_end >= dateStr) return false;
    }
  }

  const conflict = reservations.some(res => String(res.room_id) === String(room.id) && res.date === dateStr);
  if (conflict) return false;
  return true;
}

function getSelectedRoom() {
  return rooms.find(r => String(r.id) === String(selectedRoomId));
}

function formatISO(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(iso) {
  if (!iso) return '--';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function getFirstPhoto(path) {
  if (!path) return '';
  const photo = path.split(',').map(item => item.trim()).find(Boolean);
  if (!photo) return '';
  return photo.startsWith('http') ? photo : `/${photo}`;
}

function formatCurrency(value) {
  const number = Number(value);
  if (!number) return '';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
