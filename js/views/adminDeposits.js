import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

export async function renderAdminDepositsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  // Access restriction check: Admin privileges required
  if (!state.data.isLoggedIn) {
    alert("Authentication Required: Please login.");
    state.setPage('login');
    return;
  }

  if (state.data.user?.role !== 'ADMIN') {
    alert("Access Denied: Admin privileges required.");
    state.setPage('home');
    return;
  }

  // Render baseline layout with loading indicator
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Page Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="admin-deposits-back-btn" class="header-icon-btn" style="width: 34px; height: 34px;" title="Back to Main Admin Portal">
              ${getMaterialIcon('back')}
            </button>
            <h1 style="font-size: 1.6rem; font-family: var(--font-heading); font-weight: 900; color: var(--text-primary); margin: 0;">Total User Deposits Audit</h1>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px;">Comprehensive report of all M-Pesa deposits, total accumulated revenue, and user transaction audit logs.</p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="admin-deposits-export-btn" style="padding: 8px 14px; background: var(--bg-surface-hover); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-weight: 700; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            ${getMaterialIcon('download')} Export CSV
          </button>

          <button id="admin-deposits-refresh-btn" class="btn-deposit" style="padding: 8px 16px; font-size: 0.82rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
            ${getMaterialIcon('refresh')} Refresh Data
          </button>
        </div>
      </div>

      <!-- Loading Placeholder -->
      <div id="admin-deposits-content-area">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; gap: 12px; color: var(--text-muted);">
          <div class="skeleton-loader-spinner"></div>
          <span>Loading Total Deposit Metrics & Audit Logs...</span>
        </div>
      </div>

    </div>
  `;

  // Bind Header Back Button
  document.getElementById('admin-deposits-back-btn')?.addEventListener('click', () => {
    state.setPage('admin');
  });

  const contentArea = document.getElementById('admin-deposits-content-area');

  try {
    const headers = { 'Authorization': `Bearer ${state.data.token}` };
    const res = await fetch('/api/admin/deposits', { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load deposit data.");

    const m = data.metrics || { totalAmount: 0, totalCount: 0, todayAmount: 0, avgAmount: 0 };
    let deposits = data.deposits || [];

    const renderContent = (filteredList) => {
      let html = `
        <!-- Metrics Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
          
          <!-- Card 1: Total Revenue Deposited -->
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.03)); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-xl); padding: 20px; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: #10B981; letter-spacing: 0.05em;">Total User Deposits</span>
            <span style="font-family: var(--font-mono); font-weight: 900; font-size: 1.8rem; color: #10B981;">${formatCurrency(m.totalAmount)}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Lifetime accumulated M-Pesa deposits</span>
          </div>

          <!-- Card 2: Successful Deposit Count -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Successful Transactions</span>
            <span style="font-family: var(--font-mono); font-weight: 900; font-size: 1.8rem; color: var(--text-primary);">${m.totalCount.toLocaleString()} Payments</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Total completed deposit receipts</span>
          </div>

          <!-- Card 3: Today's Revenue -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Today's Revenue</span>
            <span style="font-family: var(--font-mono); font-weight: 900; font-size: 1.8rem; color: var(--color-primary);">${formatCurrency(m.todayAmount)}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Deposits completed since midnight</span>
          </div>

          <!-- Card 4: Average Deposit Size -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Average Deposit Size</span>
            <span style="font-family: var(--font-mono); font-weight: 900; font-size: 1.8rem; color: var(--text-primary);">${formatCurrency(m.avgAmount)}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Average size per successful deposit</span>
          </div>

        </div>

        <!-- Filter & Search Controls Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px; margin-bottom: 16px;">
          
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 260px;">
            <input type="text" id="admin-deposits-search-input" placeholder="Search phone number, player name, M-Pesa receipt, or ref..." class="auth-input" style="width: 100%; height: 40px; font-size: 0.82rem;" />
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Filter Status:</label>
            <select id="admin-deposits-status-select" class="auth-input" style="height: 40px; padding: 0 12px; font-size: 0.82rem;">
              <option value="ALL">All Statuses (${deposits.length})</option>
              <option value="COMPLETED">COMPLETED (${deposits.filter(d => d.status === 'COMPLETED').length})</option>
              <option value="PENDING">PENDING (${deposits.filter(d => d.status === 'PENDING').length})</option>
              <option value="FAILED">FAILED (${deposits.filter(d => d.status === 'FAILED').length})</option>
            </select>
          </div>

        </div>

        <!-- Deposits Log Table -->
        <div style="overflow-x: auto; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); box-shadow: var(--shadow-card);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem;">
            <thead>
              <tr style="background: var(--bg-surface-hover); border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem;">
                <th style="padding: 14px 16px;">Reference</th>
                <th style="padding: 14px 16px;">M-Pesa Receipt</th>
                <th style="padding: 14px 16px;">Player / Line</th>
                <th style="padding: 14px 16px;">Amount (KES)</th>
                <th style="padding: 14px 16px;">Status</th>
                <th style="padding: 14px 16px; text-align: right;">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              ${filteredList.length === 0 ? `
                <tr>
                  <td colspan="6" style="padding: 40px; text-align: center; color: var(--text-muted);">
                    No deposit records matched your filter query.
                  </td>
                </tr>
              ` : filteredList.map(d => {
                const isCompleted = d.status === 'COMPLETED';
                const isPending = d.status === 'PENDING';
                const statusBg = isCompleted ? 'rgba(16, 185, 129, 0.12)' : isPending ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)';
                const statusColor = isCompleted ? '#10B981' : isPending ? '#F59E0B' : '#EF4444';

                return `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 800; color: var(--text-primary);">${d.reference}</td>
                    <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 900; color: ${d.receiptNumber !== 'N/A' ? '#10B981' : 'var(--text-muted)'};">
                      ${d.receiptNumber}
                    </td>
                    <td style="padding: 12px 16px;">
                      <div style="font-weight: 800; color: var(--text-primary);">${d.userName}</div>
                      <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">+${d.phone}</div>
                    </td>
                    <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 900; font-size: 0.95rem; color: #10B981;">
                      KES ${d.amount.toLocaleString()}
                    </td>
                    <td style="padding: 12px 16px;">
                      <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 8px; border-radius: var(--radius-sm); font-weight: 800; font-size: 0.72rem; display: inline-block;">
                        ${d.status}
                      </span>
                    </td>
                    <td style="padding: 12px 16px; text-align: right; font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.78rem;">
                      ${new Date(d.createdAt).toLocaleString()}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      contentArea.innerHTML = html;

      // Filter & Search Event Bindings
      const searchInput = document.getElementById('admin-deposits-search-input');
      const statusSelect = document.getElementById('admin-deposits-status-select');

      const applyFilters = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const selectedStatus = statusSelect?.value || 'ALL';

        const filtered = deposits.filter(d => {
          const matchStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
          const matchQuery = !query || 
            String(d.reference).toLowerCase().includes(query) ||
            String(d.receiptNumber).toLowerCase().includes(query) ||
            String(d.phone).toLowerCase().includes(query) ||
            String(d.userName).toLowerCase().includes(query);

          return matchStatus && matchQuery;
        });

        renderContent(filtered);

        // Retain focus and values
        const newSearch = document.getElementById('admin-deposits-search-input');
        const newStatus = document.getElementById('admin-deposits-status-select');
        if (newSearch) {
          newSearch.value = query;
          newSearch.focus();
        }
        if (newStatus) newStatus.value = selectedStatus;
      };

      searchInput?.addEventListener('input', applyFilters);
      statusSelect?.addEventListener('change', applyFilters);
    };

    renderContent(deposits);

    // Refresh Button Handler
    document.getElementById('admin-deposits-refresh-btn')?.addEventListener('click', () => {
      renderAdminDepositsView();
    });

    // CSV Export Handler
    document.getElementById('admin-deposits-export-btn')?.addEventListener('click', () => {
      if (deposits.length === 0) {
        alert("No deposit records available to export.");
        return;
      }

      let csv = "Reference,Receipt Number,User Name,Phone Line,Amount (KES),Status,Date\n";
      deposits.forEach(d => {
        csv += `"${d.reference}","${d.receiptNumber}","${d.userName}","+${d.phone}",${d.amount},"${d.status}","${new Date(d.createdAt).toISOString()}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LlnBet_User_Deposits_Report_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });

  } catch (err) {
    contentArea.innerHTML = `
      <div style="color: var(--color-danger); text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
        Error loading deposits audit data: ${err.message}
      </div>
    `;
  }
}

export default renderAdminDepositsView;
