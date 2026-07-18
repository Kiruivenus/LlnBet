/**
 * Odds Engine
 * Converts normalized probabilities into bookmaker odds across multiple markets
 * (1X2, BTTS, Double Chance, Totals, DNB, 1st Half) with overround margin controls.
 */
export class OddsEngine {
  constructor() {
    this.margin = 1.05; // 5% sportsbook overround margin
  }

  /**
   * Calculate 1X2 odds from probabilities
   */
  compute1X2Odds(probabilities, suspensionState) {
    if (!probabilities) return { r1: null, rx: null, r2: null };

    const { pHome, pDraw, pAway } = probabilities;

    let r1 = pHome > 0.0001 ? 1 / (pHome * this.margin) : 999;
    let rx = pDraw > 0.0001 ? 1 / (pDraw * this.margin) : 999;
    let r2 = pAway > 0.0001 ? 1 / (pAway * this.margin) : 999;

    r1 = r1 < 1.01 ? 1.01 : parseFloat(r1.toFixed(2));
    rx = rx < 1.01 ? 1.01 : parseFloat(rx.toFixed(2));
    r2 = r2 < 1.01 ? 1.01 : parseFloat(r2.toFixed(2));

    const isSuspended = suspensionState ? suspensionState.isSuspended : false;

    return {
      r1: isSuspended || r1 > 500 ? null : Math.min(500.00, r1),
      rx: isSuspended || rx > 500 ? null : Math.min(500.00, rx),
      r2: isSuspended || r2 > 500 ? null : Math.min(500.00, r2),
      isSuspendedHome: isSuspended || r1 > 500,
      isSuspendedDraw: isSuspended || rx > 500,
      isSuspendedAway: isSuspended || r2 > 500
    };
  }

  /**
   * Generate complete market set for a match
   */
  generateMarkets(matchId, odds1X2, suspensionState) {
    const isSuspended = suspensionState ? suspensionState.isSuspended : false;

    return [
      {
        id: `${matchId}_m1`,
        name: '1X2 / Match Winner',
        status: isSuspended ? 'SUSPENDED' : 'OPEN',
        odds: [
          { selectionId: `${matchId}_m1_1`, label: '1', value: odds1X2.r1, isSuspended: odds1X2.isSuspendedHome },
          { selectionId: `${matchId}_m1_x`, label: 'X', value: odds1X2.rx, isSuspended: odds1X2.isSuspendedDraw },
          { selectionId: `${matchId}_m1_2`, label: '2', value: odds1X2.r2, isSuspended: odds1X2.isSuspendedAway }
        ]
      }
    ];
  }
}

export const oddsEngine = new OddsEngine();
