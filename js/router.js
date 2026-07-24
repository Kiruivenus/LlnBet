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
import { renderResultsView } from './views/results.js';

export function route() {
  const page = state.data.currentPage;

  const protectedPages = ['profile', 'my-bets', 'transactions', 'notifications', 'jackpot-streak'];

  if (page === 'admin') {
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
