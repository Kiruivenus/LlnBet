import { state } from '../state.js';
import { formatCurrency, formatOdds, getMaterialIcon } from '../utils.js';

export function renderMyBetsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const placedBets = state.data.placedBets;

  // Local state for filters
  let filterStatus = 'all'; // 'all', 'active', 'won', 'lost'
  let hideLostBets = false;
  let activeCategory = 'normal'; // 'normal', 'jackpot', 'virtual'

  // Dynamic timestamp helper
  const getTimestamp = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes}:${seconds}${ampm}`;
  };

  const currentUpdateTimestamp = getTimestamp();

  const drawMyBets = () => {
    // Apply filters based on local state
    let filteredList = placedBets;

    // Filter by category
    if (activeCategory === 'jackpot') {
      filteredList = []; // empty mock
    } else if (activeCategory === 'virtual') {
      filteredList = []; // empty mock
    } else {
      // Normal category
      // Filter by status dropdown
      if (filterStatus === 'active') {
        filteredList = filteredList.filter(b => b.status === 'active');
      } else if (filterStatus === 'won') {
        filteredList = filteredList.filter(b => b.status === 'won');
      } else if (filterStatus === 'lost') {
        filteredList = filteredList.filter(b => b.status === 'lost');
      }

      // Hide lost bets toggle
      if (hideLostBets) {
        filteredList = filteredList.filter(b => b.status !== 'lost');
      }
    }

    container.innerHTML = `
      <!-- Category Tabs (Betika style) -->
      <div class="sports-nav-wrapper" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
        <div class="sports-nav" style="padding-bottom: 0;">
          <button class="sport-chip ${activeCategory === 'normal' ? 'active' : ''}" data-cat="normal" style="border-radius:0; border:none; background:none; box-shadow:none; padding:10px 16px;">
            Normal
          </button>
          <button class="sport-chip ${activeCategory === 'jackpot' ? 'active' : ''}" data-cat="jackpot" style="border-radius:0; border:none; background:none; box-shadow:none; padding:10px 16px;">
            Jackpot
          </button>
          <button class="sport-chip ${activeCategory === 'virtual' ? 'active' : ''}" data-cat="virtual" style="border-radius:0; border:none; background:none; box-shadow:none; padding:10px 16px;">
            Virtual
          </button>
        </div>
      </div>

      <!-- Update timestamp tag -->
      <div class="mybets-last-updated">
        Last updated at ${currentUpdateTimestamp}
      </div>

      <!-- Filters & Toggles control bar -->
      <div class="mybets-controls">
        <select class="mybets-filter-select" id="mybets-status-filter">
          <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Bets</option>
          <option value="active" ${filterStatus === 'active' ? 'selected' : ''}>Active</option>
          <option value="won" ${filterStatus === 'won' ? 'selected' : ''}>Won</option>
          <option value="lost" ${filterStatus === 'lost' ? 'selected' : ''}>Lost</option>
        </select>

        <div class="mybets-toggle-wrapper">
          <span>Hide Lost Bets</span>
          <input type="checkbox" id="mybets-hide-lost-switch" style="width:36px; height:18px; accent-color:var(--accent-emerald); cursor:pointer;" ${hideLostBets ? 'checked' : ''} />
        </div>
      </div>

      <!-- Tickets list area -->
      <div class="bet-history-list">
        ${filteredList.length === 0 ? `
          <div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-size:0.95rem;">
            You do not have any sportsbook bets in this category.
          </div>
        ` : filteredList.map(bet => {
          const cashOutVal = parseFloat((bet.stake * 0.95).toFixed(2));
          
          return `
            <div class="bet-ticket-card" data-bet-id="${bet.id}">
              
              <!-- Card Header collapsed view -->
              <div class="bet-ticket-header">
                <div>
                  <span class="bet-ticket-type">${bet.type}</span>
                  <span class="bet-ticket-id">ID: ${bet.id}</span>
                </div>
                <span class="bet-status-label ${bet.status}" style="font-size:0.75rem; padding:4px 10px; font-weight:800; border-radius:var(--radius-sm);">
                  ${bet.status === 'active' ? 'Active' : bet.status}
                </span>
              </div>

              <!-- Compact summary stats -->
              <div class="bet-ticket-summary">
                <span style="color:var(--text-muted); font-size:0.8rem;">Date: ${bet.date}</span>
                <span style="font-weight:700;">
                  Stake: <span style="font-family:var(--font-mono);">${formatCurrency(bet.stake)}</span>
                </span>
              </div>

              <!-- Expandable details drawer (hidden by default) -->
              <div class="bet-ticket-details" id="ticket-details-${bet.id}">
                ${bet.selections.map(sel => `
                  <div class="bet-ticket-selection-item">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong style="color:var(--text-primary); font-size:0.9rem;">${sel.team}</strong>
                      <span style="font-family:var(--font-mono); font-weight:800; color:var(--accent-emerald);">${formatOdds(sel.odds)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                      <span>Market: ${sel.market}</span>
                      <span>${sel.matchName}</span>
                    </div>
                  </div>
                `).join('')}

                <!-- Cash Out panel -->
                ${bet.status === 'active' ? `
                  <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:12px; margin-top:4px;">
                    <span style="font-size:0.8rem; color:var(--text-secondary);">Early Cash Out Value:</span>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <strong style="font-family:var(--font-mono); color:var(--accent-orange); font-size:0.95rem;">
                        ${formatCurrency(cashOutVal)}
                      </strong>
                      <button class="bet-history-cashout-btn" data-id="${bet.id}" data-val="${cashOutVal}" style="padding:6px 14px; font-size:0.75rem; border-radius:var(--radius-sm);">
                        Cash Out
                      </button>
                    </div>
                  </div>
                ` : `
                  <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:12px; margin-top:4px; font-size:0.8rem;">
                    <span style="color:var(--text-muted);">Payout:</span>
                    <strong style="font-family:var(--font-mono); color:${bet.status === 'won' ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                      ${bet.status === 'won' ? formatCurrency(bet.winnings) : formatCurrency(0)}
                    </strong>
                  </div>
                `}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind Event Listeners
    // Status Filter dropdown
    document.getElementById('mybets-status-filter')?.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      drawMyBets();
    });

    // Hide Lost Bets switch
    document.getElementById('mybets-hide-lost-switch')?.addEventListener('change', (e) => {
      hideLostBets = e.target.checked;
      drawMyBets();
    });

    // Category Tabs click
    container.querySelectorAll('.sport-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        drawMyBets();
      });
    });

    // Toggle card expansion on click
    container.querySelectorAll('.bet-ticket-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent toggling expansion if clicking inside cashout button
        if (e.target.classList.contains('bet-history-cashout-btn')) return;

        const betId = card.getAttribute('data-bet-id');
        const detailsPanel = document.getElementById(`ticket-details-${betId}`);
        if (detailsPanel) {
          if (detailsPanel.style.display === 'flex') {
            detailsPanel.style.display = 'none';
            card.style.borderColor = 'var(--border-color)';
          } else {
            detailsPanel.style.display = 'flex';
            card.style.borderColor = 'var(--accent-emerald)';
          }
        }
      });
    });

    // Cash Out button trigger
    container.querySelectorAll('.bet-history-cashout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const betId = btn.getAttribute('data-id');
        const val = parseFloat(btn.getAttribute('data-val'));
        
        const success = state.cashOutBet(betId, val);
        if (success) {
          alert(`Cashout successful!\n\n${formatCurrency(val)} has been credited back to your betting wallet.`);
          drawMyBets(); // Redraw
        }
      });
    });
  };

  drawMyBets();
}
export default renderMyBetsView;
