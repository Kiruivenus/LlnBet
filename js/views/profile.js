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
      <!-- Player Profile Phone Number Header Card -->
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); padding: 20px 24px; border-radius: var(--radius-xl); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="user-avatar" style="width: 54px; height: 54px; font-size: 1.3rem;">
            ${user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LP'}
            <div class="verified-tick" style="width: 18px; height: 18px; font-size: 10px;">✓</div>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-family: var(--font-heading); font-weight: 800; color: var(--text-primary);">+${user?.phone || '254700000000'}</h2>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${user?.name || 'Verified Player'} • Account Verified</p>
          </div>
        </div>
      </div>

      <!-- Dedicated Wallet Balance & Bonus Card (Just below phone number card) -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px 24px; box-shadow: var(--shadow-card); margin-bottom: 20px; display: flex; flex-direction: column; gap: 16px;">
        
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: rgba(56, 102, 42, 0.12); color: #38662A; display: flex; align-items: center; justify-content: center;">
              ${getMaterialIcon('account_balance_wallet')}
            </div>
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary);">Wallet & Bonus Overview</h3>
              <p style="font-size: 0.75rem; color: var(--text-secondary);">Real cash balance and promotional bonus credits</p>
            </div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Currency: KES</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          
          <!-- Real Cash Balance Card -->
          <div style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Real Cash Balance</span>
              <span class="material-icons-round" style="font-size: 18px; color: var(--color-primary);">payments</span>
            </div>
            <div style="font-family: var(--font-mono); font-weight: 900; font-size: 1.5rem; color: var(--color-primary);">
              ${formatCurrency(user?.balance || 0)}
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Withdrawable & playable funds</span>
          </div>

          <!-- Bonus Credit Card -->
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.4); border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #D97706; text-transform: uppercase;">Bonus Credit</span>
              <span class="material-icons-round" style="font-size: 18px; color: #D97706;">card_giftcard</span>
            </div>
            <div style="font-family: var(--font-mono); font-weight: 900; font-size: 1.5rem; color: #D97706;">
              ${formatCurrency(user?.bonusBalance !== undefined ? user.bonusBalance : 500)}
            </div>
            <span style="font-size: 0.72rem; color: #D97706;">100% Welcome match bonus</span>
          </div>

        </div>

      </div>

      <!-- Financial Cashier Grid (Deposit & Withdraw Cards) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        
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

          <!-- Interactive M-Pesa Payment Live Status Container -->
          <div id="profile-dep-status-container" style="display: none; margin-top: 10px;"></div>
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
    const depBtn = document.getElementById('profile-dep-mpesa-btn');
    const depStatusContainer = document.getElementById('profile-dep-status-container');

    depBtn?.addEventListener('click', async () => {
      const amt = parseInt(depValInput.value) || 0;
      if (!amt || amt < minDeposit) {
        alert(`Minimum deposit amount is KES ${minDeposit.toLocaleString()}.`);
        return;
      }
      if (amt > maxDeposit) {
        alert(`Maximum deposit amount is KES ${maxDeposit.toLocaleString()}.`);
        return;
      }

      // Step 1: Requesting State
      depBtn.disabled = true;
      depBtn.style.opacity = '0.75';
      depBtn.innerHTML = `
        <span class="skeleton-loader-spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
        <span>Requesting M-Pesa STK Push...</span>
      `;

      if (depStatusContainer) {
        depStatusContainer.style.display = 'block';
        depStatusContainer.innerHTML = `
          <div style="background: rgba(56, 102, 42, 0.08); border: 1px solid rgba(56, 102, 42, 0.3); padding: 14px; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--color-primary); font-size: 0.88rem;">
              <span class="skeleton-loader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
              <span>Sending STK Push prompt to +${user?.phone || ''}...</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0;">Connecting to Safaricom Daraja API gateway...</p>
          </div>
        `;
      }

      try {
        // Step 2: Trigger real backend M-Pesa STK Push API
        const response = await state.initiateMpesaDeposit(amt, user?.phone);
        const checkoutId = response.CheckoutRequestID;

        // Step 3: STK Push initiated successfully! Prompt user to enter PIN
        depBtn.innerHTML = `
          <span class="pulse-dot" style="background: #F59E0B;"></span>
          <span>Waiting for M-Pesa PIN...</span>
        `;

        if (depStatusContainer) {
          depStatusContainer.innerHTML = `
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.5); padding: 16px; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; color: #D97706; font-size: 0.9rem;">
                  <span style="font-size: 1.2rem;">📲</span>
                  <span>STK Push Sent to Phone!</span>
                </div>
                <span style="font-size: 0.72rem; font-weight: 800; color: #D97706; background: rgba(245, 158, 11, 0.15); padding: 2px 8px; border-radius: 4px;">KES ${amt.toLocaleString()}</span>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-primary); margin: 0; line-height: 1.4;">
                Please check your mobile phone screen for the Safaricom M-Pesa pop-up and <b>enter your M-Pesa PIN</b> to confirm payment.
              </p>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-muted);">
                <span class="skeleton-loader-spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                <span>Listening for M-Pesa PIN payment confirmation...</span>
              </div>
            </div>
          `;
        }

        // Step 4: Poll payment status every 2 seconds
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const statusData = await state.checkStkStatus(checkoutId);

            if (statusData.status === 'success') {
              clearInterval(pollInterval);
              
              if (depStatusContainer) {
                depStatusContainer.innerHTML = `
                  <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid #10B981; padding: 16px; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; color: #10B981; font-size: 0.92rem;">
                      <span>🎉</span>
                      <span>Payment Confirmed & Credited!</span>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-primary); margin: 0;">
                      KES ${amt.toLocaleString()} has been successfully deposited into your wallet balance.
                    </p>
                  </div>
                `;
              }

              // Refresh user data & re-render profile after 1.5s
              await state.fetchUserData();
              setTimeout(() => {
                renderProfileView();
              }, 1500);

            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              depBtn.disabled = false;
              depBtn.style.opacity = '1';
              depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;

              if (depStatusContainer) {
                depStatusContainer.innerHTML = `
                  <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--color-danger); padding: 14px; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--color-danger); font-size: 0.88rem;">
                      <span>❌</span>
                      <span>M-Pesa Payment Failed / Cancelled</span>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0;">${statusData.reason || "Payment was cancelled or timed out on mobile phone."}</p>
                  </div>
                `;
              }
            } else if (attempts >= 30) { // 60 seconds timeout
              clearInterval(pollInterval);
              depBtn.disabled = false;
              depBtn.style.opacity = '1';
              depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;

              if (depStatusContainer) {
                depStatusContainer.innerHTML = `
                  <div style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-lg); font-size: 0.78rem; color: var(--text-muted);">
                    ⚠️ Payment confirmation timeout. If you completed the M-Pesa PIN prompt, your balance will update automatically in a few moments.
                  </div>
                `;
              }
            }
          } catch (pollErr) {
            console.warn("STK Polling error:", pollErr);
          }
        }, 2000);

      } catch (err) {
        depBtn.disabled = false;
        depBtn.style.opacity = '1';
        depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;

        if (depStatusContainer) {
          depStatusContainer.style.display = 'block';
          depStatusContainer.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--color-danger); padding: 14px; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--color-danger); font-size: 0.88rem;">
                <span>❌</span>
                <span>STK Push Request Failed</span>
              </div>
              <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0;">${err.message}</p>
            </div>
          `;
        }
      }
    });

    document.getElementById('profile-with-mpesa-btn')?.addEventListener('click', async () => {
      const amt = parseInt(withValInput.value) || 0;
      if (!amt || amt < minWithdrawal) {
        alert(`Minimum withdrawal amount is KES ${minWithdrawal.toLocaleString()}.`);
        return;
      }
      if (amt > maxWithdrawal) {
        alert(`Maximum withdrawal amount is KES ${maxWithdrawal.toLocaleString()}.`);
        return;
      }
      try {
        await state.withdraw(amt, user?.phone);
        alert(`Withdrawal Approved! KES ${amt.toLocaleString()} has been sent to your M-Pesa line.`);
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
