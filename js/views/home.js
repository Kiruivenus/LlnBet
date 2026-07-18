import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { sportsList, promotionsList } from '../data.js';
import { getMaterialIcon, formatOdds, formatCurrency, renderTeamBadge } from '../utils.js';

export function renderHomeView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const matches = simulation.getMatches();
  const activeSport = state.data.activeSport;
  const selections = state.data.betslip.selections;

  const sportMatches = matches.filter(m => m.sport === activeSport);
  const liveMatches = sportMatches.filter(m => m.isLive);
  const upcomingMatches = sportMatches.filter(m => !m.isLive);

  let html = `
    <!-- Premium Promo Hero Banner -->
    <div class="hero-slider">
      <div class="hero-bg" style="background-image: url('assets/hero_banner.png'); background-size: cover; background-position: center; opacity: 0.85;"></div>
      <div class="hero-content">
        <span class="hero-tag">Special Promo</span>
        <h1 class="hero-title">Start Betting with Double the Power</h1>
        <p class="hero-desc">Get a 100% deposit bonus on your first funding up to KES 50,000. Bet on Premier League, NBA, and Tennis with premium boosted odds.</p>
        <button class="hero-cta" id="hero-deposit-link">
          ${getMaterialIcon('deposit')}
          Claim Bonus Now
        </button>
      </div>
    </div>

    <!-- Sports Category Horizontal Chips Navigation -->
    <div class="sports-nav-wrapper">
      <div class="sports-nav">
        ${sportsList.map(sport => `
          <button class="sport-chip ${activeSport === sport.id ? 'active' : ''}" data-sport="${sport.id}">
            <span>${getMaterialIcon(sport.icon)}</span>
            <span>${sport.name}</span>
            <span class="sport-chip-count">${sport.count}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Live Matches Grid -->
    <div>
      <div class="section-header">
        <div class="section-title-area">
          <h2 class="section-title">Live In-Play Matches</h2>
          <span class="section-badge">
            <span class="pulse-dot"></span>
            Live
          </span>
        </div>
        <button class="text-link" id="view-all-live-link">
          Live Hub
          ${getMaterialIcon('back', 'icon-rotated-right')}
        </button>
      </div>

      <div class="match-grid">
        ${liveMatches.length === 0 ? `
          <div style="text-align:center; padding:30px; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            No live matches in progress for this category.
          </div>
        ` : liveMatches.map(match => renderMatchCard(match, selections)).join('')}
      </div>
    </div>

    <!-- Upcoming Matches Grid -->
    <div>
      <div class="section-header">
        <h2 class="section-title">Upcoming Fixtures</h2>
      </div>

      <div class="match-grid">
        ${upcomingMatches.length === 0 ? `
          <div style="text-align:center; padding:30px; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            No upcoming fixtures for this category.
          </div>
        ` : upcomingMatches.map(match => renderMatchCard(match, selections)).join('')}
      </div>
    </div>

    <!-- Promotions Cards Row -->
    <div style="margin-top:20px;">
      <h2 class="section-title" style="margin-bottom:16px;">Featured Bonuses</h2>
      <div class="promotions-grid">
        ${promotionsList.slice(1, 3).map(promo => `
          <div class="promo-card">
            <div class="promo-img-placeholder">
              <span class="promo-img-logo">${promo.logoText}</span>
              <span class="promo-tag">${promo.tag}</span>
            </div>
            <div class="promo-content">
              <h3 class="promo-title">${promo.title}</h3>
              <p class="promo-desc">${promo.desc}</p>
              <button class="promo-btn promo-claim-btn">Opt In</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Responsible Gambling notice banner -->
    <div class="responsible-banner">
      <div class="responsible-icon">
        ${getMaterialIcon('shield')}
      </div>
      <div class="responsible-text-area">
        <h4 class="responsible-heading">Play Responsibly (18+)</h4>
        <p class="responsible-desc">Betting should be entertaining and structured. Set deposit limits, session limits, or self-exclude by contacting support. NCPG support helpline is confidential and available 24/7.</p>
      </div>
    </div>

    <!-- Professional Sportsbook Footer -->
    <footer class="app-footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4 class="footer-title">About BetPulse</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">BetPulse is a leading licensed online sports betting operator in Kenya providing state-of-the-art live feeds, secure transaction channels, and multi-market calculators.</p>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">Information</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link-btn" data-page="promotions">Promotions</a></li>
            <li><a href="#" class="footer-link-btn" data-page="dashboard">My Account</a></li>
            <li><a href="#" class="footer-link-btn" data-page="wallet">Deposit/Withdraw</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">Responsible Gaming</h4>
          <ul class="footer-links">
            <li><a href="#" id="footer-rg-btn">Gaming Limits</a></li>
            <li><a href="#" id="footer-se-btn">Self-Exclusion</a></li>
            <li><a href="#" id="footer-support-btn">Support Helpline</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">Licensing</h4>
          <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.4;">BetPulse is regulated and licensed by the Betting Control and Licensing Board. License No. BCLB-2026-A829. All software audited for fairness and random compliance.</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <span>© 2026 BetPulse Sportsbook. All rights reserved. Registered customer data encrypted.</span>
        <div class="footer-logos" style="display:flex; align-items:center; gap:16px;">
          <span style="display:flex; align-items:center; gap:4px;">
            ${getMaterialIcon('credit_card')}
            M-Pesa / Visa
          </span>
          <span style="display:flex; align-items:center; gap:4px;">
            ${getMaterialIcon('shield')}
            18+ Safe
          </span>
        </div>
      </div>
    </footer>
  `;

  container.innerHTML = html;

  // Bind events
  document.getElementById('hero-deposit-link')?.addEventListener('click', () => {
    state.setPage('wallet');
  });

  container.querySelectorAll('.sport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sportId = chip.getAttribute('data-sport');
      state.setSport(sportId);
    });
  });

  // Odds buttons click
  container.querySelectorAll('.odds-btn').forEach(btn => {
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

  container.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => {
      const matchId = card.getAttribute('data-id');
      state.setPage('match-details', matchId);
    });
  });

  container.querySelectorAll('.footer-link-btn').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      state.setPage(page);
    });
  });

  document.getElementById('view-all-live-link')?.addEventListener('click', () => state.setPage('live'));

  document.getElementById('footer-rg-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Gaming Limits:\n\nCustomize your session duration, wager size caps, and loss limits inside your Dashboard account page.");
  });

  document.getElementById('footer-se-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Self-Exclusion:\n\nYou can request permanent or temporary exclusion of your account inside dashboard.");
  });

  document.getElementById('footer-support-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Support Helpline:\n\nConfidential gambling support is available 24/7. Call NCPG support lines at 1-800-GAMBLER.");
  });

  container.querySelectorAll('.promo-claim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert("Promotion Opt-in: You have successfully registered for this promotion!");
    });
  });
}

