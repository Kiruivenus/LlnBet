import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export function renderTransactionsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const transactions = state.data.transactions;
  let activeFilter = 'all'; // 'all', 'deposit', 'withdrawal', 'promo'

  const drawTxView = () => {
    let filteredTx = transactions;
    if (activeFilter === 'deposit') {
      filteredTx = transactions.filter(t => t.type.toLowerCase().includes('dep'));
    } else if (activeFilter === 'withdrawal') {
      filteredTx = transactions.filter(t => t.type.toLowerCase().includes('with'));
    } else if (activeFilter === 'promo') {
      filteredTx = transactions.filter(t => t.type.toLowerCase().includes('promo'));
    }

    container.innerHTML = `
      <!-- Header Back Navigation -->
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <button class="icon-btn" id="tx-back-btn" aria-label="Go Back">
          ${getMaterialIcon('back')}
        </button>
        <span style="font-size: 0.95rem; font-weight:600; color:var(--text-secondary);">Back to Profile</span>
      </div>

      <!-- Transaction List Section -->
      <div style="max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:16px;">
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 style="font-size:1.4rem; font-family:var(--font-display); font-weight:800;">My Transactions</h2>
          
          <select id="tx-filter-select" style="background:var(--bg-charcoal); border:1px solid var(--border-color); color:var(--text-primary); padding:6px 12px; border-radius:var(--radius-full); font-size:0.85rem; outline:none; cursor:pointer;">
            <option value="all" ${activeFilter === 'all' ? 'selected' : ''}>All Logs</option>
            <option value="deposit" ${activeFilter === 'deposit' ? 'selected' : ''}>Deposits</option>
            <option value="withdrawal" ${activeFilter === 'withdrawal' ? 'selected' : ''}>Withdrawals</option>
            <option value="promo" ${activeFilter === 'promo' ? 'selected' : ''}>Promo Bonus</option>
          </select>
        </div>

        <!-- Transactions Container List -->
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${filteredTx.length === 0 ? `
            <div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-size:0.95rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              No transaction logs found for this filter.
            </div>
          ` : filteredTx.map(t => {
            const isCredit = t.type.toUpperCase().includes('DEP') || t.type.toUpperCase().includes('PROMO') || t.type.toUpperCase().includes('WON');
            const refCode = t.reference || t.id || `TXN-${Math.floor(Math.random()*900+100)}`;
            const dateStr = t.date || (t.createdAt ? new Date(t.createdAt).toLocaleString('en-KE') : 'Just now');

            return `
              <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; display:flex; justify-content:space-between; align-items:center; transition:border-color 0.2s;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:${isCredit ? 'rgba(0,230,118,0.1)' : 'rgba(255,61,0,0.1)'}; color:${isCredit ? 'var(--accent-emerald)' : 'var(--accent-live)'};">
                    ${getMaterialIcon(isCredit ? 'deposit' : 'smartphone')}
                  </div>
                  <div>
                    <strong style="font-size:0.95rem; color:var(--text-primary); display:block;">${t.type}</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:2px;">Date: ${dateStr} • Ref: <span style="font-family:var(--font-mono);">${refCode}</span></span>
                  </div>
                </div>

                <div style="text-align:right;">
                  <strong style="font-family:var(--font-mono); font-size:1.05rem; color:${isCredit ? 'var(--accent-emerald)' : 'var(--accent-orange)'};">
                    ${isCredit ? '+' : '-'}${formatCurrency(t.amount)}
                  </strong>
                  <span style="display:block; font-size:0.65rem; color:var(--accent-emerald); font-weight:800; text-transform:uppercase; margin-top:2px;">${t.status || 'COMPLETED'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    document.getElementById('tx-back-btn')?.addEventListener('click', () => {
      state.setPage('profile');
    });

    document.getElementById('tx-filter-select')?.addEventListener('change', (e) => {
      activeFilter = e.target.value;
      drawTxView();
    });
  };

  drawTxView();
}
export default renderTransactionsView;
