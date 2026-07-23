import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export async function renderProfileView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const user = state.data.user;

  let minDeposit = 200;
  let maxDeposit = 500000;
  let minWithdrawal = 200;
  let maxWithdrawal = 100000;
  let mpesaPartyB = '254700000000';

  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        minDeposit = data.settings.minDeposit || 200;
        maxDeposit = data.settings.maxDeposit || 500000;
        minWithdrawal = data.settings.minWithdrawal || 200;
        maxWithdrawal = data.settings.maxWithdrawal || 100000;
        mpesaPartyB = data.settings.mpesaPartyB || '254700000000';
      }
    }
  } catch (e) {
    console.warn("Failed to load settings:", e);
  }

  let depositAmount = minDeposit;
  let withdrawAmount = minWithdrawal;

  const drawProfile = () => {
    container.innerHTML = `
      <!-- Player Profile Header Card -->
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); padding: 24px; border-radius: var(--radius-xl); border: 1px solid var(--border-color); box-shadow: var(--shadow-card);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="user-avatar" style="width: 58px; height: 58px; font-size: 1.4rem;">
            ${user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LP'}
            <div class="verified-tick" style="width: 18px; height: 18px; font-size: 10px;">✓</div>
          </div>
          <div>
            <h2 style="font-size: 1.3rem; font-family: var(--font-heading); font-weight: 800; color: var(--text-primary);">+${user?.phone || '254700000000'}</h2>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${user?.name || 'Verified Player'}</p>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Wallet Balance</span>
          <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.4rem; color: var(--color-primary); margin-top: 2px;">
            ${formatCurrency(user?.balance || 0)}
          </div>
        </div>
      </div>

      <!-- Financial Cashier Grid (Deposit & Withdraw Cards) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 20px;">
        
        <!-- DEPOSIT CASHIER CARD -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-lg); background: var(--color-primary-light); color: var(--color-primary-dark); display: flex; align-items: center; justify-content: center;">
                ${getMaterialIcon('account_balance_wallet')}
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">Deposit Funds</h3>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 1px;">Instant top-up via Safaricom M-Pesa STK</p>
              </div>
            </div>
          </div>

          <!-- Adjustable Input Group -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Deposit Amount</span>
            <div style="display: flex; align-items: center; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; height: 50px; padding: 0 16px;">
              <button id="dep-decrement-btn" style="background: none; border: none; font-size: 1.4rem; font-weight: 800; color: var(--text-secondary); cursor: pointer; outline: none;">-</button>
              <div style="display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center;">
                <span style="font-size: 0.9rem; color: var(--text-secondary); font-family: var(--font-mono); font-weight: 800;">KES</span>
                <input type="number" id="dep-val-input" value="${depositAmount}" style="background: none; border: none; color: var(--text-primary); font-family: var(--font-mono); font-weight: 800; font-size: 1.2rem; width: 120px; text-align: center; outline: none;" min="${minDeposit}" />
              </div>
              <button id="dep-increment-btn" style="background: none; border: none; font-size: 1.4rem; font-weight: 800; color: var(--text-secondary); cursor: pointer; outline: none;">+</button>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-muted);">Min: <b>KES ${minDeposit.toLocaleString()}</b> • Max: <b>KES ${maxDeposit.toLocaleString()}</b></p>
          </div>

          <!-- Quick Amount Chips -->
          <div class="quick-stakes-grid" style="grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <button class="quick-stake-btn profile-dep-quick" data-val="100" style="padding: 9px; font-weight: 700;">+100</button>
            <button class="quick-stake-btn profile-dep-quick" data-val="250" style="padding: 9px; font-weight: 700;">+250</button>
            <button class="quick-stake-btn profile-dep-quick" data-val="500" style="padding: 9px; font-weight: 700;">+500</button>
            <button class="quick-stake-btn profile-dep-quick" data-val="1000" style="padding: 9px; font-weight: 700;">+1000</button>
          </div>

          <!-- Encryption Notice -->
          <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            ${getMaterialIcon('lock')}
            <span>256-bit Encrypted M-Pesa Payment Gateway</span>
          </div>

          <!-- Submit Action Button -->
          <button class="btn-deposit" id="profile-dep-mpesa-btn" style="width: 100%; height: 46px; justify-content: center; font-size: 0.95rem;">
            ${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push
          </button>
        </div>

        <!-- WITHDRAWAL CASHIER CARD -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 18px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-lg); background: rgba(245, 158, 11, 0.1); color: var(--color-warning); display: flex; align-items: center; justify-content: center;">
                ${getMaterialIcon('payments')}
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">Withdraw Earnings</h3>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 1px;">Instant payout transfer to your mobile line</p>
              </div>
            </div>
          </div>

          <!-- Adjustable Input Group -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Withdrawal Amount</span>
            <div style="display: flex; align-items: center; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; height: 50px; padding: 0 16px;">
              <button id="with-decrement-btn" style="background: none; border: none; font-size: 1.4rem; font-weight: 800; color: var(--text-secondary); cursor: pointer; outline: none;">-</button>
              <div style="display: flex; align-items: center; gap: 6px; flex: 1; justify-content: center;">
                <span style="font-size: 0.9rem; color: var(--text-secondary); font-family: var(--font-mono); font-weight: 800;">KES</span>
                <input type="number" id="with-val-input" value="${withdrawAmount}" style="background: none; border: none; color: var(--text-primary); font-family: var(--font-mono); font-weight: 800; font-size: 1.2rem; width: 120px; text-align: center; outline: none;" min="${minWithdrawal}" />
              </div>
              <button id="with-increment-btn" style="background: none; border: none; font-size: 1.4rem; font-weight: 800; color: var(--text-secondary); cursor: pointer; outline: none;">+</button>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-muted);">Min: <b>KES ${minWithdrawal.toLocaleString()}</b> • Max: <b>KES ${maxWithdrawal.toLocaleString()}</b> • 5% Tax</p>
          </div>

          <!-- Security Notice -->
          <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            ${getMaterialIcon('verified')}
            <span>Direct B2C Mobile Settlement Engine</span>
          </div>

          <!-- Submit Action Button -->
          <button class="btn-deposit" id="profile-with-mpesa-btn" style="width: 100%; height: 46px; justify-content: center; font-size: 0.95rem; background: var(--text-primary);">
            ${getMaterialIcon('smartphone')} Withdraw to M-Pesa
          </button>
        </div>

      </div>

      <!-- Transactions Shortcut Row -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 24px; margin-top: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-card);" id="profile-transactions-row-btn">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="color: var(--color-primary); display: flex; align-items: center;">
            ${getMaterialIcon('history')}
          </div>
          <div>
            <h4 style="font-size: 0.92rem; font-weight: 800; color: var(--text-primary);">Transaction History</h4>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 1px;">View all deposit, withdrawal, and cashout logs</p>
          </div>
        </div>
        <div style="color: var(--text-muted); font-size: 20px;">&rarr;</div>
      </div>
    `;

    const depValInput = document.getElementById('dep-val-input');
    const withValInput = document.getElementById('with-val-input');

    // Deposit adjusters
    document.getElementById('dep-decrement-btn')?.addEventListener('click', () => {
      let amt = parseInt(depValInput.value) || 0;
      if (amt > 100) { depositAmount = amt - 100; depValInput.value = depositAmount; }
    });

    document.getElementById('dep-increment-btn')?.addEventListener('click', () => {
      let amt = parseInt(depValInput.value) || 0;
      depositAmount = amt + 100;
      depValInput.value = depositAmount;
    });

    depValInput?.addEventListener('input', (e) => { depositAmount = parseInt(e.target.value) || 0; });

    container.querySelectorAll('.profile-dep-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const added = parseInt(btn.getAttribute('data-val'));
        let amt = parseInt(depValInput.value) || 0;
        depositAmount = amt + added;
        depValInput.value = depositAmount;
      });
    });

    // Withdrawal adjusters
    document.getElementById('with-decrement-btn')?.addEventListener('click', () => {
      let amt = parseInt(withValInput.value) || 0;
      if (amt > 100) { withdrawAmount = amt - 100; withValInput.value = withdrawAmount; }
    });

    document.getElementById('with-increment-btn')?.addEventListener('click', () => {
      let amt = parseInt(withValInput.value) || 0;
      withdrawAmount = amt + 100;
      withValInput.value = withdrawAmount;
    });

    withValInput?.addEventListener('input', (e) => { withdrawAmount = parseInt(e.target.value) || 0; });

    // Payment triggers
    document.getElementById('profile-dep-mpesa-btn')?.addEventListener('click', () => {
      const amt = parseInt(depValInput.value) || 0;
      alert(`M-Pesa STK Push triggered for KES ${amt}.\nCheck your mobile phone to enter your M-Pesa PIN.`);
      state.deposit(amt, 'M-Pesa Mobile');
      renderProfileView();
    });

    document.getElementById('profile-with-mpesa-btn')?.addEventListener('click', async () => {
      const amt = parseInt(withValInput.value) || 0;
      try {
        await state.withdraw(amt, user?.phone);
        alert(`Withdrawal Approved! KES ${amt} has been sent to your M-Pesa line.`);
        renderProfileView();
      } catch (err) {
        alert("Withdrawal Error: " + err.message);
      }
    });

    document.getElementById('profile-transactions-row-btn')?.addEventListener('click', () => {
      state.setPage('transactions');
    });
  };

  drawProfile();
}

export default renderProfileView;
