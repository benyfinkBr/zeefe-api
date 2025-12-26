( () => {
  const STORAGE_KEY = 'zeefeHeaderSession';
  const COOKIE_KEY = 'ZEEFE_HEADER_SESSION';
  let currentSession = readStoredSession();
  let menuOpen = false;
  let domRefs = null;

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
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
    try {
      if (session) {
        document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      } else {
        document.cookie = `${COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
    const { guestSection, accountSection, accountLabel, userLabel, portalBtn } = domRefs;
    const isLogged = Boolean(currentSession);
    if (guestSection) guestSection.hidden = isLogged;
    if (accountSection) accountSection.hidden = !isLogged;
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
    if (accountSection) {
      accountSection.classList.toggle('open', menuOpen);
    }
    if (accountBtn) {
      accountBtn.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    }
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
      if (accountSection?.contains(event.target)) return;
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
    const hadLocalSession = Boolean(currentSession);
    const client = await fetchJson('/api/client_session.php');
    if (client?.success && client.client) {
      setHeaderState({
        type: 'client',
        name: client.client.name || client.client.login || 'Cliente'
      });
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
      return;
    }
    if (!hadLocalSession) {
      setHeaderState(null);
    }
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
    const guestSection = document.getElementById('homeHeaderGuest');
    const accountSection = document.getElementById('homeHeaderAccount');
    if (!guestSection && !accountSection) {
      domRefs = null;
      return;
    }
    domRefs = {
      guestSection,
      accountSection,
      accountBtn: document.getElementById('homeHeaderAccountBtn'),
      accountMenu: document.getElementById('homeHeaderAccountMenu'),
      accountLabel: document.getElementById('homeHeaderAccountLabel'),
      userLabel: document.getElementById('homeHeaderUserLabel'),
      portalBtn: document.getElementById('homeHeaderPortal'),
      logoutBtn: document.getElementById('homeHeaderLogout')
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

  document.addEventListener('DOMContentLoaded', () => {
    initDom();
    if (domRefs) {
      renderHeader();
      setupMenuEvents();
    } else {
      setMenuState(false);
    }
    hydrateSession();
  });
})();
