import { state } from '../state.js';
import { simulation } from '../simulation.js';
import { getMaterialIcon } from '../utils.js';

export function renderSearchModal() {
  const container = document.getElementById('search-modal');
  if (!container) return;

  const matches = simulation.getMatches();
  const trendingMatches = matches.slice(0, 6);

  container.innerHTML = `
    <div class="search-modal-container">
      <div class="search-modal-header">
        ${getMaterialIcon('search')}
        <input type="text" class="search-modal-input" placeholder="Search real teams, leagues, countries..." id="search-input-field" autocomplete="off" />
        <button class="search-modal-close" id="search-close-btn">${getMaterialIcon('close')}</button>
      </div>
      <div class="search-modal-results" id="search-results-area">
        <!-- Render initial dynamic recommendations -->
        <div class="search-result-group-title">Trending Live & Upcoming Matches</div>
        <ul class="search-result-list" id="search-initial-list">
          ${trendingMatches.length === 0 ? `
            <div style="padding:20px; color:var(--text-muted); text-align:center; font-size:0.9rem;">
              Loading sports scoreboard calendar...
            </div>
          ` : trendingMatches.map(match => `
            <li class="search-result-item" data-id="${match.id}">
              <div>
                <div class="search-result-title">${match.teams.home.name} vs ${match.teams.away.name}</div>
                <div class="search-result-subtitle">${match.sport.toUpperCase()} • ${match.league} • ${match.isLive ? 'Live In-Play' : match.kickoffTime}</div>
              </div>
              ${getMaterialIcon('trend', 'trend-icon')}
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;

  const inputField = document.getElementById('search-input-field');
  const closeBtn = document.getElementById('search-close-btn');
  const resultsArea = document.getElementById('search-results-area');

  const closeModal = () => {
    container.classList.remove('active');
    inputField.value = '';
  };

  closeBtn?.addEventListener('click', closeModal);

  container.addEventListener('click', (e) => {
    if (e.target === container) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || e.key === '/') {
      e.preventDefault();
      container.classList.add('active');
      inputField.focus();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Dynamic Real-Time Match Search Handler
  inputField?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderSearchModal();
      return;
    }

    const currentMatches = simulation.getMatches();

    const filtered = currentMatches.filter(match => {
      const home = match.teams.home.name.toLowerCase();
      const away = match.teams.away.name.toLowerCase();
      const matchTitle = `${home} vs ${away}`;
      const league = (match.league || '').toLowerCase();
      const country = (match.country || '').toLowerCase();
      const sport = (match.sport || '').toLowerCase();

      return home.includes(q) || 
             away.includes(q) || 
             matchTitle.includes(q) || 
             league.includes(q) || 
             country.includes(q) || 
             sport.includes(q);
    });

    if (filtered.length === 0) {
      resultsArea.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 0; color:var(--text-muted);">
          ${getMaterialIcon('info', 'info-icon')}
          <span style="margin-top:10px; font-size:0.95rem;">No matching fixtures found for "${e.target.value}"</span>
        </div>
      `;
      return;
    }

    let html = `<div class="search-result-group-title">Real-World Matches (${filtered.length})</div><ul class="search-result-list">`;
    filtered.forEach(match => {
      html += `
        <li class="search-result-item" data-id="${match.id}">
          <div>
            <div class="search-result-title">${match.teams.home.name} vs ${match.teams.away.name}</div>
            <div class="search-result-subtitle">${match.country ? match.country + ' • ' : ''}${match.league} • ${match.isLive ? 'Live In-Play' : match.kickoffTime}</div>
          </div>
          ${getMaterialIcon('back', 'icon-rotated')}
        </li>
      `;
    });
    html += `</ul>`;
    resultsArea.innerHTML = html;

    resultsArea.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        closeModal();
        if (id) {
          state.setPage('match-details', id);
        }
      });
    });
  });

  // Bind initial trending recommendations list items
  document.querySelectorAll('#search-initial-list .search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      closeModal();
      if (id) {
        state.setPage('match-details', id);
      }
    });
  });
}
export default renderSearchModal;
