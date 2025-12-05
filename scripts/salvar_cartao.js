<!-- TOKENIZECARD.JS — OBRIGATÓRIO, SEGUNDO A Pagar.me -->
<script src="https://checkout.pagar.me/v1/tokenizecard.js"
        data-pagarmecheckout-app-id="pk_test_RNoa2omHrUnZlGzK">
</script>

<script>
(() => {
  // ELEMENTOS DA UI
  const modal = document.getElementById('paymentModal');
  const closeModal = document.getElementById('closeModal');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const form = document.getElementById('paymentForm');
  const statusEl = document.getElementById('status');

  // ELEMENTOS DO SISTEMA
  const existingCardsEl = document.getElementById('existingCards');
  const addressInfoEl = document.getElementById('addressInfo');
  const cardsList = document.getElementById('cardsList');

  const show = (msg, isError = false) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#c00' : '#0a6';
  };

  // ABRIR / FECHAR MODAL
  const open = () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };

  closeModal?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  // Permite chamada externa: window.openPaymentModal()
  window.openPaymentModal = open;

  // -------------------------------------------------------------------------
  // RENDERIZAÇÃO DE CARTÕES E ENDEREÇOS
  // -------------------------------------------------------------------------
  const renderCards = (cards = []) => {
    if (!cards.length) {
      existingCardsEl.innerHTML = '<p>Nenhum cartão salvo.</p>';
      cardsList.innerHTML = '';
      return;
    }
    const list = cards.map(c =>
      `<div class="card-item"><span>${c.brand ?? ''} ****${c.last4 ?? ''} (${c.exp_month ?? ''}/${c.exp_year ?? ''})</span></div>`
    ).join('');
    existingCardsEl.innerHTML = `<h4>Cartões salvos</h4>${list}`;
    cardsList.innerHTML = `<h2>Cartões salvos</h2>${list}`;
  };

  const renderAddress = (addr) => {
    if (!addr) {
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

  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', async () => {
      open();
      try { await loadCards(); }
      catch (err) { show(err.message, true); }
    });
  }

  // -------------------------------------------------------------------------
  // TOKENIZECARD.JS — FLUXO OFICIAL
  // -------------------------------------------------------------------------
  function success(data) {
    const token = data.pagarmetoken;
    if (!token) {
      show("Falha ao tokenizar o cartão.", true);
      return false;
    }

    // Cria input hidden para enviar o token ao PHP
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "pagarmetoken";
    hidden.value = token;
    form.appendChild(hidden);

    return true; // permite continuar
  }

  function fail(error) {
    console.error(error);
    show("Erro ao processar o cartão.", true);
    return false;
  }

  // Inicializa o tokenizecard
  PagarmeCheckout.init(success, fail);

  // -------------------------------------------------------------------------
  // SUBMIT DO FORM — ENVIA TOKEN AO PHP
  // -------------------------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientId = Number(document.getElementById('clientId')?.value || 0);
    if (!clientId) {
      show("Cliente inválido.", true);
      return;
    }

    show("Processando cartão...");

    // O tokenizecard.js chamará success() automaticamente ao enviar o formulário.
    const tokenField = form.querySelector('input[name="pagarmetoken"]');
    if (!tokenField) {
      show("Token não gerado. Verifique os dados.", true);
      return;
    }

    // Envia para o back-end
    const resp = await fetch("api/customer_save_card.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        pagarmetoken: tokenField.value
      })
    });

    const json = await resp.json();
    if (!json.success) {
      show(json.error || "Erro ao salvar cartão.", true);
      return;
    }

    show(`Cartão salvo (${json.brand ?? ''} ****${json.last4 ?? ''}).`);

    // Atualiza lista de cartões
    try { await loadCards(); } catch (_) {}

    // Fecha modal depois de um tempo
    setTimeout(close, 900);
  });
})();
</script>