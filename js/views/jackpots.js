import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderJackpotsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <!-- Header Back Navigation -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <button class="icon-btn" id="jp-back-btn" aria-label="Go Back">
        ${getMaterialIcon('back')}
      </button>
      <span style="font-size: 0.95rem; font-weight:600; color:var(--text-secondary);">Back to Profile</span>
    </div>

    <!-- Active Jackpots List -->
    <div style="max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:16px;">
      
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:20px; text-align:center; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; bottom:0; left:0; background:radial-gradient(circle at top right, rgba(253,185,39,0.15) 0%, rgba(8,10,15,0) 70%);"></div>
        <div style="color:var(--accent-orange); margin:0 auto 12px auto; background:rgba(253, 185, 39, 0.1); width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; position:relative; z-index:2;">
          ${getMaterialIcon('jackpot', 'large-profile-icon')}
        </div>
        <h2 style="font-size:1.4rem; font-family:var(--font-display); font-weight:800; position:relative; z-index:2;">LlnBet Jackpot Hub</h2>
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin-top:6px; position:relative; z-index:2;">Predict match outcomes correctly to win multi-million KES prize pools. Low entry stakes, huge payouts.</p>
      </div>

      <!-- Super Daily Jackpot Card -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:20px; display:flex; flex-direction:column; gap:12px; transition:border-color 0.2s;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span style="background:var(--accent-orange-glow); color:var(--accent-orange); font-size:0.7rem; padding:2px 8px; font-weight:800; border-radius:var(--radius-sm); text-transform:uppercase;">DAILY STREAK</span>
            <h3 style="font-size:1.15rem; font-weight:800; margin-top:6px; color:var(--text-primary);">Super Daily Jackpot</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Predict 10 correct match outcomes</p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.75rem; color:var(--text-secondary);">Grand Prize Pool</span>
            <div style="font-family:var(--font-mono); font-weight:800; font-size:1.25rem; color:var(--accent-emerald); margin-top:2px;">KES 1,000,000</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:10px 14px; font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">
          <span>Ticket stake cost: <strong style="font-family:var(--font-mono); color:var(--text-primary);">KES 50.00</strong></span>
          <span>Closes: <strong style="color:var(--accent-live);">Today 17:30</strong></span>
        </div>

        <button class="auth-btn jp-join-btn" data-name="Super Daily Jackpot" data-stake="50" style="margin-top:4px; font-size:0.9rem; padding:10px;">
          Enter Jackpot
        </button>
      </div>

      <!-- Mega Weekly Jackpot Card -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:20px; display:flex; flex-direction:column; gap:12px; transition:border-color 0.2s;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span style="background:var(--accent-emerald-glow); color:var(--accent-emerald); font-size:0.7rem; padding:2px 8px; font-weight:800; border-radius:var(--radius-sm); text-transform:uppercase;">WEEKLY MILLIONAIRE</span>
            <h3 style="font-size:1.15rem; font-weight:800; margin-top:6px; color:var(--text-primary);">Mega Weekly Jackpot</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Predict 17 correct match outcomes</p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.75rem; color:var(--text-secondary);">Grand Prize Pool</span>
            <div style="font-family:var(--font-mono); font-weight:800; font-size:1.25rem; color:var(--accent-emerald); margin-top:2px;">KES 250,000,000</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:10px 14px; font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">
          <span>Ticket stake cost: <strong style="font-family:var(--font-mono); color:var(--text-primary);">KES 99.00</strong></span>
          <span>Closes: <strong style="color:var(--text-muted);">Saturday 16:00</strong></span>
        </div>

        <button class="auth-btn jp-join-btn" data-name="Mega Weekly Jackpot" data-stake="99" style="margin-top:4px; font-size:0.9rem; padding:10px; background:linear-gradient(to right, var(--accent-orange), var(--accent-emerald));">
          Enter Jackpot
        </button>
      </div>

    </div>
  `;

  document.getElementById('jp-back-btn')?.addEventListener('click', () => {
    state.setPage('profile');
  });

  // Jackpot entry click handlers
  container.querySelectorAll('.jp-join-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const stake = parseFloat(btn.getAttribute('data-stake'));

      if (!state.data.isLoggedIn) {
        state.setPage('login');
        return;
      }

      const userBalance = state.data.user ? state.data.user.balance : 0;
      if (userBalance < stake) {
        alert("Insufficient balance to buy a Jackpot ticket.");
        return;
      }

      const success = state.withdraw(stake, `${name} Ticket`);
      if (success) {
        alert(`Jackpot Entry Success!\n\nYour ticket for '${name}' has been logged. KES ${stake} stake was deducted. Standings will update on match completion.`);
        renderJackpotsView(); // Refresh page (updated balance)
      }
    });
  });
}
export default renderJackpotsView;
