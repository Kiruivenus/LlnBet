import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { sportsList, promotionsList } from '../data.js';
import { getMaterialIcon, formatOdds, formatCurrency, formatDate } from '../utils.js';

export function renderHomeView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const matches = simulation.getMatches();
  const activeSport = state.data.activeSport;
  const selections = state.data.betslip ? state.data.betslip.selections : [];

  const sportMatches = matches.filter(m => m.sport === activeSport);
  const liveMatches = sportMatches.filter(m => m.isLive);
  const upcomingMatches = sportMatches.filter(m => !m.isLive);

  // Check if slider wrapper exists to preserve smooth auto-slide interval
  const hasSlider = container.querySelector('.hero-slider-container');
  if (hasSlider) {
    // 1. Update sports category chip active states & counts
    const chipsList = container.querySelector('.sports-chips-list');
    if (chipsList) {
      chipsList.innerHTML = sportsList.map(sport => {
        const count = matches.filter(m => m.sport === sport.id).length;
        const liveCount = matches.filter(m => m.sport === sport.id && m.isLive).length;
        return `
          <button class="sport-chip ${activeSport === sport.id ? 'active' : ''}" data-sport="${sport.id}">
            <span>${getMaterialIcon(sport.icon)}</span>
            <span>${sport.name}</span>
            <span class="sport-chip-count">
              ${liveCount > 0 ? `<span style="color: var(--color-danger); font-weight: 800;">● ${liveCount}</span> / ` : ''}${count}
            </span>
          </button>
        `;
      }).join('');

      chipsList.querySelectorAll('.sport-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const sportId = chip.getAttribute('data-sport');
          state.setSport(sportId);
        });
      });
    }

    // 2. Update match cards list
    const matchCardsList = container.querySelector('.match-cards-container');
    if (matchCardsList) {
      matchCardsList.innerHTML = sportMatches.length === 0 ? `
        <div style="padding: 48px 24px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
          No match fixtures available for this category right now.
        </div>
      ` : sportMatches.map(match => renderMatchCard(match, selections)).join('');

      bindMatchCardEvents(matchCardsList, matches);
    }
    return;
  }

  if (window.homeCurrentSlideIdx === undefined) {
    window.homeCurrentSlideIdx = 0;
  }
  const activeIdx = window.homeCurrentSlideIdx;

  let html = `
    <!-- Hero Promotional Banner Carousel (300px Desktop / 220px Mobile) -->
    <div class="hero-slider-container">
      <div class="hero-slider-track" id="hero-slider-track">
        
        <!-- Slide 1: 100% Deposit Match -->
        <div class="hero-slide ${activeIdx === 0 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(5, 150, 105, 0.95), rgba(16, 185, 129, 0.82)), url('/img/hero-banner-bg.png');">
          <div class="hero-slide-content">
            <span class="hero-badge">Welcome Bonus</span>
            <h1 class="hero-title">100% DEPOSIT MATCH UP TO KES 50,000</h1>
            <p class="hero-desc">Register with LlnBet today and double your initial cashier deposit with instant wallet activation.</p>
            <div class="hero-actions-row">
              <button class="hero-cta-btn" id="slide-deposit-btn">Claim 100% Bonus</button>
              <button class="hero-quick-odd" id="slide-explore-btn">Explore Sports</button>
            </div>
          </div>
          <div class="hero-slide-graphic">
            <div class="hero-graphic-badge">100%</div>
          </div>
        </div>

        <!-- Slide 2: Esports Specials -->
        <div class="hero-slide ${activeIdx === 1 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(239, 68, 68, 0.85));">
          <div class="hero-slide-content">
            <span class="hero-badge" style="background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4);">Esports Superboost</span>
            <h1 class="hero-title">CYBERSPORTS BOOSTED ODDS</h1>
            <p class="hero-desc">High-speed live in-play multipliers on Counter-Strike 2, Dota 2, and Virtual Leagues.</p>
            <div class="hero-actions-row">
              <button class="hero-cta-btn" id="slide-esports-btn" style="background: var(--color-danger);">Bet In-Play</button>
            </div>
          </div>
          <div class="hero-slide-graphic">
            <span class="material-icons-round" style="font-size: 5.5rem; color: rgba(255,255,255,0.15);">sports_esports</span>
          </div>
        </div>

        <!-- Slide 3: Athletic Bilbao Partnership -->
        <div class="hero-slide ${activeIdx === 2 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(69, 10, 10, 0.95), rgba(17, 24, 39, 0.9));">
          <div class="hero-slide-content">
            <span class="hero-badge" style="background: rgba(245,158,11,0.2); border-color: rgba(245,158,11,0.4);">La Liga Regional Partner</span>
            <h1 class="hero-title">ATHLETIC CLUB BILBAO SPECIALS</h1>
            <p class="hero-desc">Support the lions of Basque country with customized player props and guaranteed early cashout payouts.</p>
            <div class="hero-actions-row">
              <button class="hero-cta-btn" id="slide-bilbao-btn" style="background: var(--color-warning); color: #000;">View Fixtures</button>
            </div>
          </div>
          <div class="hero-slide-graphic">
            <span class="material-icons-round" style="font-size: 5.5rem; color: rgba(255,255,255,0.15);">sports_soccer</span>
          </div>
        </div>

        <!-- Slide 4: World Cup Spain vs Argentina -->
        <div class="hero-slide ${activeIdx === 3 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(3, 105, 161, 0.85));">
          <div class="hero-slide-content">
            <span class="hero-badge">World Cup Final</span>
            <h1 class="hero-title">SPAIN vs ARGENTINA</h1>
            <p class="hero-desc">Lamine Yamal vs Lionel Messi! Boosted 1X2 market odds active right now.</p>
            <div class="hero-actions-row">
              <button class="hero-quick-odd slide-bet-btn" data-sel-id="spain_arg_1" data-val="2.25">W1: 2.25</button>
              <button class="hero-quick-odd slide-bet-btn" data-sel-id="spain_arg_x" data-val="2.94">X: 2.94</button>
              <button class="hero-quick-odd slide-bet-btn" data-sel-id="spain_arg_2" data-val="3.72">W2: 3.72</button>
            </div>
          </div>
        </div>

      </div>

      <!-- Arrow Controls -->
      <button class="hero-arrow prev" id="hero-prev-btn">&lt;</button>
      <button class="hero-arrow next" id="hero-next-btn">&gt;</button>

      <!-- Pagination Dots -->
      <div class="hero-dots" id="hero-dots-container"></div>
    </div>

    <!-- Sports Categories Horizontal Scrolling Pills -->
    <div class="sports-chips-wrapper">
      <div class="sports-chips-list">
        ${sportsList.map(sport => {
          const count = matches.filter(m => m.sport === sport.id).length;
          const liveCount = matches.filter(m => m.sport === sport.id && m.isLive).length;
          return `
            <button class="sport-chip ${activeSport === sport.id ? 'active' : ''}" data-sport="${sport.id}">
              <span>${getMaterialIcon(sport.icon)}</span>
              <span>${sport.name}</span>
              <span class="sport-chip-count">
                ${liveCount > 0 ? `<span style="color: var(--color-danger); font-weight: 800;">● ${liveCount}</span> / ` : ''}${count}
              </span>
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Commercial Sportsbook Match Cards Section -->
    <div>
      <div class="section-title-row">
        <h2 class="section-title">Top Sports Fixtures</h2>
      </div>

      <div class="match-cards-container">
        ${sportMatches.length === 0 ? `
          <div style="padding: 48px 24px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
            No match fixtures available for this category right now.
          </div>
        ` : sportMatches.map(match => renderMatchCard(match, selections)).join('')}
      </div>
    </div>

    <!-- Casino & Virtuals Horizontal Showcase Section -->
    <div style="margin-top: 8px;">
      <div class="section-title-row">
        <h2 class="section-title">Casino & Instant Games</h2>
      </div>
      <div class="casino-showcase-grid">
        <div class="casino-card" style="background-image: linear-gradient(135deg, #059669, #10B981);">
          <div class="casino-card-overlay">
            <span class="casino-card-tag">Crash Game</span>
            <h3 class="casino-card-title">Aviator Rocket</h3>
          </div>
        </div>
        <div class="casino-card" style="background-image: linear-gradient(135deg, #7C3AED, #A78BFA);">
          <div class="casino-card-overlay">
            <span class="casino-card-tag">Slot Tournament</span>
            <h3 class="casino-card-title">Gates of Olympus</h3>
          </div>
        </div>
        <div class="casino-card" style="background-image: linear-gradient(135deg, #D97706, #FBBF24);">
          <div class="casino-card-overlay">
            <span class="casino-card-tag">Live Table</span>
            <h3 class="casino-card-title">Lightning Roulette</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
        <div style="max-width: 320px;">
          <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 6px; font-weight: 800;">LlnBet Sportsbook</h4>
          <p>LlnBet is a premier licensed online sportsbook operating under Betting Control and Licensing Board License BCLB-2026-A829.</p>
        </div>
        <div>
          <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 6px; font-weight: 800;">Responsible Gaming</h4>
          <p>Please bet responsibly. 18+ Only. Gambling can be addictive if not managed properly.</p>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 16px; font-size: 0.75rem;">
        <span>© 2026 LlnBet International Sportsbook. All rights reserved.</span>
        <span>Secured via Safaricom M-Pesa STK Gateway</span>
      </div>
    </footer>
  `;

  container.innerHTML = html;

  // Initialize Slider Controls
  const slides = container.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('hero-dots-container');
  let currentSlideIdx = window.homeCurrentSlideIdx || 0;

  if (window.homeSliderInterval) {
    clearInterval(window.homeSliderInterval);
    window.homeSliderInterval = null;
  }

  const renderDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = Array.from({ length: slides.length }).map((_, idx) => `
      <div class="hero-dot ${idx === currentSlideIdx ? 'active' : ''}" data-idx="${idx}"></div>
    `).join('');

    dotsContainer.querySelectorAll('.hero-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-idx'));
        goToSlide(target);
        resetAutoplay();
      });
    });
  };

  const goToSlide = (idx) => {
    if (!container.querySelector('.hero-slider-container')) return;
    slides[currentSlideIdx].classList.remove('active');
    currentSlideIdx = (idx + slides.length) % slides.length;
    window.homeCurrentSlideIdx = currentSlideIdx;
    slides[currentSlideIdx].classList.add('active');
    renderDots();
  };

  const nextSlide = () => {
    if (!container.querySelector('.hero-slider-container')) {
      if (window.homeSliderInterval) {
        clearInterval(window.homeSliderInterval);
        window.homeSliderInterval = null;
      }
      return;
    }
    goToSlide(currentSlideIdx + 1);
  };

  const prevSlide = () => {
    if (!container.querySelector('.hero-slider-container')) {
      if (window.homeSliderInterval) {
        clearInterval(window.homeSliderInterval);
        window.homeSliderInterval = null;
      }
      return;
    }
    goToSlide(currentSlideIdx - 1);
  };

  const startAutoplay = () => {
    window.homeSliderInterval = setInterval(nextSlide, 5000);
  };

  const resetAutoplay = () => {
    if (window.homeSliderInterval) clearInterval(window.homeSliderInterval);
    startAutoplay();
  };

  document.getElementById('hero-prev-btn')?.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  document.getElementById('hero-next-btn')?.addEventListener('click', () => { nextSlide(); resetAutoplay(); });

  renderDots();
  startAutoplay();

  // Bind Slide CTAs
  document.getElementById('slide-deposit-btn')?.addEventListener('click', () => state.setPage('profile'));
  document.getElementById('slide-esports-btn')?.addEventListener('click', () => state.setPage('live'));
  document.getElementById('slide-bilbao-btn')?.addEventListener('click', () => state.setPage('home'));

  // Bind Category Chips
  container.querySelectorAll('.sports-chips-list .sport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sportId = chip.getAttribute('data-sport');
      state.setSport(sportId);
    });
  });

  const matchCardsContainer = container.querySelector('.match-cards-container');
  if (matchCardsContainer) {
    bindMatchCardEvents(matchCardsContainer, matches);
  }
}

// Render Authentic Commercial Sportsbook Match Card Component
export function renderMatchCard(match, selections) {
  const isHomeSelected = selections.some(s => s.id === `${match.id}_1`);
  const isDrawSelected = selections.some(s => s.id === `${match.id}_x`);
  const isAwaySelected = selections.some(s => s.id === `${match.id}_2`);
  const is1XSelected = selections.some(s => s.id === `${match.id}_1x`);
  const is12Selected = selections.some(s => s.id === `${match.id}_12`);
  const is2XSelected = selections.some(s => s.id === `${match.id}_2x`);

  const mainMarket = match.markets && match.markets.length > 0 ? match.markets[0] : null;
  if (!mainMarket) return '';

  const homeOddVal = mainMarket.odds[0]?.value || 1.85;
  const drawOddVal = mainMarket.odds[1]?.value || 3.40;
  const awayOddVal = mainMarket.odds[2]?.value || 3.90;

  // Double chance odds calculations
  const odd1X = parseFloat((1 / ((1 / homeOddVal) + (1 / drawOddVal))).toFixed(2)) || 1.22;
  const odd12 = parseFloat((1 / ((1 / homeOddVal) + (1 / awayOddVal))).toFixed(2)) || 1.28;
  const odd2X = parseFloat((1 / ((1 / drawOddVal) + (1 / awayOddVal))).toFixed(2)) || 1.80;

  return `
    <div class="match-card" data-id="${match.id}">
      <!-- Match Card Header: Date & Options -->
      <div class="match-card-header">
        <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.78rem;">
          <span style="font-size: 14px;">⚽</span>
          <span style="font-weight: 600;">${formatDate(match.kickoffTime)}</span>
        </div>
        <button class="header-icon-btn" style="width: 24px; height: 24px; color: var(--text-muted);" aria-label="More Options">
          ⋮
        </button>
      </div>

      <!-- Teams & Stage Subtitle -->
      <div class="match-card-body" data-match-id="${match.id}" style="cursor: pointer; padding: 4px 0 8px 0;">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="team-flag">${match.teams.home.name.substring(0, 2).toUpperCase()}</div>
              <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${match.teams.home.name}</span>
            </div>
            ${match.isLive ? `<span style="font-weight: 900; color: var(--color-primary); font-family: var(--font-mono);">${match.scores.home}</span>` : ''}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="team-flag">${match.teams.away.name.substring(0, 2).toUpperCase()}</div>
              <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${match.teams.away.name}</span>
            </div>
            ${match.isLive ? `<span style="font-weight: 900; color: var(--color-primary); font-family: var(--font-mono);">${match.scores.away}</span>` : ''}
          </div>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
          2nd qualifying round. Main path. First match
        </div>
      </div>

      <!-- 6 Horizontal Odds Chips Grid -->
      <div class="match-odds-grid-6">
        <!-- W1 -->
        <button class="odds-chip ${isHomeSelected ? 'selected' : ''}" 
          data-id="${match.id}_1" 
          data-match-id="${match.id}"
          data-team="${match.teams.home.name}" 
          data-market="Home Win (W1)" 
          data-value="${homeOddVal}">
          <span class="odds-chip-label">W1</span>
          <span class="odds-chip-value">${formatOdds(homeOddVal)}</span>
        </button>

        <!-- DRAW -->
        <button class="odds-chip ${isDrawSelected ? 'selected' : ''}" 
          data-id="${match.id}_x" 
          data-match-id="${match.id}"
          data-team="Draw" 
          data-market="Draw" 
          data-value="${drawOddVal}">
          <span class="odds-chip-label">${isDrawSelected ? '✓ DRAW' : 'DRAW'}</span>
          <span class="odds-chip-value">${formatOdds(drawOddVal)}</span>
        </button>

        <!-- W2 -->
        <button class="odds-chip ${isAwaySelected ? 'selected' : ''}" 
          data-id="${match.id}_2" 
          data-match-id="${match.id}"
          data-team="${match.teams.away.name}" 
          data-market="Away Win (W2)" 
          data-value="${awayOddVal}">
          <span class="odds-chip-label">W2</span>
          <span class="odds-chip-value">${formatOdds(awayOddVal)}</span>
        </button>

        <!-- 1X -->
        <button class="odds-chip ${is1XSelected ? 'selected' : ''}" 
          data-id="${match.id}_1x" 
          data-match-id="${match.id}"
          data-team="${match.teams.home.name} or Draw" 
          data-market="Double Chance (1X)" 
          data-value="${odd1X}">
          <span class="odds-chip-label">1X</span>
          <span class="odds-chip-value">${formatOdds(odd1X)}</span>
        </button>

        <!-- 12 -->
        <button class="odds-chip ${is12Selected ? 'selected' : ''}" 
          data-id="${match.id}_12" 
          data-match-id="${match.id}"
          data-team="${match.teams.home.name} or ${match.teams.away.name}" 
          data-market="Double Chance (12)" 
          data-value="${odd12}">
          <span class="odds-chip-label">12</span>
          <span class="odds-chip-value">${formatOdds(odd12)}</span>
        </button>

        <!-- 2X -->
        <button class="odds-chip ${is2XSelected ? 'selected' : ''}" 
          data-id="${match.id}_2x" 
          data-match-id="${match.id}"
          data-team="${match.teams.away.name} or Draw" 
          data-market="Double Chance (2X)" 
          data-value="${odd2X}">
          <span class="odds-chip-label">2X</span>
          <span class="odds-chip-value">${formatOdds(odd2X)}</span>
        </button>
      </div>
    </div>
  `;
}

function bindMatchCardEvents(container, matches) {
  // Bind Odds Selectors
  container.querySelectorAll('.odds-chip, .odds-btn').forEach(btn => {
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

  // Bind Match Navigation Triggers
  container.querySelectorAll('.match-card-body, .extra-markets-link').forEach(el => {
    el.addEventListener('click', () => {
      const matchId = el.getAttribute('data-match-id');
      if (matchId) state.setPage('match-details', matchId);
    });
  });
}

export default renderHomeView;
