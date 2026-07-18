// Formatting Utilities
export function formatCurrency(value) {
  return 'KES ' + new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatOdds(value) {
  return parseFloat(value).toFixed(2);
}

export function formatDate(dateString) {
  return dateString;
}

// Google Material Icons Round Provider
export function getMaterialIcon(name, className = '') {
  const iconMap = {
    soccer: 'sports_soccer',
    basketball: 'sports_basketball',
    tennis: 'sports_tennis',
    rugby: 'sports_rugby',
    cricket: 'sports_cricket',
    ice_hockey: 'sports_hockey',
    esports: 'sports_esports',
    search: 'search',
    wallet: 'account_balance_wallet',
    deposit: 'arrow_downward',
    withdraw: 'arrow_upward',
    notification: 'notifications',
    user: 'person',
    settings: 'settings',
    live: 'sensors',
    history: 'history',
    dashboard: 'dashboard',
    close: 'close',
    trash: 'delete',
    back: 'arrow_back',
    star: 'star',
    chat: 'chat',
    info: 'info',
    bonus: 'redeem',
    shield: 'security',
    jackpot: 'monetization_on',
    casino: 'casino',
    trend: 'trending_up',
    trophy: 'emoji_events',
    home: 'home',
    menu: 'menu'
  };

  const googleIconName = iconMap[name] || name;
  return `<span class="material-icons-round ${className}">${googleIconName}</span>`;
}

// Map old getSvgIcon function name to getMaterialIcon for compatibility
export const getSvgIcon = getMaterialIcon;

// Render CSS-based Team Badges instead of Emojis
export function renderTeamBadge(teamName) {
  const initials = teamName.substring(0, 3).toUpperCase();
  let colorStyle = 'background: #334155; color: #f8fafc;'; // default slate

  if (teamName.includes('Arsenal')) {
    colorStyle = 'background: #ef4444; color: #ffffff; border: 1px solid #b91c1c;';
  } else if (teamName.includes('Chelsea')) {
    colorStyle = 'background: #2563eb; color: #ffffff; border: 1px solid #1d4ed8;';
  } else if (teamName.includes('Real Madrid')) {
    colorStyle = 'background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1;';
  } else if (teamName.includes('Barcelona')) {
    colorStyle = 'background: linear-gradient(135deg, #7c0c16 50%, #004d98 50%); color: #ffffff; border: 1px solid #5a0710;';
  } else if (teamName.includes('Bayern')) {
    colorStyle = 'background: #dc2626; color: #ffffff; border: 1px solid #991b1b;';
  } else if (teamName.includes('Manchester City')) {
    colorStyle = 'background: #7dd3fc; color: #0f172a; border: 1px solid #38bdf8;';
  } else if (teamName.includes('Lakers')) {
    colorStyle = 'background: #552583; color: #fdb927; border: 1px solid #fdb927;';
  } else if (teamName.includes('Celtics')) {
    colorStyle = 'background: #007a33; color: #ffffff; border: 1px solid #005624;';
  } else if (teamName.includes('Sinner')) {
    colorStyle = 'background: #f97316; color: #ffffff;';
  } else if (teamName.includes('Alcaraz')) {
    colorStyle = 'background: #eab308; color: #0f172a;';
  }

  return `<span class="team-badge" style="${colorStyle} display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; width: 26px; height: 26px; border-radius: 50%; margin-right: 8px; text-transform: uppercase; vertical-align: middle;">${initials}</span>`;
}
