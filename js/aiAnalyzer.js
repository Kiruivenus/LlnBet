// AI Live Score & Odds Control Engine with MongoDB Memory & Smooth Interpolation

class AIAnalyzerEngine {
  constructor() {
    this.oddsMemoryMap = new Map(); // Local in-memory cache of last odds
    this.initMemory();
  }

  // Load last saved odds from localStorage / MongoDB API on boot
  async initMemory() {
    try {
      const local = localStorage.getItem('betpulse_odds_memory');
      if (local) {
        const parsed = JSON.parse(local);
        Object.keys(parsed).forEach(matchId => {
          this.oddsMemoryMap.set(matchId, parsed[matchId]);
        });
      }

      // Sync with MongoDB API
      const res = await fetch('/api/odds');
      if (res.ok) {
        const records = await res.json();
        if (Array.isArray(records)) {
          records.forEach(item => {
            this.oddsMemoryMap.set(item.matchId, { r1: item.r1, rx: item.rx, r2: item.r2 });
          });
        }
      }
    } catch (e) {
      // Graceful fallback to local memory
    }
  }

  // Save updated odds to local cache and MongoDB
  saveOddsMemory(matchId, oddsObj) {
    this.oddsMemoryMap.set(matchId, oddsObj);
    try {
      const obj = {};
      this.oddsMemoryMap.forEach((v, k) => obj[k] = v);
      localStorage.setItem('betpulse_odds_memory', JSON.stringify(obj));

      // Async sync to backend MongoDB API
      fetch('/api/odds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, ...oddsObj })
      }).catch(() => {});
    } catch (e) {}
  }

  /**
   * Calculates realistic live odds for a match with smooth interpolation
   */
  updateMatchLiveOdds(match) {
    if (!match) return;

    // PREMATCH MATCHES: Static or micro-fluctuations (max ±0.005)
    if (!match.isLive) {
      if (match.markets && match.markets[0] && match.markets[0].odds) {
        const oddsArr = match.markets[0].odds;
        const prev = this.oddsMemoryMap.get(match.id) || {
          r1: oddsArr[0]?.value || 2.10,
          rx: oddsArr[1]?.value || 3.40,
          r2: oddsArr[2]?.value || 2.80
        };

        // Micro-drift for prematch (barely visible smooth shift)
        if (Math.random() < 0.1) {
          const delta = (Math.random() - 0.5) * 0.01;
          prev.r1 = Math.max(1.05, parseFloat((prev.r1 + delta).toFixed(2)));
        }

        if (oddsArr[0]) oddsArr[0].value = prev.r1;
        if (oddsArr[1]) oddsArr[1].value = prev.rx;
        if (oddsArr[2]) oddsArr[2].value = prev.r2;

        this.saveOddsMemory(match.id, prev);
      }
      return;
    }

    // LIVE MATCHES: Calculate target odds based on score & minute
    let minute = 0;
    if (typeof match.timer === 'string') {
      if (match.timer.includes('90') || match.timer.includes('+') || match.timer === 'FT') {
        minute = 92;
      } else {
        minute = parseInt(match.timer) || 45;
      }
    } else {
      minute = match.timer || 45;
    }

    const homeScore = match.scores ? match.scores.home : 0;
    const awayScore = match.scores ? match.scores.away : 0;
    const scoreDiff = homeScore - awayScore;

    const timeFraction = Math.min(1.0, minute / 90);
    const timeRemaining = Math.max(0, 1.0 - timeFraction);

    let pHome = 0.45;
    let pDraw = 0.28;
    let pAway = 0.27;

    if (scoreDiff > 0) {
      const leadWeight = scoreDiff * 0.25 + (1 - timeRemaining) * 0.35;
      pHome = Math.min(0.98, pHome + leadWeight);
      pAway = Math.max(0.001, pAway * Math.pow(timeRemaining, scoreDiff + 0.5));
      pDraw = scoreDiff >= 2 
        ? Math.max(0.001, pDraw * timeRemaining) 
        : Math.max(0.02, 0.28 * timeRemaining);
    } else if (scoreDiff < 0) {
      const leadWeight = Math.abs(scoreDiff) * 0.25 + (1 - timeRemaining) * 0.35;
      pAway = Math.min(0.98, pAway + leadWeight);
      pHome = Math.max(0.001, pHome * Math.pow(timeRemaining, Math.abs(scoreDiff) + 0.5));
      pDraw = Math.abs(scoreDiff) >= 2 
        ? Math.max(0.001, pDraw * timeRemaining) 
        : Math.max(0.02, 0.28 * timeRemaining);
    } else {
      if (minute > 70) {
        pDraw = Math.min(0.85, 0.28 + (1 - timeRemaining) * 0.55);
        pHome = (1 - pDraw) * 0.55;
        pAway = (1 - pDraw) * 0.45;
      }
    }

    const totalP = pHome + pDraw + pAway;
    pHome = pHome / totalP;
    pDraw = pDraw / totalP;
    pAway = pAway / totalP;

    const margin = 1.05;
    let target1 = pHome > 0.001 ? 1 / (pHome * margin) : 999;
    let targetX = pDraw > 0.001 ? 1 / (pDraw * margin) : 999;
    let target2 = pAway > 0.001 ? 1 / (pAway * margin) : 999;

    target1 = target1 < 1.01 ? 1.01 : parseFloat(target1.toFixed(2));
    targetX = targetX < 1.01 ? 1.01 : parseFloat(targetX.toFixed(2));
    target2 = target2 < 1.01 ? 1.01 : parseFloat(target2.toFixed(2));

    // Retrieve previous odds from memory for smooth interpolation
    const mainMarket = match.markets ? match.markets[0] : null;
    if (!mainMarket || !mainMarket.odds) return;

    const oddsArr = mainMarket.odds;
    const prevMemory = this.oddsMemoryMap.get(match.id) || {
      r1: oddsArr[0]?.value || target1,
      rx: oddsArr[1]?.value || targetX,
      r2: oddsArr[2]?.value || target2
    };

    // Smooth exponential moving average factor (0.03 = 3% shift per tick)
    const smoothStep = 0.03;
    let newR1 = prevMemory.r1 + (target1 - prevMemory.r1) * smoothStep;
    let newRx = prevMemory.rx + (targetX - prevMemory.rx) * smoothStep;
    let newR2 = prevMemory.r2 + (target2 - prevMemory.r2) * smoothStep;

    newR1 = parseFloat(newR1.toFixed(2));
    newRx = parseFloat(newRx.toFixed(2));
    newR2 = parseFloat(newR2.toFixed(2));

    // Check for Market Suspensions ("-" dash state)
    let suspendHome = false;
    let suspendDraw = false;
    let suspendAway = false;

    if (minute >= 90) {
      suspendHome = true;
      suspendDraw = true;
      suspendAway = true;
    } else if (minute >= 86) {
      if (Math.abs(scoreDiff) >= 2) {
        if (scoreDiff > 0) { suspendAway = true; suspendDraw = true; newR1 = 1.01; } 
        else { suspendHome = true; suspendDraw = true; newR2 = 1.01; }
      }
    }

    // Apply calculated smooth odds or "-" dash states
    if (oddsArr[0]) {
      oddsArr[0].isSuspended = suspendHome || newR1 > 500;
      oddsArr[0].value = suspendHome || newR1 > 500 ? null : Math.min(500.00, newR1);
    }
    if (oddsArr[1]) {
      oddsArr[1].isSuspended = suspendDraw || newRx > 500;
      oddsArr[1].value = suspendDraw || newRx > 500 ? null : Math.min(500.00, newRx);
    }
    if (oddsArr[2]) {
      oddsArr[2].isSuspended = suspendAway || newR2 > 500;
      oddsArr[2].value = suspendAway || newR2 > 500 ? null : Math.min(500.00, newR2);
    }

    // Save smooth state back to memory & MongoDB
    this.saveOddsMemory(match.id, { r1: newR1, rx: newRx, r2: newR2 });
  }
}

export const aiAnalyzer = new AIAnalyzerEngine();
export default aiAnalyzer;
