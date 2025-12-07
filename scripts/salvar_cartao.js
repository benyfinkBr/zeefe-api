// api/scripts/salvar_cartao.js
(async () => {
  const modal = document.getElementById('paymentModal');
  const closeModal = document.getElementById('closeModal');
  const savePaymentClose = document.getElementById('savePaymentClose');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const form = document.getElementById('paymentForm');
  const statusEl = document.getElementById('status');
  const existingCardsEl = document.getElementById('existingCards');
  const addressInfoEl = document.getElementById('addressInfo');

  const show = (msg, isError = false) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#c00' : '#0a6';
  };

  const open = () => {
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };

  closeModal?.addEventListener('click', close);
  savePaymentClose?.addEventListener('click', close);
  modal?.addEventListener('click', (e) => { if (e.target === modal) close(); });

  // Resolve o ID do cliente (input oculto ou window.activeClient)
  const resolveClientId = () => {
    let clientId = Number(document.getElementById('clientId')?.value || 0);
    if (!clientId && window.activeClient?.id) {
      clientId = Number(window.activeClient.id);
      const hidden = document.getElementById('clientId');
      if (hidden) hidden.value = clientId;
    }
    return clientId;
  };

  const renderCards = (cards = []) => {
    if (!existingCardsEl) return;

    if (!cards.length) {
      existingCardsEl.innerHTML = '<p>Nenhum cartão salvo.</p>';
      return;
    }

    const html = cards.map(c => `
      <div class="card-item" data-card-id="${c.card_id || ''}">
        <span>${c.brand ?? ''} ****${c.last4 ?? ''} (${c.exp_month ?? ''}/${c.exp_year ?? ''})</span>
        ${c.card_id ? `<button type="button" class="btn btn-secondary btn-sm" data-action="delete-card" data-card-id="${c.card_id}">Excluir</button>` : ''}
      </div>
    `).join('');

    existingCardsEl.innerHTML = `<h4>Cartões salvos</h4>${html}`;
  };

  const renderAddress = (addr) => {
    if (!addressInfoEl) return;

    if (!addr || !addr.street) {
      addressInfoEl.innerHTML = '<p><strong>Endereço:</strong> não cadastrado.</p>';
      return;
    }

    const parts = [
      addr.street,
      addr.number,
      addr.complement,
      addr.city,
      addr.state,
      addr.zip_code
    ].filter(Boolean).join(', ');

    addressInfoEl.innerHTML = `<p><strong>Endereço:</strong> ${parts}</p>`;
  };

  const loadCards = async () => {
    const clientId = resolveClientId();
    const url = clientId ? `api/pagarme_list_cards.php?client_id=${clientId}` : 'api/pagarme_list_cards.php';

    try {
      const resp = await fetch(url, { credentials: 'include' });
      const json = await resp.json();
      if (!json.success) {
        if (json.error) show(json.error, true);
        return;
      }
      renderCards(json.cards || []);
      renderAddress(json.address || null);
    } catch (err) {
      console.error('Erro ao carregar cartões:', err);
    }
  };

  const openAndLoad = async () => {
    open();
    show('Carregando métodos de pagamento...');
    try {
      await loadCards();
      show('Métodos carregados.');
    } catch (e) {
      show('Erro ao carregar cartões.', true);
    }
  };

  btnOpenModal?.addEventListener('click', openAndLoad);

  existingCardsEl?.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-action="delete-card"]');
    if (!btn) return;
    const cardId = btn.dataset.cardId;
    if (!cardId) return;
    const clientId = resolveClientId();
    if (!confirm('Excluir este cartão?')) return;
    show('Excluindo cartão...');
    try {
      const resp = await fetch('api/pagarme_delete_card.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ card_id: cardId, client_id: clientId || undefined })
      });
      const json = await resp.json();
      if (!json.success) {
        show(json.error || 'Erro ao excluir cartão.', true);
        return;
      }
      show('Cartão excluído.');
      await loadCards();
    } catch (err) {
      console.error('Erro ao excluir cartão', err);
      show('Erro ao excluir cartão.', true);
    }
  });

  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    show('Gerando token...');

    if (typeof PagarmeCheckout === 'undefined') {
      show('tokenizecard.js não carregou', true);
      return;
    }
    try {
      const result = await PagarmeCheckout.tokenize(form);
      const pagarmetoken = result?.pagarmetoken || result?.token || result?.id;
      if (!pagarmetoken) {
        show('Token não retornado pelo Pagar.me', true);
        return;
      }
      await processToken(pagarmetoken);
    } catch (err) {
      console.error('Erro ao tokenizar', err);
      show('Erro ao tokenizar o cartão.', true);
    }
  });

  const processToken = async (pagarmetoken) => {
    const clientId = resolveClientId();
    if (!clientId) {
      console.warn('Cliente não identificado no front. Tentando usar sessão no backend.');
    }
    show('Salvando cartão no servidor...');
    try {
      const resp = await fetch('api/pagarme_save_card.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId || undefined,
          pagarmetoken
        })
      });

      const json = await resp.json();

      if (!json.success) {
        console.error('Erro ao salvar cartão:', json);
        show(json.error || 'Erro ao salvar cartão.', true);
      } else {
        show('Cartão salvo com sucesso!');
        await loadCards();
      }
    } catch (err) {
      console.error('Erro na requisição de salvamento do cartão:', err);
      show('Erro ao salvar cartão.', true);
    }
  };

  const processTokenFromUrl = async () => {
    const url = new URL(window.location.href);
    const pagarmetoken = url.searchParams.get('pagarmetoken') || url.searchParams.get('token');
    if (!pagarmetoken) return;
    await processToken(pagarmetoken);
    url.searchParams.delete('pagarmetoken');
    url.searchParams.delete('token');
    const newUrl = url.pathname + (url.search ? `?${url.searchParams.toString()}` : '');
    window.history.replaceState({}, '', newUrl);
  };

  await processTokenFromUrl();
})();
