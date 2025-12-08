import { Match, Player } from './database';

export interface DailyInsight {
  type: 'streak' | 'battle' | 'record' | 'fun' | 'doubles';
  emoji: string;
  text: string;
  players: string[];
}

/**
 * Generate insights for matches played on a specific date
 */
export function generateDailyInsights(
  matches: Match[],
  players: Player[],
  targetDate: Date
): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  // Filter matches for the target date
  const dayMatches = matches.filter(match => {
    const matchDate = new Date(match.played_at);
    return (
      matchDate.getDate() === targetDate.getDate() &&
      matchDate.getMonth() === targetDate.getMonth() &&
      matchDate.getFullYear() === targetDate.getFullYear()
    );
  });

  if (dayMatches.length === 0) {
    return [{
      type: 'fun',
      emoji: '🦗',
      text: 'Silenzio assoluto oggi... Nessuna partita giocata! Qualcuno ha paura?',
      players: [],
    }];
  }

  // Get all recent matches (for streak analysis)
  const recentMatches = matches
    .sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime())
    .slice(-50); // Last 50 matches

  // 1. STREAK ANALYSIS
  const streakInsights = analyzeStreaks(players, recentMatches, dayMatches);
  insights.push(...streakInsights);

  // 2. EPIC BATTLES
  const battleInsights = analyzeBattles(dayMatches);
  insights.push(...battleInsights);

  // 3. DEMOLITIONS
  const demolitionInsights = analyzeDemolitions(dayMatches);
  insights.push(...demolitionInsights);

  // 4. DOUBLES PERFORMANCE
  const doublesInsights = analyzeDoubles(dayMatches);
  insights.push(...doublesInsights);

  // 5. FUN FACTS
  const funInsights = analyzeFunFacts(dayMatches);
  insights.push(...funInsights);

  // 6. VENDETTA/REVENGE
  const revengeInsights = analyzeRevenge(dayMatches, matches);
  insights.push(...revengeInsights);

  // Return top 5 most interesting insights
  return insights.slice(0, 5);
}

/**
 * Analyze winning/losing streaks
 */
function analyzeStreaks(
  players: Player[],
  recentMatches: Match[],
  todayMatches: Match[]
): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  players.forEach(player => {
    const history = player.history || [];
    if (history.length === 0) return;

    // Check if player played today
    const playedToday = todayMatches.some(m => 
      m.team1.includes(player.name) || m.team2.includes(player.name)
    );
    if (!playedToday) return;

    // Calculate current streak
    let currentStreak = 0;
    let streakType = history[history.length - 1];
    
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Generate insights for significant streaks
    if (streakType === 'W' && currentStreak >= 4) {
      insights.push({
        type: 'streak',
        emoji: '🔥',
        text: `Momento d'oro per ${player.name}: ${currentStreak} vittorie consecutive! Inarrestabile!`,
        players: [player.name],
      });
    } else if (streakType === 'L' && currentStreak >= 3) {
      const adjectives = ['disastrosa', 'nera', 'difficile', 'complicata', 'drammatica'];
      const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
      insights.push({
        type: 'streak',
        emoji: '❄️',
        text: `Continua la striscia ${randomAdj} di ${player.name}: ${currentStreak} sconfitte di fila. Serve la svolta!`,
        players: [player.name],
      });
    }

    // Hot form (many wins in recent matches)
    const last10 = history.slice(-10);
    const recentWins = last10.filter(r => r === 'W').length;
    if (recentWins >= 8 && !insights.some(i => i.players.includes(player.name))) {
      insights.push({
        type: 'streak',
        emoji: '👑',
        text: `${player.name} in stato di grazia: ${recentWins} vittorie nelle ultime 10 partite!`,
        players: [player.name],
      });
    }
  });

  return insights;
}

/**
 * Analyze epic close battles (21-20, 21-19)
 */
function analyzeBattles(dayMatches: Match[]): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  dayMatches.forEach(match => {
    const winner = match.score1 > match.score2;
    const winnerScore = winner ? match.score1 : match.score2;
    const loserScore = winner ? match.score2 : match.score1;
    const diff = winnerScore - loserScore;
    
    if (diff <= 2 && winnerScore >= 20) {
      const winnerTeam = winner ? match.team1 : match.team2;
      const loserTeam = winner ? match.team2 : match.team1;
      const winnerNames = winnerTeam.join(' + ');
      const loserNames = loserTeam.join(' + ');
      
      const phrases = [
        `Battaglia epica: ${winnerNames} batte ${loserNames} ${winnerScore}-${loserScore}! Che partita!`,
        `Tensione alle stelle! ${winnerNames} vince di un soffio contro ${loserNames} (${winnerScore}-${loserScore})`,
        `Match thriller: ${winnerNames} supera ${loserNames} ${winnerScore}-${loserScore}. Cardiopalma!`,
      ];
      
      insights.push({
        type: 'battle',
        emoji: '⚔️',
        text: phrases[Math.floor(Math.random() * phrases.length)],
        players: [...winnerTeam, ...loserTeam],
      });
    }
  });

  return insights;
}

/**
 * Analyze demolitions (big score differences)
 */
function analyzeDemolitions(dayMatches: Match[]): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  dayMatches.forEach(match => {
    const winner = match.score1 > match.score2;
    const winnerScore = winner ? match.score1 : match.score2;
    const loserScore = winner ? match.score2 : match.score1;
    const diff = winnerScore - loserScore;
    
    if (diff >= 10) {
      const winnerTeam = winner ? match.team1 : match.team2;
      const loserTeam = winner ? match.team2 : match.team1;
      const winnerNames = winnerTeam.join(' + ');
      const loserNames = loserTeam.join(' + ');
      
      const phrases = [
        `Demolizione! ${winnerNames} strapazza ${loserNames} ${winnerScore}-${loserScore}. No mercy!`,
        `Dominio assoluto: ${winnerNames} travolge ${loserNames} ${winnerScore}-${loserScore}!`,
        `${loserNames} umiliato da ${winnerNames}: ${winnerScore}-${loserScore}. Che lezione!`,
      ];
      
      insights.push({
        type: 'record',
        emoji: '💀',
        text: phrases[Math.floor(Math.random() * phrases.length)],
        players: [...winnerTeam, ...loserTeam],
      });
    }
  });

  return insights;
}

