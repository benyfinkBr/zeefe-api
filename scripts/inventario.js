const token = window.INVENTORY_TOKEN || '';
const form = document.getElementById('inventoryItemForm');
const message = document.getElementById('inventoryItemMessage');
const titleEl = document.getElementById('inventoryItemName');
const updatedEl = document.getElementById('inventoryItemUpdated');

function fillForm(item) {
  if (!form || !item) return;
  Array.from(form.elements).forEach((el) => {
    if (!el.name) return;
    if (Object.prototype.hasOwnProperty.call(item, el.name)) {
      el.value = item[el.name] == null ? '' : item[el.name];
    }
  });
  if (titleEl) {
    titleEl.textContent = item.descricao || item.codigo_patrimonio || 'Item de patrimônio';
  }
  if (updatedEl) {
    updatedEl.textContent = item.updated_at ? `Última atualização: ${item.updated_at}` : '';
  }
}

async function loadItem() {
  if (!token) return;
  try {
    const res = await fetch(`/api/inventory_item.php?token=${encodeURIComponent(token)}`, { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = `/inventario_auth.php?token=${encodeURIComponent(token)}`;
      return;
    }
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Não foi possível carregar o item.');
    fillForm(json.item);
  } catch (err) {
    if (message) message.textContent = err.message || 'Falha ao carregar o item.';
  }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return;
  if (message) message.textContent = '';
  const formData = new FormData(form);
  const record = Object.fromEntries(formData.entries());
  try {
    const res = await fetch('/api/inventory_update.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, record })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao salvar.');
    await loadItem();
    if (message) message.textContent = 'Atualizado com sucesso.';
  } catch (err) {
    if (message) message.textContent = err.message || 'Erro ao salvar.';
  }
});

loadItem();
