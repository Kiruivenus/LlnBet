import { state } from '../state.js';
import { getMaterialIcon, formatCurrency } from '../utils.js';

let activeTab = 'users'; // 'users' | 'withdrawals' | 'settings'

export async function renderAdminView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  // Render baseline container structure with loading spinner
  container.innerHTML = `
    <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <h1 style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 900; color: var(--text-primary);">Admin Portal</h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">Manage registered players, approve withdrawals, and configure M-Pesa transaction limits.</p>
    </div>

    <!-- Admin Tabs -->
    <div style="display: flex; gap: 8px; border-bottom: 2px solid var(--border-color); margin-top: 20px; background: var(--bg-surface); padding: 8px 12px; border-radius: var(--radius-md) var(--radius-md) 0 0; flex-wrap: wrap;">
      <button class="admin-tab-btn" data-tab="users" style="flex: 1; min-width: 100px; padding: 12px; background: ${activeTab === 'users' ? 'var(--accent-emerald)' : 'transparent'}; color: ${activeTab === 'users' ? 'var(--bg-obsidian)' : 'var(--text-secondary)'}; border: none; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; outline: none; transition: all 0.2s;">
        PLAYERS
      </button>
      <button class="admin-tab-btn" data-tab="fixtures" style="flex: 1; min-width: 100px; padding: 12px; background: ${activeTab === 'fixtures' ? 'var(--accent-emerald)' : 'transparent'}; color: ${activeTab === 'fixtures' ? 'var(--bg-obsidian)' : 'var(--text-secondary)'}; border: none; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; outline: none; transition: all 0.2s;">
        CUSTOM FIXTURES
      </button>
      <button class="admin-tab-btn" data-tab="withdrawals" style="flex: 1; min-width: 100px; padding: 12px; background: ${activeTab === 'withdrawals' ? 'var(--accent-emerald)' : 'transparent'}; color: ${activeTab === 'withdrawals' ? 'var(--bg-obsidian)' : 'var(--text-secondary)'}; border: none; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; outline: none; transition: all 0.2s;">
        WITHDRAWALS
      </button>
      <button class="admin-tab-btn" data-tab="settings" style="flex: 1; min-width: 100px; padding: 12px; background: ${activeTab === 'settings' ? 'var(--accent-emerald)' : 'transparent'}; color: ${activeTab === 'settings' ? 'var(--bg-obsidian)' : 'var(--text-secondary)'}; border: none; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; outline: none; transition: all 0.2s;">
        SETTINGS
      </button>
      <button class="admin-tab-btn" data-tab="telemetry" style="flex: 1; min-width: 100px; padding: 12px; background: ${activeTab === 'telemetry' ? 'var(--accent-emerald)' : 'transparent'}; color: ${activeTab === 'telemetry' ? 'var(--bg-obsidian)' : 'var(--text-secondary)'}; border: none; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-sm); cursor: pointer; outline: none; transition: all 0.2s;">
        TELEMETRY
      </button>
    </div>

    <div id="admin-tab-content" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 var(--radius-lg) var(--radius-lg); padding: 24px; min-height: 300px;">
      <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-secondary);">
        <span style="font-size: 0.9rem;">Loading Admin Data...</span>
      </div>
    </div>
  `;

  // Bind tab navigation click triggers
  container.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeTab = e.target.getAttribute('data-tab');
      renderAdminView();
    });
  });

  // Load active tab data
  const headers = { 'Authorization': `Bearer ${state.data.token}` };
  const contentEl = document.getElementById('admin-tab-content');

  if (activeTab === 'users') {
    try {
      const res = await fetch('/api/admin/users', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const users = data.users || [];
      if (users.length === 0) {
        contentEl.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">No players registered yet.</div>`;
        return;
      }

      contentEl.innerHTML = `
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; color: var(--text-primary);">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-secondary);">
                <th style="padding: 10px 8px;">Phone</th>
                <th style="padding: 10px 8px;">Name</th>
                <th style="padding: 10px 8px;">Balance</th>
                <th style="padding: 10px 8px;">Role</th>
                <th style="padding: 10px 8px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 12px 8px; font-family: var(--font-mono); font-weight: 700;">+${u.phone}</td>
                  <td style="padding: 12px 8px;">${u.name || 'N/A'}</td>
                  <td style="padding: 12px 8px; font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald);">${formatCurrency(u.balance || 0)}</td>
                  <td style="padding: 12px 8px;"><span style="background: ${u.role === 'ADMIN' ? 'var(--accent-orange)' : 'var(--bg-charcoal)'}; color: ${u.role === 'ADMIN' ? 'var(--bg-obsidian)' : 'var(--text-primary)'}; font-size: 0.7rem; padding: 2px 6px; border-radius: var(--radius-xs); font-weight: 900;">${u.role}</span></td>
                  <td style="padding: 12px 8px; text-align: right;">
                    <button class="adj-bal-btn" data-id="${u._id || u.id}" data-phone="${u.phone}" style="background: var(--bg-charcoal); color: var(--accent-emerald); border: 1px solid var(--border-color); padding: 5px 10px; font-size: 0.75rem; border-radius: var(--radius-sm); font-weight: 800; cursor: pointer; outline: none;">
                      Adjust Balance
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Adjust Balance button listener
      contentEl.querySelectorAll('.adj-bal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const uId = e.target.getAttribute('data-id');
          const phone = e.target.getAttribute('data-phone');
          
          const action = window.prompt(`Adjust balance for +${phone}.\n\nType 'ADD' to add money, or 'SUBTRACT' to subtract money:`);
          if (!action) return;
          const cleanAction = action.trim().toUpperCase();
          if (cleanAction !== 'ADD' && cleanAction !== 'SUBTRACT') {
            alert("Invalid action! Type 'ADD' or 'SUBTRACT'.");
            return;
          }

          const amtStr = window.prompt(`Enter KES amount to ${cleanAction.toLowerCase()} from +${phone}:`);
          const amount = Number(amtStr);
          if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid positive number.");
            return;
          }

          fetch(`/api/admin/users/${uId}/balance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.data.token}`
            },
            body: JSON.stringify({ amount, action: cleanAction.toLowerCase() })
          })
          .then(async r => {
            const data = await r.json();
            if (!r.ok) throw new Error(data.error);
            alert(`Adjustment Successful!\n\nNew Wallet Balance for +${phone}: KES ${data.newBalance.toLocaleString()}`);
            renderAdminView();
          })
          .catch(err => {
            alert("Failed to adjust balance: " + err.message);
          });
        });
      });

    } catch (err) {
      contentEl.innerHTML = `<div style="color:var(--accent-live); text-align:center; padding:40px;">Error: ${err.message}</div>`;
    }
  }

  else if (activeTab === 'withdrawals') {
    try {
      const res = await fetch('/api/admin/withdrawals', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const withdrawals = data.withdrawals || [];
      if (withdrawals.length === 0) {
        contentEl.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">No withdrawals recorded in history.</div>`;
        return;
      }

      contentEl.innerHTML = `
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; color: var(--text-primary);">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-secondary);">
                <th style="padding: 10px 8px;">User ID</th>
                <th style="padding: 10px 8px;">Amount</th>
                <th style="padding: 10px 8px;">Reference</th>
                <th style="padding: 10px 8px;">Status</th>
                <th style="padding: 10px 8px;">Created</th>
                <th style="padding: 10px 8px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${withdrawals.map(w => {
                let badgeBg = 'var(--bg-charcoal)';
                let badgeColor = 'var(--text-primary)';
                if (w.status === 'PENDING') { badgeBg = 'var(--accent-orange)'; badgeColor = 'var(--bg-obsidian)'; }
                if (w.status === 'COMPLETED') { badgeBg = 'var(--accent-emerald)'; badgeColor = 'var(--bg-obsidian)'; }
                if (w.status === 'FAILED') { badgeBg = 'var(--accent-live)'; badgeColor = '#ffffff'; }

                return `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 12px 8px; font-family: var(--font-mono); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${w.userId}</td>
                    <td style="padding: 12px 8px; font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald);">${formatCurrency(w.amount || 0)}</td>
                    <td style="padding: 12px 8px; font-family: var(--font-mono);">${w.reference}</td>
                    <td style="padding: 12px 8px;"><span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.7rem; padding: 2px 6px; border-radius: var(--radius-xs); font-weight: 900;">${w.status}</span></td>
                    <td style="padding: 12px 8px; color: var(--text-secondary); font-size:0.75rem;">${new Date(w.createdAt).toLocaleString()}</td>
                    <td style="padding: 12px 8px; text-align: right;">
                      ${w.status === 'PENDING' ? `
                        <button class="withdraw-action-btn app-approve-btn" data-id="${w._id || w.id}" data-action="APPROVED" style="background: var(--accent-emerald); color: var(--bg-obsidian); border: none; padding: 5px 10px; font-size: 0.72rem; border-radius: var(--radius-sm); font-weight: 800; cursor: pointer; outline: none; margin-right:4px;">
                          Approve
                        </button>
                        <button class="withdraw-action-btn app-decline-btn" data-id="${w._id || w.id}" data-action="DECLINED" style="background: var(--accent-live); color: #ffffff; border: none; padding: 5px 10px; font-size: 0.72rem; border-radius: var(--radius-sm); font-weight: 800; cursor: pointer; outline: none;">
                          Decline
                        </button>
                      ` : '<span style="color:var(--text-muted); font-size:0.75rem;">Processed</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Approve/Decline click listeners
      contentEl.querySelectorAll('.withdraw-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const wId = e.target.getAttribute('data-id');
          const action = e.target.getAttribute('data-action');
          
          if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this withdrawal request?`)) return;

          fetch(`/api/admin/withdrawals/${wId}/status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.data.token}`
            },
            body: JSON.stringify({ status: action })
          })
          .then(async r => {
            const data = await r.json();
            if (!r.ok) throw new Error(data.error);
            alert(`Withdrawal request successfully ${action.toLowerCase()}!`);
            renderAdminView();
          })
          .catch(err => {
            alert("Operation failed: " + err.message);
          });
        });
      });

    } catch (err) {
      contentEl.innerHTML = `<div style="color:var(--accent-live); text-align:center; padding:40px;">Error: ${err.message}</div>`;
    }
  }

  else if (activeTab === 'fixtures') {
    try {
      const res = await fetch('/api/matches');
      const matches = await res.json();

      contentEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Custom Match Fixture Form -->
          <form id="admin-create-match-form" style="display: flex; flex-direction: column; gap: 16px; background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0;">Add Custom Game Fixture</h3>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Enter basic match details & 1X2 odds. The AI Analyzer will automatically generate all other markets (Correct Score, GG/NG, Over/Under, Double Chance, etc.).</p>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Sport Category</label>
                <select id="cfg-match-sport" class="auth-input" style="width: 100%;">
                  <option value="football">Football (Soccer)</option>
                  <option value="basketball">Basketball</option>
                  <option value="tennis">Tennis</option>
                  <option value="rugby">Rugby</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Country / League</label>
                <input type="text" id="cfg-match-league" class="auth-input" placeholder="e.g. Kenya, FKF Premier League" value="Kenya, Premier League" required />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Home Team Name</label>
                <input type="text" id="cfg-match-home" class="auth-input" placeholder="e.g. Gor Mahia" required />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Away Team Name</label>
                <input type="text" id="cfg-match-away" class="auth-input" placeholder="e.g. AFC Leopards" required />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Kickoff Date & Time</label>
                <input type="datetime-local" id="cfg-match-kickoff" class="auth-input" required />
              </div>
            </div>

            <!-- Odds Inputs -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; background: var(--bg-card); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-lg);">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: #10B981; margin-bottom: 4px;">1 (Home Win Odds)</label>
                <input type="number" step="0.01" min="1.01" id="cfg-match-r1" class="auth-input" value="2.10" required />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: #F59E0B; margin-bottom: 4px;">X (Draw Odds)</label>
                <input type="number" step="0.01" min="1.01" id="cfg-match-rx" class="auth-input" value="3.20" required />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: #EF4444; margin-bottom: 4px;">2 (Away Win Odds)</label>
                <input type="number" step="0.01" min="1.01" id="cfg-match-r2" class="auth-input" value="3.50" required />
              </div>
            </div>

            <button type="submit" id="create-match-submit-btn" style="height: 46px; background: var(--color-primary); color: #FFFFFF; border: none; border-radius: var(--radius-lg); font-weight: 800; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 12px rgba(56, 102, 42, 0.3);">
              ✨ Generate & Publish Game Fixture via AI Analyzer
            </button>
          </form>

          <!-- Active Match List Header & Cleanup Trigger -->
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0;">Active Match Fixtures (${matches.length})</h3>
              <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Matches that have finished (FT) or expired are automatically removed.</p>
            </div>
            <button id="admin-purge-expired-btn" style="padding: 8px 16px; background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md); font-weight: 800; font-size: 0.78rem; cursor: pointer;">
              Purge Expired Games
            </button>
          </div>

          <!-- Active Matches Table -->
          <div style="overflow-x: auto; background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-xl);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem;">
              <thead>
                <tr style="background: var(--bg-card); border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem;">
                  <th style="padding: 12px 16px;">Fixture</th>
                  <th style="padding: 12px 16px;">Category</th>
                  <th style="padding: 12px 16px;">Kickoff</th>
                  <th style="padding: 12px 16px;">Status</th>
                  <th style="padding: 12px 16px;">1X2 Odds</th>
                  <th style="padding: 12px 16px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${matches.map(m => {
                  const m1 = m.markets && m.markets[0]?.odds[0]?.value ? m.markets[0].odds[0].value : '-';
                  const mx = m.markets && m.markets[0]?.odds[1]?.value ? m.markets[0].odds[1].value : '-';
                  const m2 = m.markets && m.markets[0]?.odds[2]?.value ? m.markets[0].odds[2].value : '-';
                  const isCustom = (m.id && m.id.startsWith('custom_')) || m.isCustom;

                  return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 12px 16px; font-weight: 800; color: var(--text-primary);">
                        ${m.teams?.home?.name || 'Home'} vs ${m.teams?.away?.name || 'Away'}
                        ${isCustom ? '<span style="font-size: 0.65rem; background: var(--color-primary); color: #FFF; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">CUSTOM</span>' : ''}
                      </td>
                      <td style="padding: 12px 16px; color: var(--text-secondary);">${m.country || 'Global'}, ${m.league || 'League'}</td>
                      <td style="padding: 12px 16px; font-family: var(--font-mono); color: var(--text-secondary);">${new Date(m.kickoffTime).toLocaleString()}</td>
                      <td style="padding: 12px 16px;">
                        <span style="font-weight: 800; color: ${m.isLive ? '#10B981' : 'var(--text-secondary)'};">${m.isLive ? `LIVE ${m.timer}'` : 'Upcoming'}</span>
                      </td>
                      <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">
                        ${m1} | ${mx} | ${m2}
                      </td>
                      <td style="padding: 12px 16px; text-align: right;">
                        <button class="delete-match-action-btn" data-id="${m.id}" style="padding: 6px 12px; background: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); font-weight: 800; font-size: 0.75rem; cursor: pointer;">
                          Remove
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

        </div>
      `;

      // Set default datetime-local value to 2 hours from now
      const koInput = document.getElementById('cfg-match-kickoff');
      if (koInput) {
        const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        koInput.value = d.toISOString().slice(0, 16);
      }

      // Form submission
      document.getElementById('admin-create-match-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('create-match-submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "AI Analyzer Generating Markets...";
        }

        try {
          const payload = {
            sport: document.getElementById('cfg-match-sport').value,
            league: document.getElementById('cfg-match-league').value,
            country: 'Kenya',
            homeName: document.getElementById('cfg-match-home').value,
            awayName: document.getElementById('cfg-match-away').value,
            kickoffTime: document.getElementById('cfg-match-kickoff').value,
            r1: Number(document.getElementById('cfg-match-r1').value),
            rx: Number(document.getElementById('cfg-match-rx').value),
            r2: Number(document.getElementById('cfg-match-r2').value)
          };

          const r = await fetch('/api/admin/matches', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.data.token}`
            },
            body: JSON.stringify(payload)
          });
          const resData = await r.json();
          if (!r.ok) throw new Error(resData.error);

          alert("🎉 Custom game fixture and all AI markets generated & published successfully!");
          renderAdminView();
        } catch (err) {
          alert("Failed to create custom match: " + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "✨ Generate & Publish Game Fixture via AI Analyzer";
          }
        }
      });

      // Delete match action listeners
      contentEl.querySelectorAll('.delete-match-action-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const mId = btn.getAttribute('data-id');
          if (!window.confirm("Are you sure you want to remove this match fixture?")) return;

          try {
            const r = await fetch(`/api/admin/matches/${mId}`, {
              method: 'DELETE',
              headers
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            alert("Match fixture removed successfully.");
            renderAdminView();
          } catch (err) {
            alert("Failed to remove match: " + err.message);
          }
        });
      });

      // Purge expired games button
      document.getElementById('admin-purge-expired-btn')?.addEventListener('click', async () => {
        try {
          const r = await fetch('/api/admin/matches/cleanup', {
            method: 'POST',
            headers
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          alert(`Cleanup completed! ${d.remainingMatches} active matches remaining.`);
          renderAdminView();
        } catch (err) {
          alert("Cleanup failed: " + err.message);
        }
      });

    } catch (err) {
      contentEl.innerHTML = `<div style="color:var(--accent-live); text-align:center; padding:40px;">Error: ${err.message}</div>`;
    }
  }

  else if (activeTab === 'settings') {
    try {
      const res = await fetch('/api/admin/settings', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const s = data.settings || {};

      contentEl.innerHTML = `
        <form id="admin-settings-form" style="display: flex; flex-direction: column; gap: 18px; max-width: 450px;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 4px;">Limit Mappings & M-Pesa Gateways</h3>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Minimum Deposit Limit (KES)</label>
            <input type="number" id="cfg-min-dep" class="auth-input" style="width: 100%;" value="${s.minDeposit || 200}" required />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Maximum Deposit Limit (KES)</label>
            <input type="number" id="cfg-max-dep" class="auth-input" style="width: 100%;" value="${s.maxDeposit || 500000}" required />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Minimum Withdrawal Limit (KES)</label>
            <input type="number" id="cfg-min-with" class="auth-input" style="width: 100%;" value="${s.minWithdrawal || 200}" required />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Maximum Withdrawal Limit (KES)</label>
            <input type="number" id="cfg-max-with" class="auth-input" style="width: 100%;" value="${s.maxWithdrawal || 100000}" required />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">M-Pesa API Party B (Paybill / Till / Mobile)</label>
            <input type="text" id="cfg-mpesa-partyb" class="auth-input" style="width: 100%;" value="${s.mpesaPartyB || '8583204'}" required />
            <p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;">Sets the target billing account identifier for STK prompts and B2C settlements.</p>
          </div>

          <button type="submit" class="hero-cta" style="margin-top: 10px; width: 100%; background: var(--accent-emerald); color: var(--bg-obsidian); border: none; font-weight: 800; height: 44px; border-radius: var(--radius-md); cursor: pointer; box-shadow: none;">
            Save Configurations
          </button>
        </form>
      `;

      // Save form trigger
      document.getElementById('admin-settings-form')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const payload = {
          minDeposit: Number(document.getElementById('cfg-min-dep').value),
          maxDeposit: Number(document.getElementById('cfg-max-dep').value),
          minWithdrawal: Number(document.getElementById('cfg-min-with').value),
          maxWithdrawal: Number(document.getElementById('cfg-max-with').value),
          mpesaPartyB: document.getElementById('cfg-mpesa-partyb').value.trim()
        };

        fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.data.token}`
          },
          body: JSON.stringify(payload)
        })
        .then(async r => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.error);
          alert("Configuration settings updated successfully!");
          renderAdminView();
        })
        .catch(err => {
          alert("Failed to save configuration settings: " + err.message);
        });
      });

    } catch (err) {
      contentEl.innerHTML = `<div style="color:var(--accent-live); text-align:center; padding:40px;">Error: ${err.message}</div>`;
    }
  }

  else if (activeTab === 'telemetry') {
    try {
      const res = await fetch('/api/admin/telemetry', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const t = data.telemetry || {};

      contentEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">Backend Telemetry</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Real-time database connection pooling and Vercel memory caching stats.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <!-- Database State Card -->
            <div style="background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Database Connection</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${t.dbState === 'Connected' ? '#10b981' : '#ef4444'};"></span>
                <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">${t.dbState}</span>
              </div>
            </div>

            <!-- Pool Reuse Card -->
            <div style="background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Global Pool Cache</span>
              <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.1rem; color: ${t.poolCached ? '#10b981' : '#f59e0b'};">
                ${t.poolCached ? 'ACTIVE (Singleton)' : 'INACTIVE'}
              </span>
            </div>

            <!-- Cache Count Card -->
            <div style="background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Warmed Cached Matches</span>
              <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">${t.cacheCount} Records</span>
            </div>

            <!-- Sync Lock Card -->
            <div style="background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800;">Synchronization Lock</span>
              <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.1rem; color: ${t.syncInProgress ? '#f59e0b' : 'var(--text-secondary)'};">
                ${t.syncInProgress ? 'SYNCING (Locked)' : 'IDLE (Unlocked)'}
              </span>
            </div>
          </div>

          <div style="background: var(--bg-charcoal); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">Detailed Metrics & Timers</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; color: var(--text-secondary);">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                <span>Last Cache Refresh:</span>
                <span style="font-family: var(--font-mono); font-weight: 700;">${t.cacheAgeSeconds !== null ? `${t.cacheAgeSeconds}s ago` : 'Never'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Last ESPN Board Sync:</span>
                <span style="font-family: var(--font-mono); font-weight: 700;">${t.lastSyncAgeSeconds !== null ? `${t.lastSyncAgeSeconds}s ago` : 'Never'}</span>
              </div>
            </div>
          </div>
        </div>
      `;

    } catch (err) {
      contentEl.innerHTML = `<div style="color:var(--accent-live); text-align:center; padding:40px;">Error: ${err.message}</div>`;
    }
  }
}
export default renderAdminView;
