import { matchesList } from './data.js';
import { state } from './state.js';

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
    this.matches = []; // Initialized as empty list to receive real games
    this.timerId = null;
    this.feedIntervalId = null;
    this.oddsFlashDuration = 1500;
    this.flashStates = {};
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

  // Live real-world scores fetcher (ESPN scoreboard APIs with 8-day dates ranges)
  async fetchRealWorldMatches() {
    const feeds = [
      // Football Soccer (9 leagues)
      { url: 'soccer/eng.1', sport: 'football', name: 'Premier League', country: 'England' },
      { url: 'soccer/esp.1', sport: 'football', name: 'La Liga', country: 'Spain' },
      { url: 'soccer/ita.1', sport: 'football', name: 'Serie A', country: 'Italy' },
      { url: 'soccer/ger.1', sport: 'football', name: 'Bundesliga', country: 'Germany' },
      { url: 'soccer/fra.1', sport: 'football', name: 'Ligue 1', country: 'France' },
      { url: 'soccer/usa.1', sport: 'football', name: 'Major League Soccer', country: 'USA' },
      { url: 'soccer/uefa.champions', sport: 'football', name: 'Champions League', country: 'Europe' },
      { url: 'soccer/uefa.europa', sport: 'football', name: 'Europa League', country: 'Europe' },
      { url: 'soccer/mex.1', sport: 'football', name: 'Liga MX', country: 'Mexico' },
      // Basketball (2 leagues)
      { url: 'basketball/nba', sport: 'basketball', name: 'NBA', country: 'USA' },
      { url: 'basketball/wnba', sport: 'basketball', name: 'WNBA', country: 'USA' },
      // Tennis (1 league)
      { url: 'tennis/atp', sport: 'tennis', name: 'ATP Tour', country: 'International' },
      // Ice Hockey (1 league)
      { url: 'hockey/nhl', sport: 'ice_hockey', name: 'NHL', country: 'USA' }
    ];

    const parsedMatches = [];
    const dateRange = getEspnDateRange();

    for (const feed of feeds) {
      try {
        // Query both live and scheduled matches for the next 7 days in a single batch
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${feed.url}/scoreboard?dates=${dateRange}&limit=200`);
        if (!response.ok) continue;

        const data = await response.json();
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
          
          // Skip completed games to keep the active sportsbook clean
          if (isFinished) return;

          const kickoffDate = new Date(event.date);
          const matchId = `espn_${event.id}`;
          
          const homeScore = parseInt(homeComp.score) || 0;
          const awayScore = parseInt(awayComp.score) || 0;
          
          const timer = event.status?.displayClock ? event.status.displayClock.replace("'", "") : (isLive ? 'Live' : '0');

          // Generate randomized odds (seeded around standard distributions)
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
            league: feed.name,
            country: feed.country,
            isLive: isLive,
            timer: timer,
            scores: { home: homeScore, away: awayScore },
            kickoffTime: formatKickoff(kickoffDate),
            teams: {
              home: { name: homeName },
              away: { name: awayName }
            },
            venue: comp.venue?.fullName || feed.name,
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
        console.warn(`[ESPN FEED ERROR] Failed to fetch feed ${feed.url}:`, e);
      }
    }

    if (parsedMatches.length > 0) {
      console.log(`[ESPN FEED SUCCESS] Fetched ${parsedMatches.length} real-world matches.`);
      
      // Override matches list completely with parsed real-world matches
      this.matches = parsedMatches;

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
    // Avoid modifying real ESPN matches with mock timers/goals
    this.matches.forEach(match => {
      if (match.id.startsWith('espn_')) return;
      if (!match.isLive) return;

      this.tickMatchTimer(match);
      this.simulateScoring(match);
      this.fluctuateMatchOdds(match);
    });

    state.notify('matches');
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
