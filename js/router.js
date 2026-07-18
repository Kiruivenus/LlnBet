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
import { renderNotificationsView } from './views/notifications.js';

export function route() {
  const page = state.data.currentPage;

  const protectedPages = ['profile', 'my-bets', 'transactions', 'notifications', 'jackpot-streak'];

  if (protectedPages.includes(page) && !state.data.isLoggedIn) {
    alert("Authentication Required: Please login or register to access your account dashboard.");
    state.setPage('login');
    return;
  }

  switch (page) {
    case 'home':
      renderHomeView();
      break;
    case 'live':
      renderLiveView();
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
    default:
      renderHomeView();
      break;
  }
}

export default route;
