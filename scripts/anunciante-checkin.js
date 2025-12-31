const API_BASE = 'api';

const videoEl = document.getElementById('scannerVideo');
const checkinDetails = document.getElementById('checkinDetails');
const checkinCard = document.getElementById('checkinCard');
const confirmBtn = document.getElementById('confirmCheckin');
const denyBtn = document.getElementById('denyCheckin');
const manualCode = document.getElementById('manualCode');
const manualBtn = document.getElementById('manualCheckin');
const backBtn = document.getElementById('checkinBack');
const startCameraBtn = document.getElementById('startCamera');
const cameraStatus = document.getElementById('cameraStatus');
const cameraFileInput = document.getElementById('cameraFile');

const resultModal = document.getElementById('checkinResultModal');
const resultText = document.getElementById('checkinResultText');
const resultClose = document.getElementById('checkinResultClose');
const resultHome = document.getElementById('checkinResultHome');

let currentEnrollment = null;
let scanTimer = null;
let streamRef = null;
let cameraStarted = false;
const ua = navigator.userAgent || '';
const isIOS = /iPad|iPhone|iPod/i.test(ua);
const isEdge = /Edg/i.test(ua);
const isChrome = /Chrome|CriOS/i.test(ua) && !isEdge;
const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Edg/i.test(ua);
const supportsBarcodeDetector = 'BarcodeDetector' in window;
const supportsMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const isInApp = /FBAN|FBAV|Instagram|WhatsApp/i.test(ua);

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
  cameraStarted = false;
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
  if (!supportsMediaDevices) {
    if (cameraStatus) cameraStatus.textContent = 'Este navegador nao suporta camera.';
    showResult('Seu navegador nao suporta camera.');
    return;
  }
  if (!window.isSecureContext) {
    if (cameraStatus) cameraStatus.textContent = 'A camera precisa de HTTPS para funcionar.';
    showResult('A camera precisa de HTTPS para funcionar.');
    return;
  }
  try {
    if (cameraStatus) cameraStatus.textContent = 'Solicitando permissao da camera...';
    streamRef = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    videoEl.srcObject = streamRef;
    videoEl.muted = true;
    await videoEl.play();
    cameraStarted = true;
    if (!supportsBarcodeDetector) {
      let browserHint = 'Este navegador';
      if (isSafari) browserHint = 'Safari';
      if (isChrome) browserHint = 'Chrome';
      if (isEdge) browserHint = 'Edge';
      if (cameraStatus) cameraStatus.textContent = `${browserHint} nao suporta leitura automatica. Use o codigo manual.`;
      return;
    }
    if (cameraStatus) cameraStatus.textContent = 'Camera ativada. Aguardando QR Code...';
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    scanTimer = setInterval(async () => {
      if (videoEl.readyState < 2) return;
      const codes = await detector.detect(videoEl);
      if (codes && codes.length) {
        stopScanner();
        if (cameraStatus) cameraStatus.textContent = 'QR Code lido. Validando ingresso...';
        await lookupEnrollment(codes[0].rawValue);
      }
    }, 600);
  } catch (err) {
    if (cameraStatus) cameraStatus.textContent = 'Permissao de camera negada ou indisponivel.';
    showResult('Nao foi possivel acessar a camera.');
  }
}

async function decodeImageFile(file) {
  if (!file) return;
  if (!supportsBarcodeDetector) {
    showResult('Leitura de QR Code nao suportada. Digite o codigo manualmente.');
    return;
  }
  try {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const codes = await detector.detect(img);
    if (codes && codes.length) {
      await lookupEnrollment(codes[0].rawValue);
    } else {
      showResult('QR Code nao identificado. Tente novamente ou digite o codigo.');
    }
  } catch (err) {
    showResult('Nao foi possivel ler o QR Code da imagem.');
  } finally {
    cameraFileInput.value = '';
  }
}

manualBtn?.addEventListener('click', () => lookupEnrollment(manualCode?.value || ''));
startCameraBtn?.addEventListener('click', async () => {
  if (cameraStarted) {
    if (cameraStatus) cameraStatus.textContent = 'Camera ja ativada.';
    return;
  }
  await startScanner();
});
cameraFileInput?.addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  decodeImageFile(file);
});
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
      if (cameraStatus) {
        if (!supportsBarcodeDetector) {
          if (isSafari) {
            cameraStatus.textContent = 'Safari: toque em "Permitir camera" e use o codigo manual.';
          } else if (isChrome) {
            cameraStatus.textContent = 'Chrome: toque em "Permitir camera" e use o codigo manual.';
          } else if (isEdge) {
            cameraStatus.textContent = 'Edge: toque em "Permitir camera" e use o codigo manual.';
          } else {
            cameraStatus.textContent = 'Toque em "Permitir camera" e use o codigo manual.';
          }
        } else {
          cameraStatus.textContent = 'Toque em "Ativar camera" para iniciar.';
        }
        if (isIOS && isInApp) {
          cameraStatus.textContent = 'No iOS, abra este link no Safari para usar a camera.';
        }
        if (!window.isSecureContext) {
          cameraStatus.textContent = 'A camera so funciona em HTTPS. Abra o link seguro.';
        }
      }
      if (startCameraBtn) {
        startCameraBtn.textContent = supportsBarcodeDetector ? 'Ativar camera' : 'Permitir camera';
      }
      return;
    }
  } catch (err) {
    console.error('[Checkin] Falha ao carregar sessao', err);
  }
  window.location.href = 'anunciante-mobile.html';
}

loadSession();
