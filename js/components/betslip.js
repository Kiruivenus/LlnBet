import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { getMaterialIcon, formatCurrency, formatOdds } from '../utils.js';

export function renderBetslip() {
  const container = document.getElementById('app-betslip');
  if (!container) return;

  const selections = state.data.betslip.selections || [];
  const user = state.data.user;
  const balance = user ? user.balance : 0;
  const allMatches = simulation.getMatches ? simulation.getMatches() : [];

  // Determine started or expired selections
  const analyzedSelections = selections.map(sel => {
    const match = allMatches.find(m => m.id === sel.matchId);
    let status = 'Normal';

    if (match) {
      if (match.timer === 'FT' || match.timer === '90+' || (typeof match.timer === 'string' && parseInt(match.timer) >= 90)) {
        status = 'Expired';
      } else if (match.isLive) {
        status = 'Started';
      }
    }

    return {
      ...sel,
      status,
      isExpiredOrStarted: status === 'Started' || status === 'Expired'
    };
  });

  const expiredCount = analyzedSelections.filter(s => s.isExpiredOrStarted).length;

  // Header & Betika Tab System
  let html = `
    <!-- Betika Category Tabs -->
    <div style="display: flex; border-bottom: 2px solid #1e293b; margin-bottom: 8px; background: #0c121d;">
      <button style="flex: 1; padding: 10px 0; background: transparent; border: none; border-bottom: 3px solid #00e676; color: #00e676; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
        Normal (${selections.length})
      </button>
      <button style="flex: 1; padding: 10px 0; background: transparent; border: none; color: #94a3b8; font-weight: 600; font-size: 0.9rem; cursor: pointer;">
        Shikisha Bet (0)
      </button>
      <button style="flex: 1; padding: 10px 0; background: transparent; border: none; color: #94a3b8; font-weight: 600; font-size: 0.9rem; cursor: pointer;">
        Virtuals (0)
      </button>
    </div>

    <!-- Sub-header actions row -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 4px 12px 4px;">
      <button id="betslip-remove-all-btn" style="background: transparent; border: none; color: #00e676; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
        Remove All
      </button>
      <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 0.85rem;">
        <span>Keep Betslip?</span>
        <label class="ios-switch">
          <input type="checkbox" id="keep-betslip-toggle" checked />
          <span class="ios-slider"></span>
        </label>
      </div>
    </div>
  `;

  if (selections.length === 0) {
    // Empty state
    html += `
      <div class="betslip-content" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 16px; text-align: center;">
        <div style="font-size: 3rem; color: #334155; margin-bottom: 12px;">${getMaterialIcon('confirmation_number')}</div>
        <p style="font-size: 1rem; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">Your betslip is empty.</p>
        <p style="font-size: 0.85rem; color: #94a3b8;">Select odds from any match to add predictions to your slip.</p>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  // Selections Card List Container
  html += `<div style="display: flex; flex-direction: column; gap: 8px; max-height: 50vh; overflow-y: auto; padding-right: 2px;">`;

  let validTotalOdds = 1.0;
  analyzedSelections.forEach(sel => {
    if (!sel.isExpiredOrStarted && sel.odds) {
      validTotalOdds *= sel.odds;
    }

    const cardBg = sel.isExpiredOrStarted ? 'rgba(253, 185, 39, 0.08)' : '#16202e';
    const cardBorder = sel.isExpiredOrStarted ? '1px solid rgba(253, 185, 39, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)';

    html += `
      <div style="background: ${cardBg}; border: ${cardBorder}; border-radius: 8px; padding: 12px 14px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="selection-remove-btn" data-id="${sel.id}" style="width: 20px; height: 20px; border-radius: 50%; background: #334155; border: none; color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px;">
              ✕
            </button>
            <span style="font-weight: 700; font-size: 0.92rem; color: #f8fafc;">${sel.matchName}</span>
          </div>

          ${sel.isExpiredOrStarted ? `
            <span style="color: #fdb927; font-weight: 700; font-size: 0.85rem;">${sel.status}</span>
          ` : `
            <span style="color: #00e676; font-weight: 700; font-size: 0.95rem;">${formatOdds(sel.odds)}</span>
          `}
        </div>

        <div style="font-size: 0.82rem; color: #94a3b8; margin-left: 28px; margin-bottom: 4px;">
          ${sel.market} • <span style="color: #e2e8f0; font-weight: 600;">${sel.team}</span>
        </div>

        ${!sel.isExpiredOrStarted ? `
          <div style="font-size: 0.75rem; color: #64748b; margin-left: 28px;">
            Starts ${sel.matchTime || 'Today, 19:00'}
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`; // Close list container

  // Summary & Stake Input
  const formattedOdds = validTotalOdds > 1.0 ? parseFloat(validTotalOdds.toFixed(2)) : 1.0;
  const currentStake = state.data.betslip.stakes['global_multi'] || 1;
  const payout = currentStake * formattedOdds;

  html += `
    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #1e293b;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.9rem; color: #94a3b8;">
        <span>Total Odds ⓘ</span>
        <span style="color: #f8fafc; font-weight: 700; font-family: var(--font-mono);">${formatOdds(formattedOdds)}</span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.9rem; color: #94a3b8;">
        <span>Final Payout ⓘ</span>
        <span style="color: #f8fafc; font-weight: 800; font-family: var(--font-mono);">KES${payout.toFixed(2)}</span>
      </div>

      <!-- Amount Input Container -->
      <div style="background: #16202e; border: 1px solid #263346; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; font-size: 0.92rem; color: #cbd5e1;">Amount (KES)</span>
        <input type="number" id="betika-amount-input" value="${currentStake}" min="1" step="any" style="background: transparent; border: none; color: #ffffff; font-weight: 800; font-size: 1.1rem; text-align: right; width: 100px; outline: none;" />
      </div>

      <!-- Action Button Row -->
      ${expiredCount > 0 ? `
        <button id="remove-expired-btn" style="background: #fdb927; color: #080a0f; font-family: var(--font-display); font-weight: 800; font-size: 1rem; width: 100%; height: 48px; border: none; border-radius: 8px; margin-top: 12px; cursor: pointer;">
          Remove Expired
        </button>
      ` : `
        <div style="display: flex; gap: 10px; margin-top: 12px;">
          <button id="share-betslip-btn" style="flex: 1; background: #263346; color: #ffffff; font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; height: 48px; border: none; border-radius: 8px; cursor: pointer;">
            Share
          </button>
          <button id="betslip-place-bet-btn" style="flex: 1.5; background: #fdb927; color: #080a0f; font-family: var(--font-display); font-weight: 800; font-size: 1rem; height: 48px; border: none; border-radius: 8px; cursor: pointer;">
            Place Bet KES${currentStake}
          </button>
        </div>
      `}
    </div>
  `;

  container.innerHTML = html;

  // Bind Event Handlers
  document.getElementById('betslip-remove-all-btn')?.addEventListener('click', () => {
    state.clearBetslip();
  });

  // Remove individual selection
  container.querySelectorAll('.selection-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      state.removeSelection(id);
    });
  });

  // Remove Expired Button
  document.getElementById('remove-expired-btn')?.addEventListener('click', () => {
    const validSelections = analyzedSelections.filter(s => !s.isExpiredOrStarted);
    state.data.betslip.selections = validSelections;
    state.persistBetslip();
    state.notify('betslip');
  });

  // Amount input change
  const amountInput = document.getElementById('betika-amount-input');
  amountInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) || 0;
    state.setSelectionStake('global_multi', val);
  });

  // Share button placeholder action
  document.getElementById('share-betslip-btn')?.addEventListener('click', () => {
    alert(`Betslip Code: BP-${Math.floor(100000 + Math.random() * 900000)}\n\nShare code copied to clipboard!`);
  });

  // Place Bet submission handler
  document.getElementById('betslip-place-bet-btn')?.addEventListener('click', async () => {
    if (!state.data.isLoggedIn) {
      alert("Authentication Required: Please login or register to place bets.");
      state.setPage('login');
      return;
    }

    const btn = document.getElementById('betslip-place-bet-btn');
    try {
      btn.disabled = true;
      btn.textContent = "Placing Bet...";

      const bet = await state.placeBet(currentStake, formattedOdds, payout);
      alert(`Success!\n\nBet placed successfully!\nBet Ticket: ${bet.betId || bet.id}\nStake: KES ${currentStake}\nOdds: ${formattedOdds}\nPossible Payout: KES ${payout.toFixed(2)}`);
    } catch (err) {
      alert(err.message || "Failed to place bet.");
    } finally {
      btn.disabled = false;
      btn.textContent = `Place Bet KES${currentStake}`;
    }
  });
}

export default renderBetslip;
