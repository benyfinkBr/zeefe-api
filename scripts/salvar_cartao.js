(() => {
  console.log("PagarmeCheckout carregado?", window.PagarmeCheckout);
  if (typeof PagarmeCheckout !== "undefined") {
    if (typeof PagarmeCheckout.setDebug === "function") {
      PagarmeCheckout.setDebug(true);
      console.log("Pagarme DEBUG ativado");
    }
    PagarmeCheckout.init?.(
      () => console.log("PagarmeCheckout init ok"),
      (err) => console.error("Erro ao inicializar PagarmeCheckout", err)
    );
  } else {
    console.error("PagarmeCheckout NÃO carregou!");
  }

  const modal = document.getElementById('paymentModal');
  const closeModal = document.getElementById('closeModal');
  const savePaymentClose = document.getElementById('savePaymentClose');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const form = document.getElementById('paymentForm');
  const statusEl = document.getElementById('status');

  const show = (m, e=false) => {
    statusEl.textContent = m;
    statusEl.style.color = e ? '#c00' : '#0a6';
  };

  const open = () => { modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); };
  const close = () => { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); };

  closeModal?.addEventListener('click', close);
  savePaymentClose?.addEventListener('click', close);
  modal?.addEventListener('click', e => { if (e.target === modal) close(); });

  btnOpenModal?.addEventListener('click', async () => {
    open();
    try { await loadCards(); } catch(e){ show(e.message,true); }
  });

  function validateSetup() {
    const elemCount = document.querySelectorAll("[data-pagarmecheckout-element]").length;
    console.log("Total data-pagarmecheckout-element:", elemCount);
    if (elemCount !== 5) {
      show("Campos de cartão ausentes ou extras.", true);
      return false;
    }
    if (!form || form.querySelectorAll("[data-pagarmecheckout-element]").length !== 5) {
      show("Inputs devem estar dentro do form.", true);
      return false;
    }
    if (typeof PagarmeCheckout !== "object") {
      show("PagarmeCheckout indisponível.", true);
      return false;
    }
    if (location.protocol === "file:") {
      show("Abra em http(s), não file://", true);
      return false;
    }
    return true;
  }

  async function loadCards() {
    const id = Number(document.getElementById("clientId").value || 0);
    if (!id) return;

    const resp = await fetch(`api/customer_cards_list.php?client_id=${id}`);
    const json = await resp.json();

    if (!json.success) return;

    renderCards(json.cards || []);
    renderAddress(json.address || {});
  }

  function renderCards(cards){
    const container = document.getElementById("existingCards");
    if (!cards.length) {
      container.innerHTML = "<p>Nenhum cartão salvo.</p>";
      return;
    }
    container.innerHTML = cards.map(c =>
      `<div>${c.brand} ****${c.last4} (${c.exp_month}/${c.exp_year})</div>`
    ).join("");
  }

  function renderAddress(a){
    const el = document.getElementById("addressInfo");
    if (!a.street){
      el.innerHTML = "<p>Endereço não cadastrado.</p>";
      return;
    }
    el.innerHTML = `${a.street}, ${a.number} - ${a.city}/${a.state}`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    show("Gerando token...");

    if (!validateSetup()) return;

    if (typeof PagarmeCheckout === "undefined") {
      show("tokenizecard.js não carregou", true);
      return;
    }

    const required = [
      "#holderName",
      "#cardNumber",
      "#expMonth",
      "#expYear",
      "#cvv"
    ];

    for (const sel of required){
      const field = document.querySelector(sel);
      if (!field){
        show("Campo obrigatório ausente: " + sel, true);
        return;
      }
      if (!String(field.value || "").trim()) {
        show("Preencha o campo: " + sel, true);
        field.focus();
        return;
      }
    }

    let pagarmetoken = event.detail?.token || event.detail?.pagarmetoken;
    if (!pagarmetoken && typeof PagarmeCheckout.tokenize === "function") {
      try {
        const result = await PagarmeCheckout.tokenize(form);
        console.log("RESULTADO TOKEN:", result);
        pagarmetoken = result?.pagarmetoken || result?.token || result?.id;
      } catch (err) {
        console.error("ERRO TOKENIZAÇÃO:", err);
        show("Erro ao tokenizar o cartão", true);
        return;
      }
    }

    if (typeof pagarmetoken === "undefined") {
      show("Token não retornado pelo Pagar.me", true);
      return;
    }

    const clientId = Number(document.getElementById("clientId").value);

    show("Salvando cartão...");

    try {
      const resp = await fetch("api/customer_save_card.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, pagarmetoken })
      });

      const json = await resp.json();

      if (!json.success){
        show(json.error || "Erro ao salvar cartão.", true);
        return;
      }

      show("Cartão salvo!");
      await loadCards();
      setTimeout(close, 1000);

    } catch(err){
      console.error("ERRO AO SALVAR CARTÃO:", err);
      show("Erro ao salvar cartão.", true);
    }
  });

  // Checagens iniciais automáticas
  validateSetup();
})();
