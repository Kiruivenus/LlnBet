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
    <div style="background:var(--bg-charcoal); border:1px solid var(--border-color); border-radius:var(--radius-lg); overflow:hidden; display:flex; flex-direction:column; height:calc(100vh - var(--header-height) - 180px); min-height:480px; max-width:600px; margin:0 auto; box-shadow: var(--shadow-lg);">
      
      <!-- Chat Header -->
      <div style="background:var(--bg-obsidian); padding:16px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="position:relative; width:40px; height:40px; background:var(--accent-emerald-glow); color:var(--accent-emerald); border-radius:50%; display:flex; align-items:center; justify-content:center; border: 1px solid var(--border-color);">
            <img src="/img/logo.png" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Alice Bot Avatar" />
            <span style="position:absolute; bottom:2px; right:2px; width:10px; height:10px; background:#00e676; border-radius:50%; border:2px solid var(--bg-obsidian);"></span>
          </div>
          <div>
            <h4 style="font-size:0.92rem; font-weight:800; color:var(--text-primary);">Alice (LlnBet Assistant)</h4>
            <p style="font-size:0.75rem; color:var(--accent-emerald); font-weight: 600;">Active Online • Responds Instantly</p>
          </div>
        </div>
        <span style="background:var(--accent-emerald-glow); color:var(--accent-emerald); font-size:0.7rem; padding:4px 10px; font-weight:800; border-radius:var(--radius-sm); letter-spacing: 0.05em;">ONLINE</span>
      </div>

      <!-- Message History List -->
      <div id="support-chat-history" style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:16px; background: rgba(0,0,0,0.02);">
        <div style="align-self:flex-start; max-width:80%; background:var(--bg-obsidian); padding:12px 16px; border-radius:16px 16px 16px 4px; font-size:0.9rem; line-height:1.4; border:1px solid var(--border-color); color: var(--text-primary); animation: scale-up 0.15s ease-out;">
          Welcome to LlnBet live chat support desk! My name is Alice. How can I help you today?
        </div>
      </div>

      <!-- Typing Indicator Box (Hidden by default) -->
      <div id="chat-typing-indicator" style="display: none; align-self: flex-start; max-width: 80%; background: var(--bg-obsidian); padding: 10px 16px; border-radius: 16px 16px 16px 4px; margin-left: 20px; margin-bottom: 12px; border: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-muted);">
        Alice is typing<span class="typing-dots">...</span>
      </div>

      <!-- Quick Reply Suggester Chips -->
      <div style="padding: 10px 16px; background: var(--bg-obsidian); border-top: 1px solid var(--border-color); display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="support-chip-btn" data-query="How to deposit?" style="background: var(--bg-charcoal); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: var(--radius-full); padding: 6px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">💳 How to deposit?</button>
        <button class="support-chip-btn" data-query="How to withdraw?" style="background: var(--bg-charcoal); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: var(--radius-full); padding: 6px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">💰 How to withdraw?</button>
        <button class="support-chip-btn" data-query="Refer & Earn program" style="background: var(--bg-charcoal); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: var(--radius-full); padding: 6px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">👥 Refer & Earn?</button>
        <button class="support-chip-btn" data-query="Active promotions" style="background: var(--bg-charcoal); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: var(--radius-full); padding: 6px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">🎁 Promotions</button>
      </div>

      <!-- User Message input panel -->
      <div style="background:var(--bg-obsidian); padding:12px 16px; border-top:1px solid var(--border-color); display:flex; align-items:center; gap:12px;">
        <input type="text" id="support-chat-input" placeholder="Type a message..." style="flex:1; background:var(--bg-charcoal); border:1px solid var(--border-color); color:var(--text-primary); border-radius:var(--radius-full); padding:10px 16px; outline:none; font-size:0.9rem;" />
        <button id="support-chat-send" style="background:var(--accent-emerald); color:var(--bg-obsidian); border:none; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; outline:none;">
          ${getMaterialIcon('send')}
        </button>
      </div>

    </div>
  `;

  const chatHistory = document.getElementById('support-chat-history');
  const chatInput = document.getElementById('support-chat-input');
  const sendBtn = document.getElementById('support-chat-send');
  const typingIndicator = document.getElementById('chat-typing-indicator');

  const addMessage = (text, isUser = false) => {
    const msgDiv = document.createElement('div');
    msgDiv.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
    msgDiv.style.maxWidth = '80%';
    msgDiv.style.padding = '12px 16px';
    msgDiv.style.fontSize = '0.9rem';
    msgDiv.style.lineHeight = '1.4';
    msgDiv.style.animation = 'scale-up 0.15s ease-out';
    
    if (isUser) {
      msgDiv.style.background = 'var(--accent-emerald)';
      msgDiv.style.color = 'var(--bg-obsidian)';
      msgDiv.style.borderRadius = '16px 16px 4px 16px';
      msgDiv.style.fontWeight = '600';
      msgDiv.style.boxShadow = '0 2px 4px rgba(0,230,118,0.1)';
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

  const getBotReply = (userQuery) => {
    const q = userQuery.toLowerCase();
    if (q.includes('deposit') || q.includes('recharge') || q.includes('funding')) {
      return "To deposit, go to your Profile (bottom nav), choose Deposit, enter amount and click Deposit with M-Pesa. An STK push PIN prompt will appear instantly on your phone handset!";
    }
    if (q.includes('withdraw') || q.includes('payout') || q.includes('cashout')) {
      return "Withdrawals are processed instantly through Safaricom M-Pesa. Open Profile (bottom nav) > Withdrawal, enter your amount and confirm to receive cash instantly.";
    }
    if (q.includes('refer') || q.includes('earn') || q.includes('friend')) {
      return "You can earn KES 500.00 for every friend you refer! Simply click 'Refer & Earn' on the sidebar or mobile menu to copy your unique signup link.";
    }
    if (q.includes('bonus') || q.includes('promo') || q.includes('promotions')) {
      return "LlnBet offers KES 1,000 Signup Promotion balance for new users, 100% matchup deposit bonuses up to KES 50,000, and weekly accumulator multipliers!";
    }
    if (q.includes('limit') || q.includes('exclude')) {
      return "To set daily limits or request temporary self-exclusion, navigate to Profile > Responsible Gaming. Suspension requests are applied instantly.";
    }
    return "Thank you for reaching out! We have registered your request. An online service agent will review it and follow up via phone/SMS shortly.";
  };

  const handleSend = (textToSend = null) => {
    const text = textToSend || chatInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    if (!textToSend) chatInput.value = '';

    // Show typing state indicator
    typingIndicator.style.display = 'block';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    setTimeout(() => {
      typingIndicator.style.display = 'none';
      const reply = getBotReply(text);
      addMessage(reply, false);
    }, 1200);
  };

  sendBtn?.addEventListener('click', () => handleSend());
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // Bind quick reply chip button events
  container.querySelectorAll('.support-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      handleSend(q);
    });
  });

  document.getElementById('support-back-btn')?.addEventListener('click', () => {
    state.setPage('profile');
  });
}
export default renderSupportView;
