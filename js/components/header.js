import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';
import { renderMobileDrawer, openDrawer } from './mobileDrawer.js';

export function renderHeader() {
  const container = document.getElementById('app-header');
  if (!container) return;

  const isLoggedIn = state.data.isLoggedIn;
  const userData = state.data.user;

  // Initialize mobile drawer overlay
  renderMobileDrawer();

  let rightSideHtml = '';

  if (isLoggedIn && userData) {
    rightSideHtml = `
      <!-- Wallet / Deposit Area -->
      <div class="wallet-badge" id="header-wallet-trigger">
        <span class="wallet-balance-wrap" style="display:flex; align-items:center; gap:6px; color:var(--text-secondary);">
          ${getMaterialIcon('wallet')}
          <span class="wallet-balance">${formatCurrency(userData.balance)}</span>
        </span>
        <button class="deposit-btn" id="header-deposit-btn">
          Deposit
        </button>
      </div>

      <!-- Live Notification Bell -->
      <button class="icon-btn" id="header-notif-btn" aria-label="Notifications">
        ${getMaterialIcon('notification')}
        <span class="badge-dot"></span>
      </button>

      <!-- Theme Switcher Button -->
      <button class="icon-btn" id="header-theme-toggle" aria-label="Toggle Theme" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--bg-surface); border: none; color: var(--text-primary); cursor: pointer; margin-left: 4px;">
        ${getMaterialIcon(document.body.classList.contains('light-theme') ? 'dark_mode' : 'light_mode')}
      </button>
    `;
  } else {
    rightSideHtml = `
      <div style="display:flex; align-items:center; gap:6px;">
        <!-- Theme Switcher Button -->
        <button class="icon-btn" id="header-theme-toggle" aria-label="Toggle Theme" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--bg-surface); border: none; color: var(--text-primary); cursor: pointer; margin-right: 6px;">
          ${getMaterialIcon(document.body.classList.contains('light-theme') ? 'dark_mode' : 'light_mode')}
        </button>
        <button class="quick-stake-btn" id="header-login-btn" style="padding: 7px 14px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight:700; border: 1px solid var(--accent-emerald); color:var(--accent-emerald); background:none; cursor:pointer;">
          Login
        </button>
        <button class="hero-cta" id="header-register-btn" style="padding: 7px 14px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight:700; background:linear-gradient(to right, var(--accent-emerald), var(--accent-orange)); border:none; color:var(--bg-obsidian); cursor:pointer; min-height:auto; box-shadow:none;">
          Register
        </button>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Brand & Smartphone Hamburger Trigger -->
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="mobile-hamburger-btn" id="mobile-hamburger-trigger" aria-label="Open Navigation Menu">
        ${getMaterialIcon('menu')}
      </button>

      <a href="#" class="brand" id="header-brand-logo" style="display:flex; align-items:center; gap:8px;">
        <img src="/img/logo.png" alt="LlnBet Logo" class="brand-logo-img" style="height:32px; width:32px; border-radius:6px; object-fit:cover;" />
        <div class="brand-name" style="font-family:var(--font-display); font-weight:900; font-size:1.3rem; letter-spacing:-0.03em; color:var(--text-primary); text-decoration:none;">Lln<span style="color:var(--accent-orange);">Bet</span></div>
      </a>
    </div>

    <!-- Desktop Search Trigger -->
    <div class="header-center">
      <button class="search-trigger" id="header-search-btn">
        <span style="display:flex; align-items:center;">
          ${getMaterialIcon('search', 'search-icon')}
          Search teams, leagues, players...
        </span>
        <span class="search-shortcut">Ctrl K</span>
      </button>
    </div>

    <!-- Header Operations / User Info & Mobile Actions -->
    <div class="header-right" style="display:flex; align-items:center; gap:8px;">
      <!-- Mobile Compact Search Button -->
      <button class="icon-btn mobile-search-btn" id="header-mobile-search-btn" aria-label="Search">
        ${getMaterialIcon('search')}
      </button>

      ${rightSideHtml}
    </div>
  `;

  // Bind Hamburger Drawer Event
  document.getElementById('mobile-hamburger-trigger')?.addEventListener('click', () => {
    openDrawer();
  });

  document.getElementById('header-brand-logo').addEventListener('click', (e) => {
    e.preventDefault();
    state.setPage('home');
  });

  // Search Modal Trigger (Both Desktop & Mobile Buttons)
  const openSearch = () => {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) {
      searchModal.classList.add('active');
      const input = searchModal.querySelector('input');
      if (input) input.focus();
    }
  };

  document.getElementById('header-search-btn')?.addEventListener('click', openSearch);
  document.getElementById('header-mobile-search-btn')?.addEventListener('click', openSearch);

  // Deposit Button Trigger
  const triggerDeposit = () => {
    if (state.data.isLoggedIn) {
      state.setPage('profile');
    } else {
      state.setPage('login');
    }
  };

  document.getElementById('header-deposit-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerDeposit();
  });



  // Bind Theme Toggle Listener
  document.getElementById('header-theme-toggle')?.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('llnbet_theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('llnbet_theme', 'light');
    }
    state.notify('theme');
  });

  if (isLoggedIn) {
    document.getElementById('header-wallet-trigger')?.addEventListener('click', () => {
      state.setPage('profile');
    });

    document.getElementById('header-notif-btn')?.addEventListener('click', () => {
      state.setPage('notifications');
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
