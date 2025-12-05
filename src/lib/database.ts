const DB_URL = 'https://9a23583f-f98.db-pool-europe-west1.altan.ai';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwNzkzMTc0MzQsImlhdCI6MTc2Mzk1NzQzNCwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoiYW5vbiJ9.hz_DIcdZmxo0F5SypV4J17FZRmTKdzZXc1WhPgeLH3k';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  skill?: string;
  lack?: string;
  fame_entries?: FameEntry[];
  hand: string;
  shot: string;
  wins: number;
  losses: number;
  points: number;
  history: string[];
  best_rank?: number;
  days_as_leader?: number;
  first_leader_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FameEntry {
  photo: string;
  date: string;
  caption?: string;
}

export interface Match {
  id: string;
  team1: string[];
  team2: string[];
  score1: number;
  score2: number;
  is_double: boolean;
  played_at: string;
  created_at: string;
}

export interface Report {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${DB_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`API error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Players
export async function getPlayers(): Promise<Player[]> {
  return fetchAPI('players?order=name.asc');
}

export async function createPlayer(player: Partial<Player>): Promise<Player> {
  const [newPlayer] = await fetchAPI('players', {
    method: 'POST',
    body: JSON.stringify(player),
  });
  return newPlayer;
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
  const response = await fetchAPI(`players?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  
  if (!response || response.length === 0) {
    throw new Error('Nessun dato restituito dal database dopo l\'aggiornamento');
  }
  
  return response[0];
}

export async function deletePlayer(id: string): Promise<void> {
  await fetchAPI(`players?id=eq.${id}`, {
    method: 'DELETE',
  });
}

// Matches
export async function getMatches(): Promise<Match[]> {
  return fetchAPI('matches?order=played_at.desc');
}

export async function createMatch(match: Partial<Match>): Promise<Match> {
  const [newMatch] = await fetchAPI('matches', {
    method: 'POST',
    body: JSON.stringify(match),
  });
  return newMatch;
}

export async function updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
  const [updated] = await fetchAPI(`matches?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return updated;
}

export async function deleteMatch(id: string): Promise<void> {
  await fetchAPI(`matches?id=eq.${id}`, {
    method: 'DELETE',
  });
}

// Reports
export async function getReports(): Promise<Report[]> {
  return fetchAPI('reports?order=created_at.desc');
}

export async function createReport(report: Partial<Report>): Promise<Report> {
  const [newReport] = await fetchAPI('reports', {
    method: 'POST',
    body: JSON.stringify(report),
  });
  return newReport;
}

export async function deleteReport(id: string): Promise<void> {
  await fetchAPI(`reports?id=eq.${id}`, {
    method: 'DELETE',
  });
}

// Points calculation
export function calculateMatchPoints(winnerScore: number, loserScore: number): { winner: number; loser: number } {
  // Overtime symbolic win (21-20)
  if (winnerScore === 21 && loserScore === 20) {
    return { winner: 7, loser: 3 };
  }
  
  // Standard win: 10 base + 0.5 per point diff beyond 2
  const diff = winnerScore - loserScore;
  const bonus = Math.max(0, (diff - 2) * 0.5);
  return { winner: 10 + bonus, loser: 0 };
}

// Recalculate all player stats from matches
export async function recalculateAllStats(): Promise<void> {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()]);
  
  // Initialize player stats
  const playerStats: Record<string, { wins: number; losses: number; points: number; history: string[] }> = {};
  players.forEach(p => {
    playerStats[p.name] = { wins: 0, losses: 0, points: 0, history: [] };
  });
  
  // Process matches in chronological order
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );
  
  sortedMatches.forEach(match => {
    const winner = match.score1 > match.score2;
    const winnerTeam = winner ? match.team1 : match.team2;
    const loserTeam = winner ? match.team2 : match.team1;
    const winnerScore = winner ? match.score1 : match.score2;
    const loserScore = winner ? match.score2 : match.score1;
    
    const pts = calculateMatchPoints(winnerScore, loserScore);
    
    winnerTeam.forEach(name => {
      if (playerStats[name]) {
        playerStats[name].wins++;
        playerStats[name].points += pts.winner;
        playerStats[name].history.push('W');
      }
    });
    
    loserTeam.forEach(name => {
      if (playerStats[name]) {
        playerStats[name].losses++;
        playerStats[name].points += pts.loser;
        playerStats[name].history.push('L');
      }
    });
  });
  
  // Calculate rankings and best rank
  const rankedPlayers = Object.entries(playerStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins);
  
  // Update all players
  await Promise.all(
    players.map((player, idx) => {
      const stats = playerStats[player.name];
      const currentRank = rankedPlayers.findIndex(p => p.name === player.name) + 1;
      
      // Calculate best rank: use current if player has no matches OR if current is better than recorded best
      let bestRank: number;
      const hasMatches = stats.wins + stats.losses > 0;
      
      if (!hasMatches) {
        // If no matches, don't set a best_rank (it will be set when they play their first match)
        bestRank = currentRank;
      } else if (player.best_rank) {
        // If has matches and has a recorded best, use the minimum
        bestRank = Math.min(player.best_rank, currentRank);
      } else {
        // If has matches but no recorded best, use current rank
        bestRank = currentRank;
      }
      
      return updatePlayer(player.id, {
        ...stats,
        best_rank: bestRank,
        updated_at: new Date().toISOString(),
      });
    })
  );
}