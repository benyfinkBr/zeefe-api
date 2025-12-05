(() => {
  const statusEl = document.getElementById('status');
  const btnSave = document.getElementById('btnSave');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const modal = document.getElementById('paymentModal');
  const closeModal = document.getElementById('closeModal');
  const savePaymentClose = document.getElementById('savePaymentClose');
  const cardsList = document.getElementById('cardsList');
  const existingCardsEl = document.getElementById('existingCards');
  const addressInfoEl = document.getElementById('addressInfo');

  const show = (msg, isError = false) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#c00' : '#0a6';
  };

  const getPublicKey = () => 'pk_test_RNoa2omHrUnZlGzK'; // somente tokenização

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

  const expInput = document.getElementById('exp');
  const normalizeExp = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };
  const applyExpMask = () => {
    if (!expInput) return;
    expInput.value = normalizeExp(expInput.value);
  };
  if (expInput) {
    expInput.maxLength = 5;
    ['input', 'keyup', 'blur', 'change'].forEach(evt => {
      expInput.addEventListener(evt, applyExpMask);
    });
  }

  let pagarmeScriptRequested = false;
  function ensurePagarmeScript() {
    if (typeof window.pagarme !== 'undefined' || pagarmeScriptRequested) return;
    pagarmeScriptRequested = true;
    const script = document.createElement('script');
    // SDK oficial v3
    script.src = 'https://assets.pagar.me/pagarme-js/3.0/pagarme.min.js';
    script.async = true;
    document.head.appendChild(script);
  }

  async function waitForPagarme(maxTries = 10, delay = 150) {
    ensurePagarmeScript();
    let tries = 0;
    while (typeof window.pagarme === 'undefined' && tries < maxTries) {
      await new Promise(r => setTimeout(r, delay));
      tries++;
    }
    if (typeof window.pagarme === 'undefined') {
      throw new Error('Biblioteca Pagar.me não carregou. Verifique a conexão.');
    }
    return window.pagarme;
  }

  btnSave.addEventListener('click', async (e) => {
    e.preventDefault();
    const clientId = Number(document.getElementById('clientId')?.value || 0);
    const holderName = document.getElementById('holderName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, '');
    const expRaw = document.getElementById('exp').value;
    const expDigits = (expRaw || '').replace(/\D/g, '').slice(0, 4);
    const exp = expDigits.length === 4
      ? `${expDigits.slice(0, 2)}/${expDigits.slice(2)}`
      : normalizeExp(expRaw);
    const cvv = document.getElementById('cvv').value.trim();
    if (expInput) expInput.value = exp; // garante que a máscara apareça

    if (!clientId) {
      show('Faça login para salvar o cartão.', true);
      return;
    }
    if (!holderName || !cardNumber || !exp || !cvv) {
      show('Preencha todos os campos do cartão.', true);
      return;
    }
    const expParts = exp.split('/');
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
      show('Validade inválida (use MM/AA).', true);
      return;
    }
    const mm = Number(expParts[0]);
    const yy = Number(expParts[1]);
    if (Number.isNaN(mm) || mm < 1 || mm > 12) {
      show('Mês inválido na validade.', true);
      return;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      show('CVV inválido.', true);
      return;
    }
    const expiration_date = `${expParts[0]}${expParts[1]}`;

    try {
      const pagarmeLib = await waitForPagarme();
      show('Gerando token do cartão...');
      const client = await pagarmeLib.client.connect({ api_key: getPublicKey() });
      const card = await client.cards.create({
        holder_name: holderName,
        number: cardNumber,
        expiration_date,
        cvv
      });

      const cardToken = card.id;
      if (!cardToken) throw new Error('Token não retornado.');

      show('Enviando cartão para salvar...');
      const resp = await fetch('api/customer_save_card.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          card_token: cardToken
        })
      });
      const json = await resp.json();
      if (!json.success) {
        throw new Error(json.error || 'Erro ao salvar cartão.');
      }
      show(`Cartão salvo (${json.brand ?? ''} ****${json.last4 ?? ''}).`);
      await loadCards();
    } catch (err) {
      show(err.message || 'Erro ao salvar cartão.', true);
    }
  });
})();
