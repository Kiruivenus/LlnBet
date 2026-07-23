import { state } from './state.js';
import { simulation } from './simulation.js';
import { route } from './router.js';
import { renderHeader } from './components/header.js';
import { renderSidebar } from './components/sidebar.js';
import { renderBetslip } from './components/betslip.js';
import { renderMobileNavBar } from './components/mobileDrawer.js';
import { renderSearchModal } from './components/searchModal.js';

// Load theme preference on boot
const savedTheme = localStorage.getItem('llnbet_theme') || 'light';
if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
} else {
  document.body.classList.remove('light-theme');
}

// Helper to hide splash loader safely
function hideSplashLoader() {
  const loader = document.getElementById('app-splash-loader') || document.getElementById('splash-loader') || document.querySelector('.splash-loader-overlay');
  if (loader) {
    loader.classList.add('hidden');
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  }
}

// Global Custom Alert Monkey-patching
const originalAlert = window.alert;
window.alert = function(message) {
  const overlay = document.getElementById('betpulse-alert-modal');
  const msgEl = document.getElementById('betpulse-alert-message');
  const okBtn = document.getElementById('betpulse-alert-ok-btn');
  
  if (overlay && msgEl && okBtn) {
    msgEl.textContent = message;
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);
    
    const handleClose = () => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 250);
      okBtn.removeEventListener('click', handleClose);
    };
    okBtn.addEventListener('click', handleClose);
  } else {
    originalAlert(message);
  }
};

// Global Custom Async Confirm Dialog
window.showConfirm = function(message, onConfirm) {
  const overlay = document.getElementById('betpulse-confirm-modal');
  const msgEl = document.getElementById('betpulse-confirm-message');
  const yesBtn = document.getElementById('betpulse-confirm-yes-btn');
  const cancelBtn = document.getElementById('betpulse-confirm-cancel-btn');

  if (overlay && msgEl && yesBtn && cancelBtn) {
    msgEl.textContent = message;
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);

    const handleClose = (confirmed) => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 250);
      yesBtn.removeEventListener('click', onYes);
      cancelBtn.removeEventListener('click', onCancel);
      if (confirmed && onConfirm) {
        onConfirm();
      }
    };
    
    const onYes = () => handleClose(true);
    const onCancel = () => handleClose(false);
    
    yesBtn.addEventListener('click', onYes);
    cancelBtn.addEventListener('click', onCancel);
  } else {
    if (window.confirm(message)) {
      onConfirm();
    }
  }
};

// Bootstrap Application
async function initApp() {
  simulation.start();

  // Parse initial browser URL pathname for direct deep links (e.g. /match/:id)
  const initialPath = window.location.pathname;
  if (initialPath.startsWith('/match/')) {
    const id = initialPath.replace('/match/', '');
    state.data.currentPage = 'match-details';
    state.data.selectedMatchId = id;
  } else if (initialPath === '/live') {
    state.data.currentPage = 'live';
  } else if (initialPath === '/my-bets') {
    state.data.currentPage = 'my-bets';
  } else if (initialPath === '/profile') {
    state.data.currentPage = 'profile';
  } else if (initialPath === '/login') {
    state.data.currentPage = 'login';
  } else if (initialPath === '/register') {
    state.data.currentPage = 'register';
  } else if (initialPath === '/promotions') {
    state.data.currentPage = 'promotions';
  } else if (initialPath === '/admin') {
    state.data.currentPage = 'admin';
  }

  // Wait for state session restoration to finish before initial routing
  try {
    await state.sessionPromise;
  } catch (err) {
    console.warn('Session restoration warning:', err);
  }

  renderHeader();
  renderSidebar();
  renderBetslip();
  renderMobileNavBar();
  renderSearchModal();
  route();

  // Hide splash loader overlay
  hideSplashLoader();

  state.subscribe('currentPage', () => {
    route();
    renderHeader();
    renderSidebar();
    renderMobileNavBar();
  });

  state.subscribe('activeSport', () => {
    route();
  });

  state.subscribe('betslip', () => {
    renderBetslip();
    renderMobileNavBar();
    route();
  });

  state.subscribe('theme', () => {
    renderHeader();
    renderSidebar();
    renderBetslip();
  });

  state.subscribe('user', () => {
    renderHeader();
    if (state.data.currentPage === 'profile') {
      route();
    }
  });

  state.subscribe('matches', () => {
    const cur = state.data.currentPage;
    if (cur === 'home' || cur === 'live' || cur === 'match-details') {
      route();
    }
  });

  // Browser Popstate Back/Forward History Listener
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) {
      state.data.currentPage = e.state.page;
      state.data.selectedMatchId = e.state.matchId || null;
      route();
      renderHeader();
      renderSidebar();
      renderMobileNavBar();
    } else {
      const path = window.location.pathname;
      if (path.startsWith('/match/')) {
        const id = path.replace('/match/', '');
        state.data.currentPage = 'match-details';
        state.data.selectedMatchId = id;
      } else if (path === '/live') {
        state.data.currentPage = 'live';
      } else if (path === '/my-bets') {
        state.data.currentPage = 'my-bets';
      } else if (path === '/profile') {
        state.data.currentPage = 'profile';
      } else {
        state.data.currentPage = 'home';
      }
      route();
      renderHeader();
      renderSidebar();
      renderMobileNavBar();
    }
  });

  // Keyboard Navigation shortcut (Cmd+K for search)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchModal = document.getElementById('search-modal');
      if (searchModal) {
        searchModal.classList.add('active');
        const input = searchModal.querySelector('input');
        if (input) input.focus();
      }
    }
  });
}

// Start application after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Fallback safety timeout to ensure splash screen is never stuck
setTimeout(hideSplashLoader, 800);
