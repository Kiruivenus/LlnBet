import { getMaterialIcon } from '../utils.js';

export function renderPrivacyView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <h1 style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 900;">Privacy Policy</h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">Understand how LlnBet collects, secures, and handles your registered user information and transaction records.</p>
    </div>

    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Privacy details cards -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--accent-emerald);">${getMaterialIcon('shield')}</span> 1. Data Collection & Usage
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
          LlnBet collects your phone number, password hash, and name strictly to authenticate your account and process wallet transactions. Phone numbers are linked directly with Safaricom M-Pesa API queries to issue STK Push requests.
        </p>
      </div>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--accent-emerald);">${getMaterialIcon('shield')}</span> 2. SSL Encryption Protocols
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
          All communication between your client device and our servers is encrypted using 256-bit Secure Socket Layer (SSL) technology. We store sensitive passwords using salt hashes (bcryptjs) which are irreversible.
        </p>
      </div>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 12px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--accent-emerald);">${getMaterialIcon('shield')}</span> 3. Third-Party Sharing Limits
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
          LlnBet does not sell, rent, or lease customer directories to third-party advertising companies. Financial audit trails are exclusively shared with the Betting Control and Licensing Board (BCLB) and Safaricom integrations under legal compliance.
        </p>
      </div>

    </div>
  `;
}
export default renderPrivacyView;
