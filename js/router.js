import { state } from './state.js';
import { renderHomeView } from './views/home.js';
import { renderLiveView } from './views/live.js';
import { renderMatchDetailsView } from './views/matchDetails.js';
import { renderMyBetsView } from './views/myBets.js';
import { renderPromotionsView } from './views/promotions.js';
import { renderProfileView } from './views/profile.js';
import { renderLoginView } from './views/login.js';
import { renderRegisterView } from './views/register.js';

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
      // Guard my-bets route (redirect to login if not logged in)
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
      // Guard profile route (redirect to login if not logged in)
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
    default:
      renderHomeView();
      break;
  }
}

export default route;
