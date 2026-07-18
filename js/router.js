import { state } from './state.js';
import { renderHomeView } from './views/home.js';
import { renderLiveView } from './views/live.js';
import { renderMatchDetailsView } from './views/matchDetails.js';
import { renderMyBetsView } from './views/myBets.js';
import { renderPromotionsView } from './views/promotions.js';
import { renderProfileView } from './views/profile.js';

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
      renderMyBetsView();
      break;
    case 'promotions':
      renderPromotionsView();
      break;
    case 'profile':
      renderProfileView();
      break;
    default:
      renderHomeView();
      break;
  }
}

export default route;
