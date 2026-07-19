import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

function formatNotifTime(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function renderNotificationsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  const isLoggedIn = state.data.isLoggedIn;
  const notifications = state.data.notifications || [];

  // Helper to determine notification icon & styling
  const getNotifDetails = (n) => {
    const t = (n.title || '').toLowerCase();
    if (t.includes('welcome')) {
      return { icon: 'emoji_events', color: '#fdb927' };
    }
    if (t.includes('deposit') || t.includes('wallet') || t.includes('payout') || t.includes('withdrawal')) {
      return { icon: 'account_balance_wallet', color: 'var(--accent-emerald)' };
    }
    if (t.includes('referral') || t.includes('reward')) {
      return { icon: 'people', color: 'var(--accent-emerald)' };
    }
    return { icon: 'notifications', color: 'var(--text-secondary)' };
  };

  let innerContent = '';

  if (!isLoggedIn) {
    innerContent = `
      <div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-size:0.95rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md);">
        Please login to view your system notifications.
      </div>
    `;
  } else if (notifications.length === 0) {
    innerContent = `
      <div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-size:0.95rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md);">
        No active notifications.
      </div>
    `;
  } else {
    innerContent = `
      <div style="display:flex; flex-direction:column; gap:10px;" id="notifications-wrapper-list">
        ${notifications.map(n => {
          const details = getNotifDetails(n);
          return `
            <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; display:flex; gap:14px; position:relative;" class="notif-item">
              <div style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:var(--bg-charcoal); color:${details.color}; border:1px solid var(--border-color);">
                ${getMaterialIcon(details.icon)}
              </div>
              
              <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <strong style="font-size:0.95rem; color:var(--text-primary);">${n.title || 'Notification'}</strong>
                  <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono);">${formatNotifTime(n.createdAt)}</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; margin-top:4px;">${n.message || ''}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Header Back Navigation -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <button class="icon-btn" id="notif-back-btn" aria-label="Go Back">
        ${getMaterialIcon('back')}
      </button>
      <span style="font-size: 0.95rem; font-weight:600; color:var(--text-secondary);">Back to Sportsbook</span>
    </div>

    <!-- Notifications List Container -->
    <div style="max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:16px;">
      
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="font-size:1.4rem; font-family:var(--font-display); font-weight:800;">System Notifications</h2>
        ${isLoggedIn && notifications.length > 0 ? `
          <button id="notif-clear-btn" style="background:none; border:none; color:var(--accent-live); font-size:0.8rem; font-weight:700; cursor:pointer; outline:none; display:flex; align-items:center; gap:4px;">
            ${getMaterialIcon('close')} Clear All
          </button>
        ` : ''}
      </div>

      ${innerContent}

    </div>
  `;

  document.getElementById('notif-back-btn')?.addEventListener('click', () => {
    state.setPage('home');
  });

  document.getElementById('notif-clear-btn')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${state.data.token}` }
      });
      if (res.ok) {
        state.data.notifications = [];
        state.notify('notifications');
      } else {
        alert("Failed to clear notifications from server.");
      }
    } catch (e) {
      alert("Error clearing notifications: " + e.message);
    }
  });
}
export default renderNotificationsView;
