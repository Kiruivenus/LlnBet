import { getMaterialIcon } from '../utils.js';

export function renderAboutView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <h1 style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 900;">About LlnBet</h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">Discover Kenya's state-of-the-art live betting platform built for ultimate speed, security, and premium user experience.</p>
    </div>

    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Stats Banner Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 14px;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; text-align: center;">
          <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 900; color: var(--accent-emerald);">50K+</div>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Active Players</p>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; text-align: center;">
          <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 900; color: var(--accent-orange);">10ms</div>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Live Feed Update</p>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; text-align: center;">
          <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 900; color: var(--accent-emerald);">KES 50M+</div>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Weekly Payouts</p>
        </div>
      </div>

      <!-- Core Description Card -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 14px;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">Who We Are</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
          LlnBet is a premier online sports betting platform licensed under the Betting Control and Licensing Board (BCLB) of Kenya. We specialize in dynamic live in-play sportsbooks, micro-market predictions, virtuals, and instant high-pool jackpots.
        </p>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
          Our proprietary high-speed trading engine processes real-world feeds across Soccer, Basketball, Tennis, Rugby, and Ice Hockey, ensuring fair play algorithms, smooth odds adjustments, and instant ticket settlements directly linked to Safaricom M-Pesa channels.
        </p>
      </div>

      <!-- Features Checklist Card -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 16px;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">Why Bet with LlnBet?</h3>
        
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="color: var(--accent-emerald);">${getMaterialIcon('check_circle')}</span>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800;">Safaricom M-Pesa STK Push</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">Instant deposits directly triggered to your handset. PIN request pops up instantly.</p>
          </div>
        </div>

        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="color: var(--accent-emerald);">${getMaterialIcon('check_circle')}</span>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800;">Guaranteed Daily Cash Out</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">Secure your earnings early. Cash out is processed instantly upon demand 24/7.</p>
          </div>
        </div>

        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="color: var(--accent-emerald);">${getMaterialIcon('check_circle')}</span>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800;">Legal and Audited Operations</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">Full compliance under license number BCLB-2026-A829. All software audited monthly.</p>
          </div>
        </div>
      </div>

    </div>
  `;
}
export default renderAboutView;
