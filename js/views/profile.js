import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderProfileView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const user = state.data.user;

  // Track deposit and withdrawal values locally in view state
  let depositAmount = 200;
  let withdrawAmount = 200;

  const drawProfile = () => {
    container.innerHTML = `
      <!-- Phone Header -->
      <div style="display:flex; align-items:center; gap:16px; background:var(--bg-surface); padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <div style="background:var(--accent-emerald-glow); color:var(--accent-emerald); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
          ${getMaterialIcon('user', 'large-profile-icon')}
        </div>
        <div>
          <h2 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700;">+${user?.phone || '254700000000'}</h2>
          <p style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-top:2px;">${user?.name || 'BetPulse Verified Player'}</p>
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

    const renderDepositState1 = (amount) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px;">
            <svg width="50" height="50" viewBox="0 0 50 50" style="animation: spin-loop 1s linear infinite;">
              <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent-emerald)" stroke-width="5" stroke-dasharray="80 100" stroke-linecap="round"></circle>
            </svg>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Requesting STK Push</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">Sending secure payment prompt to your Kenyan mobile phone...</p>
          </div>
        </div>
      `;
    };

    const renderDepositState2 = (amount) => {
      modal.innerHTML = `
        <!-- Custom Simulated Mobile SIM ToolKit Dialog Box -->
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:14px; width:310px; padding:20px; color:#111827; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow:0 20px 25px -5px rgba(0,0,0,0.3); text-align:left; animation: scale-up 0.2s ease-out;">
          <h4 style="font-size:0.85rem; font-weight:800; color:#4ade80; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 8px 0; display:flex; align-items:center; gap:6px;">
            <span style="display:inline-block; width:8px; height:8px; background:#4ade80; border-radius:50%;"></span> M-PESA
          </h4>
          <p style="font-size:0.9rem; line-height:1.4; color:#374151; margin:0 0 12px 0;">
            Do you want to pay <strong>KES ${amount}</strong> to <strong>BETPULSE LTD</strong>?<br/>
            Enter 4-Digit M-Pesa PIN:
          </p>
          
          <input type="password" id="stk-pin-input" maxlength="4" placeholder="••••" style="background:#f3f4f6; color:#111827; border:1px solid #d1d5db; border-radius:6px; font-size:1.4rem; letter-spacing:10px; text-align:center; height:44px; width:100%; display:block; margin: 12px 0; outline:none; font-family:monospace; box-sizing:border-box;" autofocus />
          <div id="stk-error-hint" style="color:#ef4444; font-size:0.75rem; font-weight:700; margin-bottom:8px; display:none;">PIN must be 4 digits</div>

          <div style="display:flex; border-top:1px solid #e5e7eb; margin-top:16px; padding-top:12px; gap:16px;">
            <button id="stk-cancel-btn" style="background:none; border:none; color:#2563eb; font-weight:800; cursor:pointer; font-size:0.95rem; flex:1; text-align:center; outline:none; padding:8px 0;">Cancel</button>
            <button id="stk-send-btn" style="background:none; border:none; color:#2563eb; font-weight:800; cursor:pointer; font-size:0.95rem; flex:1; text-align:center; outline:none; padding:8px 0;">Send</button>
          </div>
        </div>
      `;

      const pinInput = document.getElementById('stk-pin-input');
      const errHint = document.getElementById('stk-error-hint');

      // Focus PIN prompt input
      pinInput.focus();

      document.getElementById('stk-cancel-btn').addEventListener('click', () => {
        renderDepositFailure("Transaction cancelled by user (Incorrect PIN / Request timeout).");
      });

      document.getElementById('stk-send-btn').addEventListener('click', () => {
        const val = pinInput.value;
        if (val.length !== 4 || isNaN(val)) {
          errHint.style.display = 'block';
          pinInput.value = '';
          pinInput.focus();
          return;
        }

        renderDepositState3(amount);

        setTimeout(() => {
          const success = state.deposit(amount, 'M-Pesa Mobile');
          const referenceCode = `MP-${Math.floor(Math.random() * 900000 + 100000)}`;
          if (success) {
            renderDepositSuccess(amount, referenceCode);
          } else {
            renderDepositFailure("API Callback timeout. Please try again.");
          }
        }, 2000);
      });
    };

    const renderDepositState3 = (amount) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px;">
            <svg width="50" height="50" viewBox="0 0 50 50" style="animation: spin-loop 1s linear infinite;">
              <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent-emerald)" stroke-width="5" stroke-dasharray="80 100" stroke-linecap="round"></circle>
            </svg>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Verifying PIN</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">Validating M-Pesa transaction with Safaricom callback status...</p>
          </div>
        </div>
      `;
    };

    const renderDepositSuccess = (amount, ref) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px; color:var(--accent-emerald);">
            <span class="material-icons-round" style="font-size:5rem;">check_circle</span>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Deposit Confirmed!</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">KES ${amount} has been successfully credited to your BetPulse wallet. Ref: ${ref}.</p>
          </div>
        </div>
      `;

      // Automatically close modal and reload profile balance on confirmation success
      setTimeout(() => {
        modal.style.display = 'none';
        renderProfileView();
      }, 2000);
    };

    const renderDepositFailure = (reason) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px; color:var(--accent-live);">
            <span class="material-icons-round" style="font-size:5rem;">cancel</span>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Deposit Failed</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">${reason}</p>
          </div>
          <button id="tx-failure-close-btn" class="place-bet-btn" style="width:100%; margin-top:10px;">Close</button>
        </div>
      `;

      document.getElementById('tx-failure-close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        renderProfileView();
      });
    };

    const renderWithdrawalState1 = (amount) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px;">
            <svg width="50" height="50" viewBox="0 0 50 50" style="animation: spin-loop 1s linear infinite;">
              <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent-emerald)" stroke-width="5" stroke-dasharray="80 100" stroke-linecap="round"></circle>
            </svg>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Processing Withdrawal</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">Initiating withdrawal to Safaricom M-Pesa... Please wait while we authorize the transaction.</p>
          </div>
        </div>
      `;
    };

    const renderWithdrawalSuccess = (amount, ref) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px; color:var(--accent-emerald);">
            <span class="material-icons-round" style="font-size:5rem;">check_circle</span>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Withdrawal Approved!</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">KES ${amount} has been successfully sent to your M-Pesa. Reference: ${ref}.</p>
          </div>
          <button id="with-success-close-btn" class="place-bet-btn" style="width:100%; margin-top:10px;">Close</button>
        </div>
      `;

      document.getElementById('with-success-close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        renderProfileView();
      });
    };

    const renderWithdrawalFailure = (reason) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg);">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px; color:var(--accent-live);">
            <span class="material-icons-round" style="font-size:5rem;">cancel</span>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Withdrawal Failed</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">${reason}</p>
          </div>
          <button id="with-failure-close-btn" class="place-bet-btn" style="width:100%; margin-top:10px;">Close</button>
        </div>
      `;

      document.getElementById('with-failure-close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        renderProfileView();
      });
    };

    const renderDepositStatePolling = (amount, checkoutId) => {
      modal.innerHTML = `
        <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:400px; width:100%; padding:30px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:20px; box-shadow:var(--shadow-lg); animation: scale-up 0.25s ease-out;">
          <div style="display:flex; align-items:center; justify-content:center; width:80px; height:80px;">
            <svg width="50" height="50" viewBox="0 0 50 50" style="animation: spin-loop 1s linear infinite;">
              <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent-emerald)" stroke-width="5" stroke-dasharray="80 100" stroke-linecap="round"></circle>
            </svg>
          </div>
          <div>
            <h3 style="font-size:1.3rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">Awaiting Authorization</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-top:8px;">STK Push sent successfully! Please check your handset, enter your M-Pesa PIN, and authorize the payment.</p>
          </div>
          <button id="tx-cancel-polling-btn" class="place-bet-btn" style="width:100%; margin-top:10px; background:none; border:1px solid var(--border-color); color:var(--text-secondary);">Cancel Waiting</button>
        </div>
      `;

      let isPolling = true;

      document.getElementById('tx-cancel-polling-btn').addEventListener('click', () => {
        isPolling = false;
        renderDepositFailure("Transaction aborted by user.");
      });

      const pollStatus = () => {
        if (!isPolling) return;

        fetch(`/api/status/${checkoutId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            isPolling = false;
            // Synchronize local frontend memory balance
            state.deposit(amount, 'M-Pesa Mobile');
            renderDepositSuccess(amount, data.receipt);
          } else if (data.status === 'failed') {
            isPolling = false;
            renderDepositFailure(data.reason || "M-Pesa transaction rejected.");
          } else {
            setTimeout(pollStatus, 2000);
          }
        })
        .catch(err => {
          console.error("Polling error:", err);
          setTimeout(pollStatus, 2000);
        });
      };

      // Initial check delay
      setTimeout(pollStatus, 2000);
    };

    const triggerTransactionFlow = async (type, amount) => {
      if (type === 'deposit') {
        if (amount < 200) {
          alert("Minimum deposit amount is KES 200.");
          return;
        }
      } else {
        if (amount < 200) {
          alert("Minimum withdrawal amount is KES 200.");
          return;
        }
        if (amount > (user?.balance || 0)) {
          alert(`Insufficient balance for withdrawal. Available: KES ${(user?.balance || 0).toFixed(2)}`);
          return;
        }
      }

      modal.style.display = 'flex';

      if (type === 'deposit') {
        renderDepositState1(amount);

        fetch('/api/stkpush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: user?.phone || '',
            amount: amount,
            userId: user?.id
          })
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Server error'); });
          }
          return response.json();
        })
        .then(data => {
          if (data.simulated) {
            renderDepositState2(amount);
          } else {
            renderDepositStatePolling(amount, data.CheckoutRequestID);
          }
        })
        .catch(err => {
          renderDepositFailure(err.message || "Failed to trigger M-Pesa STK Push.");
        });
      } else {
        renderWithdrawalState1(amount);
        try {
          const res = await state.withdraw(amount, user?.phone);
          renderWithdrawalSuccess(amount, res.reference || `WD-${Math.floor(Math.random()*900000+100000)}`);
        } catch (err) {
          renderWithdrawalFailure(err.message || "Withdrawal failed.");
        }
      }
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
