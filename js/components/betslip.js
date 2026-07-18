import { state } from '../state.js';
import { getMaterialIcon, formatCurrency, formatOdds } from '../utils.js';

export function renderBetslip() {
  const container = document.getElementById('app-betslip');
  if (!container) return;

  const selections = state.data.betslip.selections;
  const mode = state.data.betslip.mode || 'single';
  const user = state.data.user;
  const balance = user ? user.balance : 0;

  // Header with Mobile Close button
  let html = `
    <div class="betslip-header">
      <div class="betslip-title" style="display:flex; align-items:center; gap:8px;">
        <button class="betslip-close-mobile" id="betslip-close-mobile-btn" aria-label="Close Betslip">
          ${getMaterialIcon('close')}
        </button>
        <span>Betslip</span>
        ${selections.length > 0 ? `<span class="betslip-count">${selections.length}</span>` : ''}
      </div>
      ${selections.length > 0 ? `<button class="betslip-clear" id="betslip-clear-all">Clear All</button>` : ''}
    </div>
  `;

  if (selections.length === 0) {
    // Empty state
    html += `
      <div class="betslip-content">
        <div class="betslip-empty">
          <div class="betslip-empty-icon">${getMaterialIcon('confirmation_number', 'empty-slip-icon')}</div>
          <p class="betslip-empty-text">Your betslip is empty.</p>
          <p style="font-size:0.8rem; color:var(--text-muted);">Select odds from the matches to add predictions here.</p>
        </div>
      </div>
    `;
    container.innerHTML = html;

    // Bind Close Button for Empty State
    document.getElementById('betslip-close-mobile-btn')?.addEventListener('click', () => {
      const slip = document.getElementById('app-betslip');
      if (slip) {
        slip.classList.remove('active');
      }
    });
    return;
  }

  // Modes
  html += `
    <div class="betslip-modes">
      <button class="betslip-mode-btn ${mode === 'single' ? 'active' : ''}" id="mode-single-btn">Single</button>
      <button class="betslip-mode-btn ${mode === 'multi' ? 'active' : ''}" id="mode-multi-btn">Multi</button>
      <button class="betslip-mode-btn ${mode === 'system' ? 'active' : ''}" id="mode-system-btn">System</button>
    </div>
    
    <div class="betslip-content">
  `;

  // Selections list
  selections.forEach(sel => {
    const stake = state.data.betslip.stakes[sel.id] || 0;
    
    html += `
      <div class="selection-card">
        <div class="selection-card-header">
          <span class="selection-team-name">${sel.team}</span>
          <button class="selection-remove" data-id="${sel.id}">${getMaterialIcon('close')}</button>
        </div>
        <div class="selection-market-info">${sel.market}</div>
        <div class="selection-match-name">${sel.matchName}</div>
        <div class="selection-odds-line">
          <span class="selection-odds-label">Odds</span>
          <span class="selection-odds-val">${formatOdds(sel.odds)}</span>
        </div>
        
        <!-- Individual stake input visible ONLY in Single mode -->
        ${mode === 'single' ? `
          <div class="selection-stake-row">
            <div class="selection-stake-input-wrapper">
              <span class="currency-symbol">KES</span>
              <input type="number" class="selection-stake-input" data-id="${sel.id}" value="${stake > 0 ? stake : ''}" placeholder="Stake (KES)" min="50" step="any" />
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`; // Close content area

  // Footer Calculation Summary
  let totalOdds = 1.0;
  let totalStake = 0.0;
  let potentialWinnings = 0.0;
  let isPlaceable = true;

  if (mode === 'single') {
    selections.forEach(sel => {
      const stake = state.data.betslip.stakes[sel.id] || 0;
      totalStake += stake;
      potentialWinnings += stake * sel.odds;
      if (stake <= 0) isPlaceable = false;
    });
  } else if (mode === 'multi') {
    selections.forEach(sel => {
      totalOdds *= sel.odds;
    });
    totalOdds = parseFloat(totalOdds.toFixed(2));
    
    const globalMultiStake = state.data.betslip.stakes['global_multi'] || 1000; // default KES 1,000
    totalStake = globalMultiStake;
    potentialWinnings = totalStake * totalOdds;
    if (totalStake <= 0) isPlaceable = false;
  } else {
    totalOdds = 2.50;
    const globalSystemStake = state.data.betslip.stakes['global_system'] || 1000;
    totalStake = globalSystemStake * 3;
    potentialWinnings = globalSystemStake * totalOdds * 3;
    if (globalSystemStake <= 0) isPlaceable = false;
  }

  const hasBalance = balance >= totalStake;
  if (!hasBalance || totalStake <= 0) isPlaceable = false;

  html += `
    <div class="betslip-footer">
      
      <!-- Stake Input for Multi / System modes -->
      ${mode !== 'single' ? `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
          <span style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">
            ${mode === 'multi' ? 'Combined Stake' : 'Stake per Combination'}
          </span>
          <div class="selection-stake-input-wrapper" style="width: 130px;">
            <span class="currency-symbol">KES</span>
            <input type="number" class="selection-stake-input" id="betslip-global-stake" value="${mode === 'multi' ? (state.data.betslip.stakes['global_multi'] || '') : (state.data.betslip.stakes['global_system'] || '')}" placeholder="Stake (KES)" min="50" />
          </div>
        </div>
      ` : ''}

      <!-- Quick Stake Buttons -->
      <div class="quick-stakes-grid">
        <button class="quick-stake-btn" data-value="100">+100</button>
        <button class="quick-stake-btn" data-value="500">+500</button>
        <button class="quick-stake-btn" data-value="1000">+1k</button>
        <button class="quick-stake-btn" data-value="5000">+5k</button>
      </div>

      <!-- Financial Calculations -->
      <div class="betslip-summary-row">
        <span>Total Stake</span>
        <span class="betslip-summary-val">${formatCurrency(totalStake)}</span>
      </div>
      
      ${mode === 'multi' ? `
        <div class="betslip-summary-row">
          <span>Combined Odds</span>
          <span class="betslip-summary-val" style="color:var(--accent-orange); font-family:var(--font-mono);">${formatOdds(totalOdds)}</span>
        </div>
      ` : ''}

      <div class="betslip-summary-row total">
        <span>Est. Return</span>
        <span class="betslip-summary-val">${formatCurrency(potentialWinnings)}</span>
      </div>

      <!-- Place Bet CTA -->
      <button class="place-bet-btn" id="betslip-place-bet-btn" ${!isPlaceable ? 'disabled' : ''}>
        ${!hasBalance ? 'Insufficient Balance' : 'Place Bet'}
      </button>
    </div>
  `;

  container.innerHTML = html;

  // Bind Events
  document.getElementById('betslip-close-mobile-btn')?.addEventListener('click', () => {
    const slip = document.getElementById('app-betslip');
    if (slip) {
      slip.classList.remove('active');
    }
  });

  document.getElementById('betslip-clear-all')?.addEventListener('click', () => {
    state.clearBetslip();
  });

  // Remove individual selection
  container.querySelectorAll('.selection-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      state.removeSelection(id);
    });
  });

  // Switch bet slip mode
  document.getElementById('mode-single-btn')?.addEventListener('click', () => state.setBetslipMode('single'));
  document.getElementById('mode-multi-btn')?.addEventListener('click', () => state.setBetslipMode('multi'));
  document.getElementById('mode-system-btn')?.addEventListener('click', () => state.setBetslipMode('system'));

  // Handle single stake inputs changes
  container.querySelectorAll('.selection-stake-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const selectionId = input.getAttribute('data-id');
      state.setSelectionStake(selectionId, e.target.value);
    });
  });

  // Handle global parlay stake input
  const globalStakeInput = document.getElementById('betslip-global-stake');
  globalStakeInput?.addEventListener('input', (e) => {
    const key = mode === 'multi' ? 'global_multi' : 'global_system';
    state.setSelectionStake(key, e.target.value);
  });

  // Quick stakes event
  container.querySelectorAll('.quick-stake-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const addedVal = parseFloat(btn.getAttribute('data-value'));
      
      if (mode === 'single') {
        selections.forEach(sel => {
          const cur = state.data.betslip.stakes[sel.id] || 0;
          state.setSelectionStake(sel.id, cur + addedVal);
        });
      } else {
        const key = mode === 'multi' ? 'global_multi' : 'global_system';
        const cur = state.data.betslip.stakes[key] || 0;
        state.setSelectionStake(key, cur + addedVal);
      }
    });
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

      const bet = await state.placeBet(totalStake, totalOdds, totalPayout);
      alert(`Success!\n\nBet placed successfully!\nBet ID: ${bet.betId || bet.id}\nStake: ${formatCurrency(totalStake)}\nOdds: ${formatOdds(totalOdds)}\nPossible Payout: ${formatCurrency(totalPayout)}`);
    } catch (err) {
      alert(err.message || "Failed to place bet.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Place Bet";
    }
  });
}
export default renderBetslip;
