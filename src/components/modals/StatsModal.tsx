import { useState, useEffect } from 'react';
import { Player, getPlayers, Match, getMatches, calculateMatchPoints } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { Trophy, Target, Flame, TrendingUp, TrendingDown, TrendingUpDown, Users, X } from 'lucide-react';

interface StatsModalProps {
  type: 'leader' | 'matches' | 'winStreak' | 'lossStreak' | 'winRate' | 'lossRate' | 'twoWeeks' | 'mostPlayedPair';
  onClose: () => void;
}

interface PairStats {
  player1: string;
  player2: string;
  matches: number;
  wins: number;
  losses: number;
}

export default function StatsModal({ type, onClose }: StatsModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [playersData, matchesData] = await Promise.all([getPlayers(), getMatches()]);
    setPlayers(playersData);
    setMatches(matchesData);
  }

  function calculateRecentPoints(playerName: string) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    let points = 0;
    matches
      .filter(m => new Date(m.played_at) >= twoWeeksAgo)
      .forEach(m => {
        const winners = m.score1 > m.score2 ? m.team1 : m.team2;
        const losers = m.score1 > m.score2 ? m.team2 : m.team1;
        const wScore = Math.max(m.score1, m.score2);
        const lScore = Math.min(m.score1, m.score2);
        const pts = calculateMatchPoints(wScore, lScore);
        
        if (winners.includes(playerName)) points += pts.winner;
        if (losers.includes(playerName)) points += pts.loser;
      });
    
    return points;
  }

  function calculateMaxStreak(history: string[], targetResult: 'W' | 'L'): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const result of history) {
      if (result === targetResult) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  function getMostPlayedPairs(): PairStats[] {
    // Count pairs from double matches
    const pairCounts = new Map<string, PairStats>();
    
    matches
      .filter(m => m.is_double) // Only doubles
      .forEach(match => {
        // Process both teams
        [match.team1, match.team2].forEach((team, teamIndex) => {
          if (team.length === 2) {
            // Create unique pair key (alphabetically sorted)
            const [p1, p2] = team.sort();
            const pairKey = `${p1}|${p2}`;
            
            if (!pairCounts.has(pairKey)) {
              pairCounts.set(pairKey, {
                player1: p1,
                player2: p2,
                matches: 0,
                wins: 0,
                losses: 0,
              });
            }
            
            const pairStats = pairCounts.get(pairKey)!;
            pairStats.matches++;
            
            // Check if this team won
            const won = (teamIndex === 0 && match.score1 > match.score2) || 
                        (teamIndex === 1 && match.score2 > match.score1);
            if (won) {
              pairStats.wins++;
            } else {
              pairStats.losses++;
            }
          }
        });
      });
    
    // Convert to array and sort by matches played
    return Array.from(pairCounts.values())
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 10);
  }

  function getTopPlayers() {
    if (type === 'mostPlayedPair') {
      return getMostPlayedPairs();
    }

    if (type === 'winStreak') {
      // Calculate MAXIMUM consecutive WINS across entire history
      return players
        .map(p => ({
          player: p,
          value: calculateMaxStreak(p.history, 'W')
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }

    if (type === 'lossStreak') {
      // Calculate MAXIMUM consecutive LOSSES across entire history
      return players
        .map(p => ({
          player: p,
          value: calculateMaxStreak(p.history, 'L')
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }

    if (type === 'matches') {
      // Order by total number of matches played
      return players
        .map(p => ({
          player: p,
          value: p.wins + p.losses
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }

    if (type === 'winRate') {
      // Best win % (minimum 5 games)
      return players
        .filter(p => (p.wins + p.losses) >= 5)
        .map(p => {
          const total = p.wins + p.losses;
          const winRate = (p.wins / total) * 100;
          return { player: p, value: winRate };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }

    if (type === 'lossRate') {
      // Worst loss % (minimum 5 games)
      return players
        .filter(p => (p.wins + p.losses) >= 5)
        .map(p => {
          const total = p.wins + p.losses;
          const lossRate = (p.losses / total) * 100;
          return { player: p, value: lossRate };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }

    if (type === 'twoWeeks') {
      // Calculate points gained in last 14 days for each player
      const withRecentPoints = players
        .map(p => ({ 
          player: p, 
          value: calculateRecentPoints(p.name) 
        }))
        .filter(p => p.value !== 0) // Only show players who played in last 14 days
        .sort((a, b) => b.value - a.value);
      
      if (withRecentPoints.length === 0) {
        return [];
      }
      
      // Get top 5 and bottom 5
      const numPlayers = Math.min(5, withRecentPoints.length);
      const top5 = withRecentPoints.slice(0, numPlayers);
      const bottom5 = withRecentPoints.length > 5 
        ? withRecentPoints.slice(-numPlayers).reverse()
        : [];
      
      return [...top5, ...bottom5];
    }
    
    // For 'leader', just show top 5 by points
    return players
      .slice(0, 5)
      .map(p => ({ player: p, value: p.points }));
  }

  const topPlayers = getTopPlayers();
  const isPairStats = type === 'mostPlayedPair';

  const titles = {
    leader: 'Re del Ranking',
    matches: 'Più Partite',
    winStreak: 'Miglior Striscia',
    lossStreak: 'Peggior Striscia',
    winRate: 'Miglior % Vittorie',
    lossRate: 'Peggior % Sconfitte',
    twoWeeks: 'Top e Flop - 14gg',
    mostPlayedPair: 'Coppia Più Ricorrente',
  };

  const IconComponent = {
    leader: Trophy,
    matches: Target,
    winStreak: Flame,
    lossStreak: Flame,
    winRate: TrendingUp,
    lossRate: TrendingDown,
    twoWeeks: TrendingUpDown,
    mostPlayedPair: Users,
  }[type];

  function formatValue(value: number, playerIndex: number) {
    if (type === 'winRate' || type === 'lossRate') {
      return `${value.toFixed(1)}%`;
    }
    if (type === 'twoWeeks') {
      return value > 0 ? `+${formatPoints(value)}` : formatPoints(value);
    }
    if (type === 'winStreak' || type === 'lossStreak' || type === 'matches') {
      return value.toString();
    }
    return formatPoints(value);
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
          <div className="flex items-center gap-3">
            <IconComponent 
              className={`w-6 h-6 ${type === 'lossStreak' || type === 'lossRate' ? 'text-destructive' : type === 'winRate' || type === 'winStreak' ? 'text-green-500' : ''}`}
            />
            <h2 className="text-2xl font-semibold">{titles[type]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {topPlayers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {isPairStats ? 'Nessuna coppia trovata (solo partite doppie)' : 'Nessun dato disponibile per questo periodo'}
            </div>
          ) : isPairStats ? (
            // Pair stats display
            <div className="space-y-3">
              {(topPlayers as PairStats[]).map((pair, index) => {
                const player1 = players.find(p => p.name === pair.player1);
                const player2 = players.find(p => p.name === pair.player2);
                const winRate = (pair.wins / pair.matches) * 100;
                
                return (
                  <div
                    key={`${pair.player1}-${pair.player2}`}
                    className={`p-4 border-2 ${
                      index === 0 ? 'border-gold bg-gold/10' : 'border-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`text-2xl font-bold w-8 ${index === 0 ? 'text-gold' : ''}`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <PlayerAvatar name={pair.player1} avatar={player1?.avatar} size="sm" />
                        <span className="font-semibold">{pair.player1}</span>
                        <span className="text-muted-foreground">+</span>
                        <PlayerAvatar name={pair.player2} avatar={player2?.avatar} size="sm" />
                        <span className="font-semibold">{pair.player2}</span>
                      </div>
                      
                      <div className="text-xl font-bold">
                        {pair.matches}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground ml-12">
                      {pair.wins}V - {pair.losses}S • {winRate.toFixed(1)}% vittorie
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {type === 'twoWeeks' && topPlayers.length > 5 && (
                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 border-2 border-green-500 bg-green-500/10 text-center">
                    <div className="font-bold">🔥 TOP 5</div>
                  </div>
                  <div className="p-3 border-2 border-destructive bg-destructive/10 text-center">
                    <div className="font-bold">💧 FLOP 5</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {topPlayers.map(({ player, value }: any, index) => {
                  const isTopSection = type === 'twoWeeks' && index < 5;
                  const isFlopSection = type === 'twoWeeks' && index >= 5;
                  
                  return (
                    <div
                      key={`${player.id}-${index}`}
                      className={`flex items-center gap-4 p-4 border-2 ${
                        index === 0 && type !== 'twoWeeks' ? 'border-gold bg-gold/10' : 
                        isTopSection ? 'border-green-500 bg-green-500/5' :
                        isFlopSection ? 'border-destructive bg-destructive/5' :
                        'border-foreground'
                      }`}
                    >
                      <div className={`text-2xl font-bold w-8 ${
                        index === 0 && type !== 'twoWeeks' ? 'text-gold' : ''
                      }`}>
                        {type === 'twoWeeks' && isFlopSection ? index - 4 : index + 1}
                      </div>
                      
                      <PlayerAvatar name={player.name} avatar={player.avatar} size="sm" />
                      
                      <div className="flex-1">
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.wins}V - {player.losses}S
                        </div>
                      </div>
                      
                      <div className={`text-xl font-bold ${
                        type === 'twoWeeks' && value < 0 ? 'text-destructive' : 
                        type === 'twoWeeks' && value > 0 ? 'text-green-500' : ''
                      }`}>
                        {formatValue(value, index)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}