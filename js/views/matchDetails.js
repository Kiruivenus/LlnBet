import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { renderLiveTracker } from '../components/liveTracker.js';
import { getMaterialIcon, formatOdds, renderTeamBadge } from '../utils.js';

export function renderMatchDetailsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const matchId = state.data.selectedMatchId;
  const match = simulation.getMatchById(matchId);
  const selections = state.data.betslip.selections;

  if (!match) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:var(--text-secondary);">
        <p>Error: Event details could not be found or the event has expired.</p>
        <button class="hero-cta" style="margin-top:16px;" id="details-back-home-btn">Go to Homepage</button>
      </div>
    `;
    document.getElementById('details-back-home-btn')?.addEventListener('click', () => state.setPage('home'));
    return;
  }

  // Hero Section HTML
  let html = `
    <!-- Navigation Back Header -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
      <button class="icon-btn" id="details-back-btn" aria-label="Go Back">
        ${getMaterialIcon('back')}
      </button>
      <span style="font-size: 0.95rem; font-weight:600; color:var(--text-secondary);">Back to Sportsbook</span>
    </div>

    <!-- Match Scoreboard Hero -->
    <div class="match-hero">
      <div class="match-hero-meta">${match.league} • ${match.venue}</div>
      <div class="match-hero-scoreboard">
        
        <!-- Home Team -->
        <div class="hero-team">
          <span class="hero-team-logo" style="margin-right: 0;">${renderTeamBadge(match.teams.home.name)}</span>
          <span class="hero-team-name">${match.teams.home.name}</span>
        </div>

        <!-- Score Center -->
        <div class="hero-score-center">
          ${match.isLive ? `
            <div class="hero-score">${match.scores.home} - ${match.scores.away}</div>
            <div class="hero-timer">${match.timer}'</div>
          ` : `
            <div style="font-size:1.8rem; font-weight:800; color:var(--text-secondary);">VS</div>
            <div style="font-size:0.95rem; font-weight:600; color:var(--accent-orange); margin-top:4px;">${match.kickoffTime}</div>
          `}
        </div>

        <!-- Away Team -->
        <div class="hero-team">
          <span class="hero-team-logo" style="margin-right: 0;">${renderTeamBadge(match.teams.away.name)}</span>
          <span class="hero-team-name">${match.teams.away.name}</span>
        </div>

      </div>
    </div>
  `;

  // Render momentum and stats if match is live
  if (match.isLive) {
    html += renderLiveTracker(match);
  } else {
    // If upcoming match, render Head-to-Head & Lineup details
    html += `
      <div class="tracker-container" style="margin-top:20px;">
        <!-- Head-to-Head Stats -->
        <div class="tracker-card">
          <h3 class="tracker-title">Head to Head (H2H)</h3>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:12px;">
            ${(match.h2h || []).map(item => `
              <li style="display:flex; justify-content:space-between; background:var(--bg-charcoal); padding:10px; border-radius:var(--radius-sm); font-size:0.9rem;">
                <span style="font-weight:600; color:var(--text-primary);">${item.score}</span>
                <span style="color:var(--text-muted); font-size:0.8rem;">${item.event} (${item.date})</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Predicted Lineups -->
        <div class="tracker-card">
          <h3 class="tracker-title">Predicted Lineups</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div>
              <h4 style="font-size:0.85rem; color:var(--accent-emerald); text-transform:uppercase; margin-bottom:8px;">${match.teams.home.name}</h4>
              <ul style="list-style:none; font-size:0.8rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px;">
                ${(match.lineups?.home || []).map(p => `<li>• ${p}</li>`).join('')}
              </ul>
            </div>
            <div>
              <h4 style="font-size:0.85rem; color:var(--accent-orange); text-transform:uppercase; margin-bottom:8px;">${match.teams.away.name}</h4>
              <ul style="list-style:none; font-size:0.8rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:4px;">
                ${(match.lineups?.away || []).map(p => `<li>• ${p}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render betting markets accordion
  html += `
    <div style="margin-top:24px;">
      <h2 class="section-title" style="margin-bottom:16px;">Betting Markets</h2>
      <div class="markets-section">
        ${match.markets.map((market, mIdx) => {
          return `
            <div class="market-accordion">
              <div class="market-accordion-header" data-index="${mIdx}">
                <span class="market-title">${market.name}</span>
                <span class="accordion-arrow-icon" style="display:flex; align-items:center;">${getMaterialIcon('menu')}</span>
              </div>
              <div class="market-accordion-content" id="market-content-${mIdx}">
                <div class="odds-grid" style="grid-template-columns: repeat(${market.odds.length >= 3 ? 3 : market.odds.length}, 1fr);">
                  ${market.odds.map(odd => {
                    const isSelected = selections.some(s => s.id === odd.selectionId);
                    const flash = simulation.getFlashState(match.id, odd.selectionId);
                    
                    return `
                      <button class="odds-btn ${isSelected ? 'selected' : ''} ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''} ${odd.isLocked ? 'locked' : ''}" 
                        data-id="${odd.selectionId}" 
                        data-team="${odd.label.split(' (')[0]}" 
                        data-market="${market.name}" 
                        data-value="${odd.value}">
                        <span class="odds-label">${odd.label}</span>
                        <span class="odds-value">${formatOdds(odd.value)}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Bind Events
  document.getElementById('details-back-btn')?.addEventListener('click', () => {
    state.setPage(match.isLive ? 'live' : 'home');
  });

  // Accordions toggle listeners
  container.querySelectorAll('.market-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const idx = header.getAttribute('data-index');
      const content = document.getElementById(`market-content-${idx}`);
      if (content) {
        if (content.style.display === 'none') {
          content.style.display = 'block';
          header.querySelector('.accordion-arrow-icon').innerHTML = getMaterialIcon('menu');
        } else {
          content.style.display = 'none';
          header.querySelector('.accordion-arrow-icon').innerHTML = getMaterialIcon('close');
        }
      }
    });
  });

  // Odds button selections handler
  container.querySelectorAll('.odds-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectionId = btn.getAttribute('data-id');
      const team = btn.getAttribute('data-team');
      const market = btn.getAttribute('data-market');
      const oddsVal = parseFloat(btn.getAttribute('data-value'));

      state.addSelection({
        id: selectionId,
        matchId: match.id,
        matchName: `${match.teams.home.name} vs ${match.teams.away.name}`,
        team: team,
        market: market,
        odds: oddsVal
      });
    });
  });
}
export default renderMatchDetailsView;
