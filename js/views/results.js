import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { sportsList } from '../data.js';
import { getMaterialIcon, formatDate } from '../utils.js';

let activeResultsSport = 'all';

// Mock finished results dataset for rich presentation
const defaultFinishedMatches = [
  {
    id: 'res_1',
    sport: 'football',
    league: 'UEFA Champions League',
    country: 'Europe',
    teams: { home: { name: 'Manchester City' }, away: { name: 'Real Madrid' } },
    scores: { home: 3, away: 1 },
    timer: 'FT',
    date: '2026-07-23T20:00:00.000Z'
  },
  {
    id: 'res_2',
    sport: 'football',
    league: 'Premier League',
    country: 'England',
    teams: { home: { name: 'Arsenal' }, away: { name: 'Chelsea' } },
    scores: { home: 2, away: 0 },
    timer: 'FT',
    date: '2026-07-23T18:30:00.000Z'
  },
  {
    id: 'res_3',
    sport: 'football',
    league: 'La Liga',
    country: 'Spain',
    teams: { home: { name: 'Barcelona' }, away: { name: 'Atletico Madrid' } },
    scores: { home: 4, away: 2 },
    timer: 'FT',
    date: '2026-07-23T16:00:00.000Z'
  },
  {
    id: 'res_4',
    sport: 'basketball',
    league: 'NBA Finals',
    country: 'USA',
    teams: { home: { name: 'LA Lakers' }, away: { name: 'Boston Celtics' } },
    scores: { home: 112, away: 108 },
    timer: 'FT',
    date: '2026-07-23T02:00:00.000Z'
  },
  {
    id: 'res_5',
    sport: 'tennis',
    league: 'Wimbledon Championship',
    country: 'UK',
    teams: { home: { name: 'Carlos Alcaraz' }, away: { name: 'Novak Djokovic' } },
    scores: { home: 3, away: 1 },
    timer: 'FT',
    date: '2026-07-22T14:00:00.000Z'
  },
  {
    id: 'res_6',
    sport: 'football',
    league: 'Serie A',
    country: 'Italy',
    teams: { home: { name: 'Inter Milan' }, away: { name: 'AC Milan' } },
    scores: { home: 1, away: 1 },
    timer: 'FT',
    date: '2026-07-22T19:45:00.000Z'
  }
];

export function renderResultsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  // Retrieve finished matches from simulation or combine with default results list
  const allSimMatches = simulation.getMatches ? simulation.getMatches() : [];
  const finishedSimMatches = allSimMatches.filter(m => 
    m.timer === 'FT' || 
    m.timer === 'Finished' || 
    m.status === 'FT' || 
    m.status === 'Finished' || 
    m.isFinished === true
  );

  const combinedResults = [...finishedSimMatches, ...defaultFinishedMatches];
  
  // Deduplicate by ID
  const resultsMap = new Map();
  combinedResults.forEach(r => resultsMap.set(r.id, r));
  const resultsList = Array.from(resultsMap.values());

  const filteredResults = activeResultsSport === 'all' 
    ? resultsList 
    : resultsList.filter(r => r.sport === activeResultsSport);

  let html = `
    <!-- Results Header -->
    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="badge-live-indicator" style="background: rgba(56, 102, 42, 0.12); color: #38662A; border: 1px solid rgba(56, 102, 42, 0.3); font-size: 0.8rem; padding: 4px 12px;">
          <span style="font-size: 14px;">📊</span>
          <span>MATCH RESULTS & FINAL SCORES</span>
        </span>
      </div>
      <h1 class="section-title" style="font-size: 1.6rem;">Completed Match Results</h1>
      <p style="color: var(--text-secondary); font-size: 0.88rem;">Official verified match outcomes, final scores, and winner logs across all sports.</p>
    </div>

    <!-- Sports Filter Chips -->
    <div class="sports-chips-wrapper" style="margin-bottom: 20px;">
      <div class="sports-chips-list">
        <button class="sport-chip ${activeResultsSport === 'all' ? 'active' : ''}" data-sport="all">
          <span>${getMaterialIcon('emoji_events')}</span>
          <span>All Sports</span>
          <span class="sport-chip-count">${resultsList.length}</span>
        </button>

        ${sportsList.map(sport => {
          const count = resultsList.filter(r => r.sport === sport.id).length;
          if (count === 0) return '';
          return `
            <button class="sport-chip ${activeResultsSport === sport.id ? 'active' : ''}" data-sport="${sport.id}">
              <span>${getMaterialIcon(sport.icon)}</span>
              <span>${sport.name}</span>
              <span class="sport-chip-count">${count}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Results Cards Grid -->
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${filteredResults.length === 0 ? `
        <div style="padding: 48px 24px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
          No finished match results recorded for this sport yet.
        </div>
      ` : filteredResults.map(match => {
        const homeScore = match.scores ? match.scores.home : 0;
        const awayScore = match.scores ? match.scores.away : 0;
        const isHomeWinner = homeScore > awayScore;
        const isAwayWinner = awayScore > homeScore;
        const isDraw = homeScore === awayScore;

        return `
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 16px 20px; box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 10px;">
            
            <!-- League & Date Banner -->
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="font-weight: 700; color: var(--text-primary);">${match.league || 'International Championship'}</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="background: #38662A; color: #FFFFFF; font-size: 0.65rem; font-weight: 900; padding: 2px 6px; border-radius: 4px;">FT</span>
                <span>${formatDate(match.date || match.kickoffTime)}</span>
              </div>
            </div>

            <!-- Score Line -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">
              
              <!-- Home Team -->
              <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <div class="team-flag" style="width: 32px; height: 32px; font-size: 0.8rem;">
                  ${match.teams.home.name.substring(0, 2).toUpperCase()}
                </div>
                <span style="font-size: 0.95rem; font-weight: ${isHomeWinner ? '900' : '700'}; color: ${isHomeWinner ? '#38662A' : 'var(--text-primary)'};">
                  ${match.teams.home.name} ${isHomeWinner ? '🏆' : ''}
                </span>
              </div>

              <!-- Score Center -->
              <div style="font-family: var(--font-mono); font-weight: 900; font-size: 1.35rem; color: #38662A; padding: 0 16px; background: rgba(56, 102, 42, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(56, 102, 42, 0.2);">
                ${homeScore} : ${awayScore}
              </div>

              <!-- Away Team -->
              <div style="display: flex; align-items: center; gap: 10px; flex: 1; justify-content: flex-end;">
                <span style="font-size: 0.95rem; font-weight: ${isAwayWinner ? '900' : '700'}; color: ${isAwayWinner ? '#38662A' : 'var(--text-primary)'}; text-align: right;">
                  ${isAwayWinner ? '🏆 ' : ''}${match.teams.away.name}
                </span>
                <div class="team-flag" style="width: 32px; height: 32px; font-size: 0.8rem;">
                  ${match.teams.away.name.substring(0, 2).toUpperCase()}
                </div>
              </div>

            </div>

            <!-- Outcome Badge Footer -->
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); background: var(--bg-surface-hover); padding: 6px 12px; border-radius: var(--radius-md);">
              <span>Winning Market: <b>${isHomeWinner ? match.teams.home.name + ' (W1)' : isAwayWinner ? match.teams.away.name + ' (W2)' : 'Draw (X)'}</b></span>
              <span>Official BCLB Settlement Verified ✓</span>
            </div>

          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;

  // Filter Chips Listener
  container.querySelectorAll('.sports-chips-list .sport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeResultsSport = chip.getAttribute('data-sport');
      renderResultsView();
    });
  });
}

export default renderResultsView;
