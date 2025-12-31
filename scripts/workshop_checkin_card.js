const API_BASE = 'api';

const cardStatus = document.getElementById('cardStatus');
const cardStatusText = document.getElementById('cardStatusText');
const cardDetails = document.getElementById('cardDetails');
const cardInfo = document.getElementById('cardInfo');
const cardConfirm = document.getElementById('cardConfirm');
const cardDeny = document.getElementById('cardDeny');
const cardBack = document.getElementById('cardBack');

const resultModal = document.getElementById('cardResultModal');
const resultText = document.getElementById('cardResultText');
const resultClose = document.getElementById('cardResultClose');
const resultHome = document.getElementById('cardResultHome');

let currentEnrollment = null;

function showResult(message) {
  if (resultText) resultText.textContent = message;
  resultModal?.classList.add('show');
  resultModal?.setAttribute('aria-hidden', 'false');
}

function closeResult() {
  resultModal?.classList.remove('show');
  resultModal?.setAttribute('aria-hidden', 'true');
}

function setStatus(text) {
  if (cardStatusText) cardStatusText.textContent = text;
}

function renderCard(data) {
  if (!cardInfo || !cardDetails) return;
  cardInfo.innerHTML = `
    <strong>${data.participant_name || 'Convidado'}</strong>
    <div class="mobile-muted">CPF: ${data.participant_cpf || '--'}</div>
    <div class="mobile-muted">E-mail: ${data.participant_email || '--'}</div>
    <div class="mobile-muted">Telefone: ${data.participant_phone || '--'}</div>
    <div class="mobile-muted">Workshop: ${data.workshop_title || '--'}</div>
    <div class="mobile-muted">Data: ${data.workshop_date || '--'} ${data.workshop_time || ''}</div>
  `;
  cardDetails.hidden = false;
}

async function loadSessionAndCard(code) {
  try {
    const res = await fetch(`${API_BASE}/advertiser_session.php`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success || !json.advertiser) {
      window.location.href = `anunciante-mobile.html?redirect=card&code=${encodeURIComponent(code)}`;
      return;
    }
  } catch (err) {
    window.location.href = `anunciante-mobile.html?redirect=card&code=${encodeURIComponent(code)}`;
    return;
  }

  setStatus('Validando ingresso...');
  try {
    const lookup = await fetch(`${API_BASE}/workshop_checkin_lookup.php?code=${encodeURIComponent(code)}`, { credentials: 'include' });
    const json = await lookup.json();
    if (!json.success) throw new Error(json.error || 'Ingresso nao encontrado.');
    currentEnrollment = json.data;
    setStatus('Ingresso encontrado. Valide o documento com foto.');
    renderCard(currentEnrollment);
  } catch (err) {
    setStatus(err.message || 'Erro ao validar ingresso.');
  }
}

async function updateCheckin(action) {
  if (!currentEnrollment) return;
  try {
    const res = await fetch(`${API_BASE}/workshop_checkin_update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ enrollment_id: currentEnrollment.id, action })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao registrar.');
    showResult(action === 'confirm' ? 'Participacao confirmada.' : 'Participacao negada.');
  } catch (err) {
    showResult(err.message || 'Erro ao registrar.');
  }
}

function getCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('code') || '').trim();
}

cardConfirm?.addEventListener('click', () => updateCheckin('confirm'));
cardDeny?.addEventListener('click', () => updateCheckin('deny'));
cardBack?.addEventListener('click', () => { window.location.href = 'anunciante-mobile.html'; });
resultClose?.addEventListener('click', closeResult);
resultHome?.addEventListener('click', () => { window.location.href = 'anunciante-mobile.html'; });
resultModal?.addEventListener('click', (event) => { if (event.target === resultModal) closeResult(); });

const code = getCodeFromUrl();
if (!code) {
  setStatus('Codigo nao informado.');
} else {
  loadSessionAndCard(code);
}
