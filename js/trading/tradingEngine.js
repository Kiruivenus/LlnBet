import { liveFeedProcessor } from './liveFeedProcessor.js';
import { eventDetectionEngine } from './eventDetectionEngine.js';
import { teamStrengthModel } from './teamStrengthModel.js';
import { momentumEngine } from './momentumEngine.js';
import { probabilityEngine } from './probabilityEngine.js';
import { riskEngine } from './riskEngine.js';
import { suspensionEngine } from './suspensionEngine.js';
import { oddsEngine } from './oddsEngine.js';

/**
 * Modular Event-Driven Live Trading Engine
 * Orchestrates telemetry feed processing, event detection, strength modeling, momentum,
 * probability normalization, risk shading, market suspension rules, and smooth odds updates.
 */
export class TradingEngine {
  constructor() {
    this.memoryOdds = new Map();
    this.lastBackendSync = new Map();
    this.initMemory();
  }

  /**
   * Load odds memory from local cache and backend MongoDB API
   */
  async initMemory() {
    try {
      const local = localStorage.getItem('betpulse_odds_memory');
      if (local) {
        const parsed = JSON.parse(local);
        Object.keys(parsed).forEach(matchId => this.memoryOdds.set(matchId, parsed[matchId]));
      }

      const res = await fetch('/api/odds');
      if (res.ok) {
        const records = await res.json();
        if (Array.isArray(records)) {
          records.forEach(item => this.memoryOdds.set(item.matchId, { r1: item.r1, rx: item.rx, r2: item.r2 }));
        }
      }
    } catch (e) {}
  }

  /**
   * Persist odds memory locally and throttle MongoDB API sync
   */
  persistOdds(matchId, oddsObj) {
    this.memoryOdds.set(matchId, oddsObj);
    try {
      const obj = {};
      this.memoryOdds.forEach((v, k) => obj[k] = v);
      localStorage.setItem('betpulse_odds_memory', JSON.stringify(obj));

      const now = Date.now();
      const lastSync = this.lastBackendSync.get(matchId) || 0;
      if (now - lastSync > 60000) {
        this.lastBackendSync.set(matchId, now);
        fetch('/api/odds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, ...oddsObj })
        }).catch(() => {});
      }
    } catch (e) {}
  }

  /**
   * Process a match through the complete Live Trading Engine Pipeline
   */
  processMatchTrading(match) {
    if (!match) return;

    // 1. Process Live Feed Telemetry
    const telemetry = liveFeedProcessor.process(match);

    // 2. Event Detection Engine
    const detectedEvents = eventDetectionEngine.detectEvents(telemetry);

    // 3. Suspension Engine Evaluation
    const suspensionState = suspensionEngine.evaluateSuspension(match, telemetry, detectedEvents);

    // 4. Momentum Engine Calculation
    const momentum = momentumEngine.calculateMomentum(telemetry);

    // 5. Probability Engine Calculation
    let probabilities = probabilityEngine.calculateLiveProbabilities(match, telemetry, momentum);

    // 6. Risk Engine Exposure Shading
    probabilities = riskEngine.applyRiskShading(match.id, probabilities);

    // 7. Odds Engine Target Odds Generation
    const rawOdds = oddsEngine.compute1X2Odds(probabilities, suspensionState);

    // 8. Smooth Moving Average Odds Interpolation
    const mainMarket = match.markets ? match.markets[0] : null;
    if (!mainMarket || !mainMarket.odds) return;

    const oddsArr = mainMarket.odds;
    const prevMemory = this.memoryOdds.get(match.id) || {
      r1: oddsArr[0]?.value || rawOdds.r1 || 2.10,
      rx: oddsArr[1]?.value || rawOdds.rx || 3.30,
      r2: oddsArr[2]?.value || rawOdds.r2 || 3.10
    };

    // Interpolation rate: 4% smooth shift per tick for live, static for prematch
    const step = match.isLive ? 0.04 : 0.0;
    let smooth1 = rawOdds.r1 !== null ? parseFloat((prevMemory.r1 + (rawOdds.r1 - prevMemory.r1) * step).toFixed(2)) : null;
    let smoothX = rawOdds.rx !== null ? parseFloat((prevMemory.rx + (rawOdds.rx - prevMemory.rx) * step).toFixed(2)) : null;
    let smooth2 = rawOdds.r2 !== null ? parseFloat((prevMemory.r2 + (rawOdds.r2 - prevMemory.r2) * step).toFixed(2)) : null;

    // Apply calculated odds or "-" dash states to match object
    if (oddsArr[0]) {
      oddsArr[0].isSuspended = rawOdds.isSuspendedHome || smooth1 === null;
      oddsArr[0].value = oddsArr[0].isSuspended ? null : smooth1;
    }
    if (oddsArr[1]) {
      oddsArr[1].isSuspended = rawOdds.isSuspendedDraw || smoothX === null;
      oddsArr[1].value = oddsArr[1].isSuspended ? null : smoothX;
    }
    if (oddsArr[2]) {
      oddsArr[2].isSuspended = rawOdds.isSuspendedAway || smooth2 === null;
      oddsArr[2].value = oddsArr[2].isSuspended ? null : smooth2;
    }

    match.tradingTelemetry = {
      telemetry,
      detectedEvents,
      suspensionState,
      momentum,
      probabilities
    };

    this.persistOdds(match.id, { r1: smooth1 || prevMemory.r1, rx: smoothX || prevMemory.rx, r2: smooth2 || prevMemory.r2 });
  }
}

export const tradingEngine = new TradingEngine();
