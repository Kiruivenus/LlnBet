import { matchesList } from './data.js';
import { state } from './state.js';
import { tradingEngine } from './trading/tradingEngine.js';

// Local Date Formatter Helper
function formatKickoff(dateObj) {
  const now = new Date();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (dateObj.toDateString() === now.toDateString()) {
    return `Today, ${timeStr}`;
  }
  
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (dateObj.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeStr}`;
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[dateObj.getDay()];
  const dateNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  
  return `${dayName}, ${dateNum} ${monthName}, ${timeStr}`;
}

// Generate ESPN YYYYMMDD date range string for the next 7 days
function getEspnDateRange() {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + 7);

  const format = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  };

  return `${format(now)}-${format(future)}`;
}

class SimulationEngine {
  constructor() {
    this.matches = matchesList;
    this.timerId = null;
    this.feedIntervalId = null;
    this.flashStates = {};
    this.oddsFlashDuration = 1200;
  }

  async start() {
    if (this.timerId) return;

    // 1. Fetch real-world soccer/sports fixtures dynamically at boot
    await this.fetchRealWorldMatches();
    
    // Core simulation tick loop running every 3.5 seconds
    this.timerId = setInterval(() => {
      this.tick();
    }, 3500);

    // Initial polling interval setup
    this.updatePollingInterval();

    // Bind visibility change to pause polling when tab goes to background
    document.addEventListener('visibilitychange', () => {
      this.updatePollingInterval();
      if (!document.hidden) {
        this.fetchRealWorldMatches(); // trigger immediate fetch on tab focus
      }
    });

    // Bind page changes to adapt polling frequency (e.g. live page every 15s)
    state.subscribe('currentPage', () => {
      this.updatePollingInterval();
    });
  }

  updatePollingInterval() {
    if (this.feedIntervalId) {
      clearInterval(this.feedIntervalId);
      this.feedIntervalId = null;
    }

    if (document.hidden) {
      console.log("[POLLING] Tab is hidden. Pausing background match fetches.");
      return;
    }

    const curPage = state.data.currentPage;
    let intervalMs = 60000; // default 60s for prematch / static pages
    if (curPage === 'live') {
      intervalMs = 15000; // 15s for live odds updates
      console.log("[POLLING] Active page is LIVE. Speeding up match fetches to 15s.");
    } else {
      console.log(`[POLLING] Active page is ${curPage}. Setting match fetches to 60s.`);
    }

    this.feedIntervalId = setInterval(async () => {
      await this.fetchRealWorldMatches();
    }, intervalMs);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.feedIntervalId) {
      clearInterval(this.feedIntervalId);
      this.feedIntervalId = null;
    }
  }

  sortChronologically(list) {
    if (!Array.isArray(list)) return [];
    
    // Deduplicate matches by ID
    const uniqueMap = new Map();
    list.forEach(m => { if (m && m.id && !uniqueMap.has(m.id)) uniqueMap.set(m.id, m); });
    const deduplicated = Array.from(uniqueMap.values());

    return deduplicated.sort((a, b) => {
      // 1. Live matches always come at the top
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;

      // 2. Sort by Kickoff Time ascending (soonest playing games today first, followed by tomorrow)
      const timeA = a.kickoffTime ? new Date(a.kickoffTime).getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.kickoffTime ? new Date(b.kickoffTime).getTime() : Number.MAX_SAFE_INTEGER;

      return timeA - timeB;
    });
  }

  getMatches() {
    return this.sortChronologically(this.matches || []);
  }

  getMatchById(id) {
    const sorted = this.getMatches();
    return sorted.find(m => m.id === id);
  }

  // Live real-world scores fetcher (from backend cached MongoDB matches in <100ms)
  async fetchRealWorldMatches() {
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const backendMatches = await response.json();
        if (Array.isArray(backendMatches) && backendMatches.length > 0) {
          this.matches = [...backendMatches, ...matchesList];

          // Async index new real team names in global search database
          import('./data.js').then(dataModule => {
            dataModule.searchDatabase.length = 0;
            backendMatches.forEach(match => {
              dataModule.searchDatabase.push({
                title: match.teams.home.name,
                subtitle: `${match.sport.charAt(0).toUpperCase() + match.sport.slice(1)} Team (${match.league})`,
                type: 'team',
                id: match.id
              });
              dataModule.searchDatabase.push({
                title: match.teams.away.name,
                subtitle: `${match.sport.charAt(0).toUpperCase() + match.sport.slice(1)} Team (${match.league})`,
                type: 'team',
                id: match.id
              });
            });
          }).catch(() => {});
          
          state.notify('matches');
          return;
        }
      }
    } catch (e) {
      console.warn("[CLIENT MATCH FETCH ERROR]:", e.message);
    }
    
    // Fallback if backend returns empty or fails
    this.matches = matchesList;
    state.notify('matches');
  }



  tick() {
    this.matches.forEach(match => {
      // Execute Modular Event-Driven Live Trading Engine Pipeline
      tradingEngine.processMatchTrading(match);

      if (match.id.startsWith('espn_')) return;
      if (!match.isLive) return;

      this.tickMatchTimer(match);
      this.simulateScoring(match);
    });

    this.checkAndSettlePlacedBets();
    state.notify('matches');
  }

  checkAndSettlePlacedBets() {
    const placedBets = state.data.placedBets || [];
    const openBets = placedBets.filter(b => b.status === 'OPEN' || b.status === 'active');
    if (openBets.length === 0) return;

    openBets.forEach(bet => {
      const selections = bet.selections || [];
      if (selections.length === 0) return;

      let allFinished = true;
      let allWon = true;

      selections.forEach(sel => {
        const match = this.matches.find(m => m.id === sel.matchId);
        if (!match) {
          allFinished = false;
          return;
        }

        const hasStarted = new Date(match.kickoffTime) <= new Date();
        const isFinished = hasStarted && (!match.isLive || match.timer === 'FT' || match.timer === '90+' || (typeof match.timer === 'string' && parseInt(match.timer) >= 90));
        
        if (!isFinished) {
          allFinished = false;
          return;
        }

        const homeScore = match.scores ? match.scores.home : 0;
        const awayScore = match.scores ? match.scores.away : 0;
        const target = (sel.team || sel.label || '').toLowerCase();
        const market = (sel.market || '').toLowerCase();

        let selWon = false;

        if (target.includes('home') || target === '1' || (match.teams && target === match.teams.home.name.toLowerCase())) {
          selWon = homeScore > awayScore;
        } else if (target.includes('draw') || target === 'x') {
          selWon = homeScore === awayScore;
        } else if (target.includes('away') || target === '2' || (match.teams && target === match.teams.away.name.toLowerCase())) {
          selWon = awayScore > homeScore;
        } else if (target.includes('yes') && market.includes('btts')) {
          selWon = homeScore > 0 && awayScore > 0;
        } else if (target.includes('no') && market.includes('btts')) {
          selWon = homeScore === 0 || awayScore === 0;
        } else if (target.includes('over 1.5')) {
          selWon = (homeScore + awayScore) > 1.5;
        } else if (target.includes('under 1.5')) {
          selWon = (homeScore + awayScore) < 1.5;
        } else if (target.includes('over 2.5')) {
          selWon = (homeScore + awayScore) > 2.5;
        } else if (target.includes('under 2.5')) {
          selWon = (homeScore + awayScore) < 2.5;
        } else {
          selWon = homeScore >= awayScore;
        }

        // Tag individual selection status
        sel.status = selWon ? 'won' : 'lost';

        if (!selWon) {
          allWon = false;
        }
      });

      if (allFinished) {
        const finalStatus = allWon ? 'WON' : 'LOST';
        const winAmt = allWon ? (bet.possiblePayout || (bet.stake * (bet.totalOdds || bet.odds || 2))) : 0;
        
        // Optimistic local state update to prevent double triggers
        bet.status = finalStatus;
        bet.winnings = winAmt;

        fetch(`/api/bets/${bet.betId || bet.id}/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: finalStatus,
            selections: selections,
            winnings: winAmt
          })
        })
        .then(async r => {
          if (r.ok) {
            if (finalStatus === 'WON') {
              alert(`🎉 CONGRATULATIONS! Your Bet Ticket ${bet.betId || bet.id} WON!\n\nKES ${winAmt.toLocaleString()} has been credited automatically to your wallet.`);
            }
            state.refreshUserData();
          }
        })
        .catch(err => {
          console.warn("Failed to settle bet on backend:", err);
        });
      }
    });
  }

  tickMatchTimer(match) {
    if (match.sport === 'football') {
      let min = parseInt(match.timer) || 0;
      if (min < 90) {
        min += 1;
        match.timer = min.toString();
      } else {
        match.timer = "90+";
      }
    }
  }

  simulateScoring(match) {
    const scoreChance = 0.025;
    
    if (Math.random() < scoreChance) {
      const scoringTeam = Math.random() < 0.5 ? 'home' : 'away';
      match.scores[scoringTeam] += 1;
      
      match.markets.forEach(market => {
        market.odds.forEach(odd => {
          let shift = 0;
          if (odd.selectionId.includes(scoringTeam)) {
            shift = -0.3;
          } else {
            shift = 0.5;
          }
          this.adjustOddValue(odd, shift, match.id);
        });
      });
      
      console.log(`[GOAL/SCORE] ${match.teams.home.name} ${match.scores.home} - ${match.scores.away} ${match.teams.away.name}`);
    }
  }

  fluctuateMatchOdds(match) {
    match.markets.forEach(market => {
      market.odds.forEach(odd => {
        if (Math.random() < 0.35) {
          if (Math.random() < 0.05) {
            odd.isLocked = !odd.isLocked;
            return;
          }
          
          if (odd.isLocked) return;

          const changeDir = Math.random() < 0.5 ? -1 : 1;
          const pct = Math.random() * 0.08;
          const shift = odd.value * pct * changeDir;
          this.adjustOddValue(odd, shift, match.id);
        }
      });
    });
  }

  adjustOddValue(odd, shift, matchId) {
    const oldVal = odd.value;
    let newVal = oldVal + shift;
    
    if (newVal < 1.01) newVal = 1.01;
    if (newVal > 50.00) newVal = 50.00;
    
    newVal = parseFloat(newVal.toFixed(2));
    
    if (newVal !== oldVal) {
      odd.value = newVal;
      const flashKey = `${matchId}_${odd.selectionId}`;
      const direction = newVal < oldVal ? 'down' : 'up';
      
      this.flashStates[flashKey] = direction;
      state.updateSelectionOdds(odd.selectionId, newVal);
      
      setTimeout(() => {
        if (this.flashStates[flashKey] === direction) {
          delete this.flashStates[flashKey];
          state.notify('matches');
        }
      }, this.oddsFlashDuration);
    }
  }

  getFlashState(matchId, selectionId) {
    return this.flashStates[`${matchId}_${selectionId}`] || null;
  }
}

export const simulation = new SimulationEngine();
export default simulation;
