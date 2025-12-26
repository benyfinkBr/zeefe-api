( () => {
  const STORAGE_KEY = 'zeefeHeaderSession';
  const COOKIE_KEY = 'ZEEFE_HEADER_SESSION';
  const COOKIE_DOMAIN = location.hostname.endsWith('zeefe.com.br') ? '.zeefe.com.br' : location.hostname;
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
  let currentSession = readStoredSession();
  let menuOpen = false;
  let domRefs = null;

  function isHttps() {
    try {
      return window.location?.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function buildCookie(value) {
    const parts = [
      `${COOKIE_KEY}=${value ? encodeURIComponent(value) : ''}`,
      `Domain=${COOKIE_DOMAIN}`,
      'Path=/',
      'SameSite=Lax'
    ];
    if (value) {
      parts.push(`Max-Age=${COOKIE_MAX_AGE}`);
    } else {
      parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      parts.push('Max-Age=0');
    }
    if (isHttps()) {
      parts.push('Secure');
    }
    return parts.join('; ');
  }

  function readStoredSession() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      raw = null;
    }
    if (!raw) {
      const cookieValue = readCookie(COOKIE_KEY);
      raw = cookieValue || null;
    }
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return normalizeSession(parsed);
    } catch (_) {
      return null;
    }
  }

  function readCookie(name) {
    try {
      const entry = document.cookie.split('; ').find(item => item.startsWith(`${name}=`));
      if (!entry) return '';
      return decodeURIComponent(entry.split('=')[1]);
    } catch (_) {
      return '';
    }
  }

  function persistStoredSession(session) {
    try {
      const raw = session ? JSON.stringify(session) : null;
      document.cookie = buildCookie(raw);
    } catch (_) {}
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
  }

  function normalizeSession(session) {
    if (!session) return null;
    const type = session.type === 'advertiser' ? 'advertiser' : 'client';
    const name = session.name
      || session.label
      || session.display_name
      || session.full_name
      || session.email
      || '';
    return { type, name };
  }

  function renderHeader() {
    if (!domRefs) return;
    const {
      guestSection,
      accountSection,
      accountLabel,
      userLabel,
      portalBtn,
      simpleLoginBtn
    } = domRefs;
    const isLogged = Boolean(currentSession);

    if (guestSection) guestSection.hidden = isLogged;
    if (accountSection) accountSection.hidden = !isLogged;

    if (simpleLoginBtn && !accountSection && !guestSection) {
      if (!isLogged) {
        if (simpleLoginBtn.tagName === 'A' || simpleLoginBtn.tagName === 'BUTTON') {
          simpleLoginBtn.textContent = 'Entrar';
        }
        return;
      }
      const name = currentSession.name || 'Minha Conta';
      if (simpleLoginBtn.tagName === 'A' || simpleLoginBtn.tagName === 'BUTTON') {
        simpleLoginBtn.textContent = name;
      }
      return;
    }

    if (!isLogged) {
      setMenuState(false);
      if (accountLabel) accountLabel.textContent = 'Minha Conta';
      if (userLabel) userLabel.textContent = '';
      if (portalBtn) portalBtn.textContent = 'Ir para o Portal';
      return;
    }
    const typeLabel = currentSession.type === 'advertiser' ? 'Portal do Anunciante' : 'Portal do Cliente';
    if (accountLabel) accountLabel.textContent = currentSession.name || 'Minha Conta';
    if (userLabel) {
      userLabel.textContent = currentSession.name
        ? `${currentSession.name} · ${typeLabel}`
        : typeLabel;
    }
    if (portalBtn) {
      portalBtn.textContent = currentSession.type === 'advertiser'
        ? 'Ir para o Portal do Anunciante'
        : 'Ir para o Portal do Cliente';
    }
  }

  function setHeaderState(session, options = {}) {
    const normalized = normalizeSession(session);
    currentSession = normalized;
    if (!options.skipStorage) {
      persistStoredSession(normalized);
    }
    renderHeader();
  }

  function setMenuState(open) {
    menuOpen = Boolean(open);
    const { accountSection, accountBtn } = domRefs || {};
    if (accountSection) accountSection.classList.toggle('open', menuOpen);
    if (accountBtn) accountBtn.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
  }

  function _firstById(ids) {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  function _firstBySel(sels) {
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function initDom() {
    const guestSection =
      _firstBySel(['[data-zeefe-header="guest"]'])
      || _firstById(['homeHeaderGuest', 'headerGuest', 'siteHeaderGuest']);

    const accountSection =
      _firstBySel(['[data-zeefe-header="account"]'])
      || _firstById(['homeHeaderAccount', 'headerAccount', 'siteHeaderAccount']);

    const accountBtn =
      _firstBySel(['[data-zeefe-header-btn="account"]'])
      || _firstById(['homeHeaderAccountBtn', 'headerAccountBtn', 'siteHeaderAccountBtn']);

    const accountLabel =
      _firstBySel(['[data-zeefe-header-label="account"]'])
      || _firstById(['homeHeaderAccountLabel', 'headerAccountLabel', 'siteHeaderAccountLabel']);

    const userLabel =
      _firstBySel(['[data-zeefe-header-label="user"]'])
      || _firstById(['homeHeaderUserLabel', 'headerUserLabel', 'siteHeaderUserLabel']);

    const portalBtn =
      _firstBySel(['[data-zeefe-header-btn="portal"]'])
      || _firstById(['homeHeaderPortal', 'headerPortal', 'siteHeaderPortal']);

    const logoutBtn =
      _firstBySel(['[data-zeefe-header-btn="logout"]'])
      || _firstById(['homeHeaderLogout', 'headerLogout', 'siteHeaderLogout']);

    const simpleLoginBtn =
      _firstBySel(['[data-zeefe-header-btn="login"]'])
      || _firstById(['headerLoginBtn', 'homeHeaderLoginBtn'])
      || _firstBySel(['header a.btn-primary', 'header a.button-primary', 'header a[href*="login"]', 'header button']);

    domRefs = {
      guestSection,
      accountSection,
      accountBtn,
      accountLabel,
      userLabel,
      portalBtn,
      logoutBtn,
      simpleLoginBtn
    };
  }

  function setupMenuEvents() {
    if (!domRefs) return;
    const { accountBtn, accountSection, portalBtn, logoutBtn } = domRefs;
    accountBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      setMenuState(!menuOpen);
    });
    document.addEventListener('click', (event) => {
      if (!menuOpen) return;
      if (accountBtn && (event.target === accountBtn || accountBtn.contains(event.target))) return;
      if (accountSection && accountSection.contains(event.target)) return;
      setMenuState(false);
    });
    portalBtn?.addEventListener('click', () => {
      if (!currentSession) return;
      const destino = currentSession.type === 'advertiser' ? 'anunciante.html' : 'clientes.html';
      window.location.href = destino;
    });
    logoutBtn?.addEventListener('click', async () => {
      await performLogout();
      setMenuState(false);
    });
  }

  async function fetchJson(url) {
    try {
      const res = await fetch(url, { credentials: 'include' });
      return await res.json();
    } catch (_) {
      return null;
    }
  }

  async function hydrateSession() {
    const client = await fetchJson('/api/client_session.php');
    if (client?.success && client.client) {
      setHeaderState({
        type: 'client',
        name: client.client.name || client.client.login || 'Cliente'
      });
      renderHeader();
      return;
    }

    const advertiser = await fetchJson('/api/advertiser_session.php');
    if (advertiser?.success && advertiser.advertiser) {
      setHeaderState({
        type: 'advertiser',
        name: advertiser.advertiser.display_name
          || advertiser.advertiser.full_name
          || advertiser.advertiser.email
          || 'Anunciante'
      });
      renderHeader();
      return;
    }

    setHeaderState(currentSession, { skipStorage: true });
    renderHeader();
  }

  async function performLogout() {
    if (!currentSession) {
      persistStoredSession(null);
      return;
    }
    const endpoint = currentSession.type === 'advertiser'
      ? '/api/advertiser_logout.php'
      : '/api/apilogout.php';
    try {
      await fetch(endpoint, { credentials: 'include' });
    } catch (_) {}
    try {
      if (currentSession.type === 'client') {
        localStorage.removeItem('portalRememberToken');
      } else {
        localStorage.removeItem('advRememberToken');
      }
    } catch (_) {}
    setHeaderState(null);
  }

  function initDom() {
    const guestSection = getHeaderElement('guest', 'homeHeaderGuest', 'portalHeaderGuest', 'headerGuest', 'clientHeaderGuest', 'advHeaderGuest');
    const accountSection = getHeaderElement('account', 'homeHeaderAccount', 'portalHeaderAccount', 'headerAccount', 'clientHeaderAccount', 'advHeaderAccount');

    if (!guestSection && !accountSection) {
      domRefs = null;
      return;
    }

    domRefs = {
      guestSection,
      accountSection,
      accountBtn: getHeaderElement('account-btn', 'homeHeaderAccountBtn', 'portalHeaderAccountBtn', 'headerAccountBtn', 'accountMenuBtn', 'clientHeaderAccountBtn', 'advHeaderAccountBtn'),
      accountMenu: getHeaderElement('account-menu', 'homeHeaderAccountMenu', 'portalHeaderAccountMenu', 'headerAccountMenu', 'clientHeaderAccountMenu', 'advHeaderAccountMenu'),
      accountLabel: getHeaderElement('account-label', 'homeHeaderAccountLabel', 'portalHeaderAccountLabel', 'headerAccountLabel', 'clientHeaderAccountLabel', 'advHeaderAccountLabel'),
      userLabel: getHeaderElement('user-label', 'homeHeaderUserLabel', 'portalHeaderUserLabel', 'headerUserLabel', 'clientHeaderUserLabel', 'advHeaderUserLabel'),
      portalBtn: getHeaderElement('portal', 'homeHeaderPortal', 'portalHeaderPortal', 'headerPortal', 'clientHeaderPortal', 'advHeaderPortal'),
      logoutBtn: getHeaderElement('logout', 'homeHeaderLogout', 'portalHeaderLogout', 'headerLogout', 'clientHeaderLogout', 'advHeaderLogout')
    };
  }

  const api = {
    persistSession(data) {
      if (!data) return;
      setHeaderState(data);
    },
    clearSession() {
      setHeaderState(null);
    },
    getSession() {
      return currentSession;
    }
  };

  window.ZEEFE_HEADER = api;

  document.addEventListener('DOMContentLoaded', async () => {
    initDom();
    renderHeader();
    setupMenuEvents();
    await hydrateSession();
    renderHeader();
  });
})();
