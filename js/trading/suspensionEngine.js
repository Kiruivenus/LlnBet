/**
 * Market Suspension Engine
 * Manages market states (OPEN, SUSPENDED, LOCKED, SETTLING, CLOSED)
 * and enforces event-driven suspension windows.
 */
export class SuspensionEngine {
  constructor() {
    this.suspensionMap = new Map(); // matchId -> { isSuspended, resumeTime, reason }
  }

  /**
   * Evaluate suspension requirements for a match
   */
  evaluateSuspension(match, telemetry, detectedEvents) {
    if (!match) return { isSuspended: false, state: 'OPEN', reason: null };

    const matchId = match.id;
    const now = Date.now();
    let current = this.suspensionMap.get(matchId) || { isSuspended: false, resumeTime: 0, reason: null };

    // 1. Check if an active event requires suspension
    const suspensionEvent = detectedEvents.find(e => e.requiresSuspension);
    if (suspensionEvent) {
      current = {
        isSuspended: true,
        resumeTime: now + (suspensionEvent.suspensionDurationMs || 6000),
        reason: suspensionEvent.description || suspensionEvent.type
      };
      this.suspensionMap.set(matchId, current);
      return { isSuspended: true, state: 'SUSPENDED', reason: current.reason };
    }

    // 2. Check active suspension window timer
    if (current.isSuspended && now < current.resumeTime) {
      return { isSuspended: true, state: 'SUSPENDED', reason: current.reason };
    }

    // 3. Late Match Suspension Rules (88'+ or 2+ goal lead at 86'+)
    const minute = telemetry ? telemetry.minute : 0;
    const homeScore = telemetry ? telemetry.homeScore : 0;
    const awayScore = telemetry ? telemetry.awayScore : 0;
    const scoreDiff = homeScore - awayScore;

    if (minute >= 90 || match.timer === 'FT' || match.timer === '90+') {
      return { isSuspended: true, state: 'SUSPENDED', reason: 'Stoppage Time / Match Completed' };
    }

    if (minute >= 86 && Math.abs(scoreDiff) >= 2) {
      return { isSuspended: true, state: 'SUSPENDED', reason: 'Late Lead Established' };
    }

    // Reset suspension if time elapsed
    if (current.isSuspended && now >= current.resumeTime) {
      current = { isSuspended: false, resumeTime: 0, reason: null };
      this.suspensionMap.set(matchId, current);
    }

    return { isSuspended: false, state: 'OPEN', reason: null };
  }
}

export const suspensionEngine = new SuspensionEngine();
