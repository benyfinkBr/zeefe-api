(() => {
  const modal = document.getElementById('paymentModal');
  const closeModal = document.getElementById('closeModal');
  const savePaymentClose = document.getElementById('savePaymentClose');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const form = document.getElementById('paymentForm');
  const statusEl = document.getElementById('status');

  const show = (msg, isError = false) => {
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#c00' : '#0a6';
  };

  const open = () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };

  closeModal?.addEventListener('click', close);
  savePaymentClose?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  btnOpenModal?.addEventListener('click', async () => {
    open();
    try { await loadCards(); } catch (err) { show(err.message, true); }
  });

  async function loadCards() {
    const clientId = Number(document.getElementById("clientId").value || 0);
    if (!clientId) return;

    const resp = await fetch(`api/customer_cards_list.php?client_id=${clientId}`);
    const json = await resp.json();
    if (!json.success) return;

    renderCards(json.cards || []);
    renderAddress(json.address || {});
  }

  function renderCards(cards) {
    const container = document.getElementById("existingCards");
    if (!cards.length) {
      container.innerHTML = "<p>Nenhum cartão salvo.</p>";
      return;
    }
    container.innerHTML = cards
      .map(c => `<div>${c.brand} ****${c.last4} (${c.exp_month}/${c.exp_year})</div>`)
      .join("");
  }

  function renderAddress(addr) {
    const el = document.getElementById("addressInfo");
    if (!addr.street) {
      el.innerHTML = "<p>Endereço não cadastrado.</p>";
      return;
    }
    el.innerHTML = `${addr.street}, ${addr.number} - ${addr.city}/${addr.state}`;
  }

  // TOKENIZAÇÃO OFICIAL Pagar.me
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    show("Gerando token...");

    try {
      const result = await PagarMeCheckout.tokenize(form);

      if (!result || !result.pagarmetoken) {
        show("Token não retornado pelo Pagar.me.", true);
        return;
      }

      const pagarmetoken = result.pagarmetoken;
      const clientId = Number(document.getElementById("clientId").value);

      show("Salvando cartão...");

      const resp = await fetch("api/customer_save_card.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          pagarmetoken
        })
      });

      const json = await resp.json();
      if (!json.success) {
        show(json.error || "Erro ao salvar cartão.", true);
        return;
      }

      show("Cartão salvo com sucesso!");
      await loadCards();
      setTimeout(close, 800);

    } catch (err) {
      console.error(err);
      show("Erro ao tokenizar o cartão.", true);
    }
  });
})();
