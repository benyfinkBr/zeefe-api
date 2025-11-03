// =======================================================
// CONFIGURAÇÃO DE MÓDULOS - Define títulos, colunas e formulários
// =======================================================
const moduloConfig = {
  companies: {
    titulo: 'Empresas',
    placeholder: 'Buscar empresa...',
    novoLabel: '+ Nova Empresa',
    colunas: ['ID', 'Razão Social', 'CNPJ', 'Status', 'Ações'],
    getCampos: r => [r.id, r.razao_social, r.cnpj, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'razao_social', label: 'Razão Social', type: 'text', required: true },
      { name: 'nome_fantasia', label: 'Nome Fantasia', type: 'text' },
      { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['ativo', 'inativo'] }
    ]
  },
  clients: {
    titulo: 'Clientes',
    placeholder: 'Buscar cliente...',
    novoLabel: '+ Novo Cliente',
    colunas: ['ID', 'Nome', 'E-mail', 'Telefone', 'Empresa', 'Status', 'Ações'],
    getCampos: r => [r.id, r.nome, r.email, r.telefone, r.empresa_nome, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'nome', label: 'Nome Completo', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone', type: 'text' },
      { name: 'empresa_id', label: 'Empresa', type: 'relation', relation: 'companies', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['ativo', 'inativo'] }
    ]
  },
  rooms: {
    titulo: 'Salas',
    placeholder: 'Buscar sala...',
    novoLabel: '+ Nova Sala',
    colunas: ['ID', 'Nome', 'Capacidade', 'Diária', 'Status', 'Ações'],
    getCampos: r => [r.id, r.name, r.capacity, r.daily_rate, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'name', label: 'Nome da Sala', type: 'text', required: true },
      { name: 'capacity', label: 'Capacidade', type: 'number', required: true },
      { name: 'daily_rate', label: 'Diária (R$)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['ativo', 'manutencao', 'desativada'] },
      { name: 'amenities_ids', label: 'Comodidades', type: 'amenities', col: 'full' }
    ]
  },
  reservations: {
    titulo: 'Reservas',
    placeholder: 'Buscar reserva...',
    novoLabel: '+ Nova Reserva',
    colunas: ['ID', 'Cliente', 'Sala', 'Data', 'Status', 'Ações'],
    getCampos: r => [r.id, r.cliente_nome, r.sala_nome, r.data_reserva, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'cliente_id', label: 'Cliente', type: 'relation', relation: 'clients', required: true },
      { name: 'sala_id', label: 'Sala', type: 'relation', relation: 'rooms', required: true },
      { name: 'data_reserva', label: 'Data da Reserva', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pendente', 'confirmada', 'concluida'] }
    ]
  },
  visitors: {
    titulo: 'Visitantes',
    placeholder: 'Buscar visitante...',
    novoLabel: '+ Novo Visitante',
    colunas: ['ID', 'Nome', 'Empresa', 'Horário', 'Status', 'Ações'],
    getCampos: r => [r.id, r.nome, r.empresa_nome, r.horario, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'empresa_id', label: 'Empresa', type: 'relation', relation: 'companies', required: true },
      { name: 'horario', label: 'Horário', type: 'datetime-local', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['aguardando', 'em visita', 'finalizado'] }
    ]
  },
  amenities: {
    titulo: 'Comodidades',
    placeholder: 'Buscar comodidade...',
    novoLabel: '+ Nova Comodidade',
    colunas: ['ID', 'Nome', 'Descrição', 'Status', 'Ações'],
    getCampos: r => [r.id, r.name, r.description, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['ativo', 'inativo'] }
    ]
  },
  campaigns: {
    titulo: 'Campanhas',
    placeholder: 'Buscar campanha...',
    novoLabel: '+ Nova Campanha',
    colunas: ['ID', 'Título', 'Período', 'Status', 'Ações'],
    getCampos: r => [r.id, r.titulo, r.periodo, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'titulo', label: 'Título', type: 'text', required: true },
      { name: 'descricao', label: 'Descrição', type: 'textarea' },
      { name: 'periodo', label: 'Período', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['ativa', 'inativa'] }
    ]
  }
};

const API_BASE = '/api';
let sec = 'companies', dadosJSON = [], filtro = '', itemEdit = null;
let relationsCache = {}, amenitiesCache = [];
window.rowsData = {};

function sanitize(text) {
  if (!text) return '';
  return text.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}

function showToast(msg, timeout = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), timeout);
}

// ======= AUTENTICAÇÃO =======
async function checkAuth() {
  try {
    const r = await fetch(`${API_BASE}/auth.php`, { method: 'GET', credentials: 'include' });
    const j = await r.json();
    if (j.success) {
      document.getElementById('login').style.display = 'none';
      document.getElementById('app').style.display = 'flex';
      loadSection('companies');
    } else showLogin();
  } catch {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login').style.display = 'block';
  document.getElementById('app').style.display = 'none';
  const saved = localStorage.getItem('zeefeAdminLogin');
  if (saved) {
    document.querySelector('input[name="username"]').value = saved;
    document.querySelector('input[name="remember"]').checked = true;
  }
}

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const err = document.getElementById('loginError');
  err.style.display = 'none';

  const f = new FormData(e.target);
  const data = { login: f.get('username'), password: f.get('password') };

  if (f.get('remember')) localStorage.setItem('zeefeAdminLogin', data.login);
  else localStorage.removeItem('zeefeAdminLogin');

  try {
    const r = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(data)
    });
    const j = await r.json();
    if (j.success) checkAuth();
    else { err.textContent = j.error || 'Credenciais inválidas'; err.style.display = 'block'; }
  } catch {
    err.textContent = 'Erro de conexão. Tente novamente.';
    err.style.display = 'block';
  }
});

