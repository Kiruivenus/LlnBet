import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { renderMatchCard } from './home.js';
import { getMaterialIcon, isMatchAvailableForBetting } from '../utils.js';

export function renderLiveView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const matches = simulation.getMatches().filter(isMatchAvailableForBetting);
  const liveMatches = matches.filter(m => m.isLive);
  const selections = state.data.betslip ? state.data.betslip.selections : [];

  const activeSport = state.data.activeSport;
  const filteredLive = liveMatches.filter(m => m.sport === activeSport);

  const footballCount = liveMatches.filter(m => m.sport === 'football').length;
  const basketballCount = liveMatches.filter(m => m.sport === 'basketball').length;
  const tennisCount = liveMatches.filter(m => m.sport === 'tennis').length;

  let html = `
    <!-- Live Header -->
    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="badge-live-indicator" style="padding: 4px 12px; font-size: 0.8rem;">
          <span class="pulse-dot"></span>
          <span>LIVE IN-PLAY</span>
        </span>
      </div>
      <h1 class="section-title" style="font-size: 1.6rem;">Live Betting Dashboard</h1>
      <p style="color: var(--text-secondary); font-size: 0.88rem;">Real-time scores, dynamic multipliers, and instant cashouts.</p>
    </div>

    <!-- Sports Chips Category Selection -->
    <div class="sports-chips-wrapper">
      <div class="sports-chips-list">
        <button class="sport-chip ${activeSport === 'football' ? 'active' : ''}" data-sport="football">
          <span>${getMaterialIcon('sports_soccer')}</span>
          <span>Football</span>
          <span class="sport-chip-count">${footballCount}</span>
        </button>
        <button class="sport-chip ${activeSport === 'basketball' ? 'active' : ''}" data-sport="basketball">
          <span>${getMaterialIcon('sports_basketball')}</span>
          <span>Basketball</span>
          <span class="sport-chip-count">${basketballCount}</span>
        </button>
        <button class="sport-chip ${activeSport === 'tennis' ? 'active' : ''}" data-sport="tennis">
          <span>${getMaterialIcon('sports_tennis')}</span>
          <span>Tennis</span>
          <span class="sport-chip-count">${tennisCount}</span>
        </button>
      </div>
    </div>

    <!-- Live Match Cards Grid -->
    <div class="match-cards-container">
      ${filteredLive.length === 0 ? `
        <div style="padding: 60px 20px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <span class="material-icons-round" style="font-size: 3rem; color: var(--color-primary);">sensors</span>
          <h3 style="color: var(--text-primary); font-family: var(--font-heading);">No Active Live Matches</h3>
          <p style="font-size: 0.88rem; max-width: 420px;">There are no active live events for ${activeSport.toUpperCase()} at this moment. Explore upcoming prematch fixtures.</p>
          <button class="btn-deposit" id="back-prematch-btn" style="margin-top: 8px;">Explore Prematch Events</button>
        </div>
      ` : filteredLive.map(match => renderMatchCard(match, selections)).join('')}
    </div>
  `;

  container.innerHTML = html;

  // Bind Sports Chips
  container.querySelectorAll('.sports-chips-list .sport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sport = chip.getAttribute('data-sport');
      state.setSport(sport);
    });
  });

  // Bind Odds Buttons
  container.querySelectorAll('.odds-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectionId = btn.getAttribute('data-id');
      const matchId = btn.getAttribute('data-match-id');
      const team = btn.getAttribute('data-team');
      const market = btn.getAttribute('data-market');
      const oddsVal = parseFloat(btn.getAttribute('data-value'));

      const matchObj = matches.find(m => m.id === matchId);
      const matchName = matchObj ? `${matchObj.teams.home.name} vs ${matchObj.teams.away.name}` : 'Match Event';

      state.addSelection({
        id: selectionId,
        matchId: matchId,
        matchName: matchName,
        team: team,
        market: market,
        odds: oddsVal
      });
    });
  });

  // Bind Card Click Events
  container.querySelectorAll('.match-card-body, .extra-markets-link').forEach(el => {
    el.addEventListener('click', () => {
      const matchId = el.getAttribute('data-match-id');
      if (matchId) state.setPage('match-details', matchId);
    });
  });

  document.getElementById('back-prematch-btn')?.addEventListener('click', () => {
    state.setPage('home');
  });
}

export default renderLiveView;
