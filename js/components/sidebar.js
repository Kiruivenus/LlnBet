import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderSidebar() {
  const container = document.getElementById('app-sidebar');
  if (!container) return;

  const curPage = state.data.currentPage;

  container.innerHTML = `
    <!-- Sportsbook Navigation Group -->
    <div class="sidebar-group">
      <div class="sidebar-group-title">Sportsbook</div>

      <a href="#" class="sidebar-item ${curPage === 'home' ? 'active' : ''}" id="nav-prematch">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('sports_soccer')}</span>
          <span>Prematch</span>
        </div>
        <span class="sidebar-badge count">342</span>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'live' ? 'active' : ''}" id="nav-live">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('sensors')}</span>
          <span>Live Betting</span>
        </div>
        <span class="sidebar-badge live">LIVE</span>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'results' ? 'active' : ''}" id="nav-results">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('history')}</span>
          <span>Match Results</span>
        </div>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'virtuals' ? 'active' : ''}" id="nav-virtuals">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('sports_esports')}</span>
          <span>Virtuals</span>
        </div>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'casino' ? 'active' : ''}" id="nav-casino">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('casino')}</span>
          <span>Casino</span>
        </div>
        <span class="sidebar-badge count">HOT</span>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'promotions' ? 'active' : ''}" id="nav-promo">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('bonus')}</span>
          <span>Promotions</span>
        </div>
      </a>
    </div>

    <!-- My Account Group -->
    <div class="sidebar-group">
      <div class="sidebar-group-title">My Account</div>

      <a href="#" class="sidebar-item ${curPage === 'my-bets' ? 'active' : ''}" id="nav-mybets">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('history')}</span>
          <span>My Bets</span>
        </div>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'profile' ? 'active' : ''}" id="nav-profile">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('wallet')}</span>
          <span>Profile & Cashier</span>
        </div>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'referral' ? 'active' : ''}" id="nav-referral">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('user')}</span>
          <span>Refer & Earn</span>
        </div>
      </a>

      ${state.data.user && state.data.user.role === 'ADMIN' ? `
      <a href="#" class="sidebar-item ${curPage === 'admin' ? 'active' : ''}" id="nav-admin">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon" style="color: var(--color-primary);">${getMaterialIcon('settings')}</span>
          <span style="color: var(--color-primary); font-weight: 800;">Admin Portal</span>
        </div>
      </a>
      ` : ''}

      ${state.data.isLoggedIn ? `
      <a href="#" class="sidebar-item" id="nav-sidebar-logout" style="margin-top: 10px; background: rgba(239, 68, 68, 0.08); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2);">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon" style="color: var(--color-danger);">${getMaterialIcon('logout')}</span>
          <span style="font-weight: 800; color: var(--color-danger);">Logout</span>
        </div>
      </a>
      ` : ''}
    </div>

    <!-- Security & Responsible Gaming Group -->
    <div class="sidebar-group">
      <div class="sidebar-group-title">Play Safe</div>

      <a href="#" class="sidebar-item ${curPage === 'responsible-gaming' ? 'active' : ''}" id="nav-rg">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('shield')}</span>
          <span>Responsible Gaming</span>
        </div>
      </a>

      <a href="#" class="sidebar-item ${curPage === 'support' ? 'active' : ''}" id="nav-chat">
        <div class="sidebar-item-left">
          <span class="sidebar-item-icon">${getMaterialIcon('chat')}</span>
          <span>24/7 Support</span>
        </div>
      </a>
    </div>
  `;

  // Bind Event Listeners
  const bindNav = (id, page) => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      state.setPage(page);
    });
  };

  bindNav('nav-prematch', 'home');
  bindNav('nav-live', 'live');
  bindNav('nav-results', 'results');
  bindNav('nav-virtuals', 'virtuals');
  bindNav('nav-casino', 'casino');
  bindNav('nav-promo', 'promotions');
  bindNav('nav-mybets', 'my-bets');
  bindNav('nav-profile', 'profile');
  bindNav('nav-referral', 'referral');
  bindNav('nav-rg', 'responsible-gaming');
  bindNav('nav-chat', 'support');
  bindNav('nav-admin', 'admin');

  document.getElementById('nav-sidebar-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.logout();
  });
}

export default renderSidebar;