async function logout() {
  await fetch(`${API_BASE}/auth.php?logout=1`, { credentials: 'include' });
  showLogin();
  showToast('Sessão encerrada.');
}

// ======= MENU =======
const menuItems = Array.from(document.querySelectorAll('#menu li'));
menuItems.forEach(i => i.addEventListener('click', () => {
  menuItems.forEach(b => b.classList.remove('active'));
  i.classList.add('active');
  sec = i.dataset.section;
  loadSection(sec);
}));

// ======= CARREGAMENTO DE SEÇÕES =======
async function loadSection(section) {
  sec = section;
  document.getElementById('content-title').textContent = moduloConfig[section].titulo;
  document.getElementById('search-filters').innerHTML = `
    <input type="text" placeholder="${moduloConfig[section].placeholder}" oninput="updateSearch(this.value)">
    <button class="btn btn-primary" onclick="abrirModalNovo()">${moduloConfig[section].novoLabel}</button>
  `;
  document.getElementById('content-body').innerHTML = '<div class="box-message">Carregando...</div>';

  try {
    const response = await fetch(`${API_BASE}/apiget.php?table=${section}`, { credentials: 'include' });
    const json = await response.json();
    if (json.success) {
      dadosJSON = json.data || [];
      renderTable();
    } else throw new Error(json.error);
  } catch (e) {
    document.getElementById('content-body').innerHTML = `<div class="box-message">Erro: ${e.message}</div>`;
  }
}

function updateSearch(v) {
  filtro = v.trim().toLowerCase();
  renderTable();
}

function renderTable() {
  let linhas = dadosJSON;
  if (filtro)
    linhas = linhas.filter(r => Object.values(r).join(' ').toLowerCase().includes(filtro));

  const body = document.getElementById('content-body');
  if (!linhas.length) {
    body.innerHTML = '<div class="box-message">Nenhum registro encontrado</div>';
    return;
  }

  const cfg = moduloConfig[sec];
  let html = `<div class="table-container"><table><thead><tr>`;
  cfg.colunas.forEach(c => html += `<th>${sanitize(c)}</th>`);
  html += `</tr></thead><tbody>`;

  linhas.forEach(r => {
    window.rowsData[r.id] = r;
    html += '<tr>';
    cfg.getCampos(r).forEach(v => html += `<td>${sanitize(v || '-')}</td>`);
    if (cfg.statusCol) html += `<td>${formatStatusBadge(cfg.statusCol(r) || '')}</td>`;
    html += `<td class="actions">
      <button class="btn btn-secondary btn-sm" onclick="abrirModalEdit(${r.id})">Editar</button>
      <button class="btn btn-secondary btn-sm" onclick="abrirModalExcluir(${r.id})">Excluir</button>
    </td></tr>`;
  });
  html += '</tbody></table></div>';
  body.innerHTML = html;
}

function formatStatusBadge(status) {
  if (!status) return '';
  const map = {
    ativo: 'status-ativo', pendente: 'status-pendente',
    confirmada: 'status-confirmada', concluida: 'status-concluida',
    manutencao: 'status-manutencao'
  };
  return `<span class="status-badge ${map[status] || ''}">${sanitize(status)}</span>`;
}

// ======= CRUD =======
async function salvarItem(e) {
  e.preventDefault();
  const form = document.getElementById('modalForm');
  if (!form.checkValidity()) return showToast('Preencha todos os campos obrigatórios.');

  const fd = new FormData(form), data = {};
  for (let [k, v] of fd.entries()) {
    if (k === 'amenities[]') continue;
    if (k === 'password' && !v && itemEdit) continue;
    data[k] = v;
  }
  if (sec === 'rooms') data.amenities_ids = fd.getAll('amenities[]').join(',');
  if (itemEdit) data.id = itemEdit.id;

  try {
    const r = await fetch(`${API_BASE}/apisave.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ table: sec, data })
    });
    const j = await r.json();
    if (j.success) {
      fecharModal();
      showToast(itemEdit ? 'Item atualizado com sucesso!' : 'Item adicionado!');
      loadSection(sec);
    } else throw new Error(j.error || 'Erro ao salvar');
  } catch (err) { showToast(err.message); }
}

async function confirmarExclusao(id) {
  try {
    const r = await fetch(`${API_BASE}/apidelete.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ table: sec, id })
    });
    const j = await r.json();
    if (j.success) {
      fecharModal();
      showToast('Item excluído!');
      loadSection(sec);
    } else throw new Error(j.error);
  } catch (e) { showToast(e.message); }
}

// ======= INICIALIZAÇÃO =======
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});
checkAuth();
