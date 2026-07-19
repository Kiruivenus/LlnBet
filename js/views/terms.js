import { getMaterialIcon } from '../utils.js';

export function renderTermsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <h1 style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 900;">Terms & Conditions</h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">Review the legal user agreement, BCLB guidelines, and financial limits governing your LlnBet account operations.</p>
    </div>

    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Terms sections -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">1. Eligibility (Age Limits 18+)</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
          You must be 18 years or older to register an account on LlnBet. All players must declare their birth age status upon checkout checkbox checks, and all accounts are subject to verification controls.
        </p>
      </div>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">2. Wallet Limits & Taxation</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
          - Minimum Deposit: KES 200.00 | Minimum Withdrawal: KES 200.00.<br/>
          - All deposit amounts are audited in compliance with BCLB directives. Withdrawals are processed instantly through Safaricom M-Pesa channels linked to your registered phone.
        </p>
      </div>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">3. Responsible Gaming & Self-Exclusion</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
          LlnBet promotes structured entertainment. Players can set session limits or trigger a self-exclusion request through our live chat desk, which suspends the player login for the chosen duration.
        </p>
      </div>

    </div>
  `;
}
export default renderTermsView;
