// AI Live Score & Odds Control Engine

class AIAnalyzerEngine {
  /**
   * Calculates realistic live odds for a match based on current scores, 
   * elapsed match minute, score differential, and team momentum.
   */
  updateMatchLiveOdds(match) {
    if (!match || !match.isLive) return;

    // Parse current minute (e.g. "75", "88", "90+")
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

    // Elapsed time fraction (0.0 to 1.0)
    const timeFraction = Math.min(1.0, minute / 90);
    const timeRemaining = Math.max(0, 1.0 - timeFraction);

    // Baseline probabilities at kickoff (Home 45%, Draw 28%, Away 27%)
    let pHome = 0.45;
    let pDraw = 0.28;
    let pAway = 0.27;

    // 1. Adjust probabilities based on score difference & remaining time
    if (scoreDiff > 0) {
      // Home leading
      const leadWeight = scoreDiff * 0.25 + (1 - timeRemaining) * 0.35;
      pHome = Math.min(0.98, pHome + leadWeight);
      pAway = Math.max(0.001, pAway * Math.pow(timeRemaining, scoreDiff + 0.5));
      pDraw = scoreDiff >= 2 
        ? Math.max(0.001, pDraw * timeRemaining) 
        : Math.max(0.02, 0.28 * timeRemaining);
    } else if (scoreDiff < 0) {
      // Away leading
      const leadWeight = Math.abs(scoreDiff) * 0.25 + (1 - timeRemaining) * 0.35;
      pAway = Math.min(0.98, pAway + leadWeight);
      pHome = Math.max(0.001, pHome * Math.pow(timeRemaining, Math.abs(scoreDiff) + 0.5));
      pDraw = Math.abs(scoreDiff) >= 2 
        ? Math.max(0.001, pDraw * timeRemaining) 
        : Math.max(0.02, 0.28 * timeRemaining);
    } else {
      // Tied / Draw score
      if (minute > 70) {
        // As time runs out on a draw, draw probability skyrockets
        pDraw = Math.min(0.85, 0.28 + (1 - timeRemaining) * 0.55);
        pHome = (1 - pDraw) * 0.55;
        pAway = (1 - pDraw) * 0.45;
      }
    }

    // Normalize probabilities (Sum = 1.0)
    const totalP = pHome + pDraw + pAway;
    pHome = pHome / totalP;
    pDraw = pDraw / totalP;
    pAway = pAway / totalP;

    // Convert probabilities to odds (with bookmaker margin)
    const margin = 1.05;
    let r1 = pHome > 0.001 ? 1 / (pHome * margin) : 999;
    let rx = pDraw > 0.001 ? 1 / (pDraw * margin) : 999;
    let r2 = pAway > 0.001 ? 1 / (pAway * margin) : 999;

    // Format odds limits
    r1 = r1 < 1.01 ? 1.01 : parseFloat(r1.toFixed(2));
    rx = rx < 1.01 ? 1.01 : parseFloat(rx.toFixed(2));
    r2 = r2 < 1.01 ? 1.01 : parseFloat(r2.toFixed(2));

    // 2. Check for Market Suspensions ("-" dash state)
    let suspendHome = false;
    let suspendDraw = false;
    let suspendAway = false;

    // Late Game Suspension Rules (88'+ or 2+ goal lead near end)
    if (minute >= 90) {
      // All markets suspended in 90+ stoppage time
      suspendHome = true;
      suspendDraw = true;
      suspendAway = true;
    } else if (minute >= 86) {
      if (Math.abs(scoreDiff) >= 2) {
        // Lead by 2+ goals at 86'+: trailing team & draw suspended
        if (scoreDiff > 0) {
          suspendAway = true;
          suspendDraw = true;
          if (r1 > 50) r1 = 1.01;
        } else {
          suspendHome = true;
          suspendDraw = true;
          if (r2 > 50) r2 = 1.01;
        }
      } else if (Math.abs(scoreDiff) === 1) {
        // Lead by 1 goal at 86'+: trailing team odds high or suspended
        if (scoreDiff > 0) {
          if (r2 > 150) suspendAway = true;
        } else {
          if (r1 > 150) suspendHome = true;
        }
      }
    } else if (Math.abs(scoreDiff) >= 3 && minute >= 75) {
      // 3+ goal lead after 75 mins: suspend trailing team
      if (scoreDiff > 0) suspendAway = true;
      else suspendHome = true;
    }

    // Apply calculated odds or "-" dash states to match main market
    if (match.markets && match.markets[0] && match.markets[0].odds) {
      const oddsArr = match.markets[0].odds;
      
      // Home odd
      if (oddsArr[0]) {
        oddsArr[0].isSuspended = suspendHome || r1 > 500;
        oddsArr[0].value = suspendHome || r1 > 500 ? null : Math.min(500.00, r1);
      }
      // Draw odd
      if (oddsArr[1]) {
        oddsArr[1].isSuspended = suspendDraw || rx > 500;
        oddsArr[1].value = suspendDraw || rx > 500 ? null : Math.min(500.00, rx);
      }
      // Away odd
      if (oddsArr[2]) {
        oddsArr[2].isSuspended = suspendAway || r2 > 500;
        oddsArr[2].value = suspendAway || r2 > 500 ? null : Math.min(500.00, r2);
      }
    }

    return {
      r1: suspendHome ? null : r1,
      rx: suspendDraw ? null : rx,
      r2: suspendAway ? null : r2
    };
  }
}

export const aiAnalyzer = new AIAnalyzerEngine();
export default aiAnalyzer;
