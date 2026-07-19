import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { renderLiveTracker } from '../components/liveTracker.js';
import { getMaterialIcon, formatOdds, renderTeamBadge } from '../utils.js';

// Local variable to store selected filter tab state
let activeFilter = 'All Markets';

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

  // Extract base odds for dynamic calculations
  const mainMarket = match.markets[0] || { odds: [] };
  const homeOddObj = mainMarket.odds[0] || {};
  const drawOddObj = mainMarket.odds[1] || {};
  const awayOddObj = mainMarket.odds[2] || {};

  const r1 = homeOddObj.value;
  const rx = drawOddObj.value;
  const r2 = awayOddObj.value;

  const homeName = match.teams.home.name;
  const awayName = match.teams.away.name;

  // Hero Section HTML (Norway, Eliteserien style)
  let html = `
    <!-- Navigation Back Header -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
      <button class="icon-btn" id="details-back-btn" aria-label="Go Back">
        ${getMaterialIcon('back')}
      </button>
      <span style="font-size: 0.95rem; font-weight:600; color:var(--text-secondary);">${match.country}, ${match.league}</span>
    </div>

    <!-- Match Scoreboard Hero -->
    <div class="match-hero" style="position:relative; overflow:hidden; padding:24px var(--spacing-lg);">
      <div class="match-hero-scoreboard" style="display:flex; align-items:center; justify-content:space-between;">
        
        <!-- Home Team -->
        <div class="hero-team" style="display:flex; flex-direction:column; align-items:center; gap:8px;">
          <span class="hero-team-logo" style="margin:0; width:56px; height:56px; display:flex; align-items:center; justify-content:center; background:var(--bg-charcoal); border-radius:50%;">${renderTeamBadge(homeName)}</span>
          <span class="hero-team-name" style="font-size:1.1rem; font-weight:800;">${homeName}</span>
        </div>

        <!-- Score Center / Kickoff Time -->
        <div class="hero-score-center" style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">VS</span>
          <span style="font-size:0.9rem; font-weight:600; color:var(--accent-orange);">${match.kickoffTime || '18/07 19:00'}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">#${match.id.replace(/\D/g, '') || Math.floor(Math.random() * 90000 + 10000)}</span>
        </div>

        <!-- Away Team -->
        <div class="hero-team" style="display:flex; flex-direction:column; align-items:center; gap:8px;">
          <span class="hero-team-logo" style="margin:0; width:56px; height:56px; display:flex; align-items:center; justify-content:center; background:var(--bg-charcoal); border-radius:50%;">${renderTeamBadge(awayName)}</span>
          <span class="hero-team-name" style="font-size:1.1rem; font-weight:800;">${awayName}</span>
        </div>

      </div>

      <!-- Scoreboard & Stats links -->
      <div style="display:flex; justify-content:center; gap:24px; margin-top:20px; font-size:0.85rem; font-weight:700; color:var(--text-secondary); border-top:1px solid var(--border-color); padding-top:12px;">
        <span style="display:flex; align-items:center; gap:6px;">
          ${getMaterialIcon('live')}
          ${match.isLive ? `${match.scores.home}:${match.scores.away}` : '0:0'} Scoreboard
        </span>
        <span style="display:flex; align-items:center; gap:6px; cursor:pointer;" id="trigger-stats-modal">
          ${getMaterialIcon('analytics')}
          Statistics
        </span>
      </div>
    </div>
  `;

  // Render momentum and stats if match is live
  if (match.isLive) {
    html += renderLiveTracker(match);
  }

  // Generate expanded list of 14 betting markets dynamically
  const marketDetailsList = [
    {
      name: '1X2',
      category: 'Main',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_m1`, label: '1', value: r1, isSuspended: homeOddObj.isSuspended },
        { selectionId: `${match.id}_mx`, label: 'X', value: rx, isSuspended: drawOddObj.isSuspended },
        { selectionId: `${match.id}_m2`, label: '2', value: r2, isSuspended: awayOddObj.isSuspended }
      ]
    },
    {
      name: 'Both Teams To Score (Gg/ng)',
      category: 'Main',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_btts_yes`, label: 'Yes', value: r1 && r2 ? parseFloat((1 / (1 - (1/r1 + 1/r2)*0.4)).toFixed(2)) : null },
        { selectionId: `${match.id}_btts_no`, label: 'No', value: r1 && r2 ? parseFloat(((r1 + r2) / 1.5).toFixed(2)) : null }
      ]
    },
    {
      name: 'Double Chance',
      category: 'Main',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_dc_1x`, label: '1/X', value: r1 && rx ? parseFloat((1 / (1/r1 + 1/rx) * 1.05).toFixed(2)) : null },
        { selectionId: `${match.id}_dc_x2`, label: 'X/2', value: rx && r2 ? parseFloat((1 / (1/rx + 1/r2) * 1.05).toFixed(2)) : null },
        { selectionId: `${match.id}_dc_12`, label: '1/2', value: r1 && r2 ? parseFloat((1 / (1/r1 + 1/r2) * 1.05).toFixed(2)) : null }
      ]
    },
    {
      name: 'Total',
      category: 'Goals',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_tot_o15`, label: 'Over 1.5', value: 1.15 },
        { selectionId: `${match.id}_tot_u15`, label: 'Under 1.5', value: 5.60 },
        { selectionId: `${match.id}_tot_o25`, label: 'Over 2.5', value: 1.48 },
        { selectionId: `${match.id}_tot_u25`, label: 'Under 2.5', value: 2.70 },
        { selectionId: `${match.id}_tot_o35`, label: 'Over 3.5', value: 2.16 },
        { selectionId: `${match.id}_tot_u35`, label: 'Under 3.5', value: 1.71 },
        { selectionId: `${match.id}_tot_o45`, label: 'Over 4.5', value: 3.60 },
        { selectionId: `${match.id}_tot_u45`, label: 'Under 4.5', value: 1.29 },
        { selectionId: `${match.id}_tot_o55`, label: 'Over 5.5', value: 6.40 },
        { selectionId: `${match.id}_tot_u55`, label: 'Under 5.5', value: 1.12 }
      ]
    },
    {
      name: 'Who Will Win? (If Draw, Money Back)',
      category: 'Main',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_dnb_1`, label: '1', value: r1 ? parseFloat((r1 * 0.75).toFixed(2)) : null },
        { selectionId: `${match.id}_dnb_2`, label: '2', value: r2 ? parseFloat((r2 * 0.75).toFixed(2)) : null }
      ]
    },
    {
      name: '1st Half - 1X2',
      category: 'First Half',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_fh_1`, label: '1', value: r1 ? parseFloat((r1 * 1.3 + 0.3).toFixed(2)) : null },
        { selectionId: `${match.id}_fh_x`, label: 'X', value: rx ? parseFloat((rx * 0.75).toFixed(2)) : null },
        { selectionId: `${match.id}_fh_2`, label: '2', value: r2 ? parseFloat((r2 * 1.3 + 0.3).toFixed(2)) : null }
      ]
    },
    {
      name: '1st Half - Total',
      category: 'First Half',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_fh_o05`, label: 'Over 0.5', value: 1.25 },
        { selectionId: `${match.id}_fh_u05`, label: 'Under 0.5', value: 3.85 },
        { selectionId: `${match.id}_fh_o15`, label: 'Over 1.5', value: 2.12 },
        { selectionId: `${match.id}_fh_u15`, label: 'Under 1.5', value: 1.70 },
        { selectionId: `${match.id}_fh_o25`, label: 'Over 2.5', value: 4.50 },
        { selectionId: `${match.id}_fh_u25`, label: 'Under 2.5', value: 1.20 }
      ]
    },
    {
      name: '1st Goal',
      category: 'Goals',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_fg_none`, label: 'None', value: 23.00 },
        { selectionId: `${match.id}_fg_1`, label: '1', value: r1 ? parseFloat((r1 * 0.85).toFixed(2)) : null },
        { selectionId: `${match.id}_fg_2`, label: '2', value: r2 ? parseFloat((r2 * 0.85).toFixed(2)) : null }
      ]
    },
    {
      name: '10 Minutes - 1X2 From 1st To 10th',
      category: 'First Half',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_10m_1`, label: '1', value: 6.60 },
        { selectionId: `${match.id}_10m_x`, label: 'X', value: 1.23 },
        { selectionId: `${match.id}_10m_2`, label: '2', value: 8.00 }
      ]
    },
    {
      name: 'Multigoals',
      category: 'Goals',
      columns: 3,
      odds: [
        { selectionId: `${match.id}_mg_12`, label: '1-2', value: 2.35 },
        { selectionId: `${match.id}_mg_13`, label: '1-3', value: 1.55 },
        { selectionId: `${match.id}_mg_14`, label: '1-4', value: 1.25 },
        { selectionId: `${match.id}_mg_15`, label: '1-5', value: 1.12 },
        { selectionId: `${match.id}_mg_16`, label: '1-6', value: 1.06 },
        { selectionId: `${match.id}_mg_23`, label: '2-3', value: 1.86 },
        { selectionId: `${match.id}_mg_24`, label: '2-4', value: 1.40 },
        { selectionId: `${match.id}_mg_25`, label: '2-5', value: 1.23 },
        { selectionId: `${match.id}_mg_26`, label: '2-6', value: 1.16 },
        { selectionId: `${match.id}_mg_34`, label: '3-4', value: 1.90 },
        { selectionId: `${match.id}_mg_35`, label: '3-5', value: 1.55 },
        { selectionId: `${match.id}_mg_36`, label: '3-6', value: 1.41 },
        { selectionId: `${match.id}_mg_45`, label: '4-5', value: 2.34 },
        { selectionId: `${match.id}_mg_46`, label: '4-6', value: 1.97 },
        { selectionId: `${match.id}_mg_56`, label: '5-6', value: 3.50 },
        { selectionId: `${match.id}_mg_7`, label: '7+', value: 11.08 },
        { selectionId: `${match.id}_mg_nogoal`, label: 'No Goal', value: 15.89 }
      ]
    },
    {
      name: `${homeName} Total`,
      category: 'Goals',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_htot_o05`, label: 'Over 0.5', value: 1.14 },
        { selectionId: `${match.id}_htot_u05`, label: 'Under 0.5', value: 5.20 },
        { selectionId: `${match.id}_htot_o15`, label: 'Over 1.5', value: 1.71 },
        { selectionId: `${match.id}_htot_u15`, label: 'Under 1.5', value: 2.07 },
        { selectionId: `${match.id}_htot_o25`, label: 'Over 2.5', value: 3.15 },
        { selectionId: `${match.id}_htot_u25`, label: 'Under 2.5', value: 1.33 }
      ]
    },
    {
      name: `${awayName} Total`,
      category: 'Goals',
      columns: 2,
      odds: [
        { selectionId: `${match.id}_atot_o05`, label: 'Over 0.5', value: 1.24 },
        { selectionId: `${match.id}_atot_u05`, label: 'Under 0.5', value: 4.50 },
        { selectionId: `${match.id}_atot_o15`, label: 'Over 1.5', value: 2.15 },
        { selectionId: `${match.id}_atot_u15`, label: 'Under 1.5', value: 1.75 },
        { selectionId: `${match.id}_atot_o25`, label: 'Over 2.5', value: 4.80 },
        { selectionId: `${match.id}_atot_u25`, label: 'Under 2.5', value: 1.18 }
      ]
    }
  ];

  // Filter navigator HTML row (lime green tab chips)
  html += `
    <div style="margin-top:20px;">
      <div style="display:flex; gap:8px; overflow-x:auto; margin-bottom:16px; padding:4px 0; scrollbar-width:none;-ms-overflow-style:none;">
        ${['My Favourites', 'All Markets', 'Main', 'First Half', 'Goals'].map(tab => {
          const isActive = activeFilter === tab;
          const style = isActive 
            ? 'background:#a3e635; color:#080a0f; border-color:#a3e635; font-weight:800;'
            : 'background:var(--bg-charcoal); color:var(--text-secondary); border-color:var(--border-color);';
          return `
            <button class="filter-chip-tab" data-tab="${tab}" style="border:1px solid; border-radius:var(--radius-full); padding:8px 16px; cursor:pointer; font-size:0.85rem; font-family:var(--font-display); white-space:nowrap; transition:all 0.2s; ${style}">
              ${tab}
            </button>
          `;
        }).join('')}
      </div>

      <div class="markets-section" style="display:flex; flex-direction:column; gap:12px;">
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
                    <span class="material-icons-round accordion-arrow-icon" style="font-size:1.4rem;">expand_less</span>
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
      renderMatchDetailsView(); // Re-render this view to swap list items
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
        team: team, // e.g. "Yes", "Over 2.5", "1X"
        market: market, // e.g. "Total Goals"
        odds: oddsVal
      });
    });
  });

  document.getElementById('trigger-stats-modal')?.addEventListener('click', () => {
    alert(`Event Statistics:\n\nMatch State: ${match.isLive ? 'Live In-Play (' + match.timer + '\')' : 'Upcoming scheduled'}\nScore: ${match.teams.home.name} ${match.scores.home} - ${match.scores.away} ${match.teams.away.name}\nVenue: ${match.venue}`);
  });
}
export default renderMatchDetailsView;
