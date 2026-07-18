import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderNotificationsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  // Mock initial notifications list
  const notifications = [
    {
      id: 1,
      title: "KYC Verification Success",
      message: "Standard ID document checks are successfully verified under Betting Control regulations. Enjoy unrestricted withdrawal transactions.",
      time: "3 hours ago",
      icon: "shield",
      color: "var(--accent-emerald)"
    },
    {
      id: 2,
      title: "M-Pesa Wallet Funded",
      message: "KES 5,000 credit confirmed. Transaction Ref: MP-8291A successfully completed. Wallet updated.",
      time: "1 day ago",
      icon: "wallet",
      color: "var(--accent-emerald)"
    },
    {
      id: 3,
      title: "Double Power Bonus Enabled",
      message: "A matching deposit promo has been added to your profile balance. Terms of rollover apply. Valid for 7 days.",
      time: "2 days ago",
      icon: "bonus",
      color: "var(--accent-orange)"
    }
  ];

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
        <button id="notif-clear-btn" style="background:none; border:none; color:var(--accent-live); font-size:0.8rem; font-weight:700; cursor:pointer; outline:none; display:flex; align-items:center; gap:4px;">
          ${getMaterialIcon('close')} Clear All
        </button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;" id="notifications-wrapper-list">
        ${notifications.map(n => `
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; display:flex; gap:14px; position:relative;" class="notif-item">
            <div style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:var(--bg-charcoal); color:${n.color}; border:1px solid var(--border-color);">
              ${getMaterialIcon(n.icon)}
            </div>
            
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <strong style="font-size:0.95rem; color:var(--text-primary);">${n.title}</strong>
                <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono);">${n.time}</span>
              </div>
              <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; margin-top:4px;">${n.message}</p>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;

  document.getElementById('notif-back-btn')?.addEventListener('click', () => {
    state.setPage('home');
  });

  document.getElementById('notif-clear-btn')?.addEventListener('click', () => {
    const list = document.getElementById('notifications-wrapper-list');
    if (list) {
      list.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-size:0.95rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md);">
          No active notifications.
        </div>
      `;
    }
  });
}
export default renderNotificationsView;
