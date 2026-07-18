import { promotionsList } from '../data.js';
import { getMaterialIcon } from '../utils.js';

export function renderPromotionsView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <div class="section-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
      <h1 style="font-size: 1.8rem;">BetPulse Promotions</h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">Boost your betting payouts with accumulator multipliers, welcome packages, and weekly rebates.</p>
    </div>

    <!-- Active Promo Cards Grid -->
    <div class="promotions-grid" style="margin-top: 16px;">
      ${promotionsList.map(promo => `
        <div class="promo-card">
          <div class="promo-img-placeholder">
            <span class="promo-img-logo">${promo.logoText}</span>
            <span class="promo-tag">${promo.tag}</span>
          </div>
          <div class="promo-content">
            <h3 class="promo-title">${promo.title}</h3>
            <p class="promo-desc">${promo.desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:12px;">
              <span style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-charcoal); padding:4px 10px; border-radius:var(--radius-xs); border:1px solid var(--border-color); color:var(--text-secondary);">
                Code: <strong>${promo.logoText}</strong>
              </span>
              <button class="promo-btn promo-opt-btn" style="background:var(--accent-emerald); color:var(--bg-obsidian); border-color:var(--accent-emerald); padding:6px 20px;">Opt In</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Loyalty Rewards Section -->
    <div class="tracker-card" style="margin-top: 24px;">
      <h3 class="tracker-title">Pulse Achievements & Loyalty Program</h3>
      <div style="display:flex; flex-direction:column; gap:16px; margin-top:12px;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-charcoal); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="color: var(--accent-orange); display:flex; align-items:center;">
              ${getMaterialIcon('trophy', 'badge-trophy-icon')}
            </div>
            <div>
              <h4 style="font-size:0.95rem;">Bronze Betting Streak</h4>
              <p style="font-size:0.8rem; color:var(--text-muted);">Place 5 distinct live bets (Completed: 2/5)</p>
            </div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:var(--text-secondary);">Target: KES 1,000 Free Bet</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-charcoal); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="color: var(--accent-emerald); display:flex; align-items:center;">
              ${getMaterialIcon('trophy', 'badge-trophy-icon')}
            </div>
            <div>
              <h4 style="font-size:0.95rem;">Parlay Master</h4>
              <p style="font-size:0.8rem; color:var(--text-muted);">Win a parlay with 4+ legs (Completed: 1/1)</p>
            </div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:var(--accent-emerald);">CLAIMED: 25% Boost</span>
        </div>

      </div>
    </div>
  `;

  // Bind Promo Claim Click Events
  container.querySelectorAll('.promo-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert("Success! You are now enrolled in this promotion! Place qualifying bets to trigger rewards automatically.");
    });
  });
}
export default renderPromotionsView;
