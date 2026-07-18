/**
 * Risk Management Engine
 * Simulates bookmaker trading exposure, tracking liability volume and applying risk shading.
 */
export class RiskEngine {
  constructor() {
    this.liabilityMap = new Map();
  }

  /**
   * Register a bet stake to track bookmaker risk
   */
  recordBet(matchId, selectionType, stakeAmount) {
    const current = this.liabilityMap.get(matchId) || { home: 0, draw: 0, away: 0 };
    if (selectionType === 'home' || selectionType === '1') current.home += stakeAmount;
    else if (selectionType === 'draw' || selectionType === 'x') current.draw += stakeAmount;
    else if (selectionType === 'away' || selectionType === '2') current.away += stakeAmount;
    
    this.liabilityMap.set(matchId, current);
  }

  /**
   * Apply liability shading to raw probabilities
   */
  applyRiskShading(matchId, probabilities) {
    const liabilities = this.liabilityMap.get(matchId);
    if (!liabilities) return probabilities;

    const total = liabilities.home + liabilities.draw + liabilities.away;
    if (total < 1000) return probabilities; // Ignore low volume

    // Calculate volume imbalance
    const homeShare = liabilities.home / total;
    const drawShare = liabilities.draw / total;
    const awayShare = liabilities.away / total;

    // Shade probabilities up for high volume outcomes (lowering the odds to discourage further heavy betting)
    let shadedH = probabilities.pHome + (homeShare - 0.33) * 0.04;
    let shadedX = probabilities.pDraw + (drawShare - 0.33) * 0.04;
    let shadedA = probabilities.pAway + (awayShare - 0.33) * 0.04;

    shadedH = Math.max(0.001, shadedH);
    shadedX = Math.max(0.001, shadedX);
    shadedA = Math.max(0.001, shadedA);

    const sum = shadedH + shadedX + shadedA;
    return {
      pHome: shadedH / sum,
      pDraw: shadedX / sum,
      pAway: shadedA / sum
    };
  }
}

export const riskEngine = new RiskEngine();
