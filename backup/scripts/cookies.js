// Simple cookie consent banner handler
// Shows a small banner until the user accepts or dismisses it.

(function () {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  const acceptBtn = document.getElementById('cookieAccept');
  const dismissBtn = document.getElementById('cookieDismiss');

  const STORAGE_KEY = 'cookieConsentAccepted';
  const DISMISS_KEY = 'cookieConsentDismissedSession';

  function hasAccepted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function hasDismissedThisSession() {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function showBanner() {
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
  }

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    hideBanner();
  }

  function dismiss() {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (_) {}
    hideBanner();
  }

  if (!hasAccepted() && !hasDismissedThisSession()) {
    showBanner();
  }

  acceptBtn && acceptBtn.addEventListener('click', accept);
  dismissBtn && dismissBtn.addEventListener('click', dismiss);
})();

