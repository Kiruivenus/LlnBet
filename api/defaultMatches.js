import { generateAiMarketsForMatch } from './services/aiAnalyzer.js';

export function getDefaultPremierMatches() {
  const now = Date.now();
  const h2 = 2 * 60 * 60 * 1000;
  const h5 = 5 * 60 * 60 * 1000;
  const h24 = 24 * 60 * 60 * 1000;

  const rawFixtures = [
    {
      id: 'def_1',
      sport: 'football',
      league: 'Premier League',
      country: 'England',
      homeName: 'Arsenal',
      awayName: 'Chelsea',
      kickoffTime: new Date(now + h2).toISOString(),
      r1: 1.85, rx: 3.40, r2: 4.10,
      isLive: false,
      timer: '0\''
    },
    {
      id: 'def_2',
      sport: 'football',
      league: 'FKF Premier League',
      country: 'Kenya',
      homeName: 'Gor Mahia',
      awayName: 'AFC Leopards',
      kickoffTime: new Date(now + h5).toISOString(),
      r1: 2.10, rx: 3.10, r2: 3.60,
      isLive: false,
      timer: '0\''
    },
    {
      id: 'def_3',
      sport: 'football',
      league: 'La Liga',
      country: 'Spain',
      homeName: 'Real Madrid',
      awayName: 'FC Barcelona',
      kickoffTime: new Date(now + h24).toISOString(),
      r1: 2.25, rx: 3.45, r2: 3.10,
      isLive: false,
      timer: '0\''
    },
    {
      id: 'def_4',
      sport: 'football',
      league: 'UEFA Champions League',
      country: 'Europe',
      homeName: 'Manchester City',
      awayName: 'Bayern Munich',
      kickoffTime: new Date(now + h24 + h2).toISOString(),
      r1: 1.95, rx: 3.60, r2: 3.70,
      isLive: false,
      timer: '0\''
    },
    {
      id: 'def_5',
      sport: 'basketball',
      league: 'NBA',
      country: 'USA',
      homeName: 'LA Lakers',
      awayName: 'Golden State Warriors',
      kickoffTime: new Date(now + h5 + h2).toISOString(),
      r1: 1.80, rx: 12.00, r2: 2.05,
      isLive: false,
      timer: '0\''
    },
    {
      id: 'def_6',
      sport: 'football',
      league: 'CAF Champions League',
      country: 'Africa',
      homeName: 'Al Ahly',
      awayName: 'Zamalek',
      kickoffTime: new Date(now + h24 + h5).toISOString(),
      r1: 2.05, rx: 3.20, r2: 3.80,
      isLive: false,
      timer: '0\''
    }
  ];

  return rawFixtures.map(f => {
    const markets = generateAiMarketsForMatch({
      matchId: f.id,
      homeName: f.homeName,
      awayName: f.awayName,
      r1: f.r1,
      rx: f.rx,
      r2: f.r2,
      sport: f.sport
    });

    return {
      id: f.id,
      sport: f.sport,
      league: f.league,
      country: f.country,
      isLive: f.isLive,
      timer: f.timer,
      scores: { home: 0, away: 0 },
      kickoffTime: f.kickoffTime,
      teams: {
        home: { name: f.homeName },
        away: { name: f.awayName }
      },
      venue: `${f.homeName} Stadium`,
      stats: { possession: { home: 50, away: 50 }, shots: { home: 0, away: 0 } },
      markets: markets,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
}
