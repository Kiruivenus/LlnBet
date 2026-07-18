import { tradingEngine } from './trading/tradingEngine.js';

class LegacyAIAdapter {
  updateMatchLiveOdds(match) {
    tradingEngine.processMatchTrading(match);
  }
}

export const aiAnalyzer = new LegacyAIAdapter();
export { tradingEngine };
export default aiAnalyzer;
