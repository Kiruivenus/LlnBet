import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderMobileDrawer() {
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
      title: 'MAIN',
      items: [
        { id: 'drawer-nav-prematch', label: 'Prematch', icon: 'home', page: 'home' },
        { id: 'drawer-nav-live', label: 'Live Betting', icon: 'live', page: 'live' },
        { id: 'drawer-nav-jackpot', label: 'Jackpots', icon: 'trophy', page: 'jackpot-streak' },
        { id: 'drawer-nav-promo', label: 'Promotions', icon: 'bonus', page: 'promotions' }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { id: 'drawer-nav-deposit', label: 'Deposit', icon: 'deposit', page: 'profile' },
        { id: 'drawer-nav-withdraw', label: 'Withdraw', icon: 'wallet', page: 'profile' },
        { id: 'drawer-nav-history', label: 'Bet History', icon: 'history', page: 'my-bets' },
        { id: 'drawer-nav-referral', label: 'Refer & Earn', icon: 'user', page: 'referral' },
        ...(isUserAdmin ? [{ id: 'drawer-nav-admin', label: 'Admin Portal', icon: 'shield', page: 'admin' }] : []),
        { id: 'drawer-nav-app', label: 'Download App', icon: 'deposit', action: () => alert("Download Mobile App:\n\nAn SMS with the direct Android APK download link has been sent to your registered phone number.") }
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { id: 'drawer-nav-chat', label: 'Live Chat', icon: 'chat', page: 'live-support' },
        { id: 'drawer-nav-telegram', label: 'Telegram', icon: 'notification', action: () => alert("Telegram Support:\n\nOpening official LlnBet Kenya Telegram Channel (@LlnBetKenya)...") }
      ]
    },
    {
      title: 'LEGAL',
      items: [
        { id: 'drawer-nav-terms', label: 'Terms', icon: 'search', page: 'terms' },
        { id: 'drawer-nav-privacy', label: 'Privacy', icon: 'shield', page: 'privacy' },
        { id: 'drawer-nav-rg', label: 'Responsible Gaming', icon: 'shield', page: 'responsible-gaming' },
        { id: 'drawer-nav-about', label: 'About', icon: 'user', page: 'about' }
      ]
    }
  ];

  let drawerContentHtml = `
    <div class="mobile-drawer-container">
      <div class="mobile-drawer-header">
        <div class="brand" style="display:flex; align-items:center; gap:8px;">
          <img src="img/logo.png" alt="LlnBet Logo" class="brand-logo-img" style="height:32px; width:32px; border-radius:6px; object-fit:cover;" />
          <div class="brand-name" style="font-family:var(--font-display); font-weight:900; font-size:1.3rem; letter-spacing:-0.03em; color:var(--text-primary); text-decoration:none;">Lln<span style="color:var(--accent-orange);">Bet</span></div>
        </div>
        <button class="icon-btn" id="close-drawer-btn" style="width:36px; height:36px;">
          ${getMaterialIcon('close')}
        </button>
      </div>

      <div class="mobile-drawer-body">
  `;

  menuSections.forEach(section => {
    drawerContentHtml += `
      <div class="drawer-section">
        <div class="drawer-section-title">${section.title}</div>
        <div class="drawer-menu-list">
    `;

    section.items.forEach(item => {
      const isActive = curPage === item.page;
      drawerContentHtml += `
        <div class="drawer-menu-item ${isActive ? 'active' : ''}" id="${item.id}">
          <div class="drawer-item-left">
            <span class="drawer-icon-box">
              ${getMaterialIcon(item.icon)}
            </span>
            <span class="drawer-item-label">${item.label}</span>
          </div>
          ${isActive ? '<span class="drawer-active-pill"></span>' : ''}
        </div>
      `;
    });

    drawerContentHtml += `
        </div>
      </div>
    `;
  });

  // Logout button at bottom if logged in
  if (isLoggedIn) {
    drawerContentHtml += `
      <div class="drawer-logout-btn" id="drawer-logout-trigger">
        <span class="drawer-logout-icon">${getMaterialIcon('logout')}</span>
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
  const closeBtn = document.getElementById('close-drawer-btn');
  closeBtn?.addEventListener('click', closeDrawer);
  
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });

  // Bind Menu Click Actions
  menuSections.forEach(section => {
    section.items.forEach(item => {
      const el = document.getElementById(item.id);
      el?.addEventListener('click', () => {
        closeDrawer();
        if (item.page) {
          state.setPage(item.page);
        } else if (item.action) {
          item.action();
        }
      });
    });
  });

  document.getElementById('drawer-logout-trigger')?.addEventListener('click', () => {
    closeDrawer();
    state.logout();
    alert("Logged Out: You have successfully signed out of your LlnBet account.");
  });
}

export function openDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) {
    overlay.classList.add('active');
  }
}

export function closeDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}
export default renderMobileDrawer;
