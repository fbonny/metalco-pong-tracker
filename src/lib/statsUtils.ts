import { Player, Match } from './database';

export interface HeadToHeadStats {
  player1Wins: number;
  player2Wins: number;
  totalMatches: number;
  lastMatchDate?: string;
  lastWinner?: string;
}

export interface MatchPrediction {
  player1WinProbability: number;
  player2WinProbability: number;
  headToHead: HeadToHeadStats;
  insights: string[];
}

export interface PlayerMatchup {
  opponentName: string;
  wins: number;
  losses: number;
  totalMatches: number;
}

export interface TeammateStats {
  teammateName: string;
  matchesPlayed: number;
  wins: number;
  winRate: number;
}

export interface FormPeriod {
  period: string;
  wins: number;
  losses: number;
  pointsChange: number;
}

export interface PlayerAdvancedStats {
  nemesis: PlayerMatchup | null;
  victim: PlayerMatchup | null;
  favoriteTeammates: TeammateStats[];
  recentForm: FormPeriod[];
  bestStreak: { type: 'W' | 'L'; count: number };
  currentStreak: { type: 'W' | 'L'; count: number };
  singoloWinRate: number;
  doppioWinRate: number;
  singoloMatches: number;
  doppioMatches: number;
  balancedRivalries: PlayerMatchup[];
}

/**
 * Calculate head-to-head statistics between two players
 */
export function calculateHeadToHead(
  player1Name: string,
  player2Name: string,
  matches: Match[]
): HeadToHeadStats {
  const h2hMatches = matches.filter(match => {
    const team1Players = match.team1;
    const team2Players = match.team2;
    
    // Check if both players are in the match
    const p1InMatch = team1Players.includes(player1Name) || team2Players.includes(player1Name);
    const p2InMatch = team1Players.includes(player2Name) || team2Players.includes(player2Name);
    
    if (!p1InMatch || !p2InMatch) {
      return false; // One or both players not in this match
    }
    
    // For singles: must be a 1v1 match  
    if (!match.is_double) {
      return team1Players.includes(player1Name) && team2Players.includes(player2Name);
    }
    
    // For doubles: players MUST be on OPPOSITE teams
    const p1InTeam1 = team1Players.includes(player1Name);
    const p2InTeam1 = team1Players.includes(player2Name);
    const p1InTeam2 = team2Players.includes(player1Name);
    const p2InTeam2 = team2Players.includes(player2Name);
    
    // p1 in team1 AND p2 in team2, OR p1 in team2 AND p2 in team1
    return (p1InTeam1 && p2InTeam2) || (p1InTeam2 && p2InTeam1);
  });

  let player1Wins = 0;
  let player2Wins = 0;
  let lastMatchDate: string | undefined;
  let lastWinner: string | undefined;

  h2hMatches.forEach(match => {
    const winner = match.score1 > match.score2;
    const winningTeam = winner ? match.team1 : match.team2;
    
    if (winningTeam.includes(player1Name)) {
      player1Wins++;
      lastWinner = player1Name;
    } else if (winningTeam.includes(player2Name)) {
      player2Wins++;
      lastWinner = player2Name;
    }
    
    if (!lastMatchDate || new Date(match.played_at) > new Date(lastMatchDate)) {
      lastMatchDate = match.played_at;
    }
  });

  return {
    player1Wins,
    player2Wins,
    totalMatches: h2hMatches.length,
    lastMatchDate,
    lastWinner,
  };
}

/**
 * Get recent form for a player (last N matches)
 */
export function getRecentForm(playerName: string, matches: Match[], count: number = 10): string[] {
  const playerMatches = matches
    .filter(match => {
      const allPlayers = [...match.team1, ...match.team2];
      return allPlayers.includes(playerName);
    })
    .sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime())
    .slice(-count);

  return playerMatches.map(match => {
    const winner = match.score1 > match.score2;
    const winningTeam = winner ? match.team1 : match.team2;
    return winningTeam.includes(playerName) ? 'W' : 'L';
  });
}

/**
 * Calculate win probability between two players
 */
