const API_BASE = 'api';

const videoEl = document.getElementById('scannerVideo');
const checkinDetails = document.getElementById('checkinDetails');
const checkinCard = document.getElementById('checkinCard');
const confirmBtn = document.getElementById('confirmCheckin');
const denyBtn = document.getElementById('denyCheckin');
const manualCode = document.getElementById('manualCode');
const manualBtn = document.getElementById('manualCheckin');
const backBtn = document.getElementById('checkinBack');

const resultModal = document.getElementById('checkinResultModal');
const resultText = document.getElementById('checkinResultText');
const resultClose = document.getElementById('checkinResultClose');
const resultHome = document.getElementById('checkinResultHome');

let currentEnrollment = null;
let scanTimer = null;
let streamRef = null;

function showResult(message) {
  if (resultText) resultText.textContent = message;
  resultModal?.classList.add('show');
  resultModal?.setAttribute('aria-hidden', 'false');
}

function closeResult() {
  resultModal?.classList.remove('show');
  resultModal?.setAttribute('aria-hidden', 'true');
}

function stopScanner() {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  if (streamRef) {
    streamRef.getTracks().forEach(track => track.stop());
    streamRef = null;
  }
}

function parseCode(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  try {
    if (trimmed.includes('code=')) {
      const url = new URL(trimmed);
      return (url.searchParams.get('code') || '').trim();
    }
  } catch (err) {
    // Ignora se nao for URL valida
  }
  return trimmed.replace(/[^A-Za-z0-9]/g, '');
}

function renderEnrollmentCard(data) {
  if (!checkinCard || !checkinDetails) return;
  checkinCard.innerHTML = `
    <strong>${data.participant_name || 'Convidado'}</strong>
    <div class="mobile-muted">CPF: ${data.participant_cpf || '--'}</div>
    <div class="mobile-muted">E-mail: ${data.participant_email || '--'}</div>
    <div class="mobile-muted">Telefone: ${data.participant_phone || '--'}</div>
    <div class="mobile-muted">Workshop: ${data.workshop_title || '--'}</div>
    <div class="mobile-muted">Data: ${data.workshop_date || '--'} ${data.workshop_time || ''}</div>
  `;
  checkinDetails.removeAttribute('hidden');
}

async function lookupEnrollment(code) {
  const cleaned = parseCode(code);
  if (!cleaned) {
    showResult('Informe um codigo valido.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/workshop_checkin_lookup.php?code=${encodeURIComponent(cleaned)}`, { credentials: 'include' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Ingresso nao encontrado.');
    currentEnrollment = json.data;
    renderEnrollmentCard(json.data);
  } catch (err) {
    showResult(err.message || 'Erro ao validar ingresso.');
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
    if (!json.success) throw new Error(json.error || 'Falha ao registrar check-in.');
    showResult(action === 'confirm' ? 'Check-in confirmado com sucesso.' : 'Check-in negado.');
  } catch (err) {
    showResult(err.message || 'Erro ao registrar check-in.');
  }
}

async function startScanner() {
  if (!videoEl) return;
  if (!('mediaDevices' in navigator)) {
    showResult('Seu navegador nao suporta camera.');
    return;
  }
  if (!('BarcodeDetector' in window)) {
    showResult('Leitura de QR Code nao suportada. Digite o codigo manualmente.');
    return;
  }
  try {
    streamRef = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    videoEl.srcObject = streamRef;
    await videoEl.play();
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    scanTimer = setInterval(async () => {
      if (videoEl.readyState < 2) return;
      const codes = await detector.detect(videoEl);
      if (codes && codes.length) {
        stopScanner();
        await lookupEnrollment(codes[0].rawValue);
      }
    }, 600);
  } catch (err) {
    showResult('Nao foi possivel acessar a camera.');
  }
}

manualBtn?.addEventListener('click', () => lookupEnrollment(manualCode?.value || ''));
confirmBtn?.addEventListener('click', () => updateCheckin('confirm'));
denyBtn?.addEventListener('click', () => updateCheckin('deny'));
resultClose?.addEventListener('click', closeResult);
resultHome?.addEventListener('click', () => { window.location.href = 'anunciante-mobile.html'; });
resultModal?.addEventListener('click', (event) => { if (event.target === resultModal) closeResult(); });
backBtn?.addEventListener('click', () => { window.location.href = 'anunciante-mobile.html'; });

async function loadSession() {
  try {
    const res = await fetch(`${API_BASE}/advertiser_session.php`, { credentials: 'include' });
    const json = await res.json();
    if (json.success && json.advertiser) {
      await startScanner();
      return;
    }
  } catch (err) {
    console.error('[Checkin] Falha ao carregar sessao', err);
  }
  window.location.href = 'anunciante-mobile.html';
}

loadSession();
