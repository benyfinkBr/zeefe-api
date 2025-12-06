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
      <div class="card-item">
        <span>${c.brand ?? ''} ****${c.last4 ?? ''} (${c.exp_month ?? ''}/${c.exp_year ?? ''})</span>
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
    if (!clientId) return;

    try {
      const resp = await fetch(`api/customer_cards_list.php?client_id=${clientId}`);
      const json = await resp.json();
      if (!json.success) return;
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

  // Apenas feedback visual; NÃO fazemos preventDefault aqui.
  form?.addEventListener('submit', () => {
    show('Enviando dados para o Pagar.me...');
    // O tokenizecard.js vai interceptar o submit,
    // criar o token e redirecionar para clientes.html?pagarmetoken=...
  });

  // Fluxo oficial: após o redirect com ?pagarmetoken=...,
  // salvamos o cartão no backend e limpamos o parâmetro da URL.
  const processTokenFromUrl = async () => {
    const url = new URL(window.location.href);
    // o tokenizecard pode mandar "pagarmetoken" ou "token"
    const pagarmetoken = url.searchParams.get('pagarmetoken') || url.searchParams.get('token');

    if (!pagarmetoken) return;

    const clientId = resolveClientId();
    if (!clientId) {
      show('Cliente não identificado para salvar o cartão.', true);
      return;
    }

    show('Salvando cartão no servidor...');

    try {
      const resp = await fetch('api/customer_save_card.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
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
    } finally {
      // Remove o pagarmetoken da URL para evitar reprocessar ao recarregar
      url.searchParams.delete('pagarmetoken');
      url.searchParams.delete('token');
      const newUrl = url.pathname + (url.search ? `?${url.searchParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Processa token (se existir) assim que o script carregar
  await processTokenFromUrl();
})();