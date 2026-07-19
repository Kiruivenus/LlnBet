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
  const upcomingMatches = sportMatches.filter(m => !m.isLive && new Date(m.kickoffTime) > new Date());

  // Partial update check: if slider structure already exists, don't overwrite it to prevent resetting the autoplay timer
  const hasSlider = container.querySelector('.hero-slider-wrapper');
  if (hasSlider) {
    // 1. Update sports nav chip counts and active state
    const sportsNav = container.querySelector('.sports-nav');
    if (sportsNav) {
      sportsNav.innerHTML = sportsList.map(sport => {
        const count = matches.filter(m => m.sport === sport.id).length;
        return `
          <button class="sport-chip ${activeSport === sport.id ? 'active' : ''}" data-sport="${sport.id}">
            <span>${getMaterialIcon(sport.icon)}</span>
            <span>${sport.name}</span>
            <span class="sport-chip-count">${count}</span>
          </button>
        `;
      }).join('');

      sportsNav.querySelectorAll('.sport-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const sportId = chip.getAttribute('data-sport');
          state.setSport(sportId);
        });
      });
    }

    // 2. Update upcoming matches items
    const matchItems = container.querySelector('.match-list-items');
    if (matchItems) {
      matchItems.innerHTML = upcomingMatches.length === 0 ? `
        <div style="padding: 20px; text-align: center; color: var(--text-muted);">
          No upcoming matches available for this sport.
        </div>
      ` : upcomingMatches.map(match => renderMatchCard(match, selections)).join('');

      matchItems.querySelectorAll('.compact-odds-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const selectionId = btn.getAttribute('data-id');
          const matchId = btn.getAttribute('data-match-id');
          const team = btn.getAttribute('data-team');
          const market = btn.getAttribute('data-market');
          const value = parseFloat(btn.getAttribute('data-value'));

          const matchObj = simulation.getMatch(matchId);
          const matchName = matchObj ? `${matchObj.teams.home.name} vs ${matchObj.teams.away.name}` : "Match";

          state.addSelection({
            id: selectionId,
            matchId: matchId,
            matchName: matchName,
            team: team,
            market: market,
            odds: value
          });
        });
      });

      matchItems.querySelectorAll('.match-list-row').forEach(row => {
        row.addEventListener('click', () => {
          const matchId = row.getAttribute('data-id');
          state.setPage('match-details', matchId);
        });
      });
    }

    return;
  }

  if (window.homeCurrentSlideIdx === undefined) {
    window.homeCurrentSlideIdx = 0;
  }
  const activeIdx = window.homeCurrentSlideIdx;

  let html = `
    <!-- Premium Promo Hero Slider -->
    <div class="hero-slider-wrapper">
      <div class="hero-slider-track" id="hero-slider-track">
        
        <!-- Slide 1: Deposit Bonus -->
        <div class="hero-slide ${activeIdx === 0 ? 'active' : ''}" style="background: linear-gradient(135deg, #0e121a 0%, #15803d 100%);">
          <div class="hero-slide-content">
            <span class="hero-tag">Special Promo</span>
            <h1 class="hero-title" style="font-size:1.4rem; line-height:1.2; font-family:var(--font-display); font-weight:800; color:#fff;">100% BONUS ON THE 1ST DEPOSIT UP TO KES 50,000</h1>
            <p class="hero-desc" style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">Register with LlnBet and receive 100% match bonus on your very first funding!</p>
            <button class="hero-cta" id="slide-deposit-btn" style="margin-top:12px; font-weight:800; padding:8px 16px; font-size:0.8rem; border-radius:8px; border:none; background:var(--accent-emerald); color:#080a0f; cursor:pointer;">
              Register / Deposit
            </button>
          </div>
          <div class="hero-slide-graphic">
            <div class="percent-badge">100%</div>
          </div>
        </div>

        <!-- Slide 2: Cybersport -->
        <div class="hero-slide ${activeIdx === 1 ? 'active' : ''}" style="background: linear-gradient(135deg, #080a0f 0%, #ff3d00 150%);">
          <div class="hero-slide-content">
            <span class="hero-tag" style="background:#ff3d00;">Esports Specials</span>
            <h1 class="hero-title" style="font-size:1.4rem; line-height:1.2; font-family:var(--font-display); font-weight:800; color:#fff;">CATCH BEST COEFFICIENTS IN CYBERSPORT!</h1>
            <p class="hero-desc" style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">Take advantage of premium boosted odds on Dota 2, League of Legends, Counter-Strike and virtual leagues.</p>
            <button class="hero-cta" id="slide-esports-btn" style="margin-top:12px; font-weight:800; padding:8px 16px; font-size:0.8rem; border-radius:8px; border:none; background:#ff3d00; color:#fff; cursor:pointer;">
              Make Your Bet
            </button>
          </div>
          <div class="hero-slide-graphic">
            <span class="material-icons-round" style="font-size:6.5rem; color:rgba(255,61,0,0.12); animation: float 3s ease-in-out infinite;">sports_esports</span>
          </div>
        </div>

        <!-- Slide 3: Athletic Bilbao Partnership -->
        <div class="hero-slide ${activeIdx === 2 ? 'active' : ''}" style="background: linear-gradient(135deg, #450a0a 0%, #111 100%);">
          <div class="hero-slide-content">
            <span class="hero-tag" style="background:#fdb927; color:#111;">La Liga Partner</span>
            <h1 class="hero-title" style="font-size:1.4rem; line-height:1.2; font-family:var(--font-display); font-weight:800; color:#fff;">OFFICIAL REGIONAL PARTNER - ATHLETIC BILBAO</h1>
            <p class="hero-desc" style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">Support the lions of Basque country with customized selections and guaranteed live payouts.</p>
            <button class="hero-cta" id="slide-bilbao-btn" style="margin-top:12px; font-weight:800; padding:8px 16px; font-size:0.8rem; border-radius:8px; border:none; background:#fdb927; color:#111; cursor:pointer;">
              Place Your Bets!
            </button>
          </div>
          <div class="hero-slide-graphic">
            <span class="material-icons-round" style="font-size:6.5rem; color:rgba(253,185,39,0.12); animation: float 3s ease-in-out infinite;">sports_soccer</span>
          </div>
        </div>

        <!-- Slide 4: Spain vs Argentina Special Match -->
        <div class="hero-slide ${activeIdx === 3 ? 'active' : ''}" style="background: linear-gradient(135deg, #0e121a 0%, #0369a1 100%);">
          <div class="hero-slide-content">
            <span class="hero-tag" style="background:#38bdf8; color:#0f172a;">World Cup 2026</span>
            <h1 class="hero-title" style="font-size:1.4rem; line-height:1.2; font-family:var(--font-display); font-weight:800; color:#fff;">Spain vs Argentina</h1>
            <p class="hero-desc" style="font-size:0.82rem; color:rgba(255,255,255,0.7); margin-top:4px;">Lamine Yamal vs Lionel Messi! Boosted 1X2 market odds active right now.</p>
            <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
              <button class="quick-stake-btn slide-bet-btn" data-sel-id="spain_arg_1" data-val="2.25" style="padding:4px 10px; font-size:0.75rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; cursor:pointer; outline:none; height:auto; width:auto; border-radius:4px;">W1: 2.25</button>
              <button class="quick-stake-btn slide-bet-btn" data-sel-id="spain_arg_x" data-val="2.94" style="padding:4px 10px; font-size:0.75rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; cursor:pointer; outline:none; height:auto; width:auto; border-radius:4px;">Draw: 2.94</button>
              <button class="quick-stake-btn slide-bet-btn" data-sel-id="spain_arg_2" data-val="3.72" style="padding:4px 10px; font-size:0.75rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; cursor:pointer; outline:none; height:auto; width:auto; border-radius:4px;">W2: 3.72</button>
            </div>
          </div>
          <div class="hero-slide-graphic">
            <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.06); padding:8px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
              <span style="font-size:1.8rem;">🇪🇸</span>
              <span style="font-weight:900; color:#fff; font-size:0.8rem;">VS</span>
              <span style="font-size:1.8rem;">🇦🇷</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Arrow Controls -->
      <button class="hero-arrow prev" id="hero-prev-btn">&lt;</button>
      <button class="hero-arrow next" id="hero-next-btn">&gt;</button>

      <!-- Dots Indicators -->
      <div class="hero-dots" id="hero-dots-container"></div>
    </div>

    <!-- Sports Category Horizontal Chips Navigation -->
    <div class="sports-nav-wrapper">
      <div class="sports-nav">
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



    <!-- Upcoming Matches Section (Compact List layout) -->
    <div>
      <div class="section-header">
        <h2 class="section-title">Upcoming Fixtures</h2>
      </div>

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
          ${upcomingMatches.length === 0 ? `
            <div class="skeleton-matches-list" style="padding:10px;">
              ${[1, 2, 3, 4, 5].map(() => `
                <div class="skeleton-match-row" style="padding:14px var(--spacing-md); margin-bottom:10px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); display:flex; flex-direction:column; gap:10px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="skeleton-box" style="width: 100px; height: 12px;"></div>
                    <div class="skeleton-box" style="width: 65px; height: 12px;"></div>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; flex-direction:column; gap:6px;">
                      <div class="skeleton-box" style="width: 150px; height: 16px;"></div>
                      <div class="skeleton-box" style="width: 120px; height: 16px;"></div>
                    </div>
                    <div style="display:flex; gap:6px;">
                      <div class="skeleton-box" style="width: 54px; height: 32px; border-radius: var(--radius-sm);"></div>
                      <div class="skeleton-box" style="width: 54px; height: 32px; border-radius: var(--radius-sm);"></div>
                      <div class="skeleton-box" style="width: 54px; height: 32px; border-radius: var(--radius-sm);"></div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : upcomingMatches.map(match => renderMatchCard(match, selections)).join('')}
        </div>
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
          <h4 class="footer-title">About LlnBet</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">LlnBet is a leading licensed online sports betting operator in Kenya providing state-of-the-art live feeds, secure transaction channels, and multi-market calculators.</p>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">Information</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link-btn" data-page="promotions">Promotions</a></li>
            <li><a href="#" class="footer-link-btn" data-page="profile">My Account</a></li>
            <li><a href="#" class="footer-link-btn" data-page="profile">Deposit/Withdraw</a></li>
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
          <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.4;">LlnBet is regulated and licensed by the Betting Control and Licensing Board. License No. BCLB-2026-A829. All software audited for fairness and random compliance.</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <span>© 2026 LlnBet Sportsbook. All rights reserved. Registered customer data encrypted.</span>
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

  // Initialize Slider Logic
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

    // Bind dots click events
    dotsContainer.querySelectorAll('.hero-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-idx'));
        goToSlide(target);
        resetAutoplay();
      });
    });
  };

  const goToSlide = (idx) => {
    if (!container.querySelector('.hero-slider-wrapper')) return;
    slides[currentSlideIdx].classList.remove('active');
    currentSlideIdx = (idx + slides.length) % slides.length;
    window.homeCurrentSlideIdx = currentSlideIdx; // Persist globally across page updates
    slides[currentSlideIdx].classList.add('active');
    renderDots();
  };

  const nextSlide = () => {
    if (!container.querySelector('.hero-slider-wrapper')) {
      if (window.homeSliderInterval) {
        clearInterval(window.homeSliderInterval);
        window.homeSliderInterval = null;
      }
      return;
    }
    goToSlide(currentSlideIdx + 1);
  };

  const prevSlide = () => {
    if (!container.querySelector('.hero-slider-wrapper')) {
      if (window.homeSliderInterval) {
        clearInterval(window.homeSliderInterval);
        window.homeSliderInterval = null;
      }
      return;
    }
    goToSlide(currentSlideIdx - 1);
  };

  const startAutoplay = () => {
    window.homeSliderInterval = setInterval(nextSlide, 4000);
  };

  const resetAutoplay = () => {
    if (window.homeSliderInterval) {
      clearInterval(window.homeSliderInterval);
    }
    startAutoplay();
  };

  // Bind controls
  document.getElementById('hero-prev-btn')?.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
  });

  document.getElementById('hero-next-btn')?.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
  });

  // Start initialization
  renderDots();
  startAutoplay();

  // Bind custom links inside slides
  document.getElementById('slide-deposit-btn')?.addEventListener('click', () => {
    state.setPage('profile');
  });

  document.getElementById('slide-esports-btn')?.addEventListener('click', () => {
    state.setPage('live');
  });

  document.getElementById('slide-bilbao-btn')?.addEventListener('click', () => {
    state.setPage('home');
  });

  container.querySelectorAll('.slide-bet-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectionId = btn.getAttribute('data-sel-id');
      const team = selectionId.includes('1') ? 'Spain' : selectionId.includes('x') ? 'Draw' : 'Argentina';
      const odds = parseFloat(btn.getAttribute('data-val'));

      state.addSelection({
        id: selectionId,
        matchId: 'sim-spain-arg',
        matchName: 'Spain vs Argentina',
        team: team,
        market: '1X2',
        odds: odds
      });
    });
  });

  container.querySelectorAll('.sport-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sportId = chip.getAttribute('data-sport');
      state.setSport(sportId);
    });
  });

  // Odds buttons click selection (handles compact odds button class)
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

  container.querySelectorAll('.footer-link-btn').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      state.setPage(page);
    });
  });



  document.getElementById('footer-rg-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Gaming Limits:\n\nCustomize your session duration, wager size caps, and loss limits inside your Profile settings.");
  });

  document.getElementById('footer-se-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Self-Exclusion:\n\nYou can request permanent or temporary exclusion of your account inside profile page.");
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

// Compact match row layout renderer
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
    <div class="match-list-row" data-id="${match.id}">
      
      <!-- Meta details: Icon + League + Time -->
      <div class="match-row-meta">
        <span style="display:flex; align-items:center; gap:6px;">
          ${getMaterialIcon(match.sport === 'football' ? 'soccer' : match.sport === 'basketball' ? 'basketball' : 'tennis')}
          <span>${match.league}</span>
        </span>
        <span>
          ${match.isLive ? `
            <span class="live-indicator">
              <span class="pulse-dot"></span>
              ${match.timer}'
            </span>
          ` : match.kickoffTime}
        </span>
      </div>

      <!-- Main info: Stacked teams + Inline pill odds -->
      <div class="match-row-main">
        
        <div class="match-row-teams">
          <div class="match-row-team-line">
            <span>${match.teams.home.name}</span>
            ${match.isLive ? `<span class="match-row-score">${match.scores.home}</span>` : ''}
          </div>
          <div class="match-row-team-line" style="margin-top:2px;">
            <span>${match.teams.away.name}</span>
            ${match.isLive ? `<span class="match-row-score">${match.scores.away}</span>` : ''}
          </div>
        </div>

        <div class="match-row-odds">
          ${homeOdd.isSuspended || homeOdd.value === null ? `
            <button class="compact-odds-btn suspended" disabled style="opacity:0.4; cursor:not-allowed; background:var(--bg-obsidian); border-color:var(--border-color); color:var(--text-muted); font-weight:700;">-</button>
          ` : `
            <button class="compact-odds-btn ${isHomeSelected ? 'selected' : ''} ${homeFlash === 'up' ? 'flash-up' : homeFlash === 'down' ? 'flash-down' : ''}" 
              data-id="${homeOdd.selectionId}" 
              data-match-id="${match.id}"
              data-team="${match.teams.home.name}" 
              data-market="Home Win" 
              data-value="${homeOdd.value}">
              ${formatOdds(homeOdd.value)}
            </button>
          `}

          ${drawOdd ? (drawOdd.isSuspended || drawOdd.value === null ? `
            <button class="compact-odds-btn suspended" disabled style="opacity:0.4; cursor:not-allowed; background:var(--bg-obsidian); border-color:var(--border-color); color:var(--text-muted); font-weight:700;">-</button>
          ` : `
            <button class="compact-odds-btn ${isDrawSelected ? 'selected' : ''} ${drawFlash === 'up' ? 'flash-up' : drawFlash === 'down' ? 'flash-down' : ''}" 
              data-id="${drawOdd.selectionId}" 
              data-match-id="${match.id}"
              data-team="Draw" 
              data-market="Draw" 
              data-value="${drawOdd.value}">
              ${formatOdds(drawOdd.value)}
            </button>
          `) : `
            <div style="width:54px; height:32px;"></div>
          `}

          ${awayOdd ? (awayOdd.isSuspended || awayOdd.value === null ? `
            <button class="compact-odds-btn suspended" disabled style="opacity:0.4; cursor:not-allowed; background:var(--bg-obsidian); border-color:var(--border-color); color:var(--text-muted); font-weight:700;">-</button>
          ` : `
            <button class="compact-odds-btn ${isAwaySelected ? 'selected' : ''} ${awayFlash === 'up' ? 'flash-up' : awayFlash === 'down' ? 'flash-down' : ''}" 
              data-id="${awayOdd.selectionId}" 
              data-match-id="${match.id}"
              data-team="${match.teams.away.name}" 
              data-market="Away Win" 
              data-value="${awayOdd.value}">
              ${formatOdds(awayOdd.value)}
            </button>
          `) : `
            <div style="width:54px; height:32px;"></div>
          `}
        </div>

      </div>

      <!-- Footer: Cashout icon + Markets count -->
      <div class="match-row-footer">
        <span style="display:flex; align-items:center; gap:4px; font-size:0.75rem; color:var(--text-muted);">
          💰 Cash Out Active
        </span>
        <span class="match-row-markets">+${match.markets.length * 4} Markets</span>
      </div>

    </div>
  `;
}

export default renderHomeView;
