import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderMobileDrawer() {
  renderMobileNavBar();

  let drawerOverlay = document.getElementById('mobile-drawer-overlay');
  
  if (!drawerOverlay) {
    drawerOverlay = document.createElement('div');
    drawerOverlay.id = 'mobile-drawer-overlay';
    drawerOverlay.className = 'mobile-drawer-overlay';
    document.body.appendChild(drawerOverlay);
  }

  const curPage = state.data.currentPage;
  const isLoggedIn = state.data.isLoggedIn;
  const isUserAdmin = state.data.user && state.data.user.role === 'ADMIN';

  const menuSections = [
    {
      title: 'SPORTSBOOK',
      items: [
        { id: 'drawer-nav-prematch', label: 'Prematch', icon: 'sports_soccer', page: 'home' },
        { id: 'drawer-nav-live', label: 'Live Betting', icon: 'sensors', page: 'live' },
        { id: 'drawer-nav-virtuals', label: 'Virtuals', icon: 'sports_esports', page: 'home' },
        { id: 'drawer-nav-casino', label: 'Casino Games', icon: 'casino', page: 'home' },
        { id: 'drawer-nav-promo', label: 'Promotions', icon: 'bonus', page: 'promotions' }
      ]
    },
    {
      title: 'MY ACCOUNT',
      items: [
        { id: 'drawer-nav-deposit', label: 'Deposit / Cashier', icon: 'wallet', page: 'profile' },
        { id: 'drawer-nav-history', label: 'My Bets History', icon: 'history', page: 'my-bets' },
        { id: 'drawer-nav-referral', label: 'Refer & Earn', icon: 'user', page: 'referral' },
        ...(isUserAdmin ? [{ id: 'drawer-nav-admin', label: 'Admin Portal', icon: 'settings', page: 'admin' }] : [])
      ]
    },
    {
      title: 'SECURITY & SUPPORT',
      items: [
        { id: 'drawer-nav-rg', label: 'Responsible Gaming', icon: 'shield', page: 'responsible-gaming' },
        { id: 'drawer-nav-chat', label: '24/7 Live Support', icon: 'chat', page: 'support' }
      ]
    }
  ];

  let drawerContentHtml = `
    <div class="mobile-drawer-container">
      <div class="mobile-drawer-header">
        <div class="header-brand">
          <div class="brand-emblem" style="width: 34px; height: 34px;">
            <img src="/img/logo.png" alt="LlnBet Logo" />
          </div>
          <span class="brand-name" style="font-size: 1.15rem;">Lln<span>Bet</span></span>
        </div>
        <button class="header-icon-btn" id="close-drawer-btn" aria-label="Close Menu">
          ${getMaterialIcon('close')}
        </button>
      </div>

      <div class="mobile-drawer-body">
  `;

  menuSections.forEach(section => {
    drawerContentHtml += `
      <div class="drawer-section">
        <div class="sidebar-group-title">${section.title}</div>
        <div class="drawer-menu-list">
    `;

    section.items.forEach(item => {
      const isActive = curPage === item.page;
      drawerContentHtml += `
        <div class="sidebar-item ${isActive ? 'active' : ''}" id="${item.id}">
          <div class="sidebar-item-left">
            <span class="sidebar-item-icon">${getMaterialIcon(item.icon)}</span>
            <span>${item.label}</span>
          </div>
        </div>
      `;
    });

    drawerContentHtml += `
        </div>
      </div>
    `;
  });

  if (isLoggedIn) {
    drawerContentHtml += `
      <div class="drawer-logout-btn" id="drawer-logout-trigger" style="margin-top: 20px; padding: 12px; background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; cursor: pointer;">
        ${getMaterialIcon('logout')}
        <span>Logout</span>
      </div>
    `;
  }

  drawerContentHtml += `
      </div>
    </div>
  `;

  drawerOverlay.innerHTML = drawerContentHtml;

  // Bind Close Events
  document.getElementById('close-drawer-btn')?.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });

  // Bind Menu Click Actions
  menuSections.forEach(section => {
    section.items.forEach(item => {
      document.getElementById(item.id)?.addEventListener('click', () => {
        closeDrawer();
        if (item.page) state.setPage(item.page);
      });
    });
  });

  document.getElementById('drawer-logout-trigger')?.addEventListener('click', () => {
    closeDrawer();
    state.logoutUser();
  });
}

export function renderMobileNavBar() {
  const navContainer = document.getElementById('mobile-nav-bar');
  if (!navContainer) return;

  const curPage = state.data.currentPage;
  const betCount = (state.data.betslip && state.data.betslip.selections) ? state.data.betslip.selections.length : 0;

  navContainer.innerHTML = `
    <a href="#" class="mobile-nav-item ${curPage === 'home' ? 'active' : ''}" id="mnav-sports">
      <span class="nav-icon">${getMaterialIcon('sports_soccer')}</span>
      <span>Sports</span>
    </a>

    <a href="#" class="mobile-nav-item ${curPage === 'live' ? 'active' : ''}" id="mnav-live">
      <span class="nav-icon">${getMaterialIcon('sensors')}</span>
      <span>Live</span>
    </a>

    <a href="#" class="mobile-nav-item" id="mnav-betslip">
      <span class="nav-icon">${getMaterialIcon('receipt')}</span>
      <span>Betslip</span>
      ${betCount > 0 ? `<span class="mobile-betslip-badge">${betCount}</span>` : ''}
    </a>

    <a href="#" class="mobile-nav-item ${curPage === 'my-bets' ? 'active' : ''}" id="mnav-mybets">
      <span class="nav-icon">${getMaterialIcon('history')}</span>
      <span>My Bets</span>
    </a>

    <a href="#" class="mobile-nav-item ${curPage === 'profile' ? 'active' : ''}" id="mnav-profile">
      <span class="nav-icon">${getMaterialIcon('user')}</span>
      <span>Profile</span>
    </a>
  `;

  document.getElementById('mnav-sports')?.addEventListener('click', (e) => { e.preventDefault(); state.setPage('home'); });
  document.getElementById('mnav-live')?.addEventListener('click', (e) => { e.preventDefault(); state.setPage('live'); });
  
  document.getElementById('mnav-betslip')?.addEventListener('click', (e) => {
    e.preventDefault();
    const slipEl = document.getElementById('app-betslip');
    if (slipEl) {
      slipEl.classList.toggle('active');
    }
  });

  document.getElementById('mnav-mybets')?.addEventListener('click', (e) => { e.preventDefault(); state.setPage('my-bets'); });
  document.getElementById('mnav-profile')?.addEventListener('click', (e) => { e.preventDefault(); state.setPage('profile'); });
}

export function openDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) overlay.classList.add('active');
}

export function closeDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) overlay.classList.remove('active');
}

export default renderMobileDrawer;
