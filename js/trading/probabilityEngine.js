import { teamStrengthModel } from './teamStrengthModel.js';

/**
 * Probability Engine
 * Converts pre-match market odds into implied baseline probabilities, then evolves them
 * dynamically using match minute decay, score differential, team strength, momentum, and cards.
 */
export class ProbabilityEngine {
  /**
   * Derive implied baseline probabilities from pre-match 1X2 odds (removes overround margin)
   */
  extractBaselineProbabilities(r1, rx, r2) {
    const defaultR1 = r1 && r1 > 1.0 ? r1 : 2.10;
    const defaultRx = rx && rx > 1.0 ? rx : 3.30;
    const defaultR2 = r2 && r2 > 1.0 ? r2 : 3.10;

    const rawP1 = 1 / defaultR1;
    const rawPx = 1 / defaultRx;
    const rawP2 = 1 / defaultR2;

    const overround = rawP1 + rawPx + rawP2;

    return {
      pHome: rawP1 / overround,
      pDraw: rawPx / overround,
      pAway: rawP2 / overround
    };
  }

  /**
   * Calculate live normalized probabilities
   */
  calculateLiveProbabilities(match, telemetry, momentum) {
    if (!match) return { pHome: 0.33, pDraw: 0.34, pAway: 0.33 };

    // 1. Get pre-match baseline probabilities
    const mainMarket = match.markets ? match.markets[0] : null;
    const oddsArr = mainMarket ? mainMarket.odds : [];
    const baseR1 = oddsArr[0] ? oddsArr[0].value : 2.10;
    const baseRx = oddsArr[1] ? oddsArr[1].value : 3.30;
    const baseR2 = oddsArr[2] ? oddsArr[2].value : 3.10;

    const baselines = this.extractBaselineProbabilities(baseR1, baseRx, baseR2);

    if (!match.isLive) {
      return baselines;
    }

    // 2. Extract match parameters
    const minute = telemetry ? telemetry.minute : 45;
    const homeScore = telemetry ? telemetry.homeScore : 0;
    const awayScore = telemetry ? telemetry.awayScore : 0;
    const scoreDiff = homeScore - awayScore;

    const timeFraction = Math.min(1.0, minute / 90);
    const timeRemaining = Math.max(0, 1.0 - timeFraction);

    let pH = baselines.pHome;
    let pX = baselines.pDraw;
    let pA = baselines.pAway;

    // 3. Team Strength & Momentum Adjustments
    const momentumVal = momentum ? momentum.index : 0;
    pH += momentumVal * 0.12 * timeRemaining;
    pA -= momentumVal * 0.12 * timeRemaining;

    // 4. Red Cards Impact Adjustment
    if (telemetry) {
      if (telemetry.redCards.home > 0) {
        pH *= Math.pow(0.55, telemetry.redCards.home);
      }
      if (telemetry.redCards.away > 0) {
        pA *= Math.pow(0.55, telemetry.redCards.away);
      }
    }

    // 5. Score Differential & Time-Decay Calculations
    if (scoreDiff > 0) {
      // Home team is leading
      const leadWeight = scoreDiff * 0.22 + (1.0 - timeRemaining) * 0.40;
      pH = Math.min(0.99, pH + leadWeight);
      pA = Math.max(0.001, pA * Math.pow(timeRemaining, scoreDiff + 0.5));
      pX = scoreDiff >= 2
        ? Math.max(0.001, pX * timeRemaining)
        : Math.max(0.01, 0.28 * timeRemaining);
    } else if (scoreDiff < 0) {
      // Away team is leading
      const leadWeight = Math.abs(scoreDiff) * 0.22 + (1.0 - timeRemaining) * 0.40;
      pA = Math.min(0.99, pA + leadWeight);
      pH = Math.max(0.001, pH * Math.pow(timeRemaining, Math.abs(scoreDiff) + 0.5));
      pX = Math.abs(scoreDiff) >= 2
        ? Math.max(0.001, pX * timeRemaining)
        : Math.max(0.01, 0.28 * timeRemaining);
    } else {
      // Score is tied (Draw)
      if (minute > 65) {
        // Draw probability increases dramatically as time runs out on a level score
        pX = Math.min(0.88, pX + (1.0 - timeRemaining) * 0.50);
        const remainingProb = 1.0 - pX;
        const hRatio = baselines.pHome / (baselines.pHome + baselines.pAway);
        pH = remainingProb * hRatio;
        pA = remainingProb * (1.0 - hRatio);
      }
    }

    // 6. Normalize probabilities (Sum = 1.0, non-negative)
    pH = Math.max(0.0001, pH);
    pX = Math.max(0.0001, pX);
    pA = Math.max(0.0001, pA);

    const sum = pH + pX + pA;
    return {
      pHome: parseFloat((pH / sum).toFixed(4)),
      pDraw: parseFloat((pX / sum).toFixed(4)),
      pAway: parseFloat((pA / sum).toFixed(4))
    };
  }
}

export const probabilityEngine = new ProbabilityEngine();
