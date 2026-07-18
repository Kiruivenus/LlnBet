import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderHeader() {
  const container = document.getElementById('app-header');
  if (!container) return;

  const isLoggedIn = state.data.isLoggedIn;
  const userData = state.data.user;

  let rightSideHtml = '';

  if (isLoggedIn && userData) {
    rightSideHtml = `
      <!-- Wallet Panel Indicator -->
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
    `;
  } else {
    rightSideHtml = `
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="quick-stake-btn" id="header-login-btn" style="padding: 8px 16px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight:700; border: 1px solid var(--accent-emerald); color:var(--accent-emerald); background:none; cursor:pointer;">
          Login
        </button>
        <button class="hero-cta" id="header-register-btn" style="padding: 8px 16px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight:700; background:linear-gradient(to right, var(--accent-emerald), var(--accent-orange)); border:none; color:var(--bg-obsidian); cursor:pointer; min-height:auto; box-shadow:none;">
          Register
        </button>
      </div>
    `;
  }

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
      ${rightSideHtml}
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

  if (isLoggedIn) {
    document.getElementById('header-wallet-trigger')?.addEventListener('click', () => {
      state.setPage('profile');
    });

    document.getElementById('header-notif-btn')?.addEventListener('click', () => {
      state.setPage('notifications');
    });

    document.getElementById('header-profile-btn')?.addEventListener('click', () => {
      state.setPage('profile');
    });
  } else {
    document.getElementById('header-login-btn')?.addEventListener('click', () => {
      state.setPage('login');
    });

    document.getElementById('header-register-btn')?.addEventListener('click', () => {
      state.setPage('register');
    });
  }
}
export default renderHeader;
