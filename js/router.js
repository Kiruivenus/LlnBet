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
      // Guard route (redirect to login if not logged in)
      if (!state.data.isLoggedIn) {
        state.setPage('login');
      } else {
        renderMyBetsView();
      }
      break;
    case 'promotions':
      renderPromotionsView();
      break;
    case 'profile':
      // Guard route (redirect to login if not logged in)
      if (!state.data.isLoggedIn) {
        state.setPage('login');
      } else {
        renderProfileView();
      }
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
      // Guard route (redirect to login if not logged in)
      if (!state.data.isLoggedIn) {
        state.setPage('login');
      } else {
        renderTransactionsView();
      }
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
