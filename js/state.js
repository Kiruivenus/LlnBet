// Global Application State (MongoDB & JWT Session Integration)

class State {
  constructor() {
    let savedSelections = [];
    let savedStakes = {};
    try {
      const s = localStorage.getItem('betpulse_betslip_selections');
      const st = localStorage.getItem('betpulse_betslip_stakes');
      if (s) savedSelections = JSON.parse(s);
      if (st) savedStakes = JSON.parse(st);
    } catch (e) {}

    this.data = {
      isLoggedIn: false,
      token: localStorage.getItem('betpulse_token') || null,
      user: null, // { id, phone, name, balance, bonusBalance, verified }
      betslip: {
        mode: 'single', // 'single', 'multi'
        selections: savedSelections, // { id, matchId, matchName, team, market, odds }
        stakes: savedStakes
      },
      currentPage: 'home',
      selectedMatchId: null,
      searchQuery: '',
      placedBets: [],
      transactions: [],
      notifications: [],
      activeSport: 'football'
    };

    this.listeners = {};
    this.initSession();
  }

  persistBetslip() {
    try {
      localStorage.setItem('betpulse_betslip_selections', JSON.stringify(this.data.betslip.selections));
      localStorage.setItem('betpulse_betslip_stakes', JSON.stringify(this.data.betslip.stakes));
    } catch (e) {}
  }

  // Restore authenticated user session from MongoDB on boot
  async initSession() {
    const token = localStorage.getItem('betpulse_token');
    if (!token) {
      this.data.isLoggedIn = false;
      this.data.user = null;
      this.notify('user');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        this.data.isLoggedIn = true;
        this.data.token = token;
        this.data.user = data.user;
        this.notify('user');
        this.fetchUserData();
      } else {
        // Token invalid or expired
        this.logout();
      }
    } catch (e) {
      console.warn("Session restore error:", e);
    }
  }

  // Fetch user bets, transactions, and notifications from MongoDB
  async fetchUserData() {
    if (!this.data.isLoggedIn || !this.data.token) return;

    try {
      const headers = { 'Authorization': `Bearer ${this.data.token}` };

      // Fetch bets
      fetch('/api/bets/my-bets', { headers })
        .then(r => r.ok ? r.json() : [])
        .then(bets => {
          this.data.placedBets = bets;
          this.notify('placedBets');
        }).catch(() => {});

      // Fetch transactions
      fetch('/api/wallet/transactions', { headers })
        .then(r => r.ok ? r.json() : [])
        .then(txs => {
          this.data.transactions = txs;
          this.notify('transactions');
        }).catch(() => {});

      // Fetch notifications
      fetch('/api/notifications', { headers })
        .then(r => r.ok ? r.json() : [])
        .then(notifs => {
          this.data.notifications = notifs;
          this.notify('notifications');
        }).catch(() => {});

    } catch (e) {
      console.warn("Error fetching user MongoDB records:", e);
    }
  }

  // Refresh user profile & balance from MongoDB
  async refreshUserData() {
    if (!this.data.token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${this.data.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.data.user = data.user;
        this.notify('user');
      }
    } catch (e) {}
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }

  // Notify subscribers
  notify(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(this.data[key], this.data));
    }
    if (this.listeners['*']) {
      this.listeners['*'].forEach(callback => callback(this.data));
    }
  }

  // Navigation page switcher
  setPage(page, matchId = null) {
    this.data.currentPage = page;
    this.data.selectedMatchId = matchId;
    this.notify('currentPage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Betslip selections management
  addSelection(selection) {
    const existingIndex = this.data.betslip.selections.findIndex(s => s.id === selection.id);
    if (existingIndex > -1) {
      this.removeSelection(selection.id);
      return;
    }

    this.data.betslip.selections = this.data.betslip.selections.filter(s => s.matchId !== selection.matchId);
    this.data.betslip.selections.push(selection);
    
    if (!this.data.betslip.stakes[selection.id]) {
      this.data.betslip.stakes[selection.id] = 200; // Default KES 200 stake
    }

    this.persistBetslip();
    this.notify('betslip');
  }

  removeSelection(selectionId) {
    this.data.betslip.selections = this.data.betslip.selections.filter(s => s.id !== selectionId);
    delete this.data.betslip.stakes[selectionId];
    this.persistBetslip();
    this.notify('betslip');
  }

  clearBetslip() {
    this.data.betslip.selections = [];
    this.data.betslip.stakes = {};
    this.persistBetslip();
    this.notify('betslip');
  }

  setBetslipMode(mode) {
    this.data.betslip.mode = mode;
    this.persistBetslip();
    this.notify('betslip');
  }

  setSelectionStake(selectionId, stake) {
    this.data.betslip.stakes[selectionId] = parseFloat(stake) || 0;
    this.persistBetslip();
    this.notify('betslip');
  }

  // User Login Action against MongoDB
  async login(phone, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed.");
    }

    localStorage.setItem('betpulse_token', data.token);
    this.data.isLoggedIn = true;
    this.data.token = data.token;
    this.data.user = data.user;

    this.notify('user');
    this.fetchUserData();
    return data;
  }

  // User Registration Action against MongoDB
  async register(phone, password, name) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, name })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed.");
    }

    localStorage.setItem('betpulse_token', data.token);
    this.data.isLoggedIn = true;
    this.data.token = data.token;
    this.data.user = data.user;

    this.notify('user');
    this.fetchUserData();
    return data;
  }

  // User Logout Action
  logout() {
    localStorage.removeItem('betpulse_token');
    this.data.isLoggedIn = false;
    this.data.token = null;
    this.data.user = null;
    this.data.placedBets = [];
    this.data.transactions = [];
    this.data.notifications = [];
    this.clearBetslip();
    this.notify('user');
    this.setPage('home');
  }

  // Real Bet Placement against MongoDB (Deducts real balance)
  async placeBet(stake, totalOdds, possiblePayout) {
    if (!this.data.isLoggedIn || !this.data.token) {
      throw new Error("Please login to place bets.");
    }

    const res = await fetch('/api/bets/place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.data.token}`
      },
      body: JSON.stringify({
        selections: this.data.betslip.selections,
        stake: Number(stake),
        totalOdds: Number(totalOdds),
        possiblePayout: Number(possiblePayout)
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Bet placement failed.");
    }

    // Update real balance
    if (this.data.user) {
      this.data.user.balance = data.newBalance;
    }

    this.clearBetslip();
    this.notify('user');
    this.fetchUserData();
    return data.bet;
  }

  // Real Withdrawal Request against MongoDB (MIN KES 200)
  async withdraw(amount, phone) {
    if (!this.data.isLoggedIn || !this.data.token) {
      throw new Error("Please login to request a withdrawal.");
    }

    const numericAmount = Number(amount);
    if (numericAmount < 200) {
      throw new Error("Minimum withdrawal amount is KES 200.");
    }

    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.data.token}`
      },
      body: JSON.stringify({ amount: numericAmount, phone })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Withdrawal failed.");
    }

    if (this.data.user) {
      this.data.user.balance = data.newBalance;
    }

    this.notify('user');
    this.fetchUserData();
    return data;
  }

  setSport(sportKey) {
    this.data.activeSport = sportKey;
    this.notify('activeSport');
  }

  setSearch(query) {
    this.data.searchQuery = query;
    this.notify('searchQuery');
  }
}

export const state = new State();
export default state;
