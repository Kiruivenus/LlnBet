import { matchesList } from './data.js';
import { state } from './state.js';

class SimulationEngine {
  constructor() {
    this.matches = JSON.parse(JSON.stringify(matchesList)); // Mutable copy of initial mock data
    this.timerId = null;
    this.oddsFlashDuration = 1500; // time in ms that the green/red flashing persists
    this.flashStates = {}; // key -> 'up' | 'down' | null
  }

  start() {
    if (this.timerId) return;
    
    // Core simulation loop running every 3.5 seconds
    this.timerId = setInterval(() => {
      this.tick();
    }, 3500);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getMatches() {
    return this.matches;
  }

  getMatchById(id) {
    return this.matches.find(m => m.id === id);
  }

  tick() {
    this.matches.forEach(match => {
      if (!match.isLive) return;

      // 1. Advance the timer
      this.tickMatchTimer(match);

      // 2. Simulate random goals / scores
      this.simulateScoring(match);

      // 3. Fluctuate odds
      this.fluctuateMatchOdds(match);
    });

    // Notify listeners that matches state updated
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
    } else if (match.sport === 'basketball') {
      // e.g. "Q3 - 08:12"
      let parts = match.timer.split(' - ');
      if (parts.length === 2) {
        let q = parts[0];
        let time = parts[1];
        let timeParts = time.split(':');
        let min = parseInt(timeParts[0]);
        let sec = parseInt(timeParts[1]);
        
        sec -= 15; // Speed up basketball timer
        if (sec < 0) {
          sec = 59;
          min -= 1;
        }
        
        if (min < 0) {
          // Next quarter
          let qNum = parseInt(q.substring(1));
          if (qNum < 4) {
            match.timer = `Q${qNum + 1} - 12:00`;
          } else {
            match.timer = "FT";
            match.isLive = false;
          }
        } else {
          let minStr = min.toString().padStart(2, '0');
          let secStr = sec.toString().padStart(2, '0');
          match.timer = `${q} - ${minStr}:${secStr}`;
        }
      }
    } else if (match.sport === 'tennis') {
      // Tennis uses sets/games. Random game point increments.
      if (Math.random() < 0.15) {
        let parts = match.timer.split(', '); // e.g. "Set 3, Game 4"
        // Simply increment game count
        let gamePart = parts[1] || 'Game 0';
        let gameNum = parseInt(gamePart.replace('Game ', '')) || 0;
        gameNum += 1;
        if (gameNum > 6) {
          match.timer = 'FT';
          match.isLive = false;
        } else {
          match.timer = `${parts[0]}, Game ${gameNum}`;
        }
      }
    }
  }

  simulateScoring(match) {
    const scoreChance = 0.025; // 2.5% chance per tick
    
    if (Math.random() < scoreChance) {
      const scoringTeam = Math.random() < 0.5 ? 'home' : 'away';
      match.scores[scoringTeam] += (match.sport === 'basketball') ? Math.floor(Math.random() * 3) + 2 : 1;
      
      // If team scored, dramatically shift odds
      match.markets.forEach(market => {
        market.odds.forEach(odd => {
          let shift = 0;
          if (odd.selectionId.includes(scoringTeam)) {
            shift = -0.3; // Odds drop for scoring team
          } else {
            shift = 0.5; // Odds spike for opposing team
          }
          this.adjustOddValue(odd, shift, match.id);
        });
      });
      
      // Trigger user notification or update state if needed
      console.log(`[GOAL/SCORE] ${match.teams.home.name} ${match.scores.home} - ${match.scores.away} ${match.teams.away.name}`);
    }
  }

  fluctuateMatchOdds(match) {
    // Fluctuate about 30% of odds in each tick
    match.markets.forEach(market => {
      market.odds.forEach(odd => {
        if (Math.random() < 0.35) {
          // Locked odds simulation (5% chance to lock/unlock)
          if (Math.random() < 0.05) {
            odd.isLocked = !odd.isLocked;
            return;
          }
          
          if (odd.isLocked) return;

          const changeDir = Math.random() < 0.5 ? -1 : 1;
          const pct = Math.random() * 0.08; // Max 8% change
          const shift = odd.value * pct * changeDir;
          this.adjustOddValue(odd, shift, match.id);
        }
      });
    });
  }

  adjustOddValue(odd, shift, matchId) {
    const oldVal = odd.value;
    let newVal = oldVal + shift;
    
    // Bound odds between 1.01 and 50.00
    if (newVal < 1.01) newVal = 1.01;
    if (newVal > 50.00) newVal = 50.00;
    
    newVal = parseFloat(newVal.toFixed(2));
    
    if (newVal !== oldVal) {
      odd.value = newVal;
      const flashKey = `${matchId}_${odd.selectionId}`;
      const direction = newVal < oldVal ? 'down' : 'up';
      
      // Set flash state
      this.flashStates[flashKey] = direction;
      
      // Update betslip selection if it was active
      state.updateSelectionOdds(odd.selectionId, newVal);
      
      // Clear flash state after duration
      setTimeout(() => {
        if (this.flashStates[flashKey] === direction) {
          delete this.flashStates[flashKey];
          state.notify('matches'); // Re-trigger redraw without flash classes
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