export function renderMatchCard(match, selections) {
  const isHomeSelected = selections.some(s => s.id === `${match.id}_1`);
  const isDrawSelected = selections.some(s => s.id === `${match.id}_x`);
  const isAwaySelected = selections.some(s => s.id === `${match.id}_2`);

  const mainMarket = match.markets[0];
  const homeOdd = mainMarket.odds[0];
  const drawOdd = mainMarket.odds[1];
  const awayOdd = mainMarket.odds[2];

  const homeFlash = simulation.getFlashState(match.id, homeOdd.selectionId);
  const drawFlash = drawOdd ? simulation.getFlashState(match.id, drawOdd.selectionId) : null;
  const awayFlash = awayOdd ? simulation.getFlashState(match.id, awayOdd.selectionId) : null;

  return `
    <div class="match-card" data-id="${match.id}">
      
      <!-- Info Left Column -->
      <div class="match-info-side">
        <div class="match-meta">
          <span class="league-name">${match.league}</span>
          <span style="color:var(--text-muted);">•</span>
          ${match.isLive ? `
            <span class="live-indicator">
              <span class="pulse-dot"></span>
              ${match.timer}'
            </span>
          ` : `
            <span>${match.kickoffTime}</span>
          `}
        </div>

        <div class="match-teams">
          <div class="team-row">
            <span>
              ${renderTeamBadge(match.teams.home.name)}
              ${match.teams.home.name}
            </span>
            ${match.isLive ? `<span class="score-box">${match.scores.home}</span>` : ''}
          </div>
          <div class="team-row">
            <span>
              ${renderTeamBadge(match.teams.away.name)}
              ${match.teams.away.name}
            </span>
            ${match.isLive ? `<span class="score-box">${match.scores.away}</span>` : ''}
          </div>
        </div>

        <div class="match-footer-meta">
          <span class="match-stat-link">
            📊 Stats & H2H
          </span>
          <span style="color:var(--text-muted);">•</span>
          <span>+${match.markets.length * 4} Markets</span>
        </div>
      </div>

      <!-- Betting Odds Right Column -->
      <div class="match-odds-side">
        <div class="odds-market-title">${mainMarket.name}</div>
        <div class="odds-grid">
          
          <button class="odds-btn ${isHomeSelected ? 'selected' : ''} ${homeFlash === 'up' ? 'flash-up' : homeFlash === 'down' ? 'flash-down' : ''} ${homeOdd.isLocked ? 'locked' : ''}" 
            data-id="${homeOdd.selectionId}" 
            data-match-id="${match.id}"
            data-team="${match.teams.home.name}" 
            data-market="Home Win" 
            data-value="${homeOdd.value}">
            <span class="odds-label">1</span>
            <span class="odds-value">${formatOdds(homeOdd.value)}</span>
          </button>

          ${drawOdd ? `
            <button class="odds-btn ${isDrawSelected ? 'selected' : ''} ${drawFlash === 'up' ? 'flash-up' : drawFlash === 'down' ? 'flash-down' : ''} ${drawOdd.isLocked ? 'locked' : ''}" 
              data-id="${drawOdd.selectionId}" 
              data-match-id="${match.id}"
              data-team="Draw" 
              data-market="Draw" 
              data-value="${drawOdd.value}">
              <span class="odds-label">X</span>
              <span class="odds-value">${formatOdds(drawOdd.value)}</span>
            </button>
          ` : `
            <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); opacity:0.3; border-radius:var(--radius-sm);"></div>
          `}

          ${awayOdd ? `
            <button class="odds-btn ${isAwaySelected ? 'selected' : ''} ${awayFlash === 'up' ? 'flash-up' : awayFlash === 'down' ? 'flash-down' : ''} ${awayOdd.isLocked ? 'locked' : ''}" 
              data-id="${awayOdd.selectionId}" 
              data-match-id="${match.id}"
              data-team="${match.teams.away.name}" 
              data-market="Away Win" 
              data-value="${awayOdd.value}">
              <span class="odds-label">2</span>
              <span class="odds-value">${formatOdds(awayOdd.value)}</span>
            </button>
          ` : `
            <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); opacity:0.3; border-radius:var(--radius-sm);"></div>
          `}

        </div>
      </div>

    </div>
  `;
}
export default renderHomeView;
