// =======================================================
// Ze.EFE ADMIN PANEL vFinal (Out/2025)
// =======================================================

const API_BASE = '/api';
let sec = 'companies', dadosJSON = [], filtro = '', itemEdit = null;
let relationsCache = {}, amenitiesCache = [];
window.rowsData = {};

// =======================================================
// CONFIGURAÇÃO DE MÓDULOS
// =======================================================
const moduloConfig = {
  companies: {
    titulo: 'Empresas',
    placeholder: 'Buscar empresa...',
    novoLabel: '+ Nova Empresa',
    colunas: ['ID', 'Razão Social', 'CNPJ', 'Nome Fantasia', 'Status', 'Ações'],
    getCampos: r => [r.id, r.razao_social, r.cnpj, r.nome_fantasia, r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'razao_social', label: 'Razão Social', type: 'text', required: true },
      { name: 'nome_fantasia', label: 'Nome Fantasia', type: 'text' },
      { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
      { name: 'email', label: 'E-mail', type: 'text' },
      { name: 'telefone', label: 'Telefone', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['ativo', 'inativo'], required: true }
    ]
  },
  clients: {
    titulo: 'Clientes',
    placeholder: 'Buscar cliente...',
    novoLabel: '+ Novo Cliente',
    colunas: ['ID', 'Nome', 'E-mail', 'Telefone', 'Empresa', 'Status', 'Ações'],
    getCampos: r => [r.id, r.nome, r.email, r.telefone, r.empresa_nome || '-', r.status],
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
    getCampos: r => [r.id, r.name, r.capacity, formatMoney(r.daily_rate), r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'name', label: 'Nome da Sala', type: 'text', required: true },
      { name: 'capacity', label: 'Capacidade', type: 'number', required: true },
      { name: 'daily_rate', label: 'Diária (R$)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['ativo', 'manutencao', 'inativo'] },
      { name: 'amenities_ids', label: 'Comodidades', type: 'amenities', col: 'full' }
    ]
  },
  reservations: {
    titulo: 'Reservas',
    placeholder: 'Buscar reserva...',
    novoLabel: '+ Nova Reserva',
    colunas: ['ID', 'Cliente', 'Sala', 'Data', 'Valor (R$)', 'Status', 'Ações'],
    getCampos: r => [r.id, r.cliente_nome, r.sala_nome, formatDate(r.data_reserva), formatMoney(r.valor_total), r.status],
    statusCol: r => r.status,
    formFields: [
      { name: 'cliente_id', label: 'Cliente', type: 'relation', relation: 'clients', required: true },
      { name: 'sala_id', label: 'Sala', type: 'relation', relation: 'rooms', required: true },
      { name: 'data_reserva', label: 'Data da Reserva', type: 'date', required: true },
      { name: 'valor_total', label: 'Valor Total (R$)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pendente', 'confirmada', 'concluida'] }
    ]
  },
  visitors: {
    titulo: 'Visitantes',
    placeholder: 'Buscar visitante...',
    novoLabel: '+ Novo Visitante',
    colunas: ['ID', 'Nome', 'Empresa', 'Horário', 'Status', 'Ações'],
    getCampos: r => [r.id, r.nome, r.empresa_nome, formatDateTime(r.horario), r.status],
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

// =======================================================
// UTILITÁRIOS
// =======================================================
function sanitize(t){ return !t ? '' : t.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
function formatMoney(v){ return v ? 'R$ ' + parseFloat(v).toFixed(2).replace('.',',') : '-'; }
function formatDate(d){ if(!d) return '-'; return new Date(d).toLocaleDateString('pt-BR'); }
function formatDateTime(d){ if(!d) return '-'; const dt=new Date(d); return dt.toLocaleString('pt-BR'); }
function showToast(msg,t=3000){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),t);}

