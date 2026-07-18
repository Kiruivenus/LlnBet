import { state } from './state.js';
import { simulation } from './simulation.js';
import { route } from './router.js';
import { renderHeader } from './components/header.js';
import { renderSidebar } from './components/sidebar.js';
import { renderBetslip } from './components/betslip.js';
import { renderSearchModal } from './components/searchModal.js';
import { getMaterialIcon } from './utils.js';

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
    renderSidebar();
    renderMobileNavBar();
  });

  state.subscribe('activeSport', () => {
    route();
  });

  state.subscribe('betslip', () => {
    renderBetslip();
    renderMobileNavBar();
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

  console.log("BetPulse Sportsbook App successfully bootstrapped!");
}

document.addEventListener('DOMContentLoaded', initApp);
