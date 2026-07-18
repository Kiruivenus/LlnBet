import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderHeader() {
  const container = document.getElementById('app-header');
  if (!container) return;

  const userData = state.data.user;

  container.innerHTML = `
    <!-- Brand / Logo -->
    <a href="#" class="brand" id="header-brand-logo">
      <div class="brand-logo">P</div>
      <div class="brand-name">Bet<span>Pulse</span></div>
    </a>

    <!-- Global Search Trigger -->
    <div class="header-center">
      <button class="search-trigger" id="header-search-btn">
        <span style="display:flex; align-items:center;">
          ${getMaterialIcon('search', 'search-icon')}
          Search teams, leagues, players...
        </span>
        <span class="search-shortcut">Ctrl K</span>
      </button>
    </div>

    <!-- Header Operations / User Info -->
    <div class="header-right">
      
      <!-- Wallet Panel Indicator (Routes to Profile Cashier) -->
      <div class="wallet-badge" id="header-wallet-trigger">
        <span style="display:flex; align-items:center; gap:6px; color:var(--text-secondary);">
          ${getMaterialIcon('wallet')}
          <span class="wallet-balance">${formatCurrency(userData.balance)}</span>
        </span>
        <button class="deposit-btn" id="header-deposit-btn">
          ${getMaterialIcon('deposit', 'btn-icon')}
          <span class="btn-text">Deposit</span>
        </button>
      </div>

      <!-- Live Notification Bell -->
      <button class="icon-btn" id="header-notif-btn" aria-label="Notifications">
        ${getMaterialIcon('notification')}
        <span class="badge-dot"></span>
      </button>

      <!-- Account Settings / Profile Dropdown -->
      <button class="profile-trigger" id="header-profile-btn" aria-label="Profile">
        <img class="avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Profile" />
      </button>
    </div>
  `;

  // Bind Events
  document.getElementById('header-brand-logo').addEventListener('click', (e) => {
    e.preventDefault();
    state.setPage('home');
  });

  document.getElementById('header-search-btn').addEventListener('click', () => {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) {
      searchModal.classList.add('active');
      const input = searchModal.querySelector('input');
      if (input) input.focus();
    }
  });

  document.getElementById('header-wallet-trigger').addEventListener('click', () => {
    state.setPage('profile');
  });

  document.getElementById('header-notif-btn').addEventListener('click', () => {
    alert("Notification: Standard KYC verification completed. Your profile is active under GCC rules.");
  });

  document.getElementById('header-profile-btn').addEventListener('click', () => {
    state.setPage('profile');
  });
}
export default renderHeader;
