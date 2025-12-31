const API_BASE = 'api';

const loginOverlay = document.getElementById('mobileLoginOverlay');
const loginForm = document.getElementById('mobileLoginForm');
const loginError = document.getElementById('mobileLoginError');
const loginIdInput = document.getElementById('mobileLoginId');
const loginPwInput = document.getElementById('mobileLoginPw');
const loginRemember = document.getElementById('mobileRemember');
const actionsSection = document.getElementById('mobileActions');
const welcomeCard = document.getElementById('mobileWelcome');
const welcomeText = document.getElementById('mobileWelcomeText');
const logoutBtn = document.getElementById('mobileLogout');
const urlParams = new URLSearchParams(window.location.search);
const redirectTarget = urlParams.get('redirect');
const redirectWorkshopId = urlParams.get('workshop_id');

function maybeRedirectAfterLogin() {
  if (redirectTarget === 'convidados' && redirectWorkshopId) {
    window.location.href = `anunciante-convidados.html?workshop_id=${encodeURIComponent(redirectWorkshopId)}`;
    return true;
  }
  return false;
}

function showLogin() {
  loginOverlay?.classList.add('show');
  loginOverlay?.setAttribute('aria-hidden', 'false');
  actionsSection?.setAttribute('hidden', 'true');
  welcomeCard?.setAttribute('hidden', 'true');
  logoutBtn?.setAttribute('hidden', 'true');
}

function showLoggedIn(adv) {
  if (maybeRedirectAfterLogin()) return;
  loginOverlay?.classList.remove('show');
  loginOverlay?.setAttribute('aria-hidden', 'true');
  actionsSection?.removeAttribute('hidden');
  welcomeCard?.removeAttribute('hidden');
  logoutBtn?.removeAttribute('hidden');
  if (welcomeText) {
    const name = adv?.display_name || adv?.full_name || 'Anunciante';
    welcomeText.textContent = `Ola, ${name}`;
  }
}

async function loadSession() {
  try {
    const res = await fetch(`${API_BASE}/advertiser_session.php`, { credentials: 'include' });
    const json = await res.json();
    if (json.success && json.advertiser) {
      showLoggedIn(json.advertiser);
      return;
    }
  } catch (err) {
    console.error('[Mobile Adv] Falha ao carregar sessao', err);
  }
  showLogin();
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (loginError) loginError.textContent = '';
  const login = (loginIdInput?.value || '').trim();
  const password = loginPwInput?.value || '';
  if (!login || !password) {
    if (loginError) loginError.textContent = 'Informe login e senha.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/advertiser_login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ login, password, remember: !!loginRemember?.checked })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Falha no login.');
    }
    showLoggedIn(json.advertiser);
  } catch (err) {
    if (loginError) loginError.textContent = err.message || 'Erro ao entrar.';
  }
});

logoutBtn?.addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/apilogout.php`, { credentials: 'include' });
  } catch (err) {
    console.error('[Mobile Adv] Falha ao sair', err);
  }
  showLogin();
});

loadSession();
