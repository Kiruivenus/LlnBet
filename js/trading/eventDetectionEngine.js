/**
 * Event Detection Engine
 * Detects discrete match events and evaluates their impact weight on probability and market suspension.
 */
export class EventDetectionEngine {
  constructor() {
    this.previousStateMap = new Map();
  }

  /**
   * Analyze telemetry and return detected events list
   */
  detectEvents(telemetry) {
    if (!telemetry) return [];

    const prev = this.previousStateMap.get(telemetry.matchId);
    const events = [];

    if (!prev) {
      this.previousStateMap.set(telemetry.matchId, { ...telemetry });
      return events;
    }

    // 1. Goal Detection
    if (telemetry.homeScore > prev.homeScore) {
      events.push({
        type: 'GOAL',
        team: 'home',
        weight: 1.0,
        requiresSuspension: true,
        suspensionDurationMs: 8000,
        description: 'Goal scored for Home team'
      });
    }

    if (telemetry.awayScore > prev.awayScore) {
      events.push({
        type: 'GOAL',
        team: 'away',
        weight: 1.0,
        requiresSuspension: true,
        suspensionDurationMs: 8000,
        description: 'Goal scored for Away team'
      });
    }

    // 2. Red Card Detection
    if (telemetry.redCards.home > prev.redCards.home) {
      events.push({
        type: 'RED_CARD',
        team: 'home',
        weight: 0.85,
        requiresSuspension: true,
        suspensionDurationMs: 6000,
        description: 'Red Card for Home team'
      });
    }
    if (telemetry.redCards.away > prev.redCards.away) {
      events.push({
        type: 'RED_CARD',
        team: 'away',
        weight: 0.85,
        requiresSuspension: true,
        suspensionDurationMs: 6000,
        description: 'Red Card for Away team'
      });
    }

    // 3. VAR Review Detection
    if (telemetry.varStatus === 'REVIEWING' && prev.varStatus !== 'REVIEWING') {
      events.push({
        type: 'VAR_REVIEW',
        weight: 0.95,
        requiresSuspension: true,
        suspensionDurationMs: 12000,
        description: 'VAR Review in progress'
      });
    }

    // 4. Corner / Dangerous Attack Detection
    if (telemetry.corners.home > prev.corners.home) {
      events.push({ type: 'CORNER', team: 'home', weight: 0.15, requiresSuspension: false });
    }
    if (telemetry.corners.away > prev.corners.away) {
      events.push({ type: 'CORNER', team: 'away', weight: 0.15, requiresSuspension: false });
    }

    // Update state cache
    this.previousStateMap.set(telemetry.matchId, {
      ...telemetry,
      homeScore: telemetry.homeScore,
      awayScore: telemetry.awayScore,
      redCards: { ...telemetry.redCards },
      varStatus: telemetry.varStatus
    });

    return events;
  }
}

export const eventDetectionEngine = new EventDetectionEngine();
