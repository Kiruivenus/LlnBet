import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderReferralView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const user = state.data.user;
  const userPhone = user ? user.phone : '254700000000';
  const refLink = `${window.location.origin}/register?ref=${userPhone}`;

  container.innerHTML = `
    <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <h1 style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 900;">Refer & Earn</h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">Invite your friends to LlnBet and receive KES 500.00 bonus inside your wallet for each active signup.</p>
    </div>

    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Referral statistics cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; text-align: center;">
          <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 900; color: var(--accent-emerald);">3</div>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Friends Joined</p>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; text-align: center;">
          <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 900; color: var(--accent-orange);">KES 1,500.00</div>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Total Earned</p>
        </div>
      </div>

      <!-- Share Link Container Card -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 14px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">Your Referral Link</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; margin-top: -6px;">Copy your unique link and send it to friends via SMS, WhatsApp, or Social Media channels.</p>
        
        <div style="display: flex; align-items: center; background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0 12px; height: 48px; gap: 12px; justify-content: space-between;">
          <input type="text" readonly id="ref-link-field" value="${refLink}" style="flex: 1; background: none; border: none; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem; outline: none;" />
          <button id="ref-copy-btn" style="background: var(--accent-emerald); color: var(--bg-obsidian); border: none; font-weight: 800; font-size: 0.8rem; padding: 6px 14px; border-radius: var(--radius-sm); cursor: pointer; outline: none;">
            COPY
          </button>
        </div>
      </div>

      <!-- Referral process explanation steps -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 18px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">How it Works</h3>
        
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="background: var(--bg-charcoal); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--accent-emerald); border: 1px solid var(--border-color); font-size: 0.9rem;">1</span>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800;">Send Invitation Link</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">Share your link. Your friend signups using their phone number.</p>
          </div>
        </div>

        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="background: var(--bg-charcoal); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--accent-emerald); border: 1px solid var(--border-color); font-size: 0.9rem;">2</span>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800;">Friend Deposits min KES 200</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">Once signup completes, your friend issues an M-Pesa deposit of KES 200 or more.</p>
          </div>
        </div>

        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <span style="background: var(--bg-charcoal); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--accent-emerald); border: 1px solid var(--border-color); font-size: 0.9rem;">3</span>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800;">Both Receive Bonus</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">You get KES 500.00 credited instantly to your account. Your friend receives a welcome bonus.</p>
          </div>
        </div>
      </div>

    </div>
  `;

  // Bind copy action
  document.getElementById('ref-copy-btn')?.addEventListener('click', () => {
    const linkField = document.getElementById('ref-link-field');
    if (linkField) {
      linkField.select();
      linkField.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(linkField.value).then(() => {
        alert("Referral link copied to clipboard!");
      }).catch(() => {
        alert("Failed to copy link.");
      });
    }
  });
}
export default renderReferralView;