/**
 * Analyze doubles performance
 */
function analyzeDoubles(dayMatches: Match[]): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  const doublesMatches = dayMatches.filter(m => m.is_double);
  if (doublesMatches.length === 0) return insights;

  // Find pairs and their performance today
  const pairStats: Record<string, { wins: number; losses: number; players: string[] }> = {};
  
  doublesMatches.forEach(match => {
    const winner = match.score1 > match.score2;
    const winningTeam = winner ? match.team1 : match.team2;
    const losingTeam = winner ? match.team2 : match.team1;
    
    const winningPairKey = [...winningTeam].sort().join('+');
    const losingPairKey = [...losingTeam].sort().join('+');
    
    if (!pairStats[winningPairKey]) {
      pairStats[winningPairKey] = { wins: 0, losses: 0, players: winningTeam };
    }
    if (!pairStats[losingPairKey]) {
      pairStats[losingPairKey] = { wins: 0, losses: 0, players: losingTeam };
    }
    
    pairStats[winningPairKey].wins++;
    pairStats[losingPairKey].losses++;
  });

  // Find best and worst pairs
  Object.entries(pairStats).forEach(([pairKey, stats]) => {
    const pairName = stats.players.join(' + ');
    
    if (stats.wins >= 3 && stats.losses === 0) {
      insights.push({
        type: 'doubles',
        emoji: '🤝',
        text: `Dream team oggi: ${pairName} imbattibili con ${stats.wins} vittorie su ${stats.wins}!`,
        players: stats.players,
      });
    } else if (stats.losses >= 3 && stats.wins === 0) {
      insights.push({
        type: 'doubles',
        emoji: '💔',
        text: `Coppia maledetta: ${pairName} 0 vittorie su ${stats.losses} partite. Meglio separarsi?`,
        players: stats.players,
      });
    }
  });

  return insights;
}

/**
 * Fun facts about the day
 */
function analyzeFunFacts(dayMatches: Match[]): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  // Count close matches
  const closeMatches = dayMatches.filter(m => {
    const diff = Math.abs(m.score1 - m.score2);
    return diff <= 2;
  });
  
  if (closeMatches.length >= dayMatches.length * 0.6 && dayMatches.length >= 3) {
    insights.push({
      type: 'fun',
      emoji: '🎯',
      text: `Giornata di equilibrio: il ${Math.round(closeMatches.length / dayMatches.length * 100)}% delle partite si è deciso per 2 punti o meno!`,
      players: [],
    });
  }

  // All matches won by same person
  const allPlayers = new Set<string>();
  dayMatches.forEach(m => {
    const winner = m.score1 > m.score2;
    const winningTeam = winner ? m.team1 : m.team2;
    winningTeam.forEach(p => allPlayers.add(p));
  });

  // Count wins per player
  const winCounts: Record<string, number> = {};
  dayMatches.forEach(m => {
    const winner = m.score1 > m.score2;
    const winningTeam = winner ? m.team1 : m.team2;
    winningTeam.forEach(p => {
      winCounts[p] = (winCounts[p] || 0) + 1;
    });
  });

  const topWinner = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0];
  if (topWinner && topWinner[1] >= 4) {
    insights.push({
      type: 'fun',
      emoji: '🏆',
      text: `${topWinner[0]} domina la giornata con ${topWinner[1]} vittorie! Player of the day!`,
      players: [topWinner[0]],
    });
  }

  return insights;
}

/**
 * Analyze revenge matches
 */
function analyzeRevenge(dayMatches: Match[], allMatches: Match[]): DailyInsight[] {
  const insights: DailyInsight[] = [];
  
  // For singles only
  const todaySingles = dayMatches.filter(m => !m.is_double);
  
  todaySingles.forEach(todayMatch => {
    const winner = todayMatch.score1 > todayMatch.score2;
    const winnerName = winner ? todayMatch.team1[0] : todayMatch.team2[0];
    const loserName = winner ? todayMatch.team2[0] : todayMatch.team1[0];
    
    // Find previous matches between these two (excluding today)
    const previousH2H = allMatches
      .filter(m => {
        if (m.is_double) return false;
        if (new Date(m.played_at).toDateString() === new Date(todayMatch.played_at).toDateString()) return false;
        
        const hasWinner = m.team1.includes(winnerName) || m.team2.includes(winnerName);
        const hasLoser = m.team1.includes(loserName) || m.team2.includes(loserName);
        return hasWinner && hasLoser;
      })
      .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
      .slice(0, 5); // Last 5 matches

    if (previousH2H.length >= 3) {
      // Check if loser was winning the H2H before
      const previousWins = previousH2H.filter(m => {
        const prevWinner = m.score1 > m.score2;
        const prevWinnerName = prevWinner ? m.team1[0] : m.team2[0];
        return prevWinnerName === loserName;
      }).length;

      if (previousWins >= 3) {
        insights.push({
          type: 'record',
          emoji: '🎯',
          text: `Vendetta servita fredda! ${winnerName} batte finalmente ${loserName} dopo ${previousWins} sconfitte consecutive!`,
          players: [winnerName, loserName],
        });
      }
    }
  });

  return insights;
}
