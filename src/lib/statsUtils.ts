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

export interface FormPeriod {
  period: string;
  wins: number;
  losses: number;
  pointsChange: number;
}

export interface PlayerAdvancedStats {
  nemesis: PlayerMatchup | null;
  victim: PlayerMatchup | null;
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
    const allPlayers = [...team1Players, ...team2Players];
    
    // For singles: both players must be in the match
    if (!match.is_double) {
      return allPlayers.includes(player1Name) && allPlayers.includes(player2Name);
    }
    
    // For doubles: players must be on opposite teams
    const p1InTeam1 = team1Players.includes(player1Name);
    const p2InTeam1 = team1Players.includes(player2Name);
    
    return (p1InTeam1 && !p2InTeam1) || (!p1InTeam1 && p2InTeam1);
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

  // Find nemesis (most losses against)
  const nemesis = matchups.length > 0
    ? matchups.reduce((prev, current) => 
        current.losses > prev.losses ? current : prev
      )
    : null;

  // Find victim (most wins against)
  const victim = matchups.length > 0
    ? matchups.reduce((prev, current) => 
        current.wins > prev.wins ? current : prev
      )
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

  return {
    nemesis: nemesis && nemesis.losses > 0 ? nemesis : null,
    victim: victim && victim.wins > 0 ? victim : null,
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
