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

    // Live refetch polling loop running every 60 seconds
    this.feedIntervalId = setInterval(async () => {
      await this.fetchRealWorldMatches();
    }, 60000);
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

  getMatches() {
    return this.matches;
  }

  getMatchById(id) {
    return this.matches.find(m => m.id === id);
  }

  // Live real-world scores fetcher (ESPN scoreboard APIs with AbortController timeout)
  async fetchRealWorldMatches() {
    const feeds = [
      { url: 'soccer/all', sport: 'football', name: 'Soccer Match', country: 'International' },
      { url: 'basketball/nba', sport: 'basketball', name: 'NBA', country: 'USA' },
      { url: 'basketball/wnba', sport: 'basketball', name: 'WNBA', country: 'USA' },
      { url: 'tennis/atp', sport: 'tennis', name: 'ATP Tour', country: 'International' },
      { url: 'hockey/nhl', sport: 'ice_hockey', name: 'NHL', country: 'USA' }
    ];

    const parsedMatches = [];
    const dateRange = getEspnDateRange();

    for (const feed of feeds) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout cap

        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${feed.url}/scoreboard?limit=80`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) continue;
        const data = await response.json();
        
        const leagueMap = {};
        if (data.leagues) {
          data.leagues.forEach(l => {
            leagueMap[l.id] = {
              name: l.name || l.abbreviation || feed.name,
              country: l.midsizeName || feed.country
            };
          });
        }

        const events = data.events || [];

        events.forEach(event => {
          const comp = event.competitions?.[0];
          if (!comp) return;

          const competitors = comp.competitors || [];
          const homeComp = competitors.find(c => c.homeAway === 'home');
          const awayComp = competitors.find(c => c.homeAway === 'away');
          if (!homeComp || !awayComp) return;

          const homeName = homeComp.team?.displayName || homeComp.team?.name;
          const awayName = awayComp.team?.displayName || awayComp.team?.name;
          if (!homeName || !awayName) return;

          const isLive = event.status?.type?.state === 'in';
          const isFinished = event.status?.type?.state === 'post';
          
          if (isFinished) return;

          const kickoffDate = new Date(event.date);
          const matchId = `espn_${event.id}`;
          
          const homeScore = parseInt(homeComp.score) || 0;
          const awayScore = parseInt(awayComp.score) || 0;
          
          const timer = event.status?.displayClock ? event.status.displayClock.replace("'", "") : (isLive ? 'Live' : '0');

          const leagueId = event.uid?.split('~l:')[1]?.split('~')[0] || '';
          const leagueInfo = leagueMap[leagueId] || { name: feed.name, country: feed.country };

          const r1 = parseFloat((Math.random() * 2 + 1.2).toFixed(2));
          const rx = parseFloat((Math.random() * 1.5 + 2.5).toFixed(2));
          const r2 = parseFloat((Math.random() * 3 + 1.8).toFixed(2));

          const markets = [
            {
              name: feed.sport === 'football' || feed.sport === 'rugby' || feed.sport === 'ice_hockey' ? 'Match Outcome (1X2)' : 'Money Line (Winner)',
              odds: [
                { selectionId: `${matchId}_1`, label: `1 (${homeName})`, value: r1 },
                ...(feed.sport === 'football' || feed.sport === 'rugby' || feed.sport === 'ice_hockey' ? [
                  { selectionId: `${matchId}_x`, label: 'X (Draw)', value: rx }
                ] : []),
                { selectionId: `${matchId}_2`, label: `2 (${awayName})`, value: r2 }
              ]
            }
          ];

          parsedMatches.push({
            id: matchId,
            sport: feed.sport,
            league: leagueInfo.name,
            country: leagueInfo.country,
            isLive: isLive,
            timer: timer,
            scores: { home: homeScore, away: awayScore },
            kickoffTime: formatKickoff(kickoffDate),
            teams: {
              home: { name: homeName },
              away: { name: awayName }
            },
            venue: comp.venue?.fullName || leagueInfo.name,
            stats: {
              possession: { home: 50, away: 50 },
              shots: { home: 10, away: 8 },
              shotsOnTarget: { home: 4, away: 3 },
              corners: { home: 5, away: 4 },
              yellowCards: { home: 1, away: 1 },
              redCards: { home: 0, away: 0 }
            },
            lineups: { home: [], away: [] },
            h2h: [],
            markets
          });
        });
      } catch (e) {
        // Silently catch feed timeouts
      }
    }

    if (parsedMatches.length > 0) {
      console.log(`[ESPN FEED SUCCESS] Fetched ${parsedMatches.length} real-world matches.`);
      this.matches = [...parsedMatches, ...matchesList];
    } else {
      this.matches = matchesList;
    }

    state.notify('matches');

      // Async index new real team names in global search database
      import('./data.js').then(dataModule => {
        // Clear search database first to keep it clean
        dataModule.searchDatabase.length = 0;
        parsedMatches.forEach(match => {
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
      });

      // Notify UI state to update
      state.notify('matches');
    }
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
        if (!match) return;

        const isFinished = !match.isLive || match.timer === 'FT' || match.timer === '90+' || (typeof match.timer === 'string' && parseInt(match.timer) >= 90);
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

        if (!selWon) {
          allWon = false;
        }
      });

      if (allFinished) {
        if (allWon) {
          bet.status = 'WON';
          const winAmt = bet.possiblePayout || (bet.stake * (bet.totalOdds || bet.odds || 2));
          bet.winnings = winAmt;
          
          if (state.data.user) {
            state.data.user.balance += winAmt;
            state.notify('user');
          }
          state.refreshUserData();
          state.notify('placedBets');

          alert(`🎉 CONGRATULATIONS! Your Bet Ticket ${bet.betId || bet.id} WON!\n\nKES ${winAmt.toLocaleString()} has been credited automatically to your wallet.`);
        } else {
          bet.status = 'LOST';
          bet.winnings = 0;
          state.notify('placedBets');
        }
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