export function calculateWinProbability(
  player1Name: string,
  player2Name: string,
  player1: Player,
  player2: Player,
  matches: Match[]
): MatchPrediction {
  const headToHead = calculateHeadToHead(player1Name, player2Name, matches);
  const player1Form = getRecentForm(player1Name, matches, 10);
  const player2Form = getRecentForm(player2Name, matches, 10);

  // Calculate probabilities
  let player1Score = 0;
  let player2Score = 0;

  // 1. Head-to-head weight (40%)
  if (headToHead.totalMatches > 0) {
    const h2hWeight = 0.4;
    player1Score += (headToHead.player1Wins / headToHead.totalMatches) * h2hWeight;
    player2Score += (headToHead.player2Wins / headToHead.totalMatches) * h2hWeight;
  } else {
    // No head-to-head data, split evenly
    player1Score += 0.2;
    player2Score += 0.2;
  }

  // 2. Recent form weight (35%)
  const formWeight = 0.35;
  if (player1Form.length > 0) {
    const p1FormWins = player1Form.filter(r => r === 'W').length;
    player1Score += (p1FormWins / player1Form.length) * formWeight;
  } else {
    player1Score += formWeight * 0.5;
  }
  
  if (player2Form.length > 0) {
    const p2FormWins = player2Form.filter(r => r === 'W').length;
    player2Score += (p2FormWins / player2Form.length) * formWeight;
  } else {
    player2Score += formWeight * 0.5;
  }

  // 3. Overall win rate weight (25%)
  const winRateWeight = 0.25;
  const p1Matches = player1.wins + player1.losses;
  const p2Matches = player2.wins + player2.losses;
  
  if (p1Matches > 0) {
    player1Score += (player1.wins / p1Matches) * winRateWeight;
  } else {
    player1Score += winRateWeight * 0.5;
  }
  
  if (p2Matches > 0) {
    player2Score += (player2.wins / p2Matches) * winRateWeight;
  } else {
    player2Score += winRateWeight * 0.5;
  }

  // Normalize to percentages
  const totalScore = player1Score + player2Score;
  const player1WinProbability = (player1Score / totalScore) * 100;
  const player2WinProbability = (player2Score / totalScore) * 100;

  // Generate insights
  const insights: string[] = [];

  // Head-to-head insight
  if (headToHead.totalMatches > 0) {
    if (headToHead.player1Wins > headToHead.player2Wins) {
      insights.push(
        `${player1Name} ha vinto ${headToHead.player1Wins} degli ultimi ${headToHead.totalMatches} scontri diretti`
      );
    } else if (headToHead.player2Wins > headToHead.player1Wins) {
      insights.push(
        `${player2Name} ha vinto ${headToHead.player2Wins} degli ultimi ${headToHead.totalMatches} scontri diretti`
      );
    } else {
      insights.push(`Perfetta parità negli scontri diretti: ${headToHead.player1Wins}-${headToHead.player2Wins}`);
    }
  }

  // Recent form insights
  const p1RecentWins = player1Form.filter(r => r === 'W').length;
  const p2RecentWins = player2Form.filter(r => r === 'W').length;
  
  if (p1RecentWins >= 7) {
    insights.push(`${player1Name} è in forma: ${p1RecentWins}V-${player1Form.length - p1RecentWins}S nelle ultime ${player1Form.length}`);
  } else if (p1RecentWins <= 3 && player1Form.length >= 10) {
    insights.push(`${player1Name} è in difficoltà: ${p1RecentWins}V-${player1Form.length - p1RecentWins}S nelle ultime ${player1Form.length}`);
  }
  
  if (p2RecentWins >= 7) {
    insights.push(`${player2Name} è in forma: ${p2RecentWins}V-${player2Form.length - p2RecentWins}S nelle ultime ${player2Form.length}`);
  } else if (p2RecentWins <= 3 && player2Form.length >= 10) {
    insights.push(`${player2Name} è in difficoltà: ${p2RecentWins}V-${player2Form.length - p2RecentWins}S nelle ultime ${player2Form.length}`);
  }

  // Last match insight
  if (headToHead.lastMatchDate && headToHead.lastWinner) {
    const daysSince = Math.floor(
      (Date.now() - new Date(headToHead.lastMatchDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    insights.push(`Ultima vittoria di ${headToHead.lastWinner}: ${daysSince} giorni fa`);
  }

  return {
    player1WinProbability,
    player2WinProbability,
    headToHead,
    insights: insights.slice(0, 3), // Max 3 insights
  };
}

/**
 * Calculate teammate statistics (how often a player played with each teammate)
 */
function getTeammateStats(playerName: string, matches: Match[], allPlayerNames: string[]): TeammateStats[] {
  const teammateMap: Record<string, { matches: number; wins: number }> = {};

  // Filter only doubles matches where the player participated
  const doublesMatches = matches.filter(match => {
    if (!match.is_double) return false;
    return match.team1.includes(playerName) || match.team2.includes(playerName);
  });

  doublesMatches.forEach(match => {
    // Find which team the player is on
    const playerTeam = match.team1.includes(playerName) ? match.team1 : match.team2;
    
    // Find teammates (other players on the same team)
    const teammates = playerTeam.filter(name => name !== playerName);
    
    // Determine if this team won
    const isTeam1 = match.team1.includes(playerName);
    const didWin = isTeam1 ? match.score1 > match.score2 : match.score2 > match.score1;

    // Update stats for each teammate
    teammates.forEach(teammate => {
      if (!teammateMap[teammate]) {
        teammateMap[teammate] = { matches: 0, wins: 0 };
      }
      teammateMap[teammate].matches++;
      if (didWin) {
        teammateMap[teammate].wins++;
      }
    });
  });

  // Convert to array and calculate win rates
  const teammateStats: TeammateStats[] = Object.entries(teammateMap).map(([name, stats]) => ({
    teammateName: name,
    matchesPlayed: stats.matches,
    wins: stats.wins,
    winRate: stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0,
  }));

  // Sort by matches played (descending), then by win rate
  teammateStats.sort((a, b) => {
    if (b.matchesPlayed !== a.matchesPlayed) {
      return b.matchesPlayed - a.matchesPlayed;
    }
    return b.winRate - a.winRate;
  });

  return teammateStats;
}

/**
 * Calculate all matchups for a player
 */
function getPlayerMatchups(playerName: string, matches: Match[], allPlayers: string[]): PlayerMatchup[] {
  const matchups: Record<string, PlayerMatchup> = {};

  allPlayers.forEach(opponentName => {
    if (opponentName === playerName) return;

    const h2h = calculateHeadToHead(playerName, opponentName, matches);
    
    if (h2h.totalMatches > 0) {
      matchups[opponentName] = {
        opponentName,
        wins: h2h.player1Wins,
        losses: h2h.player2Wins,
        totalMatches: h2h.totalMatches,
      };
    }
  });

  return Object.values(matchups);
}

/**
 * Calculate advanced statistics for a player
 */
export function calculateAdvancedStats(
  player: Player,
  matches: Match[],
  allPlayers: Player[]
): PlayerAdvancedStats {
  const playerName = player.name;
  const allPlayerNames = allPlayers.map(p => p.name);

  // Get all matchups
  const matchups = getPlayerMatchups(playerName, matches, allPlayerNames);

  // Find nemesis (most losses against) - filter out those with 0 losses first
  const nemesis = matchups.length > 0
    ? matchups
        .filter(m => m.losses > 0)
        .sort((a, b) => b.losses - a.losses)[0] || null
    : null;

  // Find victim (most wins against) - filter out those with 0 wins first
  const victim = matchups.length > 0
    ? matchups
        .filter(m => m.wins > 0)
        .sort((a, b) => b.wins - a.wins)[0] || null
    : null;

  // Recent form by period
  const now = new Date();
  const recentForm: FormPeriod[] = [];
  
  [7, 14, 30].forEach(days => {
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const periodMatches = matches.filter(match => {
      const matchDate = new Date(match.played_at);
      const allPlayers = [...match.team1, ...match.team2];
      return matchDate >= periodStart && allPlayers.includes(playerName);
    });

    let wins = 0;
    let losses = 0;
    let pointsGained = 0;

    periodMatches.forEach(match => {
      const winner = match.score1 > match.score2;
      const winningTeam = winner ? match.team1 : match.team2;
      const isWinner = winningTeam.includes(playerName);
      
      if (isWinner) wins++;
      else losses++;

      // Simplified points calculation (you can use the actual function from database.ts)
      if (isWinner) pointsGained += 10;
    });

    recentForm.push({
      period: `${days} giorni`,
      wins,
      losses,
      pointsChange: pointsGained,
    });
  });

  // Calculate streaks
  let currentStreak = { type: 'W' as 'W' | 'L', count: 0 };
  let bestStreak = { type: 'W' as 'W' | 'L', count: 0 };
  
  if (player.history.length > 0) {
    // Current streak
    const lastResult = player.history[player.history.length - 1];
    currentStreak.type = lastResult as 'W' | 'L';
    for (let i = player.history.length - 1; i >= 0; i--) {
      if (player.history[i] === lastResult) {
        currentStreak.count++;
      } else {
        break;
      }
    }

    // Best streak (any type)
    let tempStreak = { type: player.history[0] as 'W' | 'L', count: 1 };
    for (let i = 1; i < player.history.length; i++) {
      if (player.history[i] === tempStreak.type) {
        tempStreak.count++;
      } else {
        if (tempStreak.type === 'W' && tempStreak.count > bestStreak.count) {
          bestStreak = { ...tempStreak };
        }
        tempStreak = { type: player.history[i] as 'W' | 'L', count: 1 };
      }
    }
    // Check last streak
    if (tempStreak.type === 'W' && tempStreak.count > bestStreak.count) {
      bestStreak = { ...tempStreak };
    }
  }

  // Performance split by match type
  const playerMatches = matches.filter(match => {
    const allPlayers = [...match.team1, ...match.team2];
    return allPlayers.includes(playerName);
  });

  const singoloMatches = playerMatches.filter(m => !m.is_double);
  const doppioMatches = playerMatches.filter(m => m.is_double);

  const singoloWins = singoloMatches.filter(match => {
    const winner = match.score1 > match.score2;
    const winningTeam = winner ? match.team1 : match.team2;
    return winningTeam.includes(playerName);
  }).length;

  const doppioWins = doppioMatches.filter(match => {
    const winner = match.score1 > match.score2;
    const winningTeam = winner ? match.team1 : match.team2;
    return winningTeam.includes(playerName);
  }).length;

  const singoloWinRate = singoloMatches.length > 0 ? (singoloWins / singoloMatches.length) * 100 : 0;
  const doppioWinRate = doppioMatches.length > 0 ? (doppioWins / doppioMatches.length) * 100 : 0;

  // Balanced rivalries (close records)
  const balancedRivalries = matchups
    .filter(m => {
      const diff = Math.abs(m.wins - m.losses);
      return m.totalMatches >= 5 && diff <= 2; // At least 5 matches and difference <= 2
    })
    .sort((a, b) => b.totalMatches - a.totalMatches)
    .slice(0, 3);

  // Favorite teammates (most frequent doubles partners)
  const allTeammateStats = getTeammateStats(playerName, matches, allPlayerNames);
  
  // Get teammates with max matches
  const maxMatches = allTeammateStats.length > 0 ? allTeammateStats[0].matchesPlayed : 0;
  const favoriteTeammates = allTeammateStats.filter(t => t.matchesPlayed === maxMatches && maxMatches > 0);

  return {
    nemesis,
    victim,
    favoriteTeammates,
    recentForm,
    bestStreak,
    currentStreak,
    singoloWinRate,
    doppioWinRate,
    singoloMatches: singoloMatches.length,
    doppioMatches: doppioMatches.length,
    balancedRivalries,
  };
}

/* ==================== Double Prediction ==================== */

export interface DoublePrediction {
  team1WinProbability: number;
  team2WinProbability: number;
  team1PairStats: { matches: number; wins: number; winRate: number };
  team2PairStats: { matches: number; wins: number; winRate: number };
  headToHeadMatches: number;
  insights: string[];
}

/**
 * Calculate pair statistics (how often 2 players played together and their win rate)
 */
function getPairStats(player1: string, player2: string, matches: Match[]): { matches: number; wins: number; winRate: number } {
  const pairMatches = matches.filter(match => {
    if (!match.is_double) return false;
    
    // Check if both players are in the same team
    const bothInTeam1 = match.team1.includes(player1) && match.team1.includes(player2);
    const bothInTeam2 = match.team2.includes(player1) && match.team2.includes(player2);
    
    return bothInTeam1 || bothInTeam2;
  });

  const wins = pairMatches.filter(match => {
    const winner = match.score1 > match.score2;
    const winningTeam = winner ? match.team1 : match.team2;
    return winningTeam.includes(player1);
  }).length;

  const winRate = pairMatches.length > 0 ? (wins / pairMatches.length) * 100 : 50;

  return {
    matches: pairMatches.length,
    wins,
    winRate,
  };
}

/**
 * Calculate head-to-head for two pairs
 */
function getPairHeadToHead(
  team1Player1: string,
  team1Player2: string,
  team2Player1: string,
  team2Player2: string,
  matches: Match[]
): { matches: number; team1Wins: number; team2Wins: number } {
  const h2hMatches = matches.filter(match => {
    if (!match.is_double) return false;
    
    // Check if team1 pair played against team2 pair
    const team1Set = new Set([team1Player1, team1Player2]);
    const team2Set = new Set([team2Player1, team2Player2]);
    
    const matchTeam1 = new Set(match.team1);
    const matchTeam2 = new Set(match.team2);
    
    // Check if team1 set matches either matchTeam1 or matchTeam2
    const team1IsMatchTeam1 = team1Set.size === matchTeam1.size && [...team1Set].every(p => matchTeam1.has(p));
    const team1IsMatchTeam2 = team1Set.size === matchTeam2.size && [...team1Set].every(p => matchTeam2.has(p));
    
    const team2IsMatchTeam1 = team2Set.size === matchTeam1.size && [...team2Set].every(p => matchTeam1.has(p));
    const team2IsMatchTeam2 = team2Set.size === matchTeam2.size && [...team2Set].every(p => matchTeam2.has(p));
    
    return (team1IsMatchTeam1 && team2IsMatchTeam2) || (team1IsMatchTeam2 && team2IsMatchTeam1);
  });

  let team1Wins = 0;
  let team2Wins = 0;

  h2hMatches.forEach(match => {
    const winner = match.score1 > match.score2;
    const winningTeam = winner ? match.team1 : match.team2;
    
    if (winningTeam.includes(team1Player1)) {
      team1Wins++;
    } else {
      team2Wins++;
    }
  });

  return {
    matches: h2hMatches.length,
    team1Wins,
    team2Wins,
  };
}

/**
 * Calculate win probability for doubles match
 */
export function calculateDoubleProbability(
  team1Player1Name: string,
  team1Player2Name: string,
  team2Player1Name: string,
  team2Player2Name: string,
  allPlayers: Player[],
  matches: Match[]
): DoublePrediction {
  const team1P1 = allPlayers.find(p => p.name === team1Player1Name);
  const team1P2 = allPlayers.find(p => p.name === team1Player2Name);
  const team2P1 = allPlayers.find(p => p.name === team2Player1Name);
  const team2P2 = allPlayers.find(p => p.name === team2Player2Name);

  // Get pair statistics
  const team1PairStats = getPairStats(team1Player1Name, team1Player2Name, matches);
  const team2PairStats = getPairStats(team2Player1Name, team2Player2Name, matches);

  // Get head-to-head between the two pairs
  const pairH2H = getPairHeadToHead(
    team1Player1Name, team1Player2Name,
    team2Player1Name, team2Player2Name,
    matches
  );

  let team1Score = 0;
  let team2Score = 0;

  // 1. Pair synergy weight (25%) - Updated: performance individuale conta di più
  const pairWeight = 0.25;
  team1Score += (team1PairStats.winRate / 100) * pairWeight;
  team2Score += (team2PairStats.winRate / 100) * pairWeight;

  // 2. Head-to-head between pairs (30%)
  const h2hWeight = 0.3;
  if (pairH2H.matches > 0) {
    team1Score += (pairH2H.team1Wins / pairH2H.matches) * h2hWeight;
    team2Score += (pairH2H.team2Wins / pairH2H.matches) * h2hWeight;
  } else {
    team1Score += h2hWeight * 0.5;
    team2Score += h2hWeight * 0.5;
  }

  // 3. Individual win rates in doubles (45%) - Updated: fattore più importante
  const individualWeight = 0.45;
  
  const getDoubleWinRate = (playerName: string): number => {
    const playerDoubles = matches.filter(m => {
      if (!m.is_double) return false;
      return m.team1.includes(playerName) || m.team2.includes(playerName);
    });
    
    if (playerDoubles.length === 0) return 0.5;
    
    const wins = playerDoubles.filter(m => {
      const winner = m.score1 > m.score2;
      const winningTeam = winner ? m.team1 : m.team2;
      return winningTeam.includes(playerName);
    }).length;
    
    return wins / playerDoubles.length;
  };

  const team1AvgWinRate = (getDoubleWinRate(team1Player1Name) + getDoubleWinRate(team1Player2Name)) / 2;
  const team2AvgWinRate = (getDoubleWinRate(team2Player1Name) + getDoubleWinRate(team2Player2Name)) / 2;

  team1Score += team1AvgWinRate * individualWeight;
  team2Score += team2AvgWinRate * individualWeight;

  // Normalize to percentages
  const totalScore = team1Score + team2Score;
  const team1WinProbability = (team1Score / totalScore) * 100;
  const team2WinProbability = (team2Score / totalScore) * 100;

  // Generate insights
  const insights: string[] = [];

  // Pair synergy insights
  if (team1PairStats.matches > 0) {
    insights.push(
      `${team1Player1Name}-${team1Player2Name}: ${team1PairStats.winRate.toFixed(0)}% vittorie in ${team1PairStats.matches} match insieme`
    );
  } else {
    insights.push(`${team1Player1Name}-${team1Player2Name}: prima volta insieme`);
  }

  if (team2PairStats.matches > 0) {
    insights.push(
      `${team2Player1Name}-${team2Player2Name}: ${team2PairStats.winRate.toFixed(0)}% vittorie in ${team2PairStats.matches} match insieme`
    );
  } else {
    insights.push(`${team2Player1Name}-${team2Player2Name}: prima volta insieme`);
  }

  // Head-to-head insight
  if (pairH2H.matches > 0) {
    insights.push(
      `Queste coppie si sono già affrontate ${pairH2H.matches} ${pairH2H.matches === 1 ? 'volta' : 'volte'} (${pairH2H.team1Wins}-${pairH2H.team2Wins})`
    );
  }

  // Cross-matchup insights (individual h2h between players from different teams)
  const crossH2H = calculateHeadToHead(team1Player1Name, team2Player1Name, matches);
  if (crossH2H.totalMatches >= 3) {
    if (crossH2H.player1Wins > crossH2H.player2Wins) {
      insights.push(`${team1Player1Name} domina contro ${team2Player1Name} (${crossH2H.player1Wins}-${crossH2H.player2Wins})`);
    } else if (crossH2H.player2Wins > crossH2H.player1Wins) {
      insights.push(`${team2Player1Name} domina contro ${team1Player1Name} (${crossH2H.player2Wins}-${crossH2H.player1Wins})`);
    }
  }

  return {
    team1WinProbability,
    team2WinProbability,
    team1PairStats,
    team2PairStats,
    headToHeadMatches: pairH2H.matches,
    insights: insights.slice(0, 3),
  };
}