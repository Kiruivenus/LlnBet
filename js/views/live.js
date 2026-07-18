import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { renderMatchCard } from './home.js';
import { getMaterialIcon } from '../utils.js';

export function renderLiveView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const matches = simulation.getMatches();
  const liveMatches = matches.filter(m => m.isLive);
  const selections = state.data.betslip.selections;

  const activeSport = state.data.activeSport;
  const filteredLive = liveMatches.filter(m => m.sport === activeSport);

  const footballCount = liveMatches.filter(m => m.sport === 'football').length;
  const basketballCount = liveMatches.filter(m => m.sport === 'basketball').length;
  const tennisCount = liveMatches.filter(m => m.sport === 'tennis').length;

  let html = `
    <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="section-badge" style="font-size: 0.85rem; padding: 4px 12px;">
          <span class="pulse-dot"></span>
          Live In-Play
        </span>
      </div>
      <h1 style="font-size: 1.8rem;">Live Betting Dashboard</h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">Real-time odds, live trackers, and statistics. Odds updates update instantly.</p>
    </div>

    <!-- Live sports tabs with scrollbar hiding system -->
    <div class="sports-nav-wrapper" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
      <div class="sports-nav" style="padding-bottom: 0;">
        <button class="sport-chip ${activeSport === 'football' ? 'active' : ''}" data-sport="football" style="border-radius: var(--radius-md);">
          ${getMaterialIcon('soccer')}
          <span>Football</span>
          <span class="sport-chip-count" style="margin-left:6px;">${footballCount}</span>
        </button>
        <button class="sport-chip ${activeSport === 'basketball' ? 'active' : ''}" data-sport="basketball" style="border-radius: var(--radius-md);">
          ${getMaterialIcon('basketball')}
          <span>Basketball</span>
          <span class="sport-chip-count" style="margin-left:6px;">${basketballCount}</span>
        </button>
        <button class="sport-chip ${activeSport === 'tennis' ? 'active' : ''}" data-sport="tennis" style="border-radius: var(--radius-md);">
          ${getMaterialIcon('tennis')}
          <span>Tennis</span>
          <span class="sport-chip-count" style="margin-left:6px;">${tennisCount}</span>
        </button>
      </div>
    </div>

    <!-- Compact matches grid listing (Betika style) -->
    <div class="matches-list-container">
      <div class="matches-list-header">
        <span>Teams</span>
        <div class="matches-header-odds">
          <span>1</span>
          <span>X</span>
          <span>2</span>
        </div>
      </div>
      <div class="match-list-items">
        ${filteredLive.length === 0 ? `
          <div style="text-align:center; padding:60px 20px; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:16px;">
            <span class="material-icons-round" style="font-size: 3rem; color: var(--text-muted);">sensors</span>
            <h3 style="color:var(--text-primary);">No Live ${activeSport.toUpperCase()} Matches</h3>
            <p style="font-size:0.9rem; max-width:400px; line-height:1.5;">There are currently no active live matches in this category. Navigate to Prematch section to see upcoming events or check back shortly.</p>
            <button class="hero-cta" id="back-prematch-btn" style="padding:10px 24px; font-size:0.9rem;">View Prematch Events</button>
          </div>
        ` : filteredLive.map(match => renderMatchCard(match, selections)).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Bind navigation events
  container.querySelectorAll('.sport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sport = chip.getAttribute('data-sport');
      state.setSport(sport);
    });
  });

  // Handle odds click selection (handles compact odds button class)
  container.querySelectorAll('.compact-odds-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectionId = btn.getAttribute('data-id');
      const matchId = btn.getAttribute('data-match-id');
      const team = btn.getAttribute('data-team');
      const market = btn.getAttribute('data-market');
      const oddsVal = parseFloat(btn.getAttribute('data-value'));

      const match = matches.find(m => m.id === matchId);
      const matchName = match ? `${match.teams.home.name} vs ${match.teams.away.name}` : 'Match Event';

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

  // Navigate to match details on row click
  container.querySelectorAll('.match-list-row').forEach(row => {
    row.addEventListener('click', () => {
      const matchId = row.getAttribute('data-id');
      state.setPage('match-details', matchId);
    });
  });

  document.getElementById('back-prematch-btn')?.addEventListener('click', () => {
    state.setPage('home');
  });
}
export default renderLiveView;
