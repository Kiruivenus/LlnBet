export const sportsList = [
  { id: 'football', name: 'Football', icon: 'soccer', count: 0 },
  { id: 'basketball', name: 'Basketball', icon: 'basketball', count: 0 },
  { id: 'tennis', name: 'Tennis', icon: 'tennis', count: 0 },
  { id: 'rugby', name: 'Rugby', icon: 'rugby', count: 0 },
  { id: 'cricket', name: 'Cricket', icon: 'cricket', count: 0 },
  { id: 'ice_hockey', name: 'Ice Hockey', icon: 'ice_hockey', count: 0 },
  { id: 'esports', name: 'Esports', icon: 'esports', count: 0 }
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

// Helper structures for generating matches dynamically
const sportLeagues = {
  football: { name: 'Premier League', country: 'England', venue: 'Emirates Stadium, London' },
  basketball: { name: 'NBA', country: 'USA', venue: 'Crypto.com Arena, Los Angeles' },
  tennis: { name: 'Wimbledon', country: 'Great Britain', venue: 'Centre Court, London' },
  rugby: { name: 'Super Rugby', country: 'New Zealand', venue: 'Eden Park, Auckland' },
  cricket: { name: 'T20 World Cup', country: 'India', venue: 'Wankhede Stadium, Mumbai' },
  ice_hockey: { name: 'NHL Playoffs', country: 'Canada', venue: 'Scotiabank Arena, Toronto' },
  esports: { name: 'LCK Summer', country: 'South Korea', venue: 'LoL Park, Seoul' }
};

const sportTeams = {
  football: [
    ['Arsenal', 'Chelsea'],
    ['Liverpool', 'Man City'],
    ['Man United', 'Tottenham'],
    ['Real Madrid', 'Barcelona'],
    ['Bayern Munich', 'Dortmund'],
    ['Juventus', 'Inter Milan'],
    ['AC Milan', 'Napoli'],
    ['PSG', 'Marseille']
  ],
  basketball: [
    ['Lakers', 'Celtics'],
    ['Warriors', 'Suns'],
    ['Bucks', 'Nuggets'],
    ['Clippers', 'Mavericks'],
    ['Heat', 'Sixers'],
    ['Hawks', 'Pacers']
  ],
  tennis: [
    ['Jannik Sinner', 'Carlos Alcaraz'],
    ['Novak Djokovic', 'Daniil Medvedev'],
    ['Alexander Zverev', 'Holger Rune'],
    ['Taylor Fritz', 'Stefanos Tsitsipas']
  ],
  rugby: [
    ['All Blacks', 'Springboks'],
    ['Wallabies', 'England Rugby'],
    ['Ireland', 'Wales'],
    ['France', 'Scotland']
  ],
  cricket: [
    ['Mumbai Indians', 'Chennai Super Kings'],
    ['Royal Challengers', 'Kolkata Knight Riders'],
    ['Delhi Capitals', 'Rajasthan Royals'],
    ['Sunrisers', 'Gujarat Titans']
  ],
  ice_hockey: [
    ['Bruins', 'Maple Leafs'],
    ['Rangers', 'Devils'],
    ['Golden Knights', 'Avalanche'],
    ['Blackhawks', 'Red Wings']
  ],
  esports: [
    ['T1', 'Gen.G'],
    ['Fnatic', 'G2 Esports'],
    ['Team Liquid', 'Cloud9'],
    ['Sentinels', 'LOUD']
  ]
};

// Formatting date objects into standard text indicators
function formatKickoff(dateObj) {
  const now = new Date();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (dateObj.toDateString() === now.toDateString()) {
    return `Today, ${timeStr}`;
  }
  
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (dateObj.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeStr}`;
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[dateObj.getDay()];
  const dateNum = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  
  return `${dayName}, ${dateNum} ${monthName}, ${timeStr}`;
}

// Generate the master matches list dynamically
export const matchesList = [];

// Helper: Seed random odds value
function getRandomOdds(min = 1.20, max = 8.00) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Step 1: Generate 1 active live match for EVERY sport (7 live matches)
Object.keys(sportTeams).forEach((sport, index) => {
  const teamsPair = sportTeams[sport][index % sportTeams[sport].length];
  const leagueInfo = sportLeagues[sport];
  const matchId = `live_${sport}_${index}`;

  let timer = '40';
  let scores = { home: 1, away: 0 };

  if (sport === 'football') {
    timer = '54';
    scores = { home: 2, away: 1 };
  } else if (sport === 'basketball') {
    timer = 'Q3 - 08:12';
    scores = { home: 78, away: 74 };
  } else if (sport === 'tennis') {
    timer = 'Set 3, Game 4';
    scores = { home: '6, 4, 3', away: '4, 6, 1' };
  } else if (sport === 'rugby') {
    timer = '62';
    scores = { home: 24, away: 18 };
  } else if (sport === 'cricket') {
    timer = '12.4 Overs';
    scores = { home: 112, away: 98 };
  } else if (sport === 'ice_hockey') {
    timer = 'P2 - 14:22';
    scores = { home: 3, away: 2 };
  } else if (sport === 'esports') {
    timer = 'Game 2 - 19:40';
    scores = { home: 1, away: 0 };
  }

  // Common markets mapping
  const markets = [
    {
      name: sport === 'football' || sport === 'rugby' || sport === 'ice_hockey' ? 'Match Outcome (1X2)' : 'Money Line (Winner)',
      odds: [
        { selectionId: `${matchId}_1`, label: `1 (${teamsPair[0]})`, value: getRandomOdds(1.30, 3.50) },
        ...(sport === 'football' || sport === 'rugby' || sport === 'ice_hockey' ? [
          { selectionId: `${matchId}_x`, label: 'X (Draw)', value: getRandomOdds(2.50, 4.50) }
        ] : []),
        { selectionId: `${matchId}_2`, label: `2 (${teamsPair[1]})`, value: getRandomOdds(1.80, 5.00) }
      ]
    }
  ];

  matchesList.push({
    id: matchId,
    sport,
    league: leagueInfo.name,
    country: leagueInfo.country,
    isLive: true,
    timer,
    scores,
    teams: {
      home: { name: teamsPair[0] },
      away: { name: teamsPair[1] }
    },
    venue: leagueInfo.venue,
    stats: {
      possession: { home: 54, away: 46 },
      shots: { home: 11, away: 8 },
      shotsOnTarget: { home: 5, away: 4 },
      corners: { home: 5, away: 3 },
      yellowCards: { home: 1, away: 2 },
      redCards: { home: 0, away: 0 }
    },
    lineups: {
      home: ['Team Alpha Lineup'],
      away: ['Team Beta Lineup']
    },
    h2h: [
      { date: '2025-11-23', score: `${teamsPair[0]} 3 - 1 ${teamsPair[1]}`, event: leagueInfo.name }
    ],
    markets
  });
});

// Step 2: Generate upcoming fixtures daily up to NEXT WEEK (for the next 7 days)
const daysToGenerate = 7;
const now = new Date();

for (let d = 0; d <= daysToGenerate; d++) {
  Object.keys(sportTeams).forEach((sport, sIndex) => {
    // Determine teams pair (cycles through lists)
    const cycleIndex = (d + sIndex) % sportTeams[sport].length;
    const teamsPair = sportTeams[sport][cycleIndex];
    const leagueInfo = sportLeagues[sport];
    
    // Stagger hours
    const matchKickoff = new Date(now);
    matchKickoff.setDate(now.getDate() + d);
    // Setup kickoff hours e.g. 15:00, 17:00, 19:00, 21:00 depending on sport sIndex
    matchKickoff.setHours(14 + (sIndex * 1.5), 0, 0, 0);

    const matchId = `upcoming_${sport}_day_${d}_${sIndex}`;

    const markets = [
      {
        name: sport === 'football' || sport === 'rugby' || sport === 'ice_hockey' ? 'Match Outcome (1X2)' : 'Money Line (Winner)',
        odds: [
          { selectionId: `${matchId}_1`, label: `1 (${teamsPair[0]})`, value: getRandomOdds(1.25, 4.00) },
          ...(sport === 'football' || sport === 'rugby' || sport === 'ice_hockey' ? [
            { selectionId: `${matchId}_x`, label: 'X (Draw)', value: getRandomOdds(2.60, 4.20) }
          ] : []),
          { selectionId: `${matchId}_2`, label: `2 (${teamsPair[1]})`, value: getRandomOdds(1.60, 6.00) }
        ]
      }
    ];

    matchesList.push({
      id: matchId,
      sport,
      league: leagueInfo.name,
      country: leagueInfo.country,
      isLive: false,
      kickoffTime: formatKickoff(matchKickoff),
      teams: {
        home: { name: teamsPair[0] },
        away: { name: teamsPair[1] }
      },
      venue: leagueInfo.venue,
      h2h: [
        { date: '2025-08-14', score: `${teamsPair[0]} 1 - 1 ${teamsPair[1]}`, event: leagueInfo.name }
      ],
      markets
    });
  });
}

// Step 3: Populate search database dynamically from all active matches
export const searchDatabase = [];

matchesList.forEach(match => {
  searchDatabase.push({
    title: match.teams.home.name,
    subtitle: `${match.sport.charAt(0).toUpperCase() + match.sport.slice(1)} Team (${match.league})`,
    type: 'team',
    id: match.id
  });
  searchDatabase.push({
    title: match.teams.away.name,
    subtitle: `${match.sport.charAt(0).toUpperCase() + match.sport.slice(1)} Team (${match.league})`,
    type: 'team',
    id: match.id
  });
});

// Update sport chips counts in sportsList dynamically
sportsList.forEach(sport => {
  sport.count = matchesList.filter(m => m.sport === sport.id).length;
});
