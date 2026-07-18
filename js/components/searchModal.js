import { state } from '../state.js';
import { searchDatabase } from '../data.js';
import { getMaterialIcon } from '../utils.js';

export function renderSearchModal() {
  const container = document.getElementById('search-modal');
  if (!container) return;

  container.innerHTML = `
    <div class="search-modal-container">
      <div class="search-modal-header">
        ${getMaterialIcon('search')}
        <input type="text" class="search-modal-input" placeholder="Type team, player, or league..." id="search-input-field" autocomplete="off" />
        <button class="search-modal-close" id="search-close-btn">${getMaterialIcon('close')}</button>
      </div>
      <div class="search-modal-results" id="search-results-area">
        <!-- Render initial recommendations -->
        <div class="search-result-group-title">Trending Searches</div>
        <ul class="search-result-list" id="search-initial-list">
          <li class="search-result-item" data-id="fb_1">
            <div>
              <div class="search-result-title">Arsenal vs Chelsea</div>
              <div class="search-result-subtitle">Football • Premier League • Live</div>
            </div>
            ${getMaterialIcon('trend', 'trend-icon')}
          </li>
          <li class="search-result-item" data-id="bb_1">
            <div>
              <div class="search-result-title">Lakers vs Celtics</div>
              <div class="search-result-subtitle">Basketball • NBA • Live</div>
            </div>
            ${getMaterialIcon('trend', 'trend-icon')}
          </li>
          <li class="search-result-item" data-id="fb_2">
            <div>
              <div class="search-result-title">Real Madrid vs Barcelona</div>
              <div class="search-result-subtitle">Football • La Liga • Live</div>
            </div>
            ${getMaterialIcon('trend', 'trend-icon')}
          </li>
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

  closeBtn.addEventListener('click', closeModal);

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

  inputField.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderSearchModal();
      return;
    }

    const filtered = searchDatabase.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      resultsArea.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 0; color:var(--text-muted);">
          ${getMaterialIcon('info', 'info-icon')}
          <span style="margin-top:10px; font-size:0.95rem;">No results found for "${e.target.value}"</span>
        </div>
      `;
      return;
    }

    let html = `<div class="search-result-group-title">Matches & Events</div><ul class="search-result-list">`;
    filtered.forEach(item => {
      html += `
        <li class="search-result-item" data-id="${item.id}" data-type="${item.type}" data-sport="${item.sport}">
          <div>
            <div class="search-result-title">${item.title}</div>
            <div class="search-result-subtitle">${item.subtitle}</div>
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
        const sport = item.getAttribute('data-sport');

        closeModal();

        if (id) {
          state.setPage('match-details', id);
        } else if (sport) {
          state.setSport(sport);
          state.setPage('home');
        }
      });
    });
  });

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
