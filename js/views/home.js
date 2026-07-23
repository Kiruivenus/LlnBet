import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { sportsList, promotionsList } from '../data.js';
import { getMaterialIcon, formatOdds, formatCurrency } from '../utils.js';

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
        return `
          <button class="sport-chip ${activeSport === sport.id ? 'active' : ''}" data-sport="${sport.id}">
            <span>${getMaterialIcon(sport.icon)}</span>
            <span>${sport.name}</span>
            <span class="sport-chip-count">${count}</span>
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
        <div style="padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
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
    <!-- Hero Promotional Slider (320px Desktop / 220px Mobile) -->
    <div class="hero-slider-container">
      <div class="hero-slider-track" id="hero-slider-track">
        
        <!-- Slide 1: 100% Deposit Match -->
        <div class="hero-slide ${activeIdx === 0 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(29, 75, 34, 0.95), rgba(37, 90, 40, 0.85)), url('/img/hero-banner-bg.png');">
          <div class="hero-slide-content">
            <span class="hero-badge">Welcome Offer</span>
            <h1 class="hero-title">100% MATCH BONUS UP TO KES 50,000</h1>
            <p class="hero-desc">Register today with LlnBet and double your initial wallet deposit instantly with zero rollover delays.</p>
            <div class="hero-actions-row">
              <button class="hero-cta-btn" id="slide-deposit-btn">Claim Bonus</button>
              <button class="hero-quick-odd" id="slide-explore-btn">Explore Matches</button>
            </div>
          </div>
          <div class="hero-slide-graphic">
            <div class="hero-graphic-badge">100%</div>
          </div>
        </div>

        <!-- Slide 2: Esports Specials -->
        <div class="hero-slide ${activeIdx === 1 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(14, 18, 26, 0.95), rgba(255, 77, 79, 0.85));">
          <div class="hero-slide-content">
            <span class="hero-badge" style="color: #FF4D4F; border-color: rgba(255,77,79,0.3);">Esports Superboost</span>
            <h1 class="hero-title">CYBERSPORTS BOOSTED COEFFICIENTS</h1>
            <p class="hero-desc">High-speed live betting on Dota 2, Counter-Strike 2, and FIFA Virtual Leagues.</p>
            <div class="hero-actions-row">
              <button class="hero-cta-btn" id="slide-esports-btn" style="background: linear-gradient(135deg, #FF4D4F, #FF7875); color: #fff;">Bet In-Play</button>
            </div>
          </div>
          <div class="hero-slide-graphic">
            <span class="material-icons-round" style="font-size: 6rem; color: rgba(255,255,255,0.15);">sports_esports</span>
          </div>
        </div>

        <!-- Slide 3: Athletic Bilbao Partnership -->
        <div class="hero-slide ${activeIdx === 2 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(69, 10, 10, 0.95), rgba(17, 17, 17, 0.9));">
          <div class="hero-slide-content">
            <span class="hero-badge" style="color: #FFD700; border-color: rgba(255,215,0,0.3);">La Liga Official Partner</span>
            <h1 class="hero-title">ATHLETIC CLUB BILBAO SPECIALS</h1>
            <p class="hero-desc">Support the lions of Basque country with customized prop markets and instant cashouts.</p>
            <div class="hero-actions-row">
              <button class="hero-cta-btn" id="slide-bilbao-btn" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000;">View Fixtures</button>
            </div>
          </div>
          <div class="hero-slide-graphic">
            <span class="material-icons-round" style="font-size: 6rem; color: rgba(255,215,0,0.15);">sports_soccer</span>
          </div>
        </div>

        <!-- Slide 4: World Cup Spain vs Argentina -->
        <div class="hero-slide ${activeIdx === 3 ? 'active' : ''}" style="background-image: linear-gradient(135deg, rgba(14, 18, 26, 0.95), rgba(3, 105, 161, 0.85));">
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

      <!-- Arrow Navigation Controls -->
      <button class="hero-arrow prev" id="hero-prev-btn">&lt;</button>
      <button class="hero-arrow next" id="hero-next-btn">&gt;</button>

      <!-- Pagination Dots -->
      <div class="hero-dots" id="hero-dots-container"></div>
    </div>

    <!-- Sports Categories Horizontal Scrolling Chips -->
    <div class="sports-chips-wrapper">
      <div class="sports-chips-list">
        ${sportsList.map(sport => {
          const count = matches.filter(m => m.sport === sport.id).length;
          return `
            <button class="sport-chip ${activeSport === sport.id ? 'active' : ''}" data-sport="${sport.id}">
              <span>${getMaterialIcon(sport.icon)}</span>
              <span>${sport.name}</span>
              <span class="sport-chip-count">${count}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Featured Match Cards Grid -->
    <div>
      <div class="section-title-row">
        <h2 class="section-title">Top Sports Fixtures</h2>
      </div>

      <div class="match-cards-container">
        ${sportMatches.length === 0 ? `
          <div style="padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
            No match fixtures available for this category right now.
          </div>
        ` : sportMatches.map(match => renderMatchCard(match, selections)).join('')}
      </div>
    </div>

    <!-- Casino & Virtuals Horizontal Showcase Section -->
    <div style="margin-top: 12px;">
      <div class="section-title-row">
        <h2 class="section-title">Casino & Instant Games</h2>
      </div>
      <div class="casino-showcase-grid">
        <div class="casino-card" style="background-image: linear-gradient(135deg, #10b981, #047857);">
          <div class="casino-card-overlay">
            <span class="casino-card-tag">Crash Game</span>
            <h3 class="casino-card-title">Aviator Rocket</h3>
          </div>
        </div>
        <div class="casino-card" style="background-image: linear-gradient(135deg, #8b5cf6, #6d28d9);">
          <div class="casino-card-overlay">
            <span class="casino-card-tag">Slot Tournament</span>
            <h3 class="casino-card-title">Gates of Olympus</h3>
          </div>
        </div>
        <div class="casino-card" style="background-image: linear-gradient(135deg, #f59e0b, #b45309);">
          <div class="casino-card-overlay">
            <span class="casino-card-tag">Live Table</span>
            <h3 class="casino-card-title">Lightning Roulette</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; display: flex; flex-direction: column; gap: 16px;">
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

