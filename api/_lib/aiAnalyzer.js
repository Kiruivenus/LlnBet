// AI Market Analyzer Engine
export function generateAiMarketsForMatch({ matchId, homeName, awayName, r1, rx, r2, sport = 'football' }) {
  r1 = parseFloat(Number(r1).toFixed(2)) || 2.10;
  rx = parseFloat(Number(rx).toFixed(2)) || 3.20;
  r2 = parseFloat(Number(r2).toFixed(2)) || 3.50;

  // 1. 1X2 Match Winner Market
  const mainMarket = {
    name: sport === 'football' || sport === 'rugby' ? '1X2 Match Winner' : 'Money Line (Winner)',
    category: 'Main',
    columns: sport === 'football' || sport === 'rugby' ? 3 : 2,
    odds: [
      { selectionId: `${matchId}_m1`, label: `1 (${homeName})`, value: r1 },
      ...(sport === 'football' || sport === 'rugby' ? [
        { selectionId: `${matchId}_mx`, label: 'X (Draw)', value: rx }
      ] : []),
      { selectionId: `${matchId}_m2`, label: `2 (${awayName})`, value: r2 }
    ]
  };

  // 2. Both Teams To Score (GG/NG)
  const bttsYes = parseFloat((1 / (1 - (1/r1 + 1/r2) * 0.4)).toFixed(2)) || 1.70;
  const bttsNo = parseFloat(((r1 + r2) / 1.6).toFixed(2)) || 2.10;
  const bttsMarket = {
    name: 'Both Teams To Score (GG/NG)',
    category: 'Main',
    columns: 2,
    odds: [
      { selectionId: `${matchId}_btts_yes`, label: 'Yes (GG)', value: bttsYes },
      { selectionId: `${matchId}_btts_no`, label: 'No (NG)', value: bttsNo }
    ]
  };

  // 3. Double Chance
  const dc1x = parseFloat((1 / (1/r1 + 1/rx) * 1.05).toFixed(2)) || 1.30;
  const dcx2 = parseFloat((1 / (1/rx + 1/r2) * 1.05).toFixed(2)) || 1.45;
  const dc12 = parseFloat((1 / (1/r1 + 1/r2) * 1.05).toFixed(2)) || 1.25;
  const dcMarket = {
    name: 'Double Chance',
    category: 'Main',
    columns: 3,
    odds: [
      { selectionId: `${matchId}_dc_1x`, label: '1/X', value: dc1x },
      { selectionId: `${matchId}_dc_x2`, label: 'X/2', value: dcx2 },
      { selectionId: `${matchId}_dc_12`, label: '1/2', value: dc12 }
    ]
  };

  // 4. Over / Under Total Goals
  const totalsMarket = {
    name: 'Over / Under Total Goals',
    category: 'Goals',
    columns: 2,
    odds: [
      { selectionId: `${matchId}_tot_o15`, label: 'Over 1.5', value: 1.22 },
      { selectionId: `${matchId}_tot_u15`, label: 'Under 1.5', value: 4.10 },
      { selectionId: `${matchId}_tot_o25`, label: 'Over 2.5', value: 1.75 },
      { selectionId: `${matchId}_tot_u25`, label: 'Under 2.5', value: 2.10 },
      { selectionId: `${matchId}_tot_o35`, label: 'Over 3.5', value: 2.85 },
      { selectionId: `${matchId}_tot_u35`, label: 'Under 3.5', value: 1.42 }
    ]
  };

  // 5. Draw No Bet
  const dnb1 = parseFloat((r1 * 0.75).toFixed(2)) || 1.55;
  const dnb2 = parseFloat((r2 * 0.75).toFixed(2)) || 2.20;
  const dnbMarket = {
    name: 'Draw No Bet',
    category: 'Main',
    columns: 2,
    odds: [
      { selectionId: `${matchId}_dnb_1`, label: `1 (${homeName})`, value: dnb1 },
      { selectionId: `${matchId}_dnb_2`, label: `2 (${awayName})`, value: dnb2 }
    ]
  };

  // 6. 1st Half - 1X2
  const fh1 = parseFloat((r1 * 1.3 + 0.3).toFixed(2)) || 2.80;
  const fhx = parseFloat((rx * 0.75).toFixed(2)) || 2.10;
  const fh2 = parseFloat((r2 * 1.3 + 0.3).toFixed(2)) || 3.40;
  const firstHalfMarket = {
    name: '1st Half - 1X2',
    category: 'First Half',
    columns: 3,
    odds: [
      { selectionId: `${matchId}_fh_1`, label: '1', value: fh1 },
      { selectionId: `${matchId}_fh_x`, label: 'X', value: fhx },
      { selectionId: `${matchId}_fh_2`, label: '2', value: fh2 }
    ]
  };

  // 7. Correct Score Grid Market
  const correctScoreMarket = {
    name: 'Correct Score',
    category: 'Correct Score',
    columns: 3,
    odds: [
      { selectionId: `${matchId}_cs_00`, label: '0:0', value: parseFloat((rx * 2.8).toFixed(2)) },
      { selectionId: `${matchId}_cs_01`, label: '0:1', value: parseFloat((r2 * 3.2).toFixed(2)) },
      { selectionId: `${matchId}_cs_02`, label: '0:2', value: parseFloat((r2 * 4.5).toFixed(2)) },
      { selectionId: `${matchId}_cs_03`, label: '0:3', value: parseFloat((r2 * 8.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_04`, label: '0:4', value: parseFloat((r2 * 16.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_10`, label: '1:0', value: parseFloat((r1 * 3.2).toFixed(2)) },
      { selectionId: `${matchId}_cs_11`, label: '1:1', value: parseFloat((rx * 1.9).toFixed(2)) },
      { selectionId: `${matchId}_cs_12`, label: '1:2', value: parseFloat((r2 * 3.8).toFixed(2)) },
      { selectionId: `${matchId}_cs_13`, label: '1:3', value: parseFloat((r2 * 7.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_14`, label: '1:4', value: parseFloat((r2 * 14.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_20`, label: '2:0', value: parseFloat((r1 * 4.5).toFixed(2)) },
      { selectionId: `${matchId}_cs_21`, label: '2:1', value: parseFloat((r1 * 3.8).toFixed(2)) },
      { selectionId: `${matchId}_cs_22`, label: '2:2', value: parseFloat((rx * 3.8).toFixed(2)) },
      { selectionId: `${matchId}_cs_23`, label: '2:3', value: parseFloat((r2 * 11.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_24`, label: '2:4', value: parseFloat((r2 * 22.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_30`, label: '3:0', value: parseFloat((r1 * 8.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_31`, label: '3:1', value: parseFloat((r1 * 7.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_32`, label: '3:2', value: parseFloat((r1 * 11.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_33`, label: '3:3', value: parseFloat((rx * 10.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_34`, label: '3:4', value: parseFloat((r2 * 45.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_40`, label: '4:0', value: parseFloat((r1 * 16.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_41`, label: '4:1', value: parseFloat((r1 * 14.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_42`, label: '4:2', value: parseFloat((r1 * 22.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_43`, label: '4:3', value: parseFloat((r1 * 45.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_44`, label: '4:4', value: parseFloat((rx * 30.0).toFixed(2)) },
      { selectionId: `${matchId}_cs_other`, label: 'Other', value: parseFloat((Math.min(r1, r2) * 4.2).toFixed(2)) }
    ]
  };

  // 8. Exact Goals per Team
  const homeGoalsMarket = {
    name: `${homeName} Exact Total Goals`,
    category: 'Goals',
    columns: 2,
    odds: [
      { selectionId: `${matchId}_htot_o05`, label: 'Over 0.5', value: 1.18 },
      { selectionId: `${matchId}_htot_u05`, label: 'Under 0.5', value: 4.80 },
      { selectionId: `${matchId}_htot_o15`, label: 'Over 1.5', value: 1.85 },
      { selectionId: `${matchId}_htot_u15`, label: 'Under 1.5', value: 1.95 }
    ]
  };

  const awayGoalsMarket = {
    name: `${awayName} Exact Total Goals`,
    category: 'Goals',
    columns: 2,
    odds: [
      { selectionId: `${matchId}_atot_o05`, label: 'Over 0.5', value: 1.30 },
      { selectionId: `${matchId}_atot_u05`, label: 'Under 0.5', value: 3.60 },
      { selectionId: `${matchId}_atot_o15`, label: 'Over 1.5', value: 2.40 },
      { selectionId: `${matchId}_atot_u15`, label: 'Under 1.5', value: 1.55 }
    ]
  };

  return [mainMarket, bttsMarket, dcMarket, totalsMarket, dnbMarket, firstHalfMarket, correctScoreMarket, homeGoalsMarket, awayGoalsMarket];
}
