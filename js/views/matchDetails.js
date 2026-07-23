import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { renderLiveTracker } from '../components/liveTracker.js';
import { getMaterialIcon, formatOdds, formatDate, renderTeamBadge } from '../utils.js';

let activeFilter = 'All Markets';

export function renderMatchDetailsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const matchId = state.data.selectedMatchId;
  const match = simulation.getMatchById(matchId);
  const selections = state.data.betslip ? state.data.betslip.selections : [];

  if (!match) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
        <p>Error: Event details could not be found or the event has expired.</p>
        <button class="btn-deposit" style="margin-top: 16px;" id="details-back-home-btn">Go to Homepage</button>
      </div>
    `;
    document.getElementById('details-back-home-btn')?.addEventListener('click', () => state.setPage('home'));
    return;
  }

  const mainMarket = match.markets[0] || { odds: [] };
  const homeOddObj = mainMarket.odds[0] || {};
  const drawOddObj = mainMarket.odds[1] || {};
  const awayOddObj = mainMarket.odds[2] || {};

  const r1 = homeOddObj.value;
  const rx = drawOddObj.value;
  const r2 = awayOddObj.value;

  const homeName = match.teams.home.name;
  const awayName = match.teams.away.name;

  let html = `
    <!-- Navigation Back Header -->
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <button class="header-icon-btn" id="details-back-btn" aria-label="Go Back">
        ${getMaterialIcon('back')}
      </button>
      <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">${match.country || 'World'}, ${match.league || 'International Championship'}</span>
    </div>

    <!-- Match Scoreboard Hero Card -->
    <div style="position: relative; overflow: hidden; padding: 24px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        
        <!-- Home Team -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-surface-hover); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--text-primary); border: 1px solid var(--border-color);">
            ${homeName.substring(0, 2).toUpperCase()}
          </div>
          <span style="font-size: 1rem; font-weight: 800; color: var(--text-primary);">${homeName}</span>
        </div>

        <!-- Score Center / Kickoff Time -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">VS</span>
          ${match.isLive ? `
            <div class="badge-live-indicator" style="font-size: 0.85rem; padding: 4px 12px;">
              <span class="pulse-dot"></span>
              <span>LIVE ${match.timer}'</span>
            </div>
            <div style="font-family: var(--font-mono); font-weight: 900; font-size: 1.6rem; color: var(--color-primary); margin-top: 4px;">
              ${match.scores.home} : ${match.scores.away}
            </div>
          ` : `
            <span style="font-size: 0.95rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary);">${formatDate(match.kickoffTime)}</span>
          `}
          <span style="font-size: 0.72rem; color: var(--text-muted);">#${match.id.substring(0, 8)}</span>
        </div>

        <!-- Away Team -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-surface-hover); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: var(--text-primary); border: 1px solid var(--border-color);">
            ${awayName.substring(0, 2).toUpperCase()}
          </div>
          <span style="font-size: 1rem; font-weight: 800; color: var(--text-primary);">${awayName}</span>
        </div>

      </div>

      <!-- Footer Quick Stats Link -->
      <div style="display: flex; justify-content: center; gap: 24px; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 14px;">
        <span style="display: flex; align-items: center; gap: 6px;">
          ${getMaterialIcon('live')}
          ${match.isLive ? `Live Feed Active` : 'Scheduled Match'}
        </span>
        <span style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--color-primary);" id="trigger-stats-modal">
          ${getMaterialIcon('trend')}
          Match Statistics
        </span>
      </div>
    </div>
  `;

  if (match.isLive) {
    html += renderLiveTracker(match);
  }

  // Expanded list of 12 betting markets
  const marketDetailsList = [
    {
      name: '1X2 Match Winner',
      category: 'Main',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_m1`, label: '1 (Home)', value: r1, isSuspended: homeOddObj.isSuspended },
        { selectionId: `${match.id}_mx`, label: 'X (Draw)', value: rx, isSuspended: drawOddObj.isSuspended },
        { selectionId: `${match.id}_m2`, label: '2 (Away)', value: r2, isSuspended: awayOddObj.isSuspended }
      ]
    },
    {
      name: 'Both Teams To Score (GG/NG)',
      category: 'Main',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_btts_yes`, label: 'Yes (GG)', value: r1 && r2 ? parseFloat((1 / (1 - (1/r1 + 1/r2)*0.4)).toFixed(2)) : 1.65 },
        { selectionId: `${match.id}_btts_no`, label: 'No (NG)', value: r1 && r2 ? parseFloat(((r1 + r2) / 1.5).toFixed(2)) : 2.15 }
      ]
    },
    {
      name: 'Double Chance',
      category: 'Main',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_dc_1x`, label: '1/X', value: r1 && rx ? parseFloat((1 / (1/r1 + 1/rx) * 1.05).toFixed(2)) : 1.35 },
        { selectionId: `${match.id}_dc_x2`, label: 'X/2', value: rx && r2 ? parseFloat((1 / (1/rx + 1/r2) * 1.05).toFixed(2)) : 1.45 },
        { selectionId: `${match.id}_dc_12`, label: '1/2', value: r1 && r2 ? parseFloat((1 / (1/r1 + 1/r2) * 1.05).toFixed(2)) : 1.25 }
      ]
    },
    {
      name: 'Over / Under Total Goals',
      category: 'Goals',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_tot_o15`, label: 'Over 1.5', value: 1.22 },
        { selectionId: `${match.id}_tot_u15`, label: 'Under 1.5', value: 4.10 },
        { selectionId: `${match.id}_tot_o25`, label: 'Over 2.5', value: 1.75 },
        { selectionId: `${match.id}_tot_u25`, label: 'Under 2.5', value: 2.10 },
        { selectionId: `${match.id}_tot_o35`, label: 'Over 3.5', value: 2.85 },
        { selectionId: `${match.id}_tot_u35`, label: 'Under 3.5', value: 1.42 }
      ]
    },
    {
      name: 'Draw No Bet',
      category: 'Main',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_dnb_1`, label: '1 (Home)', value: r1 ? parseFloat((r1 * 0.75).toFixed(2)) : 1.55 },
        { selectionId: `${match.id}_dnb_2`, label: '2 (Away)', value: r2 ? parseFloat((r2 * 0.75).toFixed(2)) : 2.20 }
      ]
    },
    {
      name: '1st Half - 1X2',
      category: 'First Half',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_fh_1`, label: '1', value: r1 ? parseFloat((r1 * 1.3 + 0.3).toFixed(2)) : 2.80 },
        { selectionId: `${match.id}_fh_x`, label: 'X', value: rx ? parseFloat((rx * 0.75).toFixed(2)) : 2.10 },
        { selectionId: `${match.id}_fh_2`, label: '2', value: r2 ? parseFloat((r2 * 1.3 + 0.3).toFixed(2)) : 3.40 }
      ]
    },
    {
      name: `${homeName} Exact Total Goals`,
      category: 'Goals',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_htot_o05`, label: 'Over 0.5', value: 1.18 },
        { selectionId: `${match.id}_htot_u05`, label: 'Under 0.5', value: 4.80 },
        { selectionId: `${match.id}_htot_o15`, label: 'Over 1.5', value: 1.85 },
        { selectionId: `${match.id}_htot_u15`, label: 'Under 1.5', value: 1.95 }
      ]
    },
    {
      name: `${awayName} Exact Total Goals`,
      category: 'Goals',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_atot_o05`, label: 'Over 0.5', value: 1.30 },
        { selectionId: `${match.id}_atot_u05`, label: 'Under 0.5', value: 3.60 },
        { selectionId: `${match.id}_atot_o15`, label: 'Over 1.5', value: 2.40 },
        { selectionId: `${match.id}_atot_u15`, label: 'Under 1.5', value: 1.55 }
      ]
    }
  ];

  // Category Filter Chips Navigator
  html += `
    <div style="margin-top: 16px;">
      <div style="display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; padding: 4px 0; scrollbar-width: none;">
        ${['All Markets', 'Main', 'First Half', 'Goals'].map(tab => {
          const isActive = activeFilter === tab;
          return `
            <button class="sport-chip ${isActive ? 'active' : ''} filter-chip-tab" data-tab="${tab}">
              <span>${tab}</span>
            </button>
          `;
        }).join('')}
      </div>

      <div class="markets-section" style="display: flex; flex-direction: column; gap: 12px;">
        ${marketDetailsList
          .filter(market => activeFilter === 'All Markets' || activeFilter === market.category)
          .map((market, mIdx) => {
            return `
              <div class="market-accordion">
                <div class="market-accordion-header" data-index="${mIdx}">
                  <div class="market-accordion-header-left">
                    <span class="material-icons-round pin-icon">push_pin</span>
                    <span class="market-title">${market.name}</span>
                  </div>
                  <div class="market-accordion-header-right">
                    <span class="material-icons-round accordion-arrow-icon">expand_less</span>
                  </div>
                </div>
                <div class="market-accordion-content" id="market-content-${mIdx}">
                  <div class="market-odds-grid" style="grid-template-columns: repeat(${market.columns}, 1fr);">
                    ${market.odds.map(odd => {
                      const isSelected = selections.some(s => s.id === odd.selectionId);
                      const flash = simulation.getFlashState(match.id, odd.selectionId);
                      const isSuspended = odd.isSuspended || odd.value === null || odd.value === undefined;

                      if (isSuspended) {
                        return `
                          <button class="market-odds-btn" disabled>
                            <span class="selection-label">${odd.label}</span>
                            <span class="selection-odds">-</span>
                          </button>
                        `;
                      }
                      
                      return `
                        <button class="market-odds-btn ${isSelected ? 'selected' : ''} ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}" 
                          data-id="${odd.selectionId}" 
                          data-team="${odd.label}" 
                          data-market="${market.name}" 
                          data-value="${odd.value}">
                          <span class="selection-label">${odd.label}</span>
                          <span class="selection-odds">${formatOdds(odd.value)}</span>
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

  // Filter chips tab click listeners
  container.querySelectorAll('.filter-chip-tab').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.getAttribute('data-tab');
      renderMatchDetailsView();
    });
  });

  // Accordions toggle listeners
  container.querySelectorAll('.market-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const idx = header.getAttribute('data-index');
      const content = document.getElementById(`market-content-${idx}`);
      if (content) {
        const arrow = header.querySelector('.accordion-arrow-icon');
        if (content.style.display === 'none') {
          content.style.display = 'block';
          if (arrow) arrow.innerText = 'expand_less';
        } else {
          content.style.display = 'none';
          if (arrow) arrow.innerText = 'expand_more';
        }
      }
    });
  });

  // Odds button selections handler
  container.querySelectorAll('.market-odds-btn').forEach(btn => {
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

  document.getElementById('trigger-stats-modal')?.addEventListener('click', () => {
    alert(`Event Statistics:\n\nMatch State: ${match.isLive ? 'Live In-Play (' + match.timer + '\')' : 'Upcoming scheduled'}\nScore: ${match.teams.home.name} ${match.scores.home} - ${match.scores.away} ${match.teams.away.name}\nVenue: ${match.venue || 'Main Stadium'}`);
  });
}

export default renderMatchDetailsView;
