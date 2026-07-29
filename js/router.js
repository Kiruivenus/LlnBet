import { state } from './state.js';
import { renderHomeView } from './views/home.js';
import { renderLiveView } from './views/live.js';
import { renderMatchDetailsView } from './views/matchDetails.js';
import { renderMyBetsView } from './views/myBets.js';
import { renderPromotionsView } from './views/promotions.js';
import { renderProfileView } from './views/profile.js';
import { renderLoginView } from './views/login.js';
import { renderRegisterView } from './views/register.js';
import { renderSupportView } from './views/support.js';
import { renderResponsibleGamingView } from './views/responsibleGaming.js';
import { renderTransactionsView } from './views/transactions.js';
import { renderJackpotsView } from './views/jackpots.js';
import { renderAboutView } from './views/about.js';
import { renderPrivacyView } from './views/privacy.js';
import { renderTermsView } from './views/terms.js';
import { renderReferralView } from './views/referral.js';
import { renderNotificationsView } from './views/notifications.js';
import { renderAdminView } from './views/admin.js';
import { renderAdminDepositsView } from './views/adminDeposits.js';
import { renderResultsView } from './views/results.js';

function updateSeoMetadata(page) {
  const metaTitles = {
    home: 'LlnBet Kenya | Best Sports Betting, Live Odds & Casino | Linebet Kenya',
    live: 'Live In-Play Sports Betting & Odds | LlnBet Kenya',
    results: 'Latest Match Results & Scoreboards | LlnBet Kenya',
    promotions: 'Sports Betting Bonuses & Deposit Promotions | LlnBet Kenya',
    'jackpot-streak': 'Mega Jackpot Streak & Multi-Bet Bonuses | LlnBet Kenya',
    profile: 'Deposit & Profile Cashier | LlnBet Kenya',
    'my-bets': 'My Active Bets & History | LlnBet Kenya',
    login: 'Account Login | LlnBet Kenya (Linebet)',
    register: 'Register New Account | LlnBet Kenya',
    support: '24/7 Live Customer Support | LlnBet Kenya',
    'responsible-gaming': 'Play Safe & Responsible Gaming | LlnBet Kenya',
    'admin-deposits': 'Total User Deposits Audit | LlnBet Admin'
  };

  const metaDescriptions = {
    home: "LlnBet (Linebet Kenya) is Kenya's top online sports betting & casino platform. Enjoy highest Premier League odds, instant M-Pesa deposits & fast withdrawals, Aviator, Jackpots & 24/7 support.",
    live: "Bet live in-play on Premier League, Champions League, NBA & Tennis with real-time scoreboards, cashout, and instant M-Pesa payouts on LlnBet Kenya.",
    promotions: "Get Kenya's best sports betting bonuses, weekly cashback, freebets, and deposit match promotions on LlnBet Kenya."
  };

  document.title = metaTitles[page] || 'LlnBet Kenya | Sports Betting & Live Casino';
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) {
    descEl.setAttribute('content', metaDescriptions[page] || metaDescriptions.home);
  }
}

export function route() {
  const page = state.data.currentPage;
  updateSeoMetadata(page);

  const protectedPages = ['profile', 'my-bets', 'transactions', 'notifications', 'jackpot-streak'];
  const protectedAdminPages = ['admin', 'admin-deposits', 'deposits'];

  if (protectedAdminPages.includes(page)) {
    if (!state.data.isLoggedIn) {
      alert("Authentication Required: Please login.");
      state.setPage('login');
      return;
    }
    if (state.data.user?.role !== 'ADMIN') {
      alert("Access Denied: Admin privileges required.");
      state.setPage('home');
      return;
    }
  } else if (protectedPages.includes(page) && !state.data.isLoggedIn) {
    alert("Authentication Required: Please login or register to access your account dashboard.");
    state.setPage('login');
    return;
  }

  switch (page) {
    case 'admin':
      renderAdminView();
      break;
    case 'admin-deposits':
    case 'deposits':
      renderAdminDepositsView();
      break;
    case 'home':
    case 'virtuals':
    case 'casino':
      renderHomeView();
      break;
    case 'live':
      renderLiveView();
      break;
    case 'results':
      renderResultsView();
      break;
    case 'match-details':
      renderMatchDetailsView();
      break;
    case 'my-bets':
      renderMyBetsView();
      break;
    case 'promotions':
      renderPromotionsView();
      break;
    case 'profile':
      renderProfileView();
      break;
    case 'login':
      renderLoginView();
      break;
    case 'register':
      renderRegisterView();
      break;
    case 'live-support':
      renderSupportView();
      break;
    case 'responsible-gaming':
      renderResponsibleGamingView();
      break;
    case 'transactions':
      renderTransactionsView();
      break;
    case 'jackpot-streak':
      renderJackpotsView();
      break;
    case 'notifications':
      renderNotificationsView();
      break;
    case 'about':
      renderAboutView();
      break;
    case 'privacy':
      renderPrivacyView();
      break;
    case 'terms':
      renderTermsView();
      break;
    case 'referral':
      renderReferralView();
      break;
    default:
      renderHomeView();
      break;
  }
}

export default route;
