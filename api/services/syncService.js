import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import { Match } from '../models.js';
import { matchCache } from '../cache.js';

function getEspnDateRange() {
  const dates = [];
  const start = new Date();
  start.setDate(start.getDate() - 1);
  for (let i = 0; i < 9; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}${mm}${dd}`);
  }
  return `${dates[0]}-${dates[dates.length - 1]}`;
}

function matchesAreEqual(m1, m2) {
  if (m1.isLive !== m2.isLive) return false;
  if (m1.timer !== m2.timer) return false;
  if (m1.scores?.home !== m2.scores?.home) return false;
  if (m1.scores?.away !== m2.scores?.away) return false;
  if (m1.kickoffTime !== m2.kickoffTime) return false;
  
  if (m1.markets && m2.markets) {
    if (m1.markets.length !== m2.markets.length) return false;
    for (let i = 0; i < m1.markets.length; i++) {
      const mk1 = m1.markets[i];
      const mk2 = m2.markets[i];
      if (mk1.name !== mk2.name) return false;
      if (mk1.odds.length !== mk2.odds.length) return false;
      for (let j = 0; j < mk1.odds.length; j++) {
        if (mk1.odds[j].selectionId !== mk2.odds[j].selectionId) return false;
        if (mk1.odds[j].label !== mk2.odds[j].label) return false;
        if (mk1.odds[j].value !== mk2.odds[j].value) return false;
      }
    }
  }
  return true;
}

export async function syncMatchesFromEspn() {
  const feeds = [
    { url: 'soccer/all', sport: 'football', name: 'Soccer Match', country: 'International' },
    { url: 'basketball/nba', sport: 'basketball', name: 'NBA', country: 'USA' },
    { url: 'basketball/wnba', sport: 'basketball', name: 'WNBA', country: 'USA' },
    { url: 'tennis/atp', sport: 'tennis', name: 'ATP Tour', country: 'International' },
    { url: 'hockey/nhl', sport: 'ice_hockey', name: 'NHL', country: 'USA' }
  ];

  const dateRange = getEspnDateRange();
  const promises = feeds.map(async (feed) => {
    const feedMatches = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const limit = feed.sport === 'football' ? 200 : 50;
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${feed.url}/scoreboard?dates=${dateRange}&limit=${limit}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];
      const data = await response.json();
      
      const leagueMap = {};
      if (data.leagues) {
        data.leagues.forEach(l => {
          leagueMap[l.id] = {
            name: l.name || l.abbreviation || feed.name,
            country: l.midsizeName || feed.country
          };
        });
      }

      const events = data.events || [];
      events.forEach(event => {
        const comp = event.competitions?.[0];
        if (!comp) return;

        const competitors = comp.competitors || [];
        const homeComp = competitors.find(c => c.homeAway === 'home');
        const awayComp = competitors.find(c => c.homeAway === 'away');
        if (!homeComp || !awayComp) return;

        const homeName = homeComp.team?.displayName || homeComp.team?.name;
        const awayName = awayComp.team?.displayName || awayComp.team?.name;
        if (!homeName || !awayName) return;

        const isLive = event.status?.type?.state === 'in';
        const isFinished = event.status?.type?.state === 'post';
        
        if (isFinished) return;

        const kickoffDate = new Date(event.date);
        const matchId = `espn_${event.id}`;
        
        const homeScore = parseInt(homeComp.score) || 0;
        const awayScore = parseInt(awayComp.score) || 0;
        const timer = event.status?.displayClock ? event.status.displayClock.replace("'", "") : (isLive ? 'Live' : '0');
        const leagueId = event.uid?.split('~l:')[1]?.split('~')[0] || '';
        const leagueInfo = leagueMap[leagueId] || { name: feed.name, country: feed.country };

        feedMatches.push({
          id: matchId,
          sport: feed.sport,
          league: leagueInfo.name,
          country: leagueInfo.country,
          isLive: isLive,
          timer: timer,
          scores: { home: homeScore, away: awayScore },
          kickoffTime: kickoffDate.toISOString(),
          teams: {
            home: { name: homeName },
            away: { name: awayName }
          },
          venue: comp.venue?.fullName || leagueInfo.name,
          stats: {
            possession: { home: 50, away: 50 },
            shots: { home: 10, away: 8 },
            shotsOnTarget: { home: 4, away: 3 },
            corners: { home: 5, away: 4 },
            yellowCards: { home: 1, away: 1 },
            redCards: { home: 0, away: 0 }
          }
        });
      });
    } catch (e) {}
    return feedMatches;
  });

  const results = await Promise.all(promises);
  const parsedMatches = results.flat();

  if (parsedMatches.length > 0) {
    await connectDb();
    if (mongoose.connection.readyState === 1) {
      // 1. Fetch current matches from DB to avoid unnecessary rewrites
      const existingMatches = await Match.find({ id: { $in: parsedMatches.map(m => m.id) } }).lean();
      const existingMap = new Map(existingMatches.map(m => [m.id, m]));

      const ops = [];
      let skippedCount = 0;

      parsedMatches.forEach(m => {
        const existing = existingMap.get(m.id);
        
        // Stabilize / reuse existing odds if they exist, or generate new ones for fresh matches
        if (existing && existing.markets) {
          m.markets = existing.markets;
        } else {
          const r1 = parseFloat((Math.random() * 2 + 1.2).toFixed(2));
          const rx = parseFloat((Math.random() * 1.5 + 2.5).toFixed(2));
          const r2 = parseFloat((Math.random() * 3 + 1.8).toFixed(2));
          m.markets = [
            {
              name: m.sport === 'football' || m.sport === 'rugby' || m.sport === 'ice_hockey' ? 'Match Outcome (1X2)' : 'Money Line (Winner)',
              odds: [
                { selectionId: `${m.id}_1`, label: `1 (${m.teams.home.name})`, value: r1 },
                ...(m.sport === 'football' || m.sport === 'rugby' || m.sport === 'ice_hockey' ? [
                  { selectionId: `${m.id}_x`, label: 'X (Draw)', value: rx }
                ] : []),
                { selectionId: `${m.id}_2`, label: `2 (${m.teams.away.name})`, value: r2 }
              ]
            }
          ];
        }

        // Compare delta!
        if (existing && matchesAreEqual(existing, m)) {
          skippedCount++;
        } else {
          ops.push({
            updateOne: {
              filter: { id: m.id },
              update: { $set: { ...m, updatedAt: new Date() } },
              upsert: true
            }
          });
        }
      });

      if (ops.length > 0) {
        await Match.bulkWrite(ops);
        console.log(`[BACKEND SYNC] bulkWrite executed: ${ops.length} matches updated. Skipped ${skippedCount} unchanged matches.`);
        
        // Refresh local cache after updates
        const updatedMatches = await Match.find({}).lean();
        matchCache.matches = updatedMatches;
        matchCache.lastFetched = Date.now();
      } else {
        console.log(`[BACKEND SYNC] 0 writes executed. All ${skippedCount} incoming matches match cache and DB state.`);
      }
    }
  }
}
