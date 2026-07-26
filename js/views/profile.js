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

    // -----------------------------------------------------------------
    // ENTERPRISE M-PESA STK PUSH HANDLER & REAL-TIME TIMELINE
    // -----------------------------------------------------------------
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

      depBtn.disabled = true;
      depBtn.style.opacity = '0.75';
      depBtn.innerHTML = `
        <span class="skeleton-loader-spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
        <span>Initiating STK Push...</span>
      `;

      if (depStatusContainer) {
        depStatusContainer.style.display = 'block';
        depStatusContainer.innerHTML = renderPaymentTimeline('PENDING', 'Connecting to Safaricom Daraja API...', amt, user?.phone, 1);
      }

      let startTime = Date.now();
      let eventSource = null;

      try {
        const response = await state.initiateMpesaDeposit(amt, user?.phone);
        const checkoutId = response.checkoutRequestID || response.CheckoutRequestID;
        const reference = response.reference || checkoutId;

        // Start Real-Time Server-Sent Events (SSE) Stream
        try {
          eventSource = new EventSource(`/api/mpesa/stream/${reference}`);
          
          eventSource.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

            if (depStatusContainer) {
              depStatusContainer.innerHTML = renderPaymentTimeline(
                data.status,
                data.statusMessage || response.message,
                amt,
                user?.phone,
                elapsedSeconds,
                response.simulated
              );
            }

            if (data.status === 'AWAITING_PIN' || data.status === 'STK_SENT') {
              depBtn.innerHTML = `
                <span class="pulse-dot" style="background: #F59E0B;"></span>
                <span>Waiting for M-Pesa PIN...</span>
              `;
            }

            if (data.status === 'SUCCESS') {
              if (eventSource) eventSource.close();
              await state.fetchUserData();
              showSuccessModal(data, amt, user);
              depBtn.disabled = false;
              depBtn.style.opacity = '1';
              depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;
            }

            if (['FAILED', 'CANCELLED', 'TIMEOUT', 'EXPIRED'].includes(data.status)) {
              if (eventSource) eventSource.close();
              showFailureModal(data);
              depBtn.disabled = false;
              depBtn.style.opacity = '1';
              depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;
            }
          };
        } catch (sseErr) {
          console.warn("[SSE FALLBACK]: Using polling mode", sseErr);
        }

        // Fallback polling loop in case SSE is blocked by client proxy
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

          try {
            const statusData = await state.checkStkStatus(reference);

            if (depStatusContainer && statusData) {
              depStatusContainer.innerHTML = renderPaymentTimeline(
                statusData.status,
                statusData.statusMessage || response.message,
                amt,
                user?.phone,
                elapsedSeconds,
                response.simulated
              );
            }

            if (statusData && statusData.status === 'SUCCESS') {
              clearInterval(pollInterval);
              if (eventSource) eventSource.close();
              await state.fetchUserData();
              showSuccessModal(statusData, amt, user);
              depBtn.disabled = false;
              depBtn.style.opacity = '1';
              depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;
            } else if (statusData && ['FAILED', 'CANCELLED', 'TIMEOUT', 'EXPIRED'].includes(statusData.status)) {
              clearInterval(pollInterval);
              if (eventSource) eventSource.close();
              showFailureModal(statusData);
              depBtn.disabled = false;
              depBtn.style.opacity = '1';
              depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;
            } else if (attempts >= 30) {
              clearInterval(pollInterval);
              if (eventSource) eventSource.close();
              depBtn.disabled = false;
              depBtn.style.opacity = '1';
              depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;
            }
          } catch (pollErr) {
            console.warn("[POLLING ERROR]:", pollErr);
          }
        }, 2000);

      } catch (err) {
        if (eventSource) eventSource.close();
        depBtn.disabled = false;
        depBtn.style.opacity = '1';
        depBtn.innerHTML = `${getMaterialIcon('smartphone')} Trigger M-Pesa STK Push`;

        showFailureModal({
          humanError: {
            title: 'STK Push Initiation Failed',
            explanation: err.message,
            suggestion: 'Verify your phone number and Vercel/Admin Daraja credentials.'
          }
        });
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

// ---------------------------------------------------------------------
// ENTERPRISE BANKING PAYMENT TIMELINE & RECEIPT MODALS
// ---------------------------------------------------------------------

function renderPaymentTimeline(status, statusMessage, amount, phone, elapsedSeconds = 0, isSimulated = false) {
  const steps = [
    { key: 'PENDING', label: 'Payment Request Created' },
    { key: 'INITIATED', label: 'Contacting Safaricom Gateway' },
    { key: 'STK_SENT', label: 'STK Push Prompt Dispatched' },
    { key: 'AWAITING_PIN', label: 'Waiting for M-Pesa PIN' },
    { key: 'PROCESSING', label: 'Validating Payment Receipt' },
    { key: 'SUCCESS', label: 'Payment Completed' }
  ];

  const currentStepMap = {
    'PENDING': 1,
    'INITIATED': 2,
    'STK_SENT': 3,
    'AWAITING_PIN': 4,
    'PROCESSING': 5,
    'SUCCESS': 6
  };

  const currentStep = currentStepMap[status] || 1;
  const isFailed = ['FAILED', 'CANCELLED', 'TIMEOUT', 'EXPIRED'].includes(status);

  return `
    <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-xl); box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 14px;">
      
      <!-- Top Status Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.1rem;">${isFailed ? '❌' : status === 'SUCCESS' ? '🎉' : '📲'}</span>
          <span style="font-weight: 800; font-size: 0.88rem; color: ${isFailed ? 'var(--color-danger)' : status === 'SUCCESS' ? '#10B981' : 'var(--color-primary)'};">
            ${isFailed ? 'Payment Failed / Cancelled' : status === 'SUCCESS' ? 'Payment Completed & Credited' : 'Safaricom M-Pesa Payment Progress'}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="background: var(--bg-surface-hover); color: var(--text-secondary); font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; font-family: var(--font-mono);">
            ⏱ ${String(elapsedSeconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

      <!-- Mode Badge (Simulated vs Real) -->
      ${isSimulated ? `
        <div style="background: rgba(59, 130, 246, 0.08); border: 1px dashed #3B82F6; padding: 8px 12px; border-radius: var(--radius-md); font-size: 0.75rem; color: #2563EB; display: flex; align-items: center; gap: 6px;">
          <span>🧪</span>
          <span><b>Sandbox Test Mode:</b> Simulated gateway test active.</span>
        </div>
      ` : ''}

      <!-- Status Explanation message -->
      <p style="font-size: 0.82rem; color: var(--text-primary); margin: 0; line-height: 1.4;">
        ${statusMessage || 'Processing M-Pesa transaction request...'}
      </p>

      <!-- Visual Step-by-Step Payment Timeline -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        ${steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum || status === 'SUCCESS';
          const isCurrent = currentStep === stepNum && !isFailed && status !== 'SUCCESS';

          let iconHtml = `<span style="width: 18px; height: 18px; border-radius: 50%; background: var(--bg-surface-hover); color: var(--text-muted); display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;">${stepNum}</span>`;
          let color = 'var(--text-muted)';
          let fontWeight = '500';

          if (isDone) {
            iconHtml = `<span style="width: 18px; height: 18px; border-radius: 50%; background: #10B981; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900;">✓</span>`;
            color = 'var(--text-primary)';
            fontWeight = '700';
          } else if (isCurrent) {
            iconHtml = `<span class="skeleton-loader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>`;
            color = 'var(--color-primary)';
            fontWeight = '800';
          }

          return `
            <div style="display: flex; align-items: center; gap: 10px;">
              ${iconHtml}
              <span style="font-size: 0.78rem; color: ${color}; font-weight: ${fontWeight};">${step.label}</span>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

function showSuccessModal(data, amount, user) {
  const receipt = data.receiptNumber || 'MP-' + Math.floor(Math.random() * 900000 + 100000);
  const ref = data.reference || 'LLN-DEP-' + Math.floor(Math.random() * 900000 + 100000);

  const modalHtml = `
    <div id="mpesa-success-modal" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 20px; text-align: center;">
        
        <!-- Big Green Checkmark -->
        <div style="width: 72px; height: 72px; background: rgba(16, 185, 129, 0.15); color: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2.2rem; font-weight: 900; border: 2px solid #10B981;">
          ✓
        </div>

        <div>
          <h2 style="font-size: 1.4rem; font-weight: 900; color: var(--text-primary); margin: 0;">Payment Successful!</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">KES ${amount.toLocaleString()} credited to your wallet balance.</p>
        </div>

        <!-- Receipt Card Details -->
        <div style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">M-Pesa Receipt No:</span>
            <span style="font-family: var(--font-mono); font-weight: 900; color: #10B981;">${receipt}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Transaction Reference:</span>
            <span style="font-family: var(--font-mono); font-weight: 800; color: var(--text-primary);">${ref}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Amount Deposited:</span>
            <span style="font-family: var(--font-mono); font-weight: 800; color: var(--text-primary);">KES ${amount.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
            <span style="color: var(--text-secondary);">Mobile Line:</span>
            <span style="font-weight: 700; color: var(--text-primary);">+${user?.phone || '254...'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Updated Wallet Balance:</span>
            <span style="font-family: var(--font-mono); font-weight: 900; color: var(--color-primary);">KES ${((user?.balance || 0) + amount).toLocaleString()}</span>
          </div>
        </div>

        <!-- Modal Action Buttons -->
        <div style="display: flex; gap: 10px; margin-top: 4px;">
          <button id="close-success-modal-btn" style="flex: 1; height: 44px; background: var(--color-primary); color: #FFFFFF; border: none; border-radius: var(--radius-lg); font-weight: 800; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 12px rgba(56, 102, 42, 0.3);">
            Done & Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('close-success-modal-btn')?.addEventListener('click', () => {
    document.getElementById('mpesa-success-modal')?.remove();
    renderProfileView();
  });
}

function showFailureModal(data) {
  const err = data.humanError || {};
  const title = err.title || 'M-Pesa Payment Failed';
  const explanation = err.explanation || data.errorMessage || data.reason || 'The M-Pesa transaction was cancelled or timed out.';
  const suggestion = err.suggestion || 'Please unlock your mobile phone screen and try again.';

  const modalHtml = `
    <div id="mpesa-failure-modal" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 18px; text-align: center;">
        
        <!-- Big Red Alert Icon -->
        <div style="width: 72px; height: 72px; background: rgba(239, 68, 68, 0.15); color: var(--color-danger); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2.2rem; font-weight: 900; border: 2px solid var(--color-danger);">
          ✕
        </div>

        <div>
          <h2 style="font-size: 1.35rem; font-weight: 900; color: var(--color-danger); margin: 0;">${title}</h2>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">${explanation}</p>
        </div>

        <!-- Actionable Guidance Box -->
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-lg); padding: 14px; text-align: left; font-size: 0.78rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 4px;">
          <span style="font-weight: 800; color: var(--color-danger);">💡 Next Steps:</span>
          <span>${suggestion}</span>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 10px; margin-top: 4px;">
          <button id="retry-failure-modal-btn" style="flex: 1; height: 44px; background: var(--color-primary); color: #FFFFFF; border: none; border-radius: var(--radius-lg); font-weight: 800; font-size: 0.88rem; cursor: pointer;">
            Try Deposit Again
          </button>
          <button id="close-failure-modal-btn" style="height: 44px; padding: 0 16px; background: var(--bg-surface-hover); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); font-weight: 700; font-size: 0.85rem; cursor: pointer;">
            Dismiss
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const closeModal = () => {
    document.getElementById('mpesa-failure-modal')?.remove();
  };

  document.getElementById('retry-failure-modal-btn')?.addEventListener('click', closeModal);
  document.getElementById('close-failure-modal-btn')?.addEventListener('click', closeModal);
}

export default renderProfileView;

