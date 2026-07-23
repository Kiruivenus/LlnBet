import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';
import { renderMobileDrawer, openDrawer } from './mobileDrawer.js';

export function renderHeader() {
  const container = document.getElementById('app-header');
  if (!container) return;

  const isLoggedIn = state.data.isLoggedIn;
  const userData = state.data.user;

  renderMobileDrawer();

  let rightToolsHtml = '';

  if (isLoggedIn && userData) {
    const initials = userData.name 
      ? userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
      : 'LP';

    rightToolsHtml = `
      <!-- Wallet Balance Pill -->
      <div class="header-wallet-badge" id="header-wallet-trigger" style="cursor: pointer;" title="View Cashier Wallet">
        <span class="header-wallet-icon">${getMaterialIcon('account_balance_wallet')}</span>
        <span class="wallet-balance">${formatCurrency(userData.balance || 0)}</span>
      </div>

      <!-- Emerald Green Deposit Button -->
      <button class="btn-deposit" id="header-deposit-btn" aria-label="Deposit Funds">
        ${getMaterialIcon('add')}
        <span>Deposit</span>
      </button>

      <!-- Notifications Bell -->
      <button class="header-icon-btn" id="header-notif-btn" aria-label="Notifications" title="Notifications">
        ${getMaterialIcon('notifications')}
        <span class="unread-dot"></span>
      </button>

      <!-- Theme Switcher Button -->
      <button class="header-icon-btn" id="header-theme-toggle" aria-label="Toggle Theme" title="Toggle Theme">
        ${getMaterialIcon(document.body.classList.contains('light-theme') ? 'dark_mode' : 'light_mode')}
      </button>

      <!-- Verified User Avatar -->
      <div class="user-avatar" id="header-profile-trigger" style="cursor: pointer;" title="Profile Account">
        ${initials}
        <div class="verified-tick">✓</div>
      </div>
    `;
  } else {
    rightToolsHtml = `
      <!-- Theme Switcher -->
      <button class="header-icon-btn" id="header-theme-toggle" aria-label="Toggle Theme" title="Toggle Theme">
        ${getMaterialIcon(document.body.classList.contains('light-theme') ? 'dark_mode' : 'light_mode')}
      </button>

      <div style="display: flex; align-items: center; gap: 6px;">
        <button class="header-icon-btn" id="header-login-btn" style="width: auto; padding: 0 12px; border-radius: var(--radius-pill); font-weight: 700; font-size: 0.8rem;">Login</button>
        <button class="btn-deposit" id="header-register-btn" style="font-size: 0.8rem; padding: 6px 14px;">Register</button>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Left: Brand Emblem & Mobile Drawer Trigger -->
    <div style="display: flex; align-items: center; gap: 8px;">
      <button class="header-icon-btn mobile-hamburger-btn" id="mobile-hamburger-trigger" aria-label="Open Menu">
        ${getMaterialIcon('menu')}
      </button>

      <a href="#" class="header-brand" id="header-brand-logo">
        <div class="brand-emblem">
          <img src="/img/logo.png" alt="LlnBet Logo" />
        </div>
        <div class="brand-title-group">
          <span class="brand-name">Lln<span>Bet</span></span>
          <span class="brand-tagline">Sportsbook</span>
        </div>
      </a>
    </div>

    <!-- Center: Large Desktop Search Bar -->
    <div class="header-search-container">
      <div class="header-search-bar" id="header-search-btn">
        <span class="header-search-icon">${getMaterialIcon('search')}</span>
        <span class="header-search-placeholder">Search teams, leagues, matches...</span>
        <span class="header-search-badge">⌘K</span>
      </div>
    </div>

    <!-- Right: Wallet, Deposit, Avatar & Tools -->
    <div class="header-right-tools">
      <button class="header-icon-btn mobile-search-btn" id="header-mobile-search-btn" aria-label="Search">
        ${getMaterialIcon('search')}
      </button>

      ${rightToolsHtml}
    </div>
  `;

  // Bind Scroll Shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      container.classList.add('scrolled');
    } else {
      container.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger Trigger
  document.getElementById('mobile-hamburger-trigger')?.addEventListener('click', () => {
    openDrawer();
  });

  // Brand Logo Click
  document.getElementById('header-brand-logo')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.setPage('home');
  });

  // Search Modal Triggers
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

  // Deposit CTA Trigger
  document.getElementById('header-deposit-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.setPage(state.data.isLoggedIn ? 'profile' : 'login');
  });

  // Theme Toggle Trigger
  document.getElementById('header-theme-toggle')?.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('llnbet_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('llnbet_theme', 'light');
    }
    state.notify('theme');
  });

  if (isLoggedIn) {
    document.getElementById('header-wallet-trigger')?.addEventListener('click', () => state.setPage('profile'));
    document.getElementById('header-profile-trigger')?.addEventListener('click', () => state.setPage('profile'));
    document.getElementById('header-notif-btn')?.addEventListener('click', () => state.setPage('notifications'));
  } else {
    document.getElementById('header-login-btn')?.addEventListener('click', () => state.setPage('login'));
    document.getElementById('header-register-btn')?.addEventListener('click', () => state.setPage('register'));
  }
}

export default renderHeader;
