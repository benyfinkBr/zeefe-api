(() => {
  // Elementos de UI
  const statusEl = document.getElementById('status');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const modal = document.getElementById('paymentModal');
  const closeModal = document.getElementById('closeModal');
  const savePaymentClose = document.getElementById('savePaymentClose');
  const cardsList = document.getElementById('cardsList');
  const existingCardsEl = document.getElementById('existingCards');
  const addressInfoEl = document.getElementById('addressInfo');
  const form = document.querySelector('[data-pagarmecheckout-form]');

  const show = (msg, isError = false) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#c00' : '#0a6';
  };

  // Abertura/fechamento do modal
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

  // Renderização de cartões e endereço
  const renderCards = (cards = []) => {
    if (!cards.length) {
      existingCardsEl.innerHTML = '<p>Nenhum cartão salvo.</p>';
      cardsList.innerHTML = '';
      return;
    }
    const list = cards.map(c => `<div class="card-item"><span>${c.brand ?? ''} ****${c.last4 ?? ''} (${c.exp_month ?? ''}/${c.exp_year ?? ''})</span></div>`).join('');
    existingCardsEl.innerHTML = `<h4>Cartões salvos</h4>${list}`;
    cardsList.innerHTML = `<h2>Cartões salvos</h2>${list}`;
  };

  const renderAddress = (addr) => {
    if (!addr) {
      addressInfoEl.innerHTML = '<p><strong>Endereço:</strong> não cadastrado.</p>';
      return;
    }
    const parts = [
      addr.street, addr.number, addr.complement,
      addr.city, addr.state, addr.zip_code
    ].filter(Boolean).join(', ');
    addressInfoEl.innerHTML = `<p><strong>Endereço:</strong> ${parts || '—'}</p>`;
  };

  const loadCards = async () => {
    let clientId = Number(document.getElementById('clientId')?.value || 0);
    if (!clientId && window.activeClient?.id) {
      clientId = Number(window.activeClient.id);
      const hidden = document.getElementById('clientId');
      if (hidden) hidden.value = clientId;
    }
    if (!clientId) {
      show('Informe o ID do cliente para listar cartões.', true);
      return;
    }
    show('Carregando métodos de pagamento...');
    const resp = await fetch(`api/customer_cards_list.php?client_id=${clientId}`);
    const json = await resp.json();
    if (!json.success) throw new Error(json.error || 'Erro ao carregar cartões.');
    renderCards(json.cards || []);
    renderAddress(json.address || null);
    show('Métodos carregados.');
  };

  const openAndLoad = async () => {
    open();
    try { await loadCards(); } catch (e) { show(e.message || 'Erro ao carregar cartões.', true); }
  };

  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', openAndLoad);
  }
  // Permite abertura via script global (clientes.js)
  window.openPaymentModal = openAndLoad;

  // Integração com tokenizecard.js (nova API)
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const clientId = Number(document.getElementById('clientId')?.value || 0);
      if (!clientId) {
        show('Faça login para salvar o cartão.', true);
        return;
      }

      // campos do cartão
      const holderName = document.getElementById('holderName')?.value?.trim();
      const cardNumber = document.getElementById('cardNumber')?.value?.replace(/\s+/g, '');
      const expMonth = document.getElementById('expMonth')?.value?.replace(/\D/g, '').slice(0, 2);
      const expYear = document.getElementById('expYear')?.value?.replace(/\D/g, '').slice(0, 2);
      const cvv = document.getElementById('cvv')?.value?.trim();

      if (!holderName || !cardNumber || !expMonth || !expYear || !cvv) {
        show('Preencha todos os campos do cartão.', true);
        return;
      }
      const mm = Number(expMonth);
      if (Number.isNaN(mm) || mm < 1 || mm > 12) {
        show('Mês inválido na validade.', true);
        return;
      }
      if (expYear.length !== 2) {
        show('Ano inválido na validade.', true);
        return;
      }
      if (cvv.length < 3 || cvv.length > 4) {
        show('CVV inválido.', true);
        return;
      }

      // o tokenizecard.js coloca o token em um input hidden chamado pagarmetoken
      const tokenInput = form.querySelector('input[name="pagarmetoken"]');
      const pagarmeToken = tokenInput?.value;
      if (!pagarmeToken) {
        show('Token não retornado pelo Pagar.me. Verifique o carregamento do tokenizecard.js.', true);
        return;
      }

      show('Enviando cartão para salvar...');
      try {
        const resp = await fetch('api/customer_save_card.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            pagarmetoken: pagarmeToken
          })
        });
        const json = await resp.json();
        if (!json.success) throw new Error(json.error || 'Erro ao salvar cartão.');
        show(`Cartão salvo (${json.brand ?? ''} ****${json.last4 ?? ''}).`);
        await loadCards();
      } catch (err) {
        show(err.message || 'Erro ao salvar cartão.', true);
      }
    });
  }
})();
