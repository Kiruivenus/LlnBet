import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderSidebar() {
  const container = document.getElementById('app-sidebar');
  if (!container) return;

  const curPage = state.data.currentPage;

  container.innerHTML = `
    <!-- Main Menu Section -->
    <div class="sidebar-section">
      <h3 class="sidebar-title">Sportsbook</h3>
      <ul class="sidebar-menu">
        <li class="sidebar-item ${curPage === 'home' ? 'active' : ''}">
          <button id="nav-prematch">
            <span class="sidebar-item-content">
              ${getMaterialIcon('home')}
              Prematch
            </span>
          </button>
        </li>
        <li class="sidebar-item ${curPage === 'live' ? 'active' : ''}">
          <button id="nav-live">
            <span class="sidebar-item-content">
              ${getMaterialIcon('live')}
              Live Betting
            </span>
            <span class="sidebar-badge live">Live</span>
          </button>
        </li>
        <li class="sidebar-item ${curPage === 'promotions' ? 'active' : ''}">
          <button id="nav-promo">
            <span class="sidebar-item-content">
              ${getMaterialIcon('bonus')}
              Promotions
            </span>
            <span class="sidebar-badge">Hot</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- User Account Section -->
    <div class="sidebar-section">
      <h3 class="sidebar-title">My Account</h3>
      <ul class="sidebar-menu">
        <li class="sidebar-item ${curPage === 'my-bets' ? 'active' : ''}">
          <button id="nav-mybets">
            <span class="sidebar-item-content">
              ${getMaterialIcon('history')}
              My Bets
            </span>
          </button>
        </li>
        <li class="sidebar-item ${curPage === 'profile' ? 'active' : ''}">
          <button id="nav-profile">
            <span class="sidebar-item-content">
              ${getMaterialIcon('user')}
              Profile & cashier
            </span>
          </button>
        </li>
        <li class="sidebar-item ${curPage === 'referral' ? 'active' : ''}">
          <button id="nav-referral">
            <span class="sidebar-item-content">
              ${getMaterialIcon('user')}
              Refer & Earn
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Info / Security Section -->
    <div class="sidebar-section">
      <h3 class="sidebar-title">Play Safe</h3>
      <ul class="sidebar-menu">
        <li class="sidebar-item ${curPage === 'responsible-gaming' ? 'active' : ''}">
          <button id="nav-rg">
            <span class="sidebar-item-content">
              ${getMaterialIcon('shield')}
              Responsible Gaming
            </span>
          </button>
        </li>
        <li class="sidebar-item ${curPage === 'about' ? 'active' : ''}">
          <button id="nav-about">
            <span class="sidebar-item-content">
              ${getMaterialIcon('user')}
              About LlnBet
            </span>
          </button>
        </li>
        <li class="sidebar-item ${curPage === 'terms' ? 'active' : ''}">
          <button id="nav-terms">
            <span class="sidebar-item-content">
              ${getMaterialIcon('search')}
              Terms & Conditions
            </span>
          </button>
        </li>
        <li class="sidebar-item ${curPage === 'privacy' ? 'active' : ''}">
          <button id="nav-privacy">
            <span class="sidebar-item-content">
              ${getMaterialIcon('shield')}
              Privacy Policy
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Customer Support -->
    <div class="sidebar-section" style="margin-top: auto; padding-top: 20px;">
      <h3 class="sidebar-title">Support</h3>
      <ul class="sidebar-menu">
        <li class="sidebar-item ${curPage === 'live-support' ? 'active' : ''}">
          <button id="nav-chat">
            <span class="sidebar-item-content">
              ${getMaterialIcon('chat')}
              Live Chat (24/7)
            </span>
          </button>
        </li>
      </ul>
    </div>
  `;

  // Bind Events
  document.getElementById('nav-prematch').addEventListener('click', () => state.setPage('home'));
  document.getElementById('nav-live').addEventListener('click', () => state.setPage('live'));
  document.getElementById('nav-promo').addEventListener('click', () => state.setPage('promotions'));
  document.getElementById('nav-mybets').addEventListener('click', () => state.setPage('my-bets'));
  document.getElementById('nav-profile').addEventListener('click', () => state.setPage('profile'));
  document.getElementById('nav-referral').addEventListener('click', () => state.setPage('referral'));
  document.getElementById('nav-rg').addEventListener('click', () => state.setPage('responsible-gaming'));
  document.getElementById('nav-about').addEventListener('click', () => state.setPage('about'));
  document.getElementById('nav-terms').addEventListener('click', () => state.setPage('terms'));
  document.getElementById('nav-privacy').addEventListener('click', () => state.setPage('privacy'));
  document.getElementById('nav-chat').addEventListener('click', () => state.setPage('live-support'));
}
export default renderSidebar;
