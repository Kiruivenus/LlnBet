import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderResponsibleGamingView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <!-- Header Back Navigation -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <button class="icon-btn" id="rg-back-btn" aria-label="Go Back">
        ${getMaterialIcon('back')}
      </button>
      <span style="font-size: 0.95rem; font-weight:600; color:var(--text-secondary);">Back to Profile</span>
    </div>

    <!-- Responsible Gaming Card Content -->
    <div style="max-width:550px; margin:0 auto; display:flex; flex-direction:column; gap:16px;">
      
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:20px; text-align:center;">
        <div style="color:var(--accent-orange); margin:0 auto 12px auto; background:rgba(253, 185, 39, 0.1); width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
          ${getMaterialIcon('shield', 'large-profile-icon')}
        </div>
        <h2 style="font-size:1.4rem; font-family:var(--font-display); font-weight:800;">Play Responsibly (18+)</h2>
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin-top:6px;">Betting should be entertaining and structured. Set deposit limits, choose timeouts, or self-exclude below to manage your gameplay.</p>
      </div>

      <!-- Settings Card -->
      <div class="wallet-card" style="gap:16px;">
        <h3 style="font-size:1.1rem; font-weight:700;">Account Safety Limits</h3>
        
        <!-- Daily Deposit Limit input -->
        <div class="auth-form-group">
          <label class="auth-input-label" for="rg-deposit-limit-input">Daily Deposit Cap</label>
          <div style="display:flex; align-items:center; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); height:48px; padding:0 12px; gap:8px;">
            <span style="font-family:var(--font-mono); font-weight:700; color:var(--text-muted);">KES</span>
            <input type="number" id="rg-deposit-limit-input" value="10000" style="background:none; border:none; color:var(--text-primary); font-family:var(--font-mono); font-weight:700; font-size:1rem; width:100%; outline:none;" />
          </div>
          <p style="font-size:0.75rem; color:var(--text-muted);">Limits the maximum funds you can deposit via M-Pesa every 24 hours.</p>
        </div>

        <!-- Session Timeout dropdown -->
        <div class="auth-form-group">
          <label class="auth-input-label" for="rg-timeout-select">Take a Timeout</label>
          <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); height:48px; padding:0 12px; display:flex; align-items:center;">
            <select id="rg-timeout-select" style="background:none; border:none; color:var(--text-primary); font-size:0.95rem; font-family:var(--font-body); width:100%; outline:none; cursor:pointer;">
              <option value="none">No timeout (Active gameplay)</option>
              <option value="24h">24 Hours Timeout</option>
              <option value="7d">7 Days Time-out</option>
              <option value="30d">30 Days Time-out</option>
              <option value="exclude">Permanent Self-Exclusion</option>
            </select>
          </div>
          <p style="font-size:0.75rem; color:var(--text-muted);">Restricts login/betting on your handset for the selected duration.</p>
        </div>

        <!-- Submit Button -->
        <button class="auth-btn" id="rg-save-limits-btn" style="margin-top:8px;">
          Save Restrictions
        </button>
      </div>

      <!-- Support Contacts banner -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px;">
        <h4 style="font-size:0.9rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
          ${getMaterialIcon('phone')} Counseling Support
        </h4>
        <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; margin-top:6px;">If gaming is negatively affecting your life, please contact BCLB and NCPG support services. Toll-free helpline counsel is confidential and available 24/7.</p>
        <div style="margin-top:10px; font-size:0.8rem; font-family:var(--font-mono); font-weight:700; color:var(--accent-emerald);">
          Helpline Call: 1-800-GAMBLER (Toll-Free)
        </div>
      </div>

    </div>
  `;

  document.getElementById('rg-back-btn')?.addEventListener('click', () => {
    state.setPage('profile');
  });

  document.getElementById('rg-save-limits-btn')?.addEventListener('click', () => {
    const limit = document.getElementById('rg-deposit-limit-input').value;
    const timeout = document.getElementById('rg-timeout-select').value;

    if (timeout === 'exclude') {
      if (confirm("Caution: Permanent Self-Exclusion will immediately log you out and terminate your profile database listing. Proceed?")) {
        alert("Account excluded successfully. Logging out...");
        state.logoutUser();
      }
    } else {
      let timeoutMsg = '';
      if (timeout === '24h') timeoutMsg = '24-hour timeout initialized.';
      else if (timeout === '7d') timeoutMsg = '7-day timeout initialized.';
      else if (timeout === '30d') timeoutMsg = '30-day timeout initialized.';
      else timeoutMsg = 'No active timeouts.';

      alert(`Settings Saved!\n\nDaily Deposit Cap: KES ${limit}\nTimeout: ${timeoutMsg}`);
      state.setPage('profile');
    }
  });
}
export default renderResponsibleGamingView;
