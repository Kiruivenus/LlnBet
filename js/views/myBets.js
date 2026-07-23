import { state } from '../state.js';
import { formatCurrency, formatOdds, formatDate, getMaterialIcon } from '../utils.js';

export function renderMyBetsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const placedBets = state.data.placedBets || [];

  let filterStatus = 'all';
  let hideLostBets = false;
  let activeCategory = 'normal';

  const getTimestamp = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const drawMyBets = () => {
    // Normalize raw bets
    const normalizedBets = placedBets.map(b => {
      const statusRaw = (b.status === 'OPEN' ? 'active' : b.status || 'active').toLowerCase();
      return {
        id: b.betId || b.id || 'N/A',
        type: b.selections?.length > 1 ? 'Multi Bet' : 'Single Bet',
        status: statusRaw,
        date: b.createdAt ? formatDate(b.createdAt) : 'Today',
        stake: b.stake || 0,
        possiblePayout: b.possiblePayout || 0,
        odds: b.odds || (b.selections ? b.selections.reduce((acc, s) => acc * (s.odds || 1), 1) : 1),
        selections: b.selections || []
      };
    });

    let filteredList = normalizedBets;

    if (activeCategory === 'jackpot' || activeCategory === 'virtual') {
      filteredList = [];
    } else {
      if (filterStatus === 'active') {
        filteredList = filteredList.filter(b => b.status === 'active');
      } else if (filterStatus === 'won') {
        filteredList = filteredList.filter(b => b.status === 'won');
      } else if (filterStatus === 'lost') {
        filteredList = filteredList.filter(b => b.status === 'lost');
      } else if (filterStatus === 'cashed_out') {
        filteredList = filteredList.filter(b => b.status === 'cashed_out' || b.status === 'cashedout');
      }

      if (hideLostBets) {
        filteredList = filteredList.filter(b => b.status !== 'lost');
      }
    }

    const activeCount = normalizedBets.filter(b => b.status === 'active').length;
    const wonCount = normalizedBets.filter(b => b.status === 'won').length;

    container.innerHTML = `
      <!-- Page Title Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <div>
          <h1 class="section-title" style="font-size: 1.4rem;">My Bets & Ticket History</h1>
          <p style="font-size: 0.82rem; color: var(--text-secondary);">Track active wagers, cashouts, and settled bet slips.</p>
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
          Updated: ${getTimestamp()}
        </span>
      </div>

      <!-- Category Navigation Pills -->
      <div class="sports-chips-wrapper" style="margin-bottom: 12px;">
        <div class="sports-chips-list">
          <button class="sport-chip ${activeCategory === 'normal' ? 'active' : ''}" data-cat="normal">
            <span>${getMaterialIcon('receipt')}</span>
            <span>Normal Bets</span>
            <span class="sport-chip-count">${normalizedBets.length}</span>
          </button>
          <button class="sport-chip ${activeCategory === 'jackpot' ? 'active' : ''}" data-cat="jackpot">
            <span>${getMaterialIcon('jackpot')}</span>
            <span>Jackpot</span>
            <span class="sport-chip-count">0</span>
          </button>
          <button class="sport-chip ${activeCategory === 'virtual' ? 'active' : ''}" data-cat="virtual">
            <span>${getMaterialIcon('esports')}</span>
            <span>Virtuals</span>
            <span class="sport-chip-count">0</span>
          </button>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px 18px; border-radius: var(--radius-xl); box-shadow: var(--shadow-subtle); flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Filter:</span>
          <div style="display: flex; gap: 6px;">
            ${['all', 'active', 'won', 'lost'].map(st => `
              <button class="quick-stake-btn ${filterStatus === st ? 'active-filter' : ''}" data-status="${st}" style="padding: 5px 12px; border-radius: var(--radius-pill); font-size: 0.78rem; ${filterStatus === st ? 'background: var(--color-primary); color: #fff; border-color: var(--color-primary);' : ''}">
                ${st.toUpperCase()}
              </button>
            `).join('')}
          </div>
        </div>

        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary);">
          <input type="checkbox" id="mybets-hide-lost-switch" ${hideLostBets ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer;" />
          <span>Hide Lost Bets</span>
        </label>
      </div>

      <!-- Tickets List -->
      <div class="bet-history-list" style="display: flex; flex-direction: column; gap: 16px;">
        ${filteredList.length === 0 ? `
          <div style="text-align: center; padding: 60px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
            <span class="material-icons-round" style="font-size: 3rem; color: var(--border-color-hover);">receipt_long</span>
            <h3 style="color: var(--text-primary); font-family: var(--font-heading); margin-top: 8px;">No Bet Slips Found</h3>
            <p style="font-size: 0.85rem; margin-top: 4px;">You currently have no bet tickets in this section. Explore top fixtures to place your first bet.</p>
          </div>
        ` : filteredList.map(bet => {
          const cashOutVal = parseFloat((bet.stake * 0.95).toFixed(2));
          const isActive = bet.status === 'active';
          const isWon = bet.status === 'won';
          const isCashedOut = bet.status === 'cashed_out' || bet.status === 'cashedout';

          return `
            <div class="bet-ticket-card" data-bet-id="${bet.id}" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px; box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 14px;">
              
              <!-- Ticket Header -->
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 800; font-size: 0.88rem; color: var(--text-primary);">${bet.type}</span>
                  <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">#${bet.id}</span>
                </div>

                <div>
                  ${isActive ? `
                    <span class="badge-live-indicator" style="background: rgba(16, 185, 129, 0.1); color: var(--color-primary); border-color: rgba(16, 185, 129, 0.25);">
                      <span class="pulse-dot" style="background: var(--color-primary);"></span>
                      <span>ACTIVE</span>
                    </span>
                  ` : isWon ? `
                    <span style="background: rgba(16, 185, 129, 0.15); color: var(--color-primary); font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-pill);">
                      ✓ WON
                    </span>
                  ` : isCashedOut ? `
                    <span style="background: rgba(245, 158, 11, 0.15); color: var(--color-warning); font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-pill);">
                      💰 CASHED OUT
                    </span>
                  ` : `
                    <span style="background: var(--bg-surface-hover); color: var(--text-muted); font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-pill);">
                      LOST
                    </span>
                  `}
                </div>
              </div>

              <!-- Ticket Selections Items -->
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${bet.selections.map(sel => `
                  <div style="display: flex; flex-direction: column; gap: 2px; background: var(--bg-surface-hover); padding: 10px 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-weight: 800; font-size: 0.9rem; color: var(--color-primary);">${sel.team}</span>
                      <span style="font-family: var(--font-mono); font-weight: 800; font-size: 0.9rem; color: var(--text-primary);">${formatOdds(sel.odds)}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary);">
                      <span>Market: ${sel.market}</span>
                      <span style="font-size: 0.72rem; color: var(--text-muted);">${sel.matchName || ''}</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Summary Stats & Cashout Footer -->
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 12px; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; gap: 16px; font-size: 0.82rem;">
                  <div>
                    <span style="color: var(--text-muted); font-size: 0.75rem;">Stake:</span>
                    <div style="font-family: var(--font-mono); font-weight: 800; color: var(--text-primary);">${formatCurrency(bet.stake)}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 0.75rem;">Total Odds:</span>
                    <div style="font-family: var(--font-mono); font-weight: 800; color: var(--text-primary);">${formatOdds(bet.odds)}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 0.75rem;">Potential Win:</span>
                    <div style="font-family: var(--font-mono); font-weight: 800; color: var(--color-primary);">${formatCurrency(bet.possiblePayout)}</div>
                  </div>
                </div>

                <!-- Cash Out Action Button -->
                ${isActive ? `
                  <button class="btn-deposit bet-cashout-action-btn" data-id="${bet.id}" data-val="${cashOutVal}" style="padding: 8px 16px; font-size: 0.82rem;">
                    💰 Cash Out ${formatCurrency(cashOutVal)}
                  </button>
                ` : ''}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;

    // Filter status buttons
    container.querySelectorAll('.quick-stake-btn[data-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        filterStatus = btn.getAttribute('data-status');
        drawMyBets();
      });
    });

    // Hide lost switch
    document.getElementById('mybets-hide-lost-switch')?.addEventListener('change', (e) => {
      hideLostBets = e.target.checked;
      drawMyBets();
    });

    // Category chips
    container.querySelectorAll('.sports-chips-list .sport-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeCategory = chip.getAttribute('data-cat');
        drawMyBets();
      });
    });

    // Cash Out Trigger
    container.querySelectorAll('.bet-cashout-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const betId = btn.getAttribute('data-id');
        const val = parseFloat(btn.getAttribute('data-val'));

        try {
          btn.disabled = true;
          btn.textContent = "Processing Cash Out...";
          const success = await state.cashOutBet(betId, val);
          if (success) {
            alert(`Cashout Confirmed!\n\n${formatCurrency(val)} has been credited back to your wallet balance.`);
            drawMyBets();
          }
        } catch (err) {
          alert(err.message || "Cashout failed.");
        } finally {
          btn.disabled = false;
        }
      });
    });
  };

  drawMyBets();
}

export default renderMyBetsView;
