import { state } from './state.js';
import { simulation } from './simulation.js';
import { route } from './router.js';
import { renderHeader } from './components/header.js';
import { renderSidebar } from './components/sidebar.js';
import { renderBetslip } from './components/betslip.js';
import { renderSearchModal } from './components/searchModal.js';
import { getMaterialIcon } from './utils.js';

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
    
    const handleClose = (agreed) => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 250);
      
      yesBtn.removeEventListener('click', onYes);
      cancelBtn.removeEventListener('click', onCancel);
      
      if (agreed && onConfirm) {
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

// Renders the Mobile Bottom Navigation Bar
function renderMobileNavBar() {
  const container = document.getElementById('mobile-nav-bar');
  if (!container) return;

  const curPage = state.data.currentPage;
  const selections = state.data.betslip.selections;

  container.innerHTML = `
    <button class="mobile-nav-item ${curPage === 'home' ? 'active' : ''}" id="mobile-nav-home">
      ${getMaterialIcon('home')}
      <span>Home</span>
    </button>
    <button class="mobile-nav-item ${curPage === 'live' ? 'active' : ''}" id="mobile-nav-live">
      ${getMaterialIcon('live')}
      <span>Live</span>
    </button>
    
    <!-- Centered floating yellow betslip button (Betika style) -->
    <button class="mobile-nav-item betslip-center-btn" id="mobile-nav-betslip" aria-label="Betslip">
      ${getMaterialIcon('jackpot')}
      ${selections.length > 0 ? `<span class="mobile-betslip-badge-count">${selections.length}</span>` : ''}
    </button>

    <button class="mobile-nav-item ${curPage === 'my-bets' ? 'active' : ''}" id="mobile-nav-mybets">
      ${getMaterialIcon('history')}
      <span>My Bets</span>
    </button>
    <button class="mobile-nav-item ${curPage === 'profile' ? 'active' : ''}" id="mobile-nav-profile">
      ${getMaterialIcon('user')}
      <span>Profile</span>
    </button>
  `;

  // Bind Events
  document.getElementById('mobile-nav-home').addEventListener('click', () => state.setPage('home'));
  document.getElementById('mobile-nav-live').addEventListener('click', () => state.setPage('live'));
  document.getElementById('mobile-nav-mybets').addEventListener('click', () => state.setPage('my-bets'));
  document.getElementById('mobile-nav-profile').addEventListener('click', () => state.setPage('profile'));

  // Mobile slip sliding drawer toggle
  document.getElementById('mobile-nav-betslip').addEventListener('click', () => {
    const slip = document.getElementById('app-betslip');
    if (slip) {
      slip.classList.toggle('active');
    }
  });
}

// Bootstrap Application
function initApp() {
  simulation.start();

  renderHeader();
  renderSidebar();
  renderBetslip();
  renderMobileNavBar();
  renderSearchModal();
  route();

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

  state.subscribe('user', () => {
    renderHeader();
    // Refresh profile balance if currently active
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

  // Dynamic splash loader fade-out and removal
  setTimeout(() => {
    const loader = document.getElementById('app-splash-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.remove();
      }, 400);
    }
  }, 1500);

  console.log("BetPulse Sportsbook App successfully bootstrapped!");
}

document.addEventListener('DOMContentLoaded', initApp);
