import { getMaterialIcon } from '../utils.js';

export function renderLiveTracker(match) {
  if (!match) return '';

  const stats = match.stats || {
    possession: { home: 50, away: 50 },
    shots: { home: 5, away: 5 },
    shotsOnTarget: { home: 2, away: 2 },
    corners: { home: 3, away: 3 },
    yellowCards: { home: 1, away: 1 },
    redCards: { home: 0, away: 0 }
  };

  let momentumBarsHtml = '';
  const barCount = 30;
  for (let i = 0; i < barCount; i++) {
    const intensity = Math.floor(Math.sin((i / 4.0) + (parseInt(match.timer) || 0) * 0.1) * 35) + Math.floor(Math.random() * 20 - 10);
    const height = Math.abs(intensity);
    
    momentumBarsHtml += `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: ${intensity >= 0 ? 'flex-end' : 'flex-start'};
        height: 100%;
        width: 6px;
      ">
        ${intensity >= 0 ? `
          <div class="momentum-bar-col" style="height: ${height}%; background: var(--accent-emerald);"></div>
          <div style="height: 50%; width: 1px;"></div>
        ` : `
          <div style="height: 50%; width: 1px;"></div>
          <div class="momentum-bar-col away" style="height: ${height}%; background: var(--accent-orange);"></div>
        `}
      </div>
    `;
  }

  const timerVal = parseInt(match.timer) || 0;
  let pitchStatus = "Midfield Possession";
  let ballLeft = 50;
  let ballTop = 50;

  if (match.isLive) {
    const seed = (timerVal + match.scores.home * 7 + match.scores.away * 13) % 6;
    switch(seed) {
      case 0:
        pitchStatus = `Dangerous Attack: ${match.teams.home.name}`;
        ballLeft = 82;
        ballTop = 45;
        break;
      case 1:
        pitchStatus = `${match.teams.away.name} Throw-in`;
        ballLeft = 35;
        ballTop = 15;
        break;
      case 2:
        pitchStatus = `Corner Kick for ${match.teams.home.name}`;
        ballLeft = 95;
        ballTop = 85;
        break;
      case 3:
        pitchStatus = `Goal Kick: ${match.teams.away.name}`;
        ballLeft = 10;
        ballTop = 50;
        break;
      case 4:
        pitchStatus = `Attacking Third: ${match.teams.away.name}`;
        ballLeft = 24;
        ballTop = 60;
        break;
      default:
        pitchStatus = `Ball Possession: ${match.teams.home.name}`;
        ballLeft = 60;
        ballTop = 38;
        break;
    }
  } else {
    pitchStatus = "Event Concluded";
  }

  return `
    <div class="tracker-container">
      
      <!-- Visual Live Match Pitch Tracker -->
      <div class="tracker-card">
        <h3 class="tracker-title">Live Match Tracker</h3>
        <div class="pitch-visualizer">
          <div class="pitch-line-center"></div>
          <div class="pitch-circle-center"></div>
          <div style="position: absolute; left: 0; top: 30%; bottom: 30%; width: 12px; border: 2px solid rgba(255,255,255,0.2); border-left: none;"></div>
          <div style="position: absolute; right: 0; top: 30%; bottom: 30%; width: 12px; border: 2px solid rgba(255,255,255,0.2); border-right: none;"></div>
          
          <div class="pitch-ball" style="left: ${ballLeft}%; top: ${ballTop}%;"></div>
          
          <div class="pitch-text">
            <span style="color:var(--accent-orange); font-weight:800; text-transform:uppercase;">• ${pitchStatus}</span>
          </div>
        </div>
      </div>

      <!-- Live Statistics & Momentum Graphs -->
      <div class="tracker-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 class="tracker-title">Momentum Chart</h3>
          <div class="momentum-graph-box">
            <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--border-color-light); z-index: 1;"></div>
            <div class="momentum-bar-chart" style="position: relative; z-index: 2; height:120px;">
              ${momentumBarsHtml}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); margin-top:8px;">
              <span>${match.teams.home.name}</span>
              <span>Timeline (90 min)</span>
              <span>${match.teams.away.name}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Match Statistics Section -->
    <div class="tracker-card" style="margin-top:16px;">
      <h3 class="tracker-title" style="margin-bottom:20px;">Match Statistics</h3>
      <div class="live-stats-list">
        
        ${renderStatBar('Possession', stats.possession.home, stats.possession.away, '%')}
        ${renderStatBar('Total Shots', stats.shots.home, stats.shots.away)}
        ${renderStatBar('Shots on Target', stats.shotsOnTarget.home, stats.shotsOnTarget.away)}
        ${renderStatBar('Corners', stats.corners.home, stats.corners.away)}

        <!-- Cards Row -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-charcoal); padding:10px; border-radius:var(--radius-sm);">
            <span style="font-size:0.85rem; color:var(--text-secondary);">Yellow Cards</span>
            <div style="display:flex; gap:12px; font-family:var(--font-mono); font-weight:700;">
              <span style="color:var(--accent-emerald);">${stats.yellowCards.home}</span>
              <span style="color:var(--text-muted);">|</span>
              <span style="color:var(--accent-orange);">${stats.yellowCards.away}</span>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-charcoal); padding:10px; border-radius:var(--radius-sm);">
            <span style="font-size:0.85rem; color:var(--text-secondary);">Red Cards</span>
            <div style="display:flex; gap:12px; font-family:var(--font-mono); font-weight:700;">
              <span style="color:var(--accent-emerald);">${stats.redCards.home}</span>
              <span style="color:var(--text-muted);">|</span>
              <span style="color:var(--accent-orange);">${stats.redCards.away}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderStatBar(name, homeVal, awayVal, suffix = '') {
  const home = parseFloat(homeVal) || 0;
  const away = parseFloat(awayVal) || 0;
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  const awayPct = 100 - homePct;

  return `
    <div class="live-stat-row">
      <div class="live-stat-labels">
        <span>${home}${suffix}</span>
        <span class="live-stat-label-name">${name}</span>
        <span>${away}${suffix}</span>
      </div>
      <div class="live-stat-bar-container">
        <div class="live-stat-bar-home" style="width: ${homePct}%;"></div>
        <div class="live-stat-bar-away" style="width: ${awayPct}%;"></div>
      </div>
    </div>
  `;
}
export default renderLiveTracker;
