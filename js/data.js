export const sportsList = [
  { id: 'football', name: 'Football', icon: 'soccer', count: 18 },
  { id: 'basketball', name: 'Basketball', icon: 'basketball', count: 12 },
  { id: 'tennis', name: 'Tennis', icon: 'tennis', count: 9 },
  { id: 'rugby', name: 'Rugby', icon: 'rugby', count: 4 },
  { id: 'cricket', name: 'Cricket', icon: 'cricket', count: 7 },
  { id: 'ice_hockey', name: 'Ice Hockey', icon: 'ice_hockey', count: 6 },
  { id: 'esports', name: 'Esports', icon: 'esports', count: 14 }
];

export const promotionsList = [
  {
    id: 'welcome_offer',
    title: '100% First Deposit Welcome Bonus',
    desc: 'Register today and double your initial deposit up to KES 50,000! Play with extra funds on any sport market of your choice.',
    tag: 'Welcome',
    logoText: 'WELCOME100'
  },
  {
    id: 'free_bet_club',
    title: 'Weekly Free Bet Club',
    desc: 'Place bets totaling KES 5,000 or more on any sports event from Monday to Sunday and receive a KES 1,000 free bet reward on Monday morning.',
    tag: 'Free Bet',
    logoText: 'FREECLUB50'
  },
  {
    id: 'acca_boost',
    title: 'Up to 50% Accumulator Boost',
    desc: 'Combine 3 or more selections (minimum odds 1.30 per selection) and get a boost on your potential winnings. The more legs, the bigger the boost!',
    tag: 'Acca Boost',
    logoText: 'BOOST50'
  },
  {
    id: 'cashback_offer',
    title: '15% Weekly Loss Cashback',
    desc: 'We have your back. Receive a 15% cashback refund on net weekly losses incurred on virtual sports and casino markets.',
    tag: 'Cashback',
    logoText: 'CASHBACK15'
  }
];

