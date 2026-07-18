import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderProfileView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const user = state.data.user;

  // Track deposit and withdrawal values locally in view state
  let depositAmount = 1000;
  let withdrawAmount = 500;

  const drawProfile = () => {
    container.innerHTML = `
      <!-- Phone Header -->
      <div style="display:flex; align-items:center; gap:16px; background:var(--bg-surface); padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <div style="background:var(--accent-emerald-glow); color:var(--accent-emerald); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
          ${getMaterialIcon('user', 'large-profile-icon')}
        </div>
        <div>
          <h2 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700;">(254) 794-424486</h2>
          <p style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-top:2px;">BetPulse Verified Profile</p>
        </div>
      </div>

      <!-- Financial Widgets (Balance / Bonus) -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px;">
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:16px; border-radius:var(--radius-md); display:flex; align-items:center; gap:12px;">
          <div style="color:var(--accent-emerald); display:flex; align-items:center;">
            ${getMaterialIcon('wallet')}
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--text-secondary);">Balance</span>
            <div style="font-family:var(--font-mono); font-weight:800; font-size:1.1rem; color:var(--text-primary); margin-top:2px;" id="profile-wallet-balance">
              ${formatCurrency(user.balance)}
            </div>
          </div>
        </div>
        
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:16px; border-radius:var(--radius-md); display:flex; align-items:center; gap:12px;">
          <div style="color:var(--accent-orange); display:flex; align-items:center;">
            ${getMaterialIcon('bonus')}
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--text-secondary);">Bonus</span>
            <div style="font-family:var(--font-mono); font-weight:800; font-size:1.1rem; color:var(--accent-orange); margin-top:2px;">
              ${formatCurrency(0)}
            </div>
          </div>
        </div>
      </div>

      <!-- Promotions & Jackpot Shortcuts -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:16px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="font-size:0.85rem; color:var(--text-primary);">Promotions</h4>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Claim free bets</p>
          </div>
          <button class="quick-stake-btn" id="profile-view-promos-btn" style="padding:4px 10px; font-size:0.75rem;">View</button>
        </div>
        
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); padding:16px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="font-size:0.85rem; color:var(--text-primary);">Jackpot Streak</h4>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Standings list</p>
          </div>
          <button class="quick-stake-btn" id="profile-view-jackpots-btn" style="padding:4px 10px; font-size:0.75rem;">View</button>
        </div>
      </div>

      <!-- DEPOSIT BOX -->
      <div class="wallet-card" style="margin-top:16px; gap: 12px;">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">Deposit</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Send money into your BetPulse account</p>
        </div>

        <!-- Editable Adjuster Input -->
        <div style="display:flex; align-items:center; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; justify-content:space-between; height:48px; padding:0 12px;">
          <button id="dep-decrement-btn" style="background:none; border:none; width:36px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700; outline:none;">-</button>
          <div style="display:flex; align-items:center; gap:4px; flex:1; justify-content:center;">
            <span style="font-size:0.85rem; color:var(--text-secondary); font-family:var(--font-mono); font-weight:800;">KES</span>
            <input type="number" id="dep-val-input" value="${depositAmount}" style="background:none; border:none; color:var(--text-primary); font-family:var(--font-mono); font-weight:800; font-size:1.15rem; width:100px; text-align:center; outline:none; -moz-appearance: textfield;" min="10" />
          </div>
          <button id="dep-increment-btn" style="background:none; border:none; width:36px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700; outline:none;">+</button>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:-4px;">Minimum KES 10. All transactions are subject to 5% tax.</p>

        <!-- Quick Amount Selectors -->
        <div class="quick-stakes-grid" style="grid-template-columns: repeat(4, 1fr);">
          <button class="quick-stake-btn profile-dep-quick" data-val="100">+100</button>
          <button class="quick-stake-btn profile-dep-quick" data-val="200">+200</button>
          <button class="quick-stake-btn profile-dep-quick" data-val="500">+500</button>
          <button class="quick-stake-btn profile-dep-quick" data-val="1000">+1000</button>
        </div>

        <!-- Single clean full-width M-Pesa Deposit button -->
        <button class="wallet-submit-btn" id="profile-dep-mpesa-btn" style="background:#00e676; color:#080a0f; font-size:0.9rem; padding:12px; font-weight:800; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; gap:8px; border:none; cursor:pointer; width:100%;">
          ${getMaterialIcon('smartphone')} Deposit with Mpesa
        </button>
      </div>

      <!-- WITHDRAWAL BOX -->
      <div class="wallet-card" style="margin-top:16px; gap: 12px;">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">Withdrawal</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Withdraw money from your BetPulse wallet</p>
        </div>

        <!-- Editable Adjuster Input -->
        <div style="display:flex; align-items:center; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; justify-content:space-between; height:48px; padding:0 12px;">
          <button id="with-decrement-btn" style="background:none; border:none; width:36px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700; outline:none;">-</button>
          <div style="display:flex; align-items:center; gap:4px; flex:1; justify-content:center;">
            <span style="font-size:0.85rem; color:var(--text-secondary); font-family:var(--font-mono); font-weight:800;">KES</span>
            <input type="number" id="with-val-input" value="${withdrawAmount}" style="background:none; border:none; color:var(--text-primary); font-family:var(--font-mono); font-weight:800; font-size:1.15rem; width:100px; text-align:center; outline:none; -moz-appearance: textfield;" min="50" />
          </div>
          <button id="with-increment-btn" style="background:none; border:none; width:36px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700; outline:none;">+</button>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:-4px;">Minimum KES 50, Maximum KES 300,000. All transactions are subject to 5% tax.</p>

        <!-- Single clean full-width M-Pesa Withdraw button -->
        <button class="wallet-submit-btn" id="profile-with-mpesa-btn" style="background:#00e676; color:#080a0f; font-size:0.9rem; padding:12px; font-weight:800; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; gap:8px; border:none; cursor:pointer; width:100%;">
          ${getMaterialIcon('smartphone')} Withdraw with Mpesa
        </button>
      </div>

      <!-- DEDICATED TRANSACTIONS ROW LINK -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; margin-top:16px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" id="profile-transactions-row-btn">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="color:var(--accent-emerald); display:flex; align-items:center;">
            ${getMaterialIcon('history')}
          </div>
          <div>
            <h4 style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">My Transactions</h4>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">View all deposit, withdrawal and cashout logs</p>
          </div>
        </div>
        <div style="color:var(--text-muted); display:flex; align-items:center;">
          ${getMaterialIcon('back', 'icon-rotated-right')}
        </div>
      </div>

      <!-- PREFERENCES SECTION -->
      <div class="wallet-card" style="margin-top:20px; gap:16px;">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700;">Preferences</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Customise your experience</p>
        </div>

        <!-- Display settings -->
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; gap:16px;">
          <!-- Light Theme Switch -->
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h4 style="font-size:0.85rem; font-weight:700;">Display Settings</h4>
              <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Switch between light theme and dark theme</p>
            </div>
            <label class="switch-toggle-label">
              <input type="checkbox" id="theme-toggle-switch" ${document.body.classList.contains('light-theme') ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
          </div>
          <!-- Data Saver Switch -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:12px;">
            <div>
              <h4 style="font-size:0.85rem; font-weight:700;">Data Saver</h4>
              <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Turn on to save data bundles</p>
            </div>
            <label class="switch-toggle-label">
              <input type="checkbox" id="data-saver-switch" />
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- OTHER INFO & PREFERENCES -->
      <div style="margin-top:24px; display:flex; flex-direction:column; gap:8px;">
        <div style="margin-bottom:8px;">
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">Other Info & Preferences</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Information that is critical in managing your account</p>
        </div>

        <!-- Sleek info rows -->
        <div class="profile-info-row" id="profile-livechat-btn">
          <div class="profile-info-icon-wrapper chat">
            ${getMaterialIcon('chat')}
          </div>
          <div class="profile-info-text">
            <span class="profile-info-title">Live Chat Support</span>
            <span class="profile-info-desc">Chat with helpdesk agents (24/7 online)</span>
          </div>
          <span style="display:flex; align-items:center;" class="arrow-icon">
            ${getMaterialIcon('back', 'icon-rotated-right')}
          </span>
        </div>

        <div class="profile-info-row" id="profile-rg-btn">
          <div class="profile-info-icon-wrapper safety">
            ${getMaterialIcon('shield')}
          </div>
          <div class="profile-info-text">
            <span class="profile-info-title">Responsible Gaming</span>
            <span class="profile-info-desc">Set daily deposit limits or request timeouts</span>
          </div>
          <span style="display:flex; align-items:center;" class="arrow-icon">
            ${getMaterialIcon('back', 'icon-rotated-right')}
          </span>
        </div>

        <div class="profile-info-row" id="profile-del-btn">
          <div class="profile-info-icon-wrapper delete">
            ${getMaterialIcon('trash')}
          </div>
          <div class="profile-info-text">
            <span class="profile-info-title" style="color:var(--accent-live);">Delete Account</span>
            <span class="profile-info-desc">Request permanent closure under BCLB rules</span>
          </div>
          <span style="display:flex; align-items:center;" class="arrow-icon">
            ${getMaterialIcon('back', 'icon-rotated-right')}
          </span>
        </div>

        <!-- Logout Button -->
        <button id="profile-signout-btn" style="background:none; border:none; color:var(--accent-live); font-weight:800; font-family:var(--font-display); cursor:pointer; text-align:left; padding:12px 4px; font-size:0.95rem; display:flex; align-items:center; gap:8px; align-self:flex-start; margin-top:8px; outline:none;">
          ${getMaterialIcon('logout')} Logout
        </button>
      </div>

      <!-- Custom Transaction Processing Modal Overlay -->
      <div id="tx-processing-modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(8,10,15,0.85); backdrop-filter:blur(6px); align-items:center; justify-content:center; z-index:9999; padding: 20px;">
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div id="tx-modal-icon" style="display:flex; align-items:center; justify-content:center; width:80px; height:80px;">
            <svg width="50" height="50" viewBox="0 0 50 50" style="animation: spin-loop 1s linear infinite;">
              <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent-emerald)" stroke-width="5" stroke-dasharray="80 100" stroke-linecap="round"></circle>
            </svg>
          </div>
          <div>
            <h3 id="tx-modal-heading" style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Processing</h3>
            <p id="tx-modal-message" style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;"></p>
          </div>
          <button id="tx-modal-close" class="place-bet-btn" style="width:100%; display:none; margin-top:10px;">Close</button>
        </div>
      </div>

      <!-- CSS styling rules for spin animations -->
      <style>
        @keyframes spin-loop {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    const depValInput = document.getElementById('dep-val-input');
    const withValInput = document.getElementById('with-val-input');

    // Adjuster buttons for deposit amount
    document.getElementById('dep-decrement-btn')?.addEventListener('click', () => {
      let amt = parseInt(depValInput.value) || 0;
      if (amt > 100) {
        depositAmount = amt - 100;
        depValInput.value = depositAmount;
      }
    });

    document.getElementById('dep-increment-btn')?.addEventListener('click', () => {
      let amt = parseInt(depValInput.value) || 0;
      depositAmount = amt + 100;
      depValInput.value = depositAmount;
    });

    depValInput?.addEventListener('input', (e) => {
      depositAmount = parseInt(e.target.value) || 0;
    });

    // Quick deposit buttons
    container.querySelectorAll('.profile-dep-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const added = parseInt(btn.getAttribute('data-val'));
        let amt = parseInt(depValInput.value) || 0;
        depositAmount = amt + added;
        depValInput.value = depositAmount;
      });
    });

    // Adjuster buttons for withdrawals
    document.getElementById('with-decrement-btn')?.addEventListener('click', () => {
      let amt = parseInt(withValInput.value) || 0;
      if (amt > 100) {
        withdrawAmount = amt - 100;
        withValInput.value = withdrawAmount;
      }
    });

    document.getElementById('with-increment-btn')?.addEventListener('click', () => {
      let amt = parseInt(withValInput.value) || 0;
      withdrawAmount = amt + 100;
      withValInput.value = withdrawAmount;
    });

    withValInput?.addEventListener('input', (e) => {
      withdrawAmount = parseInt(e.target.value) || 0;
    });

    // Custom Modal Transaction Trigger Routine
    const modal = document.getElementById('tx-processing-modal');
    const modalIcon = document.getElementById('tx-modal-icon');
    const modalHeading = document.getElementById('tx-modal-heading');
    const modalMsg = document.getElementById('tx-modal-message');
    const modalCloseBtn = document.getElementById('tx-modal-close');

    const triggerTransactionFlow = (type, amount) => {
      if (type === 'withdraw' && amount > user.balance) {
        alert("Insufficient balance for requested withdrawal.");
        return;
      }
      if (amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      modalCloseBtn.style.display = 'none';
      modalIcon.innerHTML = `
        <svg width="50" height="50" viewBox="0 0 50 50" style="animation: spin-loop 1s linear infinite;">
          <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent-emerald)" stroke-width="5" stroke-dasharray="80 100" stroke-linecap="round"></circle>
        </svg>
      `;
      modalHeading.textContent = type === 'deposit' ? 'Processing Deposit' : 'Processing Withdrawal';
      modalMsg.textContent = type === 'deposit' 
        ? `Sending KES ${amount} STK Push... Please check your handset and enter your M-Pesa PIN prompt.` 
        : `Initiating KES ${amount} withdrawal to Safaricom M-Pesa... Please wait while we authorize the transaction.`;
      
      modal.style.display = 'flex';

      setTimeout(() => {
        let success = false;
        let referenceCode = '';

        if (type === 'deposit') {
          success = state.deposit(amount, 'M-Pesa Mobile');
          referenceCode = `MP-${Math.floor(Math.random() * 900000 + 100000)}`;
          modalHeading.textContent = 'Deposit Successful!';
          modalMsg.textContent = `KES ${amount} has been successfully credited to your BetPulse wallet. Ref: ${referenceCode}.`;
        } else {
          success = state.withdraw(amount, 'M-Pesa Mobile');
          referenceCode = `WT-${Math.floor(Math.random() * 900000 + 100000)}`;
          modalHeading.textContent = 'Withdrawal Approved!';
          modalMsg.textContent = `KES ${amount} has been sent to your M-Pesa account. Funds will reflect shortly. Ref: ${referenceCode}.`;
        }

        if (success) {
          modalIcon.innerHTML = `
            <span class="material-icons-round" style="font-size: 5rem; color: var(--accent-emerald);">check_circle</span>
          `;
          modalCloseBtn.style.display = 'block';
        }
      }, 2000);
    };

    // Bind M-Pesa Buttons
    document.getElementById('profile-dep-mpesa-btn')?.addEventListener('click', () => {
      const amt = parseInt(depValInput.value) || 0;
      triggerTransactionFlow('deposit', amt);
    });

    document.getElementById('profile-with-mpesa-btn')?.addEventListener('click', () => {
      const amt = parseInt(withValInput.value) || 0;
      triggerTransactionFlow('withdraw', amt);
    });

    modalCloseBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
      renderProfileView(); // Refresh page data
    });

    // Dedicated Transaction Page redirection
    document.getElementById('profile-transactions-row-btn')?.addEventListener('click', () => {
      state.setPage('transactions');
    });

    // View shortcuts
    document.getElementById('profile-view-promos-btn')?.addEventListener('click', () => state.setPage('promotions'));
    document.getElementById('profile-view-jackpots-btn')?.addEventListener('click', () => {
      state.setPage('jackpot-streak');
    });

    // Preferences switches
    const themeSwitch = document.getElementById('theme-toggle-switch');
    themeSwitch?.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    });

    const dsSwitch = document.getElementById('data-saver-switch');
    dsSwitch?.addEventListener('change', (e) => {
      alert(`Data Saver Mode: ${e.target.checked ? 'Enabled. Images compressed.' : 'Disabled.'}`);
    });

    // Other Info List Rows triggers
    document.getElementById('profile-livechat-btn')?.addEventListener('click', () => {
      state.setPage('live-support');
    });

    document.getElementById('profile-rg-btn')?.addEventListener('click', () => {
      state.setPage('responsible-gaming');
    });

    document.getElementById('profile-del-btn')?.addEventListener('click', () => {
      window.showConfirm("Warning: Are you sure you wish to delete your account? This action is permanent.", () => {
        alert("Under GCC compliance guidelines, account deletion requires 7 days cool-down period. Request logged.");
      });
    });

    document.getElementById('profile-signout-btn')?.addEventListener('click', () => {
      alert("Logging out... Session ended.");
      state.logoutUser();
    });
  };

  drawProfile();
}
export default renderProfileView;
