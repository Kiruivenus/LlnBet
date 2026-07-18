import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderProfileView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const user = state.data.user;
  const transactions = state.data.transactions;

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

      <!-- DEPOSIT BOX (Betika style) -->
      <div class="wallet-card" style="margin-top:16px; gap: 12px;">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">Deposit</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Send money into your BetPulse account</p>
        </div>

        <!-- Adjuster Input -->
        <div style="display:flex; align-items:center; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; justify-content:space-between; height:48px;">
          <button class="sidebar-item-content" id="dep-decrement-btn" style="background:none; border:none; width:48px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700;">-</button>
          <div style="display:flex; align-items:center; gap:4px; font-family:var(--font-mono); font-weight:800; font-size:1.15rem; color:var(--text-primary);">
            <span style="font-size:0.85rem; color:var(--text-secondary);">KES</span>
            <span id="dep-val-display">${depositAmount}</span>
          </div>
          <button class="sidebar-item-content" id="dep-increment-btn" style="background:none; border:none; width:48px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700;">+</button>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:-4px;">Minimum KES 10. All transactions are subject to 5% tax.</p>

        <!-- Quick Amount Selectors -->
        <div class="quick-stakes-grid" style="grid-template-columns: repeat(4, 1fr);">
          <button class="quick-stake-btn profile-dep-quick" data-val="100">+100</button>
          <button class="quick-stake-btn profile-dep-quick" data-val="200">+200</button>
          <button class="quick-stake-btn profile-dep-quick" data-val="500">+500</button>
          <button class="quick-stake-btn profile-dep-quick" data-val="1000">+1000</button>
        </div>

        <!-- Deposit Action Buttons -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button class="wallet-submit-btn" id="profile-dep-cashia-btn" style="background:#e91e63; color:#fff; font-size:0.85rem; padding:10px 4px;">
            ${getMaterialIcon('deposit')} Deposit Cashia
          </button>
          <button class="wallet-submit-btn" id="profile-dep-mpesa-btn" style="background:#00e676; color:#080a0f; font-size:0.85rem; padding:10px 4px;">
            ${getMaterialIcon('smartphone')} Deposit Mpesa
          </button>
        </div>
      </div>

      <!-- WITHDRAWAL BOX (Betika style) -->
      <div class="wallet-card" style="margin-top:16px; gap: 12px;">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">Withdrawal</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Withdraw money from your BetPulse wallet</p>
        </div>

        <!-- Adjuster Input -->
        <div style="display:flex; align-items:center; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; justify-content:space-between; height:48px;">
          <button class="sidebar-item-content" id="with-decrement-btn" style="background:none; border:none; width:48px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700;">-</button>
          <div style="display:flex; align-items:center; gap:4px; font-family:var(--font-mono); font-weight:800; font-size:1.15rem; color:var(--text-primary);">
            <span style="font-size:0.85rem; color:var(--text-secondary);">KES</span>
            <span id="with-val-display">${withdrawAmount}</span>
          </div>
          <button class="sidebar-item-content" id="with-increment-btn" style="background:none; border:none; width:48px; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer; font-size:1.5rem; font-weight:700;">+</button>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:-4px;">Minimum KES 50, Maximum KES 300,000. All transactions are subject to 5% tax.</p>

        <!-- Withdraw Action Buttons -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button class="wallet-submit-btn" id="profile-with-cashia-btn" style="background:#e91e63; color:#fff; font-size:0.85rem; padding:10px 4px;">
            ${getMaterialIcon('withdraw')} Withdraw Cashia
          </button>
          <button class="wallet-submit-btn" id="profile-with-mpesa-btn" style="background:#00e676; color:#080a0f; font-size:0.85rem; padding:10px 4px;">
            ${getMaterialIcon('smartphone')} Withdraw Mpesa
          </button>
        </div>
      </div>

      <!-- MY TRANSACTIONS LINK -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; margin-top:16px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" id="profile-transactions-row-btn">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="color:var(--accent-emerald); display:flex; align-items:center;">
            ${getMaterialIcon('history')}
          </div>
          <div>
            <h4 style="font-size:0.9rem; font-weight:700;">My Transactions</h4>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">View all your debits and credits logs</p>
          </div>
        </div>
        <div style="color:var(--text-muted); display:flex; align-items:center;">
          ${getMaterialIcon('back', 'icon-rotated-right')}
        </div>
      </div>

      <!-- Dynamic transactions dropdown overlay box -->
      <div id="profile-transactions-list-box" style="display:none; margin-top:8px; display:flex; flex-direction:column; gap:8px; border-left:2px solid var(--border-color-light); padding-left:12px; margin-left:16px;">
        ${transactions.map(txn => `
          <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
            <div>
              <div style="font-weight:700;">${txn.type} (${txn.method})</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${txn.date}</div>
            </div>
            <strong style="font-family:var(--font-mono); color:${txn.type.includes('dep') || txn.type.includes('Dep') ? 'var(--accent-emerald)' : 'var(--accent-orange)'};">
              ${txn.type.includes('dep') || txn.type.includes('Dep') ? '+' : '-'}${formatCurrency(txn.amount)}
            </strong>
          </div>
        `).join('')}
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
            <div style="display:flex; align-items:center; gap:8px;">
              ${getMaterialIcon('settings')}
              <input type="checkbox" id="theme-toggle-switch" style="width:40px; height:20px; accent-color:var(--accent-emerald); cursor:pointer;" ${document.body.classList.contains('light-theme') ? 'checked' : ''} />
            </div>
          </div>
          <!-- Data Saver Switch -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:12px;">
            <div>
              <h4 style="font-size:0.85rem; font-weight:700;">Data Saver</h4>
              <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Turn on to save data bundles</p>
            </div>
            <input type="checkbox" id="data-saver-switch" style="width:40px; height:20px; accent-color:var(--accent-emerald); cursor:pointer;" />
          </div>
        </div>
      </div>

      <!-- OTHER INFO & PREFERENCES -->
      <div class="wallet-card" style="margin-top:20px; gap:16px;">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700;">Other Info & Preferences</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Information that is critical in managing your account</p>
        </div>

        <div style="display:flex; flex-direction:column; background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden;">
          
          <div class="sidebar-item" style="border-bottom:1px solid var(--border-color);">
            <button id="profile-livechat-btn" style="padding:12px; display:flex; justify-content:space-between; align-items:center; width:100%; border:none; background:none; text-align:left; cursor:pointer;">
              <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                ${getMaterialIcon('chat')} Live Chat
              </span>
              ${getMaterialIcon('back', 'icon-rotated-right')}
            </button>
          </div>

          <div class="sidebar-item" style="border-bottom:1px solid var(--border-color);">
            <button id="profile-del-btn" style="padding:12px; display:flex; justify-content:space-between; align-items:center; width:100%; border:none; background:none; text-align:left; cursor:pointer;">
              <span style="font-size:0.85rem; font-weight:700; color:var(--accent-live); display:flex; align-items:center; gap:8px;">
                ${getMaterialIcon('trash')} Delete Account
              </span>
              ${getMaterialIcon('back', 'icon-rotated-right')}
            </button>
          </div>

          <div class="sidebar-item">
            <button id="profile-rg-btn" style="padding:12px; display:flex; justify-content:space-between; align-items:center; width:100%; border:none; background:none; text-align:left; cursor:pointer;">
              <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                ${getMaterialIcon('shield')} Responsible Gaming
              </span>
              ${getMaterialIcon('back', 'icon-rotated-right')}
            </button>
          </div>

        </div>

        <button id="profile-signout-btn" style="background:none; border:none; color:var(--accent-emerald); font-weight:700; font-family:var(--font-display); cursor:pointer; text-align:left; padding:8px 0; font-size:0.95rem; align-self:flex-start;">
          Sign Out
        </button>
      </div>
    `;

    // 1. Hook up adjuster buttons for deposit amount
    document.getElementById('dep-decrement-btn')?.addEventListener('click', () => {
      if (depositAmount > 50) {
        depositAmount -= 100;
        document.getElementById('dep-val-display').textContent = depositAmount;
      }
    });

    document.getElementById('dep-increment-btn')?.addEventListener('click', () => {
      depositAmount += 100;
      document.getElementById('dep-val-display').textContent = depositAmount;
    });

    // Quick deposit buttons
    container.querySelectorAll('.profile-dep-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const added = parseInt(btn.getAttribute('data-val'));
        depositAmount += added;
        document.getElementById('dep-val-display').textContent = depositAmount;
      });
    });

    // 2. Hook up adjuster buttons for withdrawals
    document.getElementById('with-decrement-btn')?.addEventListener('click', () => {
      if (withdrawAmount > 100) {
        withdrawAmount -= 100;
        document.getElementById('with-val-display').textContent = withdrawAmount;
      }
    });

    document.getElementById('with-increment-btn')?.addEventListener('click', () => {
      withdrawAmount += 100;
      document.getElementById('with-val-display').textContent = withdrawAmount;
    });

    // 3. Deposit Submissions handlers
    const processDeposit = (method) => {
      const parentBtnId = method === 'Mpesa' ? 'profile-dep-mpesa-btn' : 'profile-dep-cashia-btn';
      const submitBtn = document.getElementById(parentBtnId);
      const originalHtml = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `Sending STK...`;

      setTimeout(() => {
        const success = state.deposit(depositAmount, `${method} Mobile`);
        if (success) {
          alert(`M-Pesa STK Push Received!\n\nReference: MP-${Math.floor(Math.random() * 900000 + 100000)}\nAmount: KES ${depositAmount}\nStatus: Deposited Successfully.`);
          renderProfileView(); // Redraw
        }
      }, 1500);
    };

    document.getElementById('profile-dep-cashia-btn')?.addEventListener('click', () => processDeposit('Cashia'));
    document.getElementById('profile-dep-mpesa-btn')?.addEventListener('click', () => processDeposit('M-Pesa'));

    // 4. Withdrawal Submissions
    const processWithdrawal = (method) => {
      if (withdrawAmount > user.balance) {
        alert("Insufficient balance for requested withdrawal.");
        return;
      }

      const success = state.withdraw(withdrawAmount, `${method} Mobile`);
      if (success) {
        alert(`Withdrawal Approved!\n\nAmount: KES ${withdrawAmount}\nMethod: ${method}\nStatus: Processing Completed.`);
        renderProfileView(); // Redraw
      }
    };

    document.getElementById('profile-with-cashia-btn')?.addEventListener('click', () => processWithdrawal('Cashia'));
    document.getElementById('profile-with-mpesa-btn')?.addEventListener('click', () => processWithdrawal('M-Pesa'));

    // 5. Expandable Transactions List
    const txRowBtn = document.getElementById('profile-transactions-row-btn');
    const txListBox = document.getElementById('profile-transactions-list-box');
    txRowBtn?.addEventListener('click', () => {
      if (txListBox.style.display === 'none') {
        txListBox.style.display = 'flex';
      } else {
        txListBox.style.display = 'none';
      }
    });

    // 6. View shortcuts
    document.getElementById('profile-view-promos-btn')?.addEventListener('click', () => state.setPage('promotions'));
    document.getElementById('profile-view-jackpots-btn')?.addEventListener('click', () => {
      alert("Jackpot Streaks: Standings table loading... [No active jackpot tickets found.]");
    });

    // 7. Preferences switches (Light theme switch)
    const themeSwitch = document.getElementById('theme-toggle-switch');
    themeSwitch?.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    });

    document.getElementById('data-saver-switch')?.addEventListener('change', (e) => {
      alert(`Data Saver Mode: ${e.target.checked ? 'Enabled. Images compressed.' : 'Disabled.'}`);
    });

    // 8. Other Preferences Links
    document.getElementById('profile-livechat-btn')?.addEventListener('click', () => {
      alert("Support: Hello! Welcome to BetPulse Live Chat assistance. How can we help?");
    });

    document.getElementById('profile-del-btn')?.addEventListener('click', () => {
      if (confirm("Warning: Are you sure you wish to delete your account? This action is permanent.")) {
        alert("Under GCC compliance guidelines, account deletion requires 7 days cool-down period. Request logged.");
      }
    });

    document.getElementById('profile-rg-btn')?.addEventListener('click', () => {
      alert("Responsible Gaming: Adjust Daily Limits or Request Session Timeouts. Call 1-800-GAMBLER for help.");
    });

    document.getElementById('profile-signout-btn')?.addEventListener('click', () => {
      alert("Signing out. Resetting session data...");
      state.data.user.balance = 150000.00; // Reset balance
      state.clearBetslip();
      state.setPage('home');
    });
  };

  drawProfile();
}
export default renderProfileView;
