(() => {
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('btnSave');

  const show = (msg, isError = false) => {
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#c00' : '#0a6';
  };

  const getPublicKey = () => {
    // Public key usada apenas para tokenizar no navegador
    return 'pk_test_RNoa2omHrUnZlGzK';
  };

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    show('Gerando token do cartão...');
    const clientId = Number(document.getElementById('clientId').value || 0);
    const holderName = document.getElementById('holderName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, '');
    const exp = document.getElementById('exp').value.replace(/\s+/g, '');
    const cvv = document.getElementById('cvv').value.trim();

    if (!clientId || !holderName || !cardNumber || !exp || !cvv) {
      show('Preencha todos os campos.', true);
      return;
    }
    const expParts = exp.split('/');
    if (expParts.length !== 2) {
      show('Validade inválida (use MM/AA).', true);
      return;
    }
    const expiration_date = `${expParts[0]}${expParts[1]}`;

    try {
      const client = await pagarme.client.connect({ api_key: getPublicKey() });
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
    } catch (err) {
      show(err.message || 'Erro ao salvar cartão.', true);
    }
  });
})();
