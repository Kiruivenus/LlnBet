// AI Oddsmaker & Live Match Analysis Engine

class AIAnalyzerEngine {
  constructor() {
    this.criticalEventReasons = [
      "VAR Review in Progress",
      "Penalty Kick Awarded",
      "Red Card Review",
      "Dangerous Free Kick",
      "Goal Confirmation Check",
      "Late Stoppage Time Lock"
    ];
  }

  /**
   * Calculate prematch baseline odds based on team metrics, rankings, and H2H
   */
  calculatePrematchOdds(match) {
    const homeName = match.teams.home.name;
    const awayName = match.teams.away.name;

    // Evaluate H2H history weighting
    let homeWins = 0;
    let awayWins = 0;
    (match.h2h || []).forEach(h => {
      if (h.score.startsWith(homeName)) homeWins++;
      if (h.score.includes(`- ${awayName}`) && !h.score.startsWith(homeName)) awayWins++;
    });

    const h2hBias = (homeWins - awayWins) * 0.08; // 8% bias per past victory

    // Calculate baseline probability distribution (Sum = 1.0)
    let pHome = 0.45 + h2hBias;
    let pDraw = 0.28;
    let pAway = 0.27 - h2hBias;

    // Normalize probabilities
    const totalP = pHome + pDraw + pAway;
    pHome = pHome / totalP;
    pDraw = pDraw / totalP;
    pAway = pAway / totalP;

    // Convert probabilities to odds with a standard 6% bookmaker margin (1.06)
    const margin = 1.06;
    const r1 = parseFloat((1 / (pHome * margin)).toFixed(2));
    const rx = parseFloat((1 / (pDraw * margin)).toFixed(2));
    const r2 = parseFloat((1 / (pAway * margin)).toFixed(2));

    return {
      homeProb: Math.round(pHome * 100),
      drawProb: Math.round(pDraw * 100),
      awayProb: Math.round(pAway * 100),
      odds: { 1: Math.max(1.05, r1), X: Math.max(1.50, rx), 2: Math.max(1.05, r2) }
    };
  }

  /**
   * Analyze live match in real-time, computing momentum index, odds shifts, and market locks
   */
  analyzeLiveMatch(match) {
    const stats = match.stats || {
      possession: { home: 50, away: 50 },
      shotsOnTarget: { home: 3, away: 3 },
      corners: { home: 4, away: 4 },
      yellowCards: { home: 1, away: 1 },
      redCards: { home: 0, away: 0 }
    };

    // 1. Calculate Real-Time Dominance / Attack Power Index
    const homePower = 
      (stats.possession.home * 0.4) + 
      (stats.shotsOnTarget.home * 7) + 
      (stats.corners.home * 3) - 
      (stats.yellowCards.home * 4) - 
      (stats.redCards.home * 30);

    const awayPower = 
      (stats.possession.away * 0.4) + 
      (stats.shotsOnTarget.away * 7) + 
      (stats.corners.away * 3) - 
      (stats.yellowCards.away * 4) - 
      (stats.redCards.away * 30);

    // Score difference factor
    const scoreDiff = match.scores.home - match.scores.away;

    // 2. Compute live probability percentages
    let pHome = 0.40 + (homePower - awayPower) * 0.005 + (scoreDiff * 0.15);
    let pAway = 0.35 + (awayPower - homePower) * 0.005 - (scoreDiff * 0.15);
    let pDraw = 0.25;

    // Bound probabilities
    pHome = Math.max(0.05, Math.min(0.90, pHome));
    pAway = Math.max(0.05, Math.min(0.90, pAway));
    pDraw = Math.max(0.05, Math.min(0.60, 1 - pHome - pAway));

    const total = pHome + pDraw + pAway;
    const homePct = Math.round((pHome / total) * 100);
    const drawPct = Math.round((pDraw / total) * 100);
    const awayPct = Math.round((pAway / total) * 100);

    // 3. Determine if market should be LOCKED for high-risk critical events
    let isLocked = false;
    let lockReason = null;

    // Trigger lock in 90+ stoppage time or random 4% high-threat momentum spike
    const isStoppage = match.timer === '90+' || match.timer === 'FT';
    const isHighThreatSpike = Math.random() < 0.04; // 4% chance per tick to simulate VAR/Penalty

    if (isStoppage) {
      isLocked = true;
      lockReason = "Late Stoppage Time - Market Suspended";
    } else if (isHighThreatSpike) {
      isLocked = true;
      lockReason = this.criticalEventReasons[Math.floor(Math.random() * (this.criticalEventReasons.length - 1))];
    } else if (stats.redCards.home > 0 || stats.redCards.away > 0) {
      // 15% lock chance if a red card was recently issued
      if (Math.random() < 0.15) {
        isLocked = true;
        lockReason = "Red Card Advantage - Re-evaluating Odds";
      }
    }

    // Determine current AI Match Status Text
    let aiStatusText = "Balanced Match Control";
    if (homePower > awayPower + 15) {
      aiStatusText = `${match.teams.home.name} Heavy Dominance (Pressure High)`;
    } else if (awayPower > homePower + 15) {
      aiStatusText = `${match.teams.away.name} Counter-Attacking Momentum`;
    }

    return {
      homeProb: homeHomePct(homePct),
      drawProb: drawPct,
      awayProb: awayPct,
      isLocked,
      lockReason,
      aiStatusText,
      homePower: Math.round(homePower),
      awayPower: Math.round(awayPower)
    };

    function homeHomePct(val) { return val; }
  }
}

export const aiAnalyzer = new AIAnalyzerEngine();
export default aiAnalyzer;
