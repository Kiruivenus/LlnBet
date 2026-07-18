import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderRegisterView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <div class="auth-page-container">
      <div class="auth-card">
        
        <div class="auth-header">
          <div class="brand-logo" style="margin: 0 auto; width: 44px; height: 44px; font-size: 1.3rem;">P</div>
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Register to BetPulse with your Safaricom or Airtel Kenyan number</p>
        </div>

        <div class="auth-error-badge" id="register-error-badge" style="display:none; background:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#ef4444; padding:10px; border-radius:var(--radius-sm); font-size:0.85rem; margin-bottom:14px; text-align:center;"></div>

        <form id="register-form" onsubmit="return false;">
          
          <!-- Mobile Input -->
          <div class="auth-form-group">
            <label class="auth-input-label" for="register-phone-num">Kenyan Mobile Number</label>
            <div class="auth-phone-wrapper">
              <span class="auth-phone-prefix">+254</span>
              <input type="tel" class="auth-input" id="register-phone-num" placeholder="712345678" maxlength="9" required autocomplete="tel" />
            </div>
            <p style="font-size:0.7rem; color:var(--text-muted);">Enter 9 digits (e.g. 712345678 or 112345678)</p>
          </div>

          <!-- Password Input -->
          <div class="auth-form-group">
            <label class="auth-input-label" for="register-password-val">Choose Password</label>
            <div class="auth-pw-wrapper">
              <input type="password" class="auth-input" id="register-password-val" placeholder="••••••••" required autocomplete="new-password" />
              <button type="button" class="auth-pw-toggle" id="register-pw-toggle-btn" aria-label="Toggle Password Visibility">
                ${getMaterialIcon('visibility')}
              </button>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="auth-form-group">
            <label class="auth-input-label" for="register-confirm-password-val">Confirm Password</label>
            <div class="auth-pw-wrapper">
              <input type="password" class="auth-input" id="register-confirm-password-val" placeholder="••••••••" required autocomplete="new-password" />
              <button type="button" class="auth-pw-toggle" id="register-confirm-pw-toggle-btn" aria-label="Toggle Password Visibility">
                ${getMaterialIcon('visibility')}
              </button>
            </div>
          </div>

          <!-- BCLB Terms Checkbox -->
          <div class="auth-checkbox-group">
            <input type="checkbox" id="register-terms-agree" required />
            <label for="register-terms-agree">
              I declare that I am 18 years or older and I agree to BetPulse's 
              <a href="#" class="auth-link" id="auth-terms-popup-link">Terms & Conditions</a>.
            </label>
          </div>

          <!-- Action buttons -->
          <button type="submit" class="auth-btn" id="register-submit-btn">
            Register Account
          </button>

        </form>

        <div class="auth-footer">
          Already have an account? 
          <a href="#" class="auth-link" id="register-to-login-link">Login Here</a>
        </div>

      </div>
    </div>
  `;

  const phoneInput = document.getElementById('register-phone-num');
  const passwordInput = document.getElementById('register-password-val');
  const confirmPasswordInput = document.getElementById('register-confirm-password-val');
  const termsCheckbox = document.getElementById('register-terms-agree');
  const errorBadge = document.getElementById('register-error-badge');
  const submitBtn = document.getElementById('register-submit-btn');
  
  const togglePwBtn = document.getElementById('register-pw-toggle-btn');
  const toggleConfirmPwBtn = document.getElementById('register-confirm-pw-toggle-btn');

  // Toggle password visibility
  togglePwBtn?.addEventListener('click', () => {
    const isPw = passwordInput.type === 'password';
    passwordInput.type = isPw ? 'text' : 'password';
    togglePwBtn.innerHTML = getMaterialIcon(isPw ? 'visibility_off' : 'visibility');
  });

  // Toggle confirm password visibility
  toggleConfirmPwBtn?.addEventListener('click', () => {
    const isPw = confirmPasswordInput.type === 'password';
    confirmPasswordInput.type = isPw ? 'text' : 'password';
    toggleConfirmPwBtn.innerHTML = getMaterialIcon(isPw ? 'visibility_off' : 'visibility');
  });

  // Handle number input restriction (9 digits only)
  phoneInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 9);
  });

  // Handle Form Submission
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBadge.style.display = 'none';

    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const termsChecked = termsCheckbox.checked;

    if (phone.length !== 9 || !(/^[17]\d{8}$/.test(phone))) {
      errorBadge.textContent = "Please enter a valid 9-digit Kenyan phone number starting with 7 or 1.";
      errorBadge.style.display = 'block';
      return;
    }

    if (password.length < 4) {
      errorBadge.textContent = "Password must be at least 4 characters long.";
      errorBadge.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      errorBadge.textContent = "Passwords do not match. Please verify.";
      errorBadge.style.display = 'block';
      return;
    }

    if (!termsChecked) {
      errorBadge.textContent = "You must agree to the Terms & Conditions to proceed.";
      errorBadge.style.display = 'block';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";

      await state.register(phone, password);
      alert("Registration Successful!\n\nWelcome to BetPulse. Your betting account has been created.");
      state.setPage('home');
    } catch (err) {
      errorBadge.textContent = err.message || "Registration failed.";
      errorBadge.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register Account";
    }
  });

  document.getElementById('auth-terms-popup-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Terms & Conditions:\n\n1. All registrants must be 18 years or older.\n2. One registration account per mobile user.\n3. Minimum Deposit KES 200 | Minimum Withdrawal KES 200.");
  });

  document.getElementById('register-to-login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.setPage('login');
  });
}
export default renderRegisterView;
