import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { getMaterialIcon, formatCurrency, formatOdds } from '../utils.js';

export function renderBetslip() {
  const container = document.getElementById('app-betslip');
  if (!container) return;

  // Create or retrieve global betslip backdrop element for mobile
  let backdrop = document.getElementById('betslip-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'betslip-backdrop';
    backdrop.className = 'betslip-backdrop';
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', () => {
      closeBetslipDrawer();
    });
  }

  const selections = state.data.betslip ? state.data.betslip.selections : [];
  const user = state.data.user;
  const balance = user ? user.balance : 0;
  const allMatches = simulation.getMatches ? simulation.getMatches() : [];

  const activeTab = state.data.betslipTab || 'normal';

  // Analyze selections
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

  let html = `
    <!-- Mobile Drawer Pull Handle -->
    <div style="display: flex; justify-content: center; padding-top: 8px; cursor: pointer;" id="betslip-pull-handle">
      <div style="width: 36px; height: 4px; border-radius: 9999px; background-color: var(--border-color-hover);"></div>
    </div>

    <!-- Betslip Header -->
    <div class="betslip-header">
      <div class="betslip-title-group">
        <span style="color: var(--color-primary); display: flex; align-items: center;">${getMaterialIcon('receipt')}</span>
        <h3 class="betslip-title">Betslip</h3>
        ${selections.length > 0 ? `<span class="betslip-count-badge">${selections.length}</span>` : ''}
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        ${selections.length > 0 ? `
          <button id="betslip-remove-all-btn" style="background: none; border: none; color: var(--color-danger); font-size: 0.8rem; font-weight: 700; cursor: pointer;">
            Remove All
          </button>
        ` : ''}
        <button id="betslip-close-mobile-x-btn" class="header-icon-btn" aria-label="Close" style="width: 32px; height: 32px;">
          ${getMaterialIcon('close')}
        </button>
      </div>
    </div>

    <!-- Betslip Navigation Tabs -->
    <div class="betslip-tabs">
      <button class="betslip-tab ${activeTab === 'normal' ? 'active' : ''}" id="btab-normal">
        Normal (${selections.length})
      </button>
      <button class="betslip-tab ${activeTab === 'system' ? 'active' : ''}" id="btab-system">
        System (0)
      </button>
      <button class="betslip-tab ${activeTab === 'virtuals' ? 'active' : ''}" id="btab-virtuals">
        Virtuals (0)
      </button>
    </div>
  `;

  if (selections.length === 0) {
    html += `
      <div class="betslip-body">
        <div class="betslip-empty-state">
          <span class="betslip-empty-icon">${getMaterialIcon('confirmation_number')}</span>
          <p class="betslip-empty-text">Your betslip is currently empty.</p>
          <p style="font-size: 0.78rem;">Click on any odds button across football, basketball, or tennis to build your accumulator slip.</p>
        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById('betslip-close-mobile-x-btn')?.addEventListener('click', closeBetslipDrawer);
    document.getElementById('betslip-pull-handle')?.addEventListener('click', closeBetslipDrawer);
    return;
  }

  // Selections Ticket List Container
  html += `<div class="betslip-body">`;

  let validTotalOdds = 1.0;
  analyzedSelections.forEach(sel => {
    if (!sel.isExpiredOrStarted && sel.odds) {
      validTotalOdds *= sel.odds;
    }

    html += `
      <div class="betslip-ticket">
        <button class="ticket-remove-btn selection-remove-btn" data-id="${sel.id}" title="Remove selection">✕</button>
        <div class="ticket-header">
          <span class="ticket-selection-name">${sel.team}</span>
          <span class="ticket-odds">${formatOdds(sel.odds)}</span>
        </div>
        <div class="ticket-match-name">${sel.matchName}</div>
        <div class="ticket-market-name">Market: ${sel.market}</div>
      </div>
    `;
  });

  html += `</div>`;

  // Calculations & Stake Inputs
  const formattedOdds = validTotalOdds > 1.0 ? parseFloat(validTotalOdds.toFixed(2)) : 1.0;
  const currentStake = state.data.betslip.stakes['global_multi'] || 100;
  const payout = currentStake * formattedOdds;

  html += `
    <div class="betslip-footer">
      <!-- Quick Stake Buttons -->
      <div class="quick-stakes-grid">
        <button class="quick-stake-btn" data-val="100">+100</button>
        <button class="quick-stake-btn" data-val="250">+250</button>
        <button class="quick-stake-btn" data-val="500">+500</button>
        <button class="quick-stake-btn" data-val="1000">+1000</button>
      </div>

      <!-- Stake Input -->
      <div class="betslip-stake-row">
        <div class="stake-input-wrapper">
          <span class="stake-currency">KES</span>
          <input type="number" id="betslip-stake-input" class="stake-input" value="${currentStake}" min="1" step="any" placeholder="Enter Stake" />
        </div>
      </div>

      <!-- Summary Statistics -->
      <div class="betslip-summary-row">
        <span class="summary-label">Total Odds</span>
        <span class="summary-val">${formatOdds(formattedOdds)}</span>
      </div>

      <div class="betslip-summary-row">
        <span class="summary-label">Potential Win</span>
        <span class="summary-val payout">KES ${payout.toFixed(2)}</span>
      </div>

      <!-- Submit Place Bet CTA Button -->
      ${expiredCount > 0 ? `
        <button class="btn-place-bet" id="remove-expired-btn" style="background: var(--color-danger); color: #fff;">
          Remove Expired (${expiredCount})
        </button>
      ` : `
        <button class="btn-place-bet" id="betslip-place-bet-btn">
          Place Bet (KES ${currentStake})
        </button>
      `}
    </div>
  `;

  container.innerHTML = html;

  // Bind Close Handlers
  document.getElementById('betslip-close-mobile-x-btn')?.addEventListener('click', closeBetslipDrawer);
  document.getElementById('betslip-pull-handle')?.addEventListener('click', closeBetslipDrawer);

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

  // Quick Stake Buttons Listener
  container.querySelectorAll('.quick-stake-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const addVal = parseFloat(btn.getAttribute('data-val')) || 0;
      const newStake = (currentStake || 0) + addVal;
      state.setSelectionStake('global_multi', newStake);
    });
  });

  // Stake input change
  const stakeInput = document.getElementById('betslip-stake-input');
  stakeInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) || 0;
    state.setSelectionStake('global_multi', val);
  });

  // Place Bet Submission
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
      alert(`Bet Placed Successfully!\n\nTicket ID: ${bet.betId || bet.id}\nStake: KES ${currentStake}\nTotal Odds: ${formattedOdds}\nPossible Win: KES ${payout.toFixed(2)}`);
      closeBetslipDrawer();
    } catch (err) {
      alert(err.message || "Failed to place bet.");
    } finally {
      btn.disabled = false;
      btn.textContent = `Place Bet (KES ${currentStake})`;
    }
  });
}

export function openBetslipDrawer() {
  const slip = document.getElementById('app-betslip');
  const backdrop = document.getElementById('betslip-backdrop');
  if (slip) slip.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
}

export function closeBetslipDrawer() {
  const slip = document.getElementById('app-betslip');
  const backdrop = document.getElementById('betslip-backdrop');
  if (slip) slip.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
}

export default renderBetslip;