export const matchesList = [
  // FOOTBALL Matches
  {
    id: 'fb_1',
    sport: 'football',
    league: 'Premier League',
    country: 'England',
    isLive: true,
    timer: '54',
    scores: { home: 2, away: 1 },
    teams: {
      home: { name: 'Arsenal' },
      away: { name: 'Chelsea' }
    },
    venue: 'Emirates Stadium, London',
    stats: {
      possession: { home: 58, away: 42 },
      shots: { home: 11, away: 7 },
      shotsOnTarget: { home: 5, away: 3 },
      corners: { home: 6, away: 3 },
      yellowCards: { home: 1, away: 2 },
      redCards: { home: 0, away: 0 }
    },
    lineups: {
      home: ['Raya (GK)', 'White', 'Saliba', 'Gabriel', 'Timber', 'Odegaard (C)', 'Rice', 'Merino', 'Saka', 'Havertz', 'Martinelli'],
      away: ['Sanchez (GK)', 'Gusto', 'Fofana', 'Colwill', 'Cucurella', 'Caicedo', 'Enzo (C)', 'Madueke', 'Palmer', 'Neto', 'Jackson']
    },
    h2h: [
      { date: '2025-11-23', score: 'Arsenal 3 - 1 Chelsea', event: 'Premier League' },
      { date: '2025-04-23', score: 'Arsenal 5 - 0 Chelsea', event: 'Premier League' },
      { date: '2024-10-21', score: 'Chelsea 2 - 2 Arsenal', event: 'Premier League' }
    ],
    markets: [
      {
        name: 'Match Outcome (1X2)',
        odds: [
          { selectionId: 'fb_1_1', label: '1 (Arsenal)', value: 1.45 },
          { selectionId: 'fb_1_x', label: 'X (Draw)', value: 3.80 },
          { selectionId: 'fb_1_2', label: '2 (Chelsea)', value: 6.20 }
        ]
      },
      {
        name: 'Double Chance',
        odds: [
          { selectionId: 'fb_1_dc1x', label: '1X (Arsenal or Draw)', value: 1.10 },
          { selectionId: 'fb_1_dc12', label: '12 (Arsenal or Chelsea)', value: 1.25 },
          { selectionId: 'fb_1_dcx2', label: 'X2 (Draw or Chelsea)', value: 2.30 }
        ]
      },
      {
        name: 'Total Goals (Over/Under 2.5)',
        odds: [
          { selectionId: 'fb_1_o25', label: 'Over 2.5', value: 1.70 },
          { selectionId: 'fb_1_u25', label: 'Under 2.5', value: 2.05 }
        ]
      },
      {
        name: 'Both Teams to Score',
        odds: [
          { selectionId: 'fb_1_btts_yes', label: 'Yes', value: 1.65 },
          { selectionId: 'fb_1_btts_no', label: 'No', value: 2.15 }
        ]
      },
      {
        name: 'Draw No Bet',
        odds: [
          { selectionId: 'fb_1_dnb1', label: '1 (Arsenal)', value: 1.15 },
          { selectionId: 'fb_1_dnb2', label: '2 (Chelsea)', value: 4.50 }
        ]
      },
      {
        name: 'Handicap (0:1)',
        odds: [
          { selectionId: 'fb_1_hc1', label: '1 (Arsenal -1)', value: 2.10 },
          { selectionId: 'fb_1_hcx', label: 'X (Handicap Draw)', value: 3.60 },
          { selectionId: 'fb_1_hc2', label: '2 (Chelsea +1)', value: 2.80 }
        ]
      },
      {
        name: 'Correct Score',
        odds: [
          { selectionId: 'fb_1_cs10', label: '1-0 (Arsenal)', value: 6.50 },
          { selectionId: 'fb_1_cs20', label: '2-0 (Arsenal)', value: 7.00 },
          { selectionId: 'fb_1_cs21', label: '2-1 (Arsenal)', value: 8.50 },
          { selectionId: 'fb_1_cs11', label: '1-1 (Draw)', value: 7.50 },
          { selectionId: 'fb_1_cs01', label: '0-1 (Chelsea)', value: 15.00 }
        ]
      },
      {
        name: 'Odd/Even Goals',
        odds: [
          { selectionId: 'fb_1_odd', label: 'Odd', value: 1.95 },
          { selectionId: 'fb_1_even', label: 'Even', value: 1.85 }
        ]
      }
    ]
  },
  {
    id: 'fb_2',
    sport: 'football',
    league: 'La Liga',
    country: 'Spain',
    isLive: true,
    timer: '21',
    scores: { home: 0, away: 0 },
    teams: {
      home: { name: 'Real Madrid' },
      away: { name: 'Barcelona' }
    },
    venue: 'Santiago Bernabeu, Madrid',
    stats: {
      possession: { home: 47, away: 53 },
      shots: { home: 4, away: 5 },
      shotsOnTarget: { home: 2, away: 2 },
      corners: { home: 1, away: 2 },
      yellowCards: { home: 0, away: 1 },
      redCards: { home: 0, away: 0 }
    },
    lineups: {
      home: ['Courtois (GK)', 'Carvajal', 'Militao', 'Rudiger', 'Mendy', 'Valverde', 'Tchouameni', 'Bellingham', 'Rodrygo', 'Mbappe', 'Vinicius Jr.'],
      away: ['Ter Stegen (GK)', 'Kounde', 'Cubarsi', 'Martinez', 'Balde', 'Casado', 'Pedri', 'Yamal', 'Olmo', 'Raphinha', 'Lewandowski']
    },
    h2h: [
      { date: '2025-10-26', score: 'Real Madrid 0 - 4 Barcelona', event: 'La Liga' },
      { date: '2025-04-21', score: 'Real Madrid 3 - 2 Barcelona', event: 'La Liga' },
      { date: '2024-10-28', score: 'Barcelona 1 - 2 Real Madrid', event: 'La Liga' }
    ],
    markets: [
      {
        name: 'Match Outcome (1X2)',
        odds: [
          { selectionId: 'fb_2_1', label: '1 (Real Madrid)', value: 2.10 },
          { selectionId: 'fb_2_x', label: 'X (Draw)', value: 3.40 },
          { selectionId: 'fb_2_2', label: '2 (Barcelona)', value: 3.10 }
        ]
      },
      {
        name: 'Double Chance',
        odds: [
          { selectionId: 'fb_2_dc1x', label: '1X (Real Madrid or Draw)', value: 1.35 },
          { selectionId: 'fb_2_dc12', label: '12 (Real Madrid or Barcelona)', value: 1.25 },
          { selectionId: 'fb_2_dcx2', label: 'X2 (Draw or Barcelona)', value: 1.65 }
        ]
      },
      {
        name: 'Total Goals (Over/Under 2.5)',
        odds: [
          { selectionId: 'fb_2_o25', label: 'Over 2.5', value: 1.55 },
          { selectionId: 'fb_2_u25', label: 'Under 2.5', value: 2.30 }
        ]
      },
      {
        name: 'Both Teams to Score',
        odds: [
          { selectionId: 'fb_2_btts_yes', label: 'Yes', value: 1.48 },
          { selectionId: 'fb_2_btts_no', label: 'No', value: 2.50 }
        ]
      },
      {
        name: 'Draw No Bet',
        odds: [
          { selectionId: 'fb_2_dnb1', label: '1 (Real Madrid)', value: 1.55 },
          { selectionId: 'fb_2_dnb2', label: '2 (Barcelona)', value: 2.25 }
        ]
      },
      {
        name: 'Correct Score',
        odds: [
          { selectionId: 'fb_2_cs10', label: '1-0 (Real Madrid)', value: 9.50 },
          { selectionId: 'fb_2_cs21', label: '2-1 (Real Madrid)', value: 9.00 },
          { selectionId: 'fb_2_cs11', label: '1-1 (Draw)', value: 7.00 },
          { selectionId: 'fb_2_cs12', label: '1-2 (Barcelona)', value: 11.00 },
          { selectionId: 'fb_2_cs02', label: '0-2 (Barcelona)', value: 18.00 }
        ]
      }
    ]
  },
  {
    id: 'fb_3',
    sport: 'football',
    league: 'UEFA Champions League',
    country: 'Europe',
    isLive: false,
    kickoffTime: 'Today, 22:00',
    teams: {
      home: { name: 'Bayern Munich' },
      away: { name: 'Manchester City' }
    },
    venue: 'Allianz Arena, Munich',
    h2h: [
      { date: '2025-04-19', score: 'Bayern 1 - 1 Man City', event: 'Champions League' },
      { date: '2025-04-11', score: 'Man City 3 - 0 Bayern', event: 'Champions League' }
    ],
    markets: [
      {
        name: 'Match Outcome (1X2)',
        odds: [
          { selectionId: 'fb_3_1', label: '1 (Bayern)', value: 2.65 },
          { selectionId: 'fb_3_x', label: 'X (Draw)', value: 3.60 },
          { selectionId: 'fb_3_2', label: '2 (Man City)', value: 2.45 }
        ]
      },
      {
        name: 'Double Chance',
        odds: [
          { selectionId: 'fb_3_dc1x', label: '1X (Bayern or Draw)', value: 1.55 },
          { selectionId: 'fb_3_dc12', label: '12 (Bayern or Man City)', value: 1.25 },
          { selectionId: 'fb_3_dcx2', label: 'X2 (Draw or Man City)', value: 1.48 }
        ]
      },
      {
        name: 'Both Teams to Score',
        odds: [
          { selectionId: 'fb_3_btts_yes', label: 'Yes', value: 1.50 },
          { selectionId: 'fb_3_btts_no', label: 'No', value: 2.40 }
        ]
      },
      {
        name: 'Draw No Bet',
        odds: [
          { selectionId: 'fb_3_dnb1', label: '1 (Bayern)', value: 1.95 },
          { selectionId: 'fb_3_dnb2', label: '2 (Man City)', value: 1.80 }
        ]
      },
      {
        name: 'Total Goals (Over/Under 2.5)',
        odds: [
          { selectionId: 'fb_3_o25', label: 'Over 2.5', value: 1.62 },
          { selectionId: 'fb_3_u25', label: 'Under 2.5', value: 2.15 }
        ]
      }
    ]
  },

  // BASKETBALL Matches
  {
    id: 'bb_1',
    sport: 'basketball',
    league: 'NBA',
    country: 'USA',
    isLive: true,
    timer: 'Q3 - 08:12',
    scores: { home: 78, away: 74 },
    teams: {
      home: { name: 'Lakers' },
      away: { name: 'Celtics' }
    },
    venue: 'Crypto.com Arena, Los Angeles',
    stats: {
      possession: { home: 50, away: 50 },
      shots: { home: 68, away: 70 },
      shotsOnTarget: { home: 34, away: 32 },
      corners: { home: 18, away: 22 },
      yellowCards: { home: 12, away: 14 },
      redCards: { home: 4, away: 5 }
    },
    lineups: {
      home: ['D. Russell (G)', 'A. Reaves (G)', 'R. Hachimura (F)', 'L. James (F)', 'A. Davis (C)'],
      away: ['J. Holiday (G)', 'D. White (G)', 'J. Brown (F)', 'J. Tatum (F)', 'K. Porzingis (C)']
    },
    h2h: [
      { date: '2026-02-01', score: 'Lakers 115 - 112 Celtics', event: 'NBA' },
      { date: '2025-12-25', score: 'Lakers 122 - 126 Celtics', event: 'NBA' }
    ],
    markets: [
      {
        name: 'Money Line (Winner)',
        odds: [
          { selectionId: 'bb_1_1', label: '1 (Lakers)', value: 1.70 },
          { selectionId: 'bb_1_2', label: '2 (Celtics)', value: 2.10 }
        ]
      },
      {
        name: 'Point Spread',
        odds: [
          { selectionId: 'bb_1_h1', label: 'Lakers -3.5', value: 1.90 },
          { selectionId: 'bb_1_h2', label: 'Celtics +3.5', value: 1.90 }
        ]
      },
      {
        name: 'Total Points (Over/Under 224.5)',
        odds: [
          { selectionId: 'bb_1_tot_o', label: 'Over 224.5', value: 1.85 },
          { selectionId: 'bb_1_tot_u', label: 'Under 224.5', value: 1.95 }
        ]
      },
      {
        name: 'Home Team Odd/Even Points',
        odds: [
          { selectionId: 'bb_1_odd_home', label: 'Odd', value: 1.90 },
          { selectionId: 'bb_1_even_home', label: 'Even', value: 1.90 }
        ]
      }
    ]
  },
  {
    id: 'bb_2',
    sport: 'basketball',
    league: 'EuroLeague',
    country: 'Europe',
    isLive: false,
    kickoffTime: 'Tomorrow, 21:30',
    teams: {
      home: { name: 'Real Madrid' },
      away: { name: 'Panathinaikos' }
    },
    venue: 'WiZink Center, Madrid',
    h2h: [
      { date: '2025-05-26', score: 'Panathinaikos 95 - 80 Real Madrid', event: 'EuroLeague Final' }
    ],
    markets: [
      {
        name: 'Money Line (Winner)',
        odds: [
          { selectionId: 'bb_2_1', label: '1 (Madrid)', value: 1.55 },
          { selectionId: 'bb_2_2', label: '2 (Panathinaikos)', value: 2.40 }
        ]
      },
      {
        name: 'Total Points (Over/Under 165.5)',
        odds: [
          { selectionId: 'bb_2_tot_o', label: 'Over 165.5', value: 1.88 },
          { selectionId: 'bb_2_tot_u', label: 'Under 165.5', value: 1.92 }
        ]
      }
    ]
  },

  // TENNIS Matches
  {
    id: 'tn_1',
    sport: 'tennis',
    league: 'Wimbledon',
    country: 'Great Britain',
    isLive: true,
    timer: 'Set 3, Game 4',
    scores: { home: '6, 4, 3', away: '4, 6, 1' },
    teams: {
      home: { name: 'Jannik Sinner' },
      away: { name: 'Carlos Alcaraz' }
    },
    venue: 'Centre Court, London',
    stats: {
      possession: { home: 52, away: 48 },
      shots: { home: 4, away: 2 },
      shotsOnTarget: { home: 1, away: 3 },
      corners: { home: 12, away: 9 },
      yellowCards: { home: 8, away: 11 },
      redCards: { home: 2, away: 1 }
    },
    lineups: {
      home: ['Coach: Darren Cahill'],
      away: ['Coach: Juan Carlos Ferrero']
    },
    h2h: [
      { date: '2025-09-06', score: 'Sinner 3 - 2 Alcaraz', event: 'US Open' },
      { date: '2025-06-07', score: 'Alcaraz 3 - 2 Sinner', event: 'French Open' }
    ],
    markets: [
      {
        name: 'Match Winner',
        odds: [
          { selectionId: 'tn_1_1', label: '1 (Sinner)', value: 1.40 },
          { selectionId: 'tn_1_2', label: '2 (Carlos Alcaraz)', value: 2.80 }
        ]
      },
      {
        name: 'To Win Set 3',
        odds: [
          { selectionId: 'tn_1_s3_1', label: '1 (Sinner)', value: 1.35 },
          { selectionId: 'tn_1_s3_2', label: '2 (Carlos Alcaraz)', value: 3.00 }
        ]
      },
      {
        name: 'Total Games (Over/Under 38.5)',
        odds: [
          { selectionId: 'tn_1_tot_o', label: 'Over 38.5', value: 1.90 },
          { selectionId: 'tn_1_tot_u', label: 'Under 38.5', value: 1.80 }
        ]
      }
    ]
  }
];

