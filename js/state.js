// Global Application State
class State {
  constructor() {
    this.data = {
      user: {
        username: "PatrikBetson",
        email: "patrik.betson@gmail.com",
        balance: 150000.00, // KES 150,000.00
        kycVerified: true,
        currency: "KES"
      },
      betslip: {
        mode: 'single', // 'single', 'multi', 'system'
        selections: [], // { id, matchId, matchName, team, market, odds, selectedOddIndex }
        stakes: {} // matchId/selectionId -> stake value
      },
      currentPage: 'home', // 'home', 'live', 'match-details', 'wallet', 'promotions', 'dashboard'
      selectedMatchId: null,
      searchQuery: '',
      placedBets: [
        {
          id: "TX-7821A",
          date: "2026-07-17 19:40",
          type: "Multi (2 Fold)",
          stake: 5000.00,
          odds: 3.42,
          winnings: 17100.00,
          status: "won",
          selections: [
            { team: "Arsenal", market: "Match Result (1)", odds: 1.80, matchName: "Arsenal vs Chelsea" },
            { team: "Real Madrid", market: "Match Result (1)", odds: 1.90, matchName: "Real Madrid vs Barcelona" }
          ]
        },
        {
          id: "TX-9902B",
          date: "2026-07-18 10:15",
          type: "Single",
          stake: 1000.00,
          odds: 2.10,
          winnings: 0.00,
          status: "active",
          selections: [
            { team: "Lakers", market: "Money Line (1)", odds: 2.10, matchName: "Lakers vs Celtics" }
          ]
        }
      ],
      transactions: [
        { id: "TXN-887", type: "Deposit", date: "2026-07-17 14:30", amount: 5000.00, method: "M-Pesa Mobile", status: "success" },
        { id: "TXN-886", type: "Deposit", date: "2026-07-16 09:12", amount: 15000.00, method: "M-Pesa Mobile", status: "success" }
      ],
      activeSport: 'football'
    };

    this.listeners = {};
  }

  // Subscribe to changes in specific state keys
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }

  // Notify all subscribers of a key
  notify(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(this.data[key], this.data));
    }
    if (this.listeners['*']) {
      this.listeners['*'].forEach(callback => callback(this.data));
    }
  }

  // Set page and trigger navigation updates
  setPage(page, matchId = null) {
    this.data.currentPage = page;
    this.data.selectedMatchId = matchId;
    this.notify('currentPage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Add a betting selection
  addSelection(selection) {
    const existingIndex = this.data.betslip.selections.findIndex(s => s.id === selection.id);
    if (existingIndex > -1) {
      this.removeSelection(selection.id);
      return;
    }

    this.data.betslip.selections = this.data.betslip.selections.filter(s => s.matchId !== selection.matchId);
    this.data.betslip.selections.push(selection);
    
    if (!this.data.betslip.stakes[selection.id]) {
      this.data.betslip.stakes[selection.id] = 1000; // Default KES 1,000 stake
    }

    this.notify('betslip');
  }

  // Remove a betting selection
  removeSelection(selectionId) {
    this.data.betslip.selections = this.data.betslip.selections.filter(s => s.id !== selectionId);
    delete this.data.betslip.stakes[selectionId];
    this.notify('betslip');
  }

  // Update odds of an existing selection
  updateSelectionOdds(selectionId, newOdds) {
    const selection = this.data.betslip.selections.find(s => s.id === selectionId);
    if (selection) {
      selection.odds = newOdds;
      this.notify('betslip');
    }
  }

  // Clear all selections
  clearBetslip() {
    this.data.betslip.selections = [];
    this.data.betslip.stakes = {};
    this.notify('betslip');
  }

  // Set betslip mode
  setBetslipMode(mode) {
    this.data.betslip.mode = mode;
    this.notify('betslip');
  }

  // Update selection stake
  setSelectionStake(selectionId, stake) {
    this.data.betslip.stakes[selectionId] = parseFloat(stake) || 0;
    this.notify('betslip');
  }

  // Deposit funds
  deposit(amount, method) {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return false;
    
    this.data.user.balance += amt;
    
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.data.transactions.unshift({
      id: "TXN-" + Math.floor(Math.random() * 900 + 100),
      type: "Deposit",
      date: dateStr,
      amount: amt,
      method: method,
      status: "success"
    });

    this.notify('user');
    this.notify('transactions');
    return true;
  }

  // Withdraw funds
  withdraw(amount, method) {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || amt > this.data.user.balance) return false;

    this.data.user.balance -= amt;

    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.data.transactions.unshift({
      id: "TXN-" + Math.floor(Math.random() * 900 + 100),
      type: "Withdrawal",
      date: dateStr,
      amount: amt,
      method: method,
      status: "success"
    });

    this.notify('user');
    this.notify('transactions');
    return true;
  }

  // Place bet
  placeBet(totalStake) {
    const amt = parseFloat(totalStake);
    if (isNaN(amt) || amt <= 0 || amt > this.data.user.balance || this.data.betslip.selections.length === 0) {
      return false;
    }

    this.data.user.balance -= amt;

    const selectionsCopy = JSON.parse(JSON.stringify(this.data.betslip.selections));
    const isMulti = this.data.betslip.mode === 'multi' && selectionsCopy.length > 1;
    
    let combinedOdds = 1.0;
    selectionsCopy.forEach(s => {
      combinedOdds *= s.odds;
    });
    
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBet = {
      id: "TX-" + Math.floor(Math.random() * 9000 + 1000) + "K",
      date: dateStr,
      type: isMulti ? `Multi (${selectionsCopy.length} Fold)` : "Single",
      stake: amt,
      odds: isMulti ? parseFloat(combinedOdds.toFixed(2)) : selectionsCopy[0].odds,
      winnings: 0.00,
      status: "active",
      selections: selectionsCopy.map(s => ({
        team: s.team,
        market: s.market,
        odds: s.odds,
        matchName: s.matchName
      }))
    };

    this.data.placedBets.unshift(newBet);
    this.clearBetslip();
    this.notify('user');
    this.notify('placedBets');
    return newBet;
  }

  // Cash out a bet early
  cashOutBet(betId, cashOutValue) {
    const bet = this.data.placedBets.find(b => b.id === betId);
    if (bet && bet.status === 'active') {
      bet.status = 'won';
      bet.winnings = cashOutValue;
      this.data.user.balance += cashOutValue;

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.data.transactions.unshift({
        id: "TXN-" + Math.floor(Math.random() * 900 + 100),
        type: "Cashout",
        date: dateStr,
        amount: cashOutValue,
        method: "Bet Cashout",
        status: "success"
      });

      this.notify('user');
      this.notify('placedBets');
      this.notify('transactions');
      return true;
    }
    return false;
  }

  // Select sport category
  setSport(sportKey) {
    this.data.activeSport = sportKey;
    this.notify('activeSport');
  }

  // Set Search Query
  setSearch(query) {
    this.data.searchQuery = query;
    this.notify('searchQuery');
  }
}

export const state = new State();
export default state;
