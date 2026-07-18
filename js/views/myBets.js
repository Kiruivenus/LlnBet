import { state } from '../state.js';
import { formatCurrency, formatOdds, getMaterialIcon } from '../utils.js';

export function renderMyBetsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const placedBets = state.data.placedBets;
  const activeBets = placedBets.filter(b => b.status === 'active');
  const settledBets = placedBets.filter(b => b.status !== 'active');

  let activeTab = 'active'; // 'active' or 'settled'

  const drawMyBets = () => {
    const list = activeTab === 'active' ? activeBets : settledBets;

    container.innerHTML = `
      <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
        <h1 style="font-size: 1.8rem; display:flex; align-items:center; gap:8px;">
          ${getMaterialIcon('history')}
          My Betting History
        </h1>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">Review your active tickets, cash out early, or inspect past settled results.</p>
      </div>

      <!-- Tab Buttons -->
      <div class="dashboard-main-card" style="margin-top: 16px;">
        <div class="dashboard-tabs">
          <button class="dashboard-tab-btn ${activeTab === 'active' ? 'active' : ''}" id="mybets-tab-active-btn">
            Active Tickets (${activeBets.length})
          </button>
          <button class="dashboard-tab-btn ${activeTab === 'settled' ? 'active' : ''}" id="mybets-tab-settled-btn">
            Settled Tickets (${settledBets.length})
          </button>
        </div>

        <div class="bet-history-list" style="margin-top:20px;">
          ${list.length === 0 ? `
            <div style="text-align:center; padding:50px 20px; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:12px;">
              <span class="material-icons-round" style="font-size: 3rem; color:var(--border-color-light);">assignment</span>
              <p style="font-size: 0.95rem;">No ${activeTab} bets found for this account.</p>
            </div>
          ` : list.map(bet => {
            const cashOutVal = parseFloat((bet.stake * 0.95).toFixed(2));
            
            return `
              <div class="bet-history-item" style="border: 1px solid var(--border-color); background: var(--bg-surface);">
                <div class="bet-history-header">
                  <div>
                    <span class="bet-type-label" style="background:var(--bg-charcoal); color:var(--text-secondary); font-weight:700;">${bet.type}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px;">ID: ${bet.id}</span>
                  </div>
                  <span class="bet-status-label ${bet.status}">
                    ${bet.status === 'active' ? 'Active' : bet.status}
                  </span>
                </div>

                <!-- Selections List -->
                ${bet.selections.map(sel => `
                  <div class="bet-history-selection" style="border-left: 2px solid var(--accent-emerald); padding-left:12px; margin: 8px 0;">
                    <div class="bet-history-sel-name" style="font-weight:700; font-size:0.95rem;">${sel.team}</div>
                    <div class="bet-history-sel-market" style="font-size:0.8rem; color:var(--text-secondary);">${sel.market} — <span style="font-family:var(--font-mono); font-weight:700; color:var(--accent-emerald);">${formatOdds(sel.odds)}</span></div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${sel.matchName}</div>
                  </div>
                `).join('')}

                <div class="bet-history-footer" style="border-top: 1px solid var(--border-color); padding-top:12px; margin-top:8px;">
                  <div>
                    Total Stake: <strong>${formatCurrency(bet.stake)}</strong>
                    ${bet.status !== 'active' ? `| Return: <strong style="color:var(--accent-emerald);">${formatCurrency(bet.winnings)}</strong>` : ''}
                  </div>
                  
                  ${bet.status === 'active' ? `
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-orange); font-weight:700;">
                        Cashout: ${formatCurrency(cashOutVal)}
                      </span>
                      <button class="bet-history-cashout-btn" data-id="${bet.id}" data-val="${cashOutVal}">
                        Cash Out
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Bind events
    document.getElementById('mybets-tab-active-btn')?.addEventListener('click', () => {
      activeTab = 'active';
      drawMyBets();
    });

    document.getElementById('mybets-tab-settled-btn')?.addEventListener('click', () => {
      activeTab = 'settled';
      drawMyBets();
    });

    // Cash Out trigger
    container.querySelectorAll('.bet-history-cashout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const betId = btn.getAttribute('data-id');
        const val = parseFloat(btn.getAttribute('data-val'));
        
        const success = state.cashOutBet(betId, val);
        if (success) {
          alert(`Cashout successful!\n\n${formatCurrency(val)} has been credited back to your betting wallet.`);
          
          // Re-fetch bets to update lists
          const updatedPlacedBets = state.data.placedBets;
          const updatedActive = updatedPlacedBets.filter(b => b.status === 'active');
          const updatedSettled = updatedPlacedBets.filter(b => b.status !== 'active');
          
          activeBets.length = 0; activeBets.push(...updatedActive);
          settledBets.length = 0; settledBets.push(...updatedSettled);
          
          drawMyBets();
        }
      });
    });
  };

  drawMyBets();
}
export default renderMyBetsView;
