import { useState, useEffect } from 'react';
import { Player, getPlayers, Match, getMatches, calculateMatchPoints } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { Trophy, Target, Flame, TrendingUp, TrendingDown, TrendingUpDown, X } from 'lucide-react';

interface StatsModalProps {
  type: 'leader' | 'matches' | 'winStreak' | 'lossStreak' | 'winRate' | 'lossRate' | 'twoWeeks';
  onClose: () => void;
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

  function getTopPlayers() {
    if (type === 'winStreak') {
      // Only count consecutive WINS from the end
      return players
        .map(p => {
          let streak = 0;
          for (let i = p.history.length - 1; i >= 0; i--) {
            if (p.history[i] === 'W') streak++;
            else break;
          }
          return { player: p, value: streak };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }

    if (type === 'lossStreak') {
      // Only count consecutive LOSSES from the end
      return players
        .map(p => {
          let streak = 0;
          for (let i = p.history.length - 1; i >= 0; i--) {
            if (p.history[i] === 'L') streak++;
            else break;
          }
          return { player: p, value: streak };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
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
      // Top 5 and Bottom 5 for last 14 days
      const withRecentPoints = players
        .map(p => ({ player: p, value: calculateRecentPoints(p.name) }))
        .sort((a, b) => b.value - a.value);
      
      // Get top 5 and bottom 5
      const top5 = withRecentPoints.slice(0, 5);
      const bottom5 = withRecentPoints.slice(-5).reverse();
      
      return [...top5, ...bottom5];
    }
    
    // For 'leader', just show top 5 by points
    return players
      .slice(0, 5)
      .map(p => ({ player: p, value: p.points }));
  }

  const topPlayers = getTopPlayers();

  const titles = {
    leader: 'Re del Ranking',
    matches: 'Più Partite',
    winStreak: 'Miglior Striscia',
    lossStreak: 'Peggior Striscia',
    winRate: 'Miglior % Vittorie',
    lossRate: 'Peggior % Sconfitte',
    twoWeeks: 'Top e Flop - 14gg',
  };

  const IconComponent = {
    leader: Trophy,
    matches: Target,
    winStreak: Flame,
    lossStreak: Flame,
    winRate: TrendingUp,
    lossRate: TrendingDown,
    twoWeeks: TrendingUpDown,
  }[type];

  function formatValue(value: number, playerIndex: number) {
    if (type === 'winRate' || type === 'lossRate') {
      return `${value.toFixed(1)}%`;
    }
    if (type === 'twoWeeks') {
      return value > 0 ? `+${formatPoints(value)}` : formatPoints(value);
    }
    if (type === 'winStreak' || type === 'lossStreak') {
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
              className={`w-6 h-6 ${type === 'lossStreak' || type === 'lossRate' ? 'text-destructive' : type === 'winRate' ? 'text-green-500' : ''}`}
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
          {type === 'twoWeeks' && (
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
            {topPlayers.map(({ player, value }, index) => {
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
                    {type === 'twoWeeks' ? (index < 5 ? index + 1 : index - 4) : index + 1}
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
        </div>
      </div>
    </div>
  );
}