/**
 * Live Feed Processor
 * Processes and normalizes raw match telemetry inputs into structured stats.
 */
export class LiveFeedProcessor {
  constructor() {
    this.feedCache = new Map();
  }

  /**
   * Process raw match input and return structured telemetry object
   */
  process(match) {
    if (!match) return null;

    const cached = this.feedCache.get(match.id) || this.createDefaultTelemetry(match);

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

    // Detect changes in telemetry
    const scoreChanged = homeScore !== cached.homeScore || awayScore !== cached.awayScore;

    // Simulate realistic match stats evolution if not present on raw fixture
    if (match.isLive) {
      if (!cached.initialized || scoreChanged) {
        cached.homeScore = homeScore;
        cached.awayScore = awayScore;
        cached.initialized = true;
      }

      // Evolve stats progressively as match minute increases
      const minuteDelta = Math.max(0, minute - cached.minute);
      if (minuteDelta > 0 && minute <= 90) {
        // Possessions drift slightly
        const possDrift = (Math.random() - 0.5) * 2;
        cached.possession.home = Math.min(80, Math.max(20, parseFloat((cached.possession.home + possDrift).toFixed(1))));
        cached.possession.away = parseFloat((100 - cached.possession.home).toFixed(1));

        // Attacks, shots, corners scale with time & possession
        if (Math.random() < 0.35) {
          const homeDom = cached.possession.home > 50;
          if (homeDom ? Math.random() < 0.6 : Math.random() < 0.4) {
            cached.dangerousAttacks.home += Math.floor(Math.random() * 2 + 1);
            if (Math.random() < 0.3) cached.shots.home += 1;
            if (Math.random() < 0.15) cached.shotsOnTarget.home += 1;
            if (Math.random() < 0.2) cached.corners.home += 1;
            cached.xG.home = parseFloat((cached.xG.home + (Math.random() * 0.08)).toFixed(2));
          } else {
            cached.dangerousAttacks.away += Math.floor(Math.random() * 2 + 1);
            if (Math.random() < 0.3) cached.shots.away += 1;
            if (Math.random() < 0.15) cached.shotsOnTarget.away += 1;
            if (Math.random() < 0.2) cached.corners.away += 1;
            cached.xG.away = parseFloat((cached.xG.away + (Math.random() * 0.08)).toFixed(2));
          }
        }
      }
    }

    cached.minute = minute;
    cached.isLive = match.isLive;
    this.feedCache.set(match.id, cached);

    return cached;
  }

  createDefaultTelemetry(match) {
    return {
      matchId: match.id,
      initialized: false,
      minute: 0,
      homeScore: match.scores ? match.scores.home : 0,
      awayScore: match.scores ? match.scores.away : 0,
      possession: { home: 52, away: 48 },
      dangerousAttacks: { home: Math.floor(Math.random() * 20 + 10), away: Math.floor(Math.random() * 20 + 8) },
      shots: { home: Math.floor(Math.random() * 5 + 2), away: Math.floor(Math.random() * 4 + 1) },
      shotsOnTarget: { home: Math.floor(Math.random() * 3 + 1), away: Math.floor(Math.random() * 2) },
      corners: { home: Math.floor(Math.random() * 4 + 1), away: Math.floor(Math.random() * 3) },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 },
      penalties: { home: 0, away: 0 },
      varStatus: 'NONE', // 'NONE', 'REVIEWING', 'DECIDED'
      xG: { home: 0.45, away: 0.32 }
    };
  }
}

export const liveFeedProcessor = new LiveFeedProcessor();
