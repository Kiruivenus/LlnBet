import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderLoginView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <div class="auth-page-container">
      <div class="auth-card">
        
        <div class="auth-header">
          <img src="/img/logo.png" style="display:block; margin: 0 auto; width: 44px; height: 44px; border-radius: 8px; object-fit:cover;" alt="LlnBet Logo" />
          <h2 class="auth-title" style="margin-top: 10px;">Login to LlnBet</h2>
          <p class="auth-subtitle">Enter your Kenyan mobile number and password to access your betting account</p>
        </div>

        <div class="auth-error-badge" id="login-error-badge" style="display:none; background:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#ef4444; padding:10px; border-radius:var(--radius-sm); font-size:0.85rem; margin-bottom:14px; text-align:center;"></div>

        <form id="login-form" onsubmit="return false;">
          
          <!-- Mobile Input -->
          <div class="auth-form-group">
            <label class="auth-input-label" for="login-phone-num">Kenyan Mobile Number</label>
            <div class="auth-phone-wrapper">
              <span class="auth-phone-prefix">+254</span>
              <input type="tel" class="auth-input" id="login-phone-num" placeholder="712345678" maxlength="9" required autocomplete="tel" />
            </div>
            <p style="font-size:0.7rem; color:var(--text-muted);">Enter 9 digits (e.g. 712345678 or 112345678)</p>
          </div>

          <!-- Password Input -->
          <div class="auth-form-group">
            <label class="auth-input-label" for="login-password-val">Password</label>
            <div class="auth-pw-wrapper">
              <input type="password" class="auth-input" id="login-password-val" placeholder="••••••••" required autocomplete="current-password" />
              <button type="button" class="auth-pw-toggle" id="login-pw-toggle-btn" aria-label="Toggle Password Visibility">
                ${getMaterialIcon('visibility')}
              </button>
            </div>
          </div>

          <!-- Action buttons -->
          <button type="submit" class="auth-btn" id="login-submit-btn" style="margin-top: 10px;">
            Login
          </button>

        </form>

        <div class="auth-footer">
          Don't have an account? 
          <a href="#" class="auth-link" id="login-to-register-link">Register Here</a>
        </div>

      </div>
    </div>
  `;

  const phoneInput = document.getElementById('login-phone-num');
  const passwordInput = document.getElementById('login-password-val');
  const errorBadge = document.getElementById('login-error-badge');
  const togglePwBtn = document.getElementById('login-pw-toggle-btn');
  const submitBtn = document.getElementById('login-submit-btn');

  // Toggle password visibility
  togglePwBtn?.addEventListener('click', () => {
    const isPw = passwordInput.type === 'password';
    passwordInput.type = isPw ? 'text' : 'password';
    togglePwBtn.innerHTML = getMaterialIcon(isPw ? 'visibility_off' : 'visibility');
  });

  // Handle number input restriction (9 digits only)
  phoneInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 9);
  });

  // Handle Form Submission
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBadge.style.display = 'none';

    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (phone.length !== 9 || !(/^[17]\d{8}$/.test(phone))) {
      errorBadge.textContent = "Please enter a valid 9-digit Kenyan phone number starting with 7 or 1.";
      errorBadge.style.display = 'block';
      return;
    }

    if (password.length === 0) {
      errorBadge.textContent = "Please enter your password.";
      errorBadge.style.display = 'block';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Authenticating...";

      await state.login(phone, password);
      alert("Welcome back to LlnBet! Login successful.");
      if (state.data.user && state.data.user.role === 'ADMIN') {
        state.setPage('admin');
      } else {
        state.setPage('home');
      }
    } catch (err) {
      errorBadge.textContent = err.message || "Invalid login credentials.";
      errorBadge.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });

  // Register link redirection
  document.getElementById('login-to-register-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.setPage('register');
  });
}
export default renderLoginView;
