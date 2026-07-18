/**
 * Team Strength Model
 * Evaluates offensive/defensive ratings, home advantage, and form factors for any fixture.
 */
export class TeamStrengthModel {
  constructor() {
    this.ratingsDatabase = new Map([
      ['Arsenal', { attack: 88, defense: 86, form: 1.15 }],
      ['Chelsea', { attack: 82, defense: 80, form: 1.05 }],
      ['Real Madrid', { attack: 92, defense: 89, form: 1.20 }],
      ['Barcelona', { attack: 90, defense: 85, form: 1.18 }],
      ['Bayern Munich', { attack: 91, defense: 87, form: 1.16 }],
      ['Manchester City', { attack: 94, defense: 91, form: 1.22 }],
      ['Liverpool', { attack: 89, defense: 87, form: 1.14 }],
      ['Inter Miami CF', { attack: 84, defense: 78, form: 1.10 }]
    ]);

    this.defaultRating = { attack: 75, defense: 75, form: 1.00 };
    this.homeAdvantageMultiplier = 1.12; // 12% home advantage boost
  }

  /**
   * Get team strength profile
   */
  getTeamProfile(teamName) {
    if (!teamName) return this.defaultRating;
    
    for (const [key, profile] of this.ratingsDatabase.entries()) {
      if (teamName.toLowerCase().includes(key.toLowerCase())) {
        return profile;
      }
    }
    return this.defaultRating;
  }

  /**
   * Calculate baseline win expectancy ratio between two teams
   */
  calculateBaselineExpectancy(homeTeamName, awayTeamName) {
    const home = this.getTeamProfile(homeTeamName);
    const away = this.getTeamProfile(awayTeamName);

    const homeStrength = (home.attack * 0.6 + home.defense * 0.4) * home.form * this.homeAdvantageMultiplier;
    const awayStrength = (away.attack * 0.6 + away.defense * 0.4) * away.form;

    const total = homeStrength + awayStrength;
    return {
      homeRatio: homeStrength / total,
      awayRatio: awayStrength / total,
      strengthDiff: (homeStrength - awayStrength) / 100
    };
  }
}

export const teamStrengthModel = new TeamStrengthModel();
