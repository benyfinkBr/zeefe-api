document.addEventListener('DOMContentLoaded', () => {
  const guestSection = document.getElementById('homeHeaderGuest');
  const accountSection = document.getElementById('homeHeaderAccount');
  if (!guestSection && !accountSection) {
    return;
  }

  const accountBtn = document.getElementById('homeHeaderAccountBtn');
  const accountMenu = document.getElementById('homeHeaderAccountMenu');
  const accountLabel = document.getElementById('homeHeaderAccountLabel');
  const userLabel = document.getElementById('homeHeaderUserLabel');
  const portalBtn = document.getElementById('homeHeaderPortal');
  const logoutBtn = document.getElementById('homeHeaderLogout');

  let currentSession = null;
  let menuOpen = false;

  function setMenuState(open) {
    menuOpen = Boolean(open);
    if (accountSection) {
      accountSection.classList.toggle('open', menuOpen);
    }
    if (accountBtn) {
      accountBtn.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    }
  }

  function setupMenuEvents() {
    if (accountBtn) {
      accountBtn.addEventListener('click', (event) => {
        event.preventDefault();
        setMenuState(!menuOpen);
      });
    }
    document.addEventListener('click', (event) => {
      if (!menuOpen) return;
      if (!accountSection || accountSection.contains(event.target)) return;
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
    const client = await fetchJson('api/client_session.php');
    if (client?.success && client.client) {
      setHeaderState({
        type: 'client',
        name: client.client.name || 'Cliente'
      });
      return;
    }
    const advertiser = await fetchJson('api/advertiser_session.php');
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
    setHeaderState(null);
  }

  function setHeaderState(session) {
    currentSession = session;
    const isLogged = Boolean(session);
    if (guestSection) guestSection.hidden = isLogged;
    if (accountSection) accountSection.hidden = !isLogged;
    if (!isLogged) {
      setMenuState(false);
      if (accountLabel) accountLabel.textContent = 'Minha Conta';
      if (userLabel) userLabel.textContent = '';
      return;
    }
    const typeLabel = session.type === 'advertiser' ? 'Portal do Anunciante' : 'Portal do Cliente';
    if (accountLabel) accountLabel.textContent = session.name || 'Minha Conta';
    if (userLabel) userLabel.textContent = session.name ? `${session.name} · ${typeLabel}` : typeLabel;
    if (portalBtn) {
      portalBtn.textContent = session.type === 'advertiser'
        ? 'Ir para o Portal do Anunciante'
        : 'Ir para o Portal do Cliente';
    }
  }

  async function performLogout() {
    if (!currentSession) return;
    const endpoint = currentSession.type === 'advertiser'
      ? 'api/advertiser_logout.php'
      : 'api/apilogout.php';
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

  setupMenuEvents();
  hydrateSession();
});
