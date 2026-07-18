/**
 * Momentum Engine
 * Evaluates live pressure, dangerous attacks, possession differentials, and shots on target
 * to compute a momentum index (-1.0 to +1.0) favoring Home (+1.0) or Away (-1.0).
 */
export class MomentumEngine {
  constructor() {
    this.momentumCache = new Map();
  }

  /**
   * Calculate live momentum for a match
   */
  calculateMomentum(telemetry) {
    if (!telemetry) return { index: 0, statusText: 'Balanced Match Momentum' };

    const possDiff = (telemetry.possession.home - telemetry.possession.away) / 100; // -0.3 to +0.3
    const attackDiff = (telemetry.dangerousAttacks.home - telemetry.dangerousAttacks.away) / 50;
    const shotDiff = (telemetry.shotsOnTarget.home - telemetry.shotsOnTarget.away) / 10;
    const xGDiff = (telemetry.xG.home - telemetry.xG.away);

    // Weighted composite momentum calculation
    let rawMomentum = (possDiff * 0.25) + (attackDiff * 0.35) + (shotDiff * 0.25) + (xGDiff * 0.15);

    // Apply exponential smoothing to prevent sudden jumps
    const prev = this.momentumCache.get(telemetry.matchId) || 0;
    const smoothMomentum = prev + (rawMomentum - prev) * 0.08;

    // Clamp to -1.0 to +1.0
    const clamped = Math.max(-1.0, Math.min(1.0, parseFloat(smoothMomentum.toFixed(3))));
    this.momentumCache.set(telemetry.matchId, clamped);

    let statusText = 'Balanced Match Control';
    if (clamped > 0.35) statusText = 'Heavy Home Attacking Pressure';
    else if (clamped > 0.15) statusText = 'Moderate Home Control';
    else if (clamped < -0.35) statusText = 'Heavy Away Counter-Pressure';
    else if (clamped < -0.15) statusText = 'Moderate Away Control';

    return {
      index: clamped,
      statusText
    };
  }
}

export const momentumEngine = new MomentumEngine();