// =======================================================
// AUTENTICAÇÃO E VERIFICAÇÃO DE SESSÃO
// =======================================================
// =======================================================
// AUTENTICAÇÃO E VERIFICAÇÃO DE SESSÃO (vFinal)
// =======================================================
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/auth.php`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const j = await response.json();

    if (j.success) {
      // Exibe o nome do usuário logado no topo
      if (j.user) {
        const name = j.user.nome || j.user.username || 'Admin';
        const userBar = document.getElementById('userName');
        if (userBar) userBar.textContent = 'Logado como ' + name;
      }

      // Mostra o app e carrega a seção inicial
      document.getElementById('app').style.display = 'flex';
      document.getElementById('login')?.style?.display = 'none';
      loadSection('companies');
    } else {
      console.warn('Sessão expirada ou não autenticada.');
      window.location.href = 'admin-login.html';
    }
  } catch (err) {
    console.error('Erro ao verificar autenticação:', err);
    window.location.href = 'admin-login.html';
  }
}

// Função de logout
async function logout() {
  try {
    await fetch(`${API_BASE}/auth.php?logout=1`, { credentials: 'include' });
  } finally {
    window.location.href = 'admin-login.html';
  }
}

// =======================================================
// MENU
// =======================================================
const menuItems = Array.from(document.querySelectorAll('#menu li'));
menuItems.forEach(i => i.addEventListener('click', () => {
  menuItems.forEach(b => b.classList.remove('active'));
  i.classList.add('active');
  sec = i.dataset.section;
  loadSection(sec);
}));

// =======================================================
// SEÇÕES E TABELAS
// =======================================================
async function loadSection(section) {
  sec = section;
  document.getElementById('content-title').textContent = moduloConfig[section].titulo;
  document.getElementById('search-filters').innerHTML = `
    <input type="text" placeholder="${moduloConfig[section].placeholder}" oninput="updateSearch(this.value)">
    <button class="btn btn-primary" onclick="abrirModalNovo()">${moduloConfig[section].novoLabel}</button>`;
  document.getElementById('content-body').innerHTML = '<div class="box-message">Carregando...</div>';
  try {
    const r = await fetch(`${API_BASE}/apiget.php?table=${section}`, { credentials: 'include' });
    const j = await r.json();
    if (j.success) { dadosJSON = j.data || []; renderTable(); }
    else throw new Error(j.error);
  } catch(e){ document.getElementById('content-body').innerHTML = `<div class="box-message">Erro: ${e.message}</div>`; }
}

function updateSearch(v){ filtro=v.trim().toLowerCase(); renderTable(); }

function renderTable(){
  let linhas=dadosJSON;
  if(filtro) linhas=linhas.filter(r=>Object.values(r).join(' ').toLowerCase().includes(filtro));
  const body=document.getElementById('content-body');
  if(!linhas.length){body.innerHTML='<div class="box-message">Nenhum registro encontrado</div>';return;}
  const cfg=moduloConfig[sec];
  let html=`<div class="table-container"><table><thead><tr>`;
  cfg.colunas.forEach(c=>html+=`<th>${sanitize(c)}</th>`); html+=`</tr></thead><tbody>`;
  linhas.forEach(r=>{
    window.rowsData[r.id]=r;
    html+='<tr>';
    cfg.getCampos(r).forEach(v=>html+=`<td>${sanitize(v||'-')}</td>`);
    if(cfg.statusCol) html+=`<td>${formatStatusBadge(cfg.statusCol(r)||'')}</td>`;
    html+=`<td class="actions"><button class="btn btn-secondary btn-sm" onclick="abrirModalEdit(${r.id})">Editar</button><button class="btn btn-secondary btn-sm" onclick="abrirModalExcluir(${r.id})">Excluir</button></td></tr>`;
  });
  html+='</tbody></table></div>'; body.innerHTML=html;
}

function formatStatusBadge(s){
  if(!s) return ''; const map={ativo:'status-ativo',pendente:'status-pendente',confirmada:'status-confirmada',concluida:'status-concluida',manutencao:'status-manutencao'};
  return `<span class="status-badge ${map[s]||''}">${sanitize(s)}</span>`;
}

// =======================================================
// MODAIS E CRUD
// =======================================================
function fecharModal(){document.getElementById('modal').classList.remove('show');}

async function abrirModalNovo(){itemEdit=null;document.getElementById('modalTitle').textContent=moduloConfig[sec].novoLabel;await buildModalForm();document.getElementById('modal').classList.add('show');}

async function abrirModalEdit(id){const r=window.rowsData[id];if(!r)return showToast('Registro não encontrado');itemEdit=r;document.getElementById('modalTitle').textContent='Editar '+moduloConfig[sec].titulo.replace('Gestão de ','');await buildModalForm(r);document.getElementById('modal').classList.add('show');}

async function buildModalForm(row=null){
  const flds=moduloConfig[sec].formFields||[];let html='';if(sec==='rooms')await loadAmenities();
  for(let f of flds){
    const val=row?sanitize(row[f.name]||''):'';
    html+=`<div class="form-row${f.col==='full'?' full':''}"><div class="form-group"><label>${sanitize(f.label)}${f.required?' *':''}</label>`;
    if(f.type==='select'){
      html+=`<select name="${f.name}" ${f.required?'required':''}>${!f.required?'<option value="">Selecione...</option>':''}`;
      (f.options||[]).forEach(opt=>html+=`<option value="${opt}" ${val===opt?'selected':''}>${opt}</option>`); html+='</select>';
    } else if(f.type==='relation'){ html+=await buildRelationSelect(f,val); }
    else if(f.type==='amenities'){ html+=await buildAmenitiesCheckboxes(row); }
    else if(f.type==='textarea'){ html+=`<textarea name="${f.name}" ${f.required?'required':''}>${val}</textarea>`; }
    else if(f.type==='password'){ html+=`<input type="password" name="${f.name}" placeholder="Deixe em branco para manter" ${!row?'required':''}>`; }
    else{ html+=`<input type="${f.type}" name="${f.name}" value="${val}" ${f.required?'required':''}>`; }
    html+='</div></div>';
  }
  document.getElementById('modalBody').innerHTML=html;
}

async function buildRelationSelect(f,val=''){
  const rel=f.relation;if(!relationsCache[rel]){try{const r=await fetch(`${API_BASE}/apiget.php?table=${rel}`,{credentials:'include'});const j=await r.json();relationsCache[rel]=j.success?j.data:[];}catch{relationsCache[rel]=[];}}
  let html=`<select name="${f.name}" ${f.required?'required':''}>${!f.required?'<option value="">Selecione...</option>':''}`;
  relationsCache[rel].forEach(it=>{const label=sanitize(it.name||it.nome||it.razao_social||`ID ${it.id}`);html+=`<option value="${it.id}" ${val==it.id?'selected':''}>${label}</option>`;});
  return html+'</select>';
}

async function loadAmenities(){
  if(!amenitiesCache.length){try{const r=await fetch(`${API_BASE}/apiget.php?table=amenities`,{credentials:'include'});const j=await r.json();amenitiesCache=j.success?j.data:[];}catch{amenitiesCache=[];}}
}

async function buildAmenitiesCheckboxes(room){
  const selected=room&&room.amenities_ids?room.amenities_ids.split(',').map(Number):[];
  return '<div style="max-height:150px;overflow-y:auto;">'+amenitiesCache.map(a=>`<div class="amenity-item"><input type="checkbox" name="amenities[]" value="${a.id}" ${selected.includes(a.id)?'checked':''}><label>${sanitize(a.name)}</label></div>`).join('')+'</div>';
}

async function salvarItem(e){
  e.preventDefault();
  const form=document.getElementById('modalForm');
  if(!form.checkValidity())return showToast('Preencha todos os campos obrigatórios.');
  const fd=new FormData(form),data={};
  for(let[k,v]of fd.entries()){if(k==='amenities[]')continue;data[k]=v;}
  if(sec==='rooms')data.amenities_ids=fd.getAll('amenities[]').join(',');
  if(itemEdit)data.id=itemEdit.id;
  try{
    const r=await fetch(`${API_BASE}/apisave.php`,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({table:sec,data})});
    const j=await r.json();
    if(j.success){fecharModal();showToast(itemEdit?'Item atualizado!':'Item adicionado!');loadSection(sec);}
    else throw new Error(j.error||'Erro ao salvar');
  }catch(err){showToast(err.message);}
}

async function abrirModalExcluir(id){
  const body=document.getElementById('modalBody');
  document.getElementById('modalTitle').textContent='Confirmar Exclusão';
  body.innerHTML='<p>Deseja realmente excluir este registro? Esta ação não pode ser desfeita.</p>';
  document.querySelector('.modal-footer').innerHTML=`<button type="button" class="btn btn-secondary" onclick="fecharModal()">Cancelar</button><button type="button" class="btn btn-primary" onclick="confirmarExclusao(${id})">Confirmar Exclusão</button>`;
  document.getElementById('modal').classList.add('show');
}

async function confirmarExclusao(id){
  try{
    const r=await fetch(`${API_BASE}/apidelete.php`,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({table:sec,id})});
    const j=await r.json();
    if(j.success){fecharModal();showToast('Item excluído!');loadSection(sec);}
    else throw new Error(j.error);
  }catch(e){showToast(e.message);}
}

// =======================================================
// INICIALIZAÇÃO
// =======================================================
document.getElementById('modal').addEventListener('click',e=>{if(e.target===e