// Render Redesigned Match Card Component
export function renderMatchCard(match, selections) {
  const isHomeSelected = selections.some(s => s.id === `${match.id}_1`);
  const isDrawSelected = selections.some(s => s.id === `${match.id}_x`);
  const isAwaySelected = selections.some(s => s.id === `${match.id}_2`);

  const mainMarket = match.markets && match.markets.length > 0 ? match.markets[0] : null;
  if (!mainMarket) return '';

  const homeOdd = mainMarket.odds[0];
  const drawOdd = mainMarket.odds[1];
  const awayOdd = mainMarket.odds[2];

  return `
    <div class="match-card" data-id="${match.id}">
      <!-- Card Header -->
      <div class="match-card-header">
        <div class="match-league-info">
          <span class="match-league-icon">${getMaterialIcon('emoji_events')}</span>
          <span>${match.league || 'International Championship'}</span>
        </div>
        <div class="match-badges-group">
          ${match.isLive ? `
            <div class="badge-live-indicator">
              <span class="pulse-dot"></span>
              <span>LIVE ${match.timer}'</span>
            </div>
          ` : `<span style="font-family: var(--font-mono); font-weight: 700;">${match.kickoffTime}</span>`}
          <div class="badge-cashout">💰 Cash Out</div>
        </div>
      </div>

      <!-- Card Body (Teams & Score) -->
      <div class="match-card-body" data-match-id="${match.id}">
        <div class="match-teams-col">
          <div class="team-row">
            <div class="team-name-group">
              <div class="team-flag">${match.teams.home.name.substring(0, 2).toUpperCase()}</div>
              <span class="team-name">${match.teams.home.name}</span>
            </div>
            ${match.isLive ? `<span class="team-score">${match.scores.home}</span>` : ''}
          </div>
          <div class="team-row">
            <div class="team-name-group">
              <div class="team-flag">${match.teams.away.name.substring(0, 2).toUpperCase()}</div>
              <span class="team-name">${match.teams.away.name}</span>
            </div>
            ${match.isLive ? `<span class="team-score">${match.scores.away}</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Odds Selector Buttons -->
      <div class="match-odds-grid">
        <button class="odds-btn ${isHomeSelected ? 'selected' : ''}" 
          data-id="${homeOdd.selectionId}" 
          data-match-id="${match.id}"
          data-team="${match.teams.home.name}" 
          data-market="Home Win" 
          data-value="${homeOdd.value}">
          <span class="odds-label">1</span>
          <span class="odds-value">${formatOdds(homeOdd.value)}</span>
        </button>

        ${drawOdd ? `
          <button class="odds-btn ${isDrawSelected ? 'selected' : ''}" 
            data-id="${drawOdd.selectionId}" 
            data-match-id="${match.id}"
            data-team="Draw" 
            data-market="Draw" 
            data-value="${drawOdd.value}">
            <span class="odds-label">X</span>
            <span class="odds-value">${formatOdds(drawOdd.value)}</span>
          </button>
        ` : '<div></div>'}

        ${awayOdd ? `
          <button class="odds-btn ${isAwaySelected ? 'selected' : ''}" 
            data-id="${awayOdd.selectionId}" 
            data-match-id="${match.id}"
            data-team="${match.teams.away.name}" 
            data-market="Away Win" 
            data-value="${awayOdd.value}">
            <span class="odds-label">2</span>
            <span class="odds-value">${formatOdds(awayOdd.value)}</span>
          </button>
        ` : '<div></div>'}
      </div>

      <!-- Card Footer -->
      <div class="match-card-footer">
        <span style="color: var(--text-muted);">Match ID: #${match.id.substring(0, 8)}</span>
        <div class="extra-markets-link" data-match-id="${match.id}">
          <span>+${match.markets.length * 4} Markets</span>
          <span>&rarr;</span>
        </div>
      </div>
    </div>
  `;
}

function bindMatchCardEvents(container, matches) {
  // Bind Odds Selectors
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

  // Bind Match Navigation Triggers
  container.querySelectorAll('.match-card-body, .extra-markets-link').forEach(el => {
    el.addEventListener('click', () => {
      const matchId = el.getAttribute('data-match-id');
      if (matchId) state.setPage('match-details', matchId);
    });
  });
}

export default renderHomeView;
