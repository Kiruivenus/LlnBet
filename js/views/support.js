import { state } from '../state.js';
import { getMaterialIcon } from '../utils.js';

export function renderSupportView() {
  const container = document.getElementById('app-main');
  if (!container) return;

  container.innerHTML = `
    <!-- Header Back Navigation -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <button class="icon-btn" id="support-back-btn" aria-label="Go Back">
        ${getMaterialIcon('back')}
      </button>
      <span style="font-size: 0.95rem; font-weight:600; color:var(--text-secondary);">Back to Profile</span>
    </div>

    <!-- Live Helpdesk Desk -->
    <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); overflow:hidden; display:flex; flex-direction:column; height:calc(100vh - var(--header-height) - 180px); min-height:450px; max-width:600px; margin:0 auto;">
      
      <!-- Chat Header -->
      <div style="background:var(--bg-obsidian); padding:16px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="position:relative; width:40px; height:40px; background:var(--accent-emerald-glow); color:var(--accent-emerald); border-radius:50%; display:flex; align-items:center; justify-content:center;">
            ${getMaterialIcon('user')}
            <span style="position:absolute; bottom:2px; right:2px; width:8px; height:8px; background:#00e676; border-radius:50%; border:2px solid var(--bg-obsidian);"></span>
          </div>
          <div>
            <h4 style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Alice (LlnBet Bot Helpdesk)</h4>
            <p style="font-size:0.75rem; color:var(--text-muted);">Active Online • Average reply 10s</p>
          </div>
        </div>
        <span style="background:var(--accent-emerald-glow); color:var(--accent-emerald); font-size:0.75rem; padding:4px 10px; font-weight:700; border-radius:var(--radius-sm);">ONLINE</span>
      </div>

      <!-- Message History List -->
      <div id="support-chat-history" style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:16px;">
        <div style="align-self:flex-start; max-width:80%; background:var(--bg-obsidian); padding:12px 16px; border-radius:16px 16px 16px 4px; font-size:0.9rem; line-height:1.4; border:1px solid var(--border-color);">
          Welcome to LlnBet live chat support desk! My name is Alice. How can I help you today?
        </div>
      </div>

      <!-- User Message input panel -->
      <div style="background:var(--bg-obsidian); padding:12px 16px; border-top:1px solid var(--border-color); display:flex; align-items:center; gap:12px;">
        <input type="text" id="support-chat-input" placeholder="Ask about deposits, payouts, limits..." style="flex:1; background:var(--bg-charcoal); border:1px solid var(--border-color); color:var(--text-primary); border-radius:var(--radius-full); padding:10px 16px; outline:none; font-size:0.9rem;" />
        <button id="support-chat-send" style="background:var(--accent-emerald); color:var(--bg-obsidian); border:none; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; outline:none;">
          ${getMaterialIcon('send')}
        </button>
      </div>

    </div>
  `;

  const chatHistory = document.getElementById('support-chat-history');
  const chatInput = document.getElementById('support-chat-input');
  const sendBtn = document.getElementById('support-chat-send');

  const addMessage = (text, isUser = false) => {
    const msgDiv = document.createElement('div');
    msgDiv.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
    msgDiv.style.maxWidth = '80%';
    msgDiv.style.padding = '12px 16px';
    msgDiv.style.fontSize = '0.9rem';
    msgDiv.style.lineHeight = '1.4';
    
    if (isUser) {
      msgDiv.style.background = 'var(--accent-emerald)';
      msgDiv.style.color = 'var(--bg-obsidian)';
      msgDiv.style.borderRadius = '16px 16px 4px 16px';
      msgDiv.style.fontWeight = '600';
    } else {
      msgDiv.style.background = 'var(--bg-obsidian)';
      msgDiv.style.color = 'var(--text-primary)';
      msgDiv.style.borderRadius = '16px 16px 16px 4px';
      msgDiv.style.border = '1px solid var(--border-color)';
    }

    msgDiv.textContent = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  // Bot mock replies logic
  const getBotReply = (userQuery) => {
    const q = userQuery.toLowerCase();
    if (q.includes('deposit') || q.includes('recharge') || q.includes('funding')) {
      return "To deposit, click Profile in bottom nav bar and select Safaricom M-Pesa. It will send a secure STK push verification code directly to your phone.";
    }
    if (q.includes('withdraw') || q.includes('payout') || q.includes('cashout')) {
      return "All withdrawals are processed instantly to your registered Kenyan mobile number. Tap Profile > Withdraw to submit request.";
    }
    if (q.includes('bonus') || q.includes('promo')) {
      return "New registrations get KES 1,000 Signup Promo balance. First deposits also qualify for a 100% matchup bonus up to KES 50,000.";
    }
    if (q.includes('limit') || q.includes('limitations') || q.includes('self')) {
      return "Under BCLB regulations, you can adjust daily deposit limits or self-exclude under Profile > Responsible Gaming options.";
    }
    return "Thank you for reaching out! We have registered your inquiry. An online support agent will contact you shortly via SMS notification.";
  };

  const handleSend = () => {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    chatInput.value = '';

    // Simulate online typing delay
    setTimeout(() => {
      const reply = getBotReply(text);
      addMessage(reply, false);
    }, 1000);
  };

  sendBtn?.addEventListener('click', handleSend);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  document.getElementById('support-back-btn')?.addEventListener('click', () => {
    state.setPage('profile');
  });
}
export default renderSupportView;