export const searchDatabase = [
  { title: 'Arsenal', subtitle: 'Football Team (England)', type: 'team', id: 'fb_1' },
  { title: 'Chelsea', subtitle: 'Football Team (England)', type: 'team', id: 'fb_1' },
  { title: 'Real Madrid', subtitle: 'Football/Basketball Team (Spain)', type: 'team', id: 'fb_2' },
  { title: 'Barcelona', subtitle: 'Football Team (Spain)', type: 'team', id: 'fb_2' },
  { title: 'Bayern Munich', subtitle: 'Football Team (Germany)', type: 'team', id: 'fb_3' },
  { title: 'Manchester City', subtitle: 'Football Team (England)', type: 'team', id: 'fb_3' },
  { title: 'Lakers', subtitle: 'Basketball Team (USA)', type: 'team', id: 'bb_1' },
  { title: 'Celtics', subtitle: 'Basketball Team (USA)', type: 'team', id: 'bb_1' },
  { title: 'Jannik Sinner', subtitle: 'Tennis Player (Italy)', type: 'player', id: 'tn_1' },
  { title: 'Carlos Alcaraz', subtitle: 'Tennis Player (Spain)', type: 'player', id: 'tn_1' },
  { title: 'Premier League', subtitle: 'Football Competition (England)', type: 'league', sport: 'football' },
  { title: 'La Liga', subtitle: 'Football Competition (Spain)', type: 'league', sport: 'football' },
  { title: 'NBA', subtitle: 'Basketball League (USA)', type: 'league', sport: 'basketball' },
  { title: 'Wimbledon', subtitle: 'Tennis Grand Slam', type: 'league', sport: 'tennis' }
];
