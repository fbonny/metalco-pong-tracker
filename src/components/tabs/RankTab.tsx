import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { BarChart3, Info } from 'lucide-react';

interface RankTabProps {
  onPlayerClick: (player: Player) => void;
  onStatsClick: (player: Player) => void;
}

export default function RankTab({ onPlayerClick, onStatsClick }: RankTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const data = await getPlayers();
    const ranked = [...data].sort((a, b) => {
      const pointsA = typeof a.points === 'string' ? parseFloat(a.points) : a.points;
      const pointsB = typeof b.points === 'string' ? parseFloat(b.points) : b.points;
      return pointsB - pointsA || b.wins - a.wins;
    });
    setPlayers(ranked);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">🏓 CLASSIFICA - VERSIONE AGGIORNATA 🏓</h2>
      
      <div className="space-y-2">
        {players.map((player, index) => {
          const rank = index + 1;
          const isLeader = rank === 1;
          const last10 = player.history.slice(-10);
          
          return (
            <div
              key={player.id}
              className={`w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-2 ${
                isLeader ? 'border-gold bg-gold/10 leader-glow' : 'border-foreground'
              }`}
            >
              <div className={`text-xl sm:text-2xl font-bold w-8 sm:w-12 text-center flex-shrink-0 ${isLeader ? 'text-gold' : ''}`}>
                {rank}
              </div>
              
              <div className="flex-shrink-0">
                <PlayerAvatar name={player.name} avatar={player.avatar} size="sm" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2 flex-wrap">
                  <span className="truncate">{player.name}</span>
                  {isLeader && (
                    <span className="px-2 py-0.5 bg-gold text-gold-foreground text-xs font-bold flex-shrink-0">
                      LEADER
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {player.wins}V - {player.losses}S
                </div>
                {last10.length > 0 && (
                  <div className="flex gap-1 mt-1 sm:mt-2">
                    {last10.map((result, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}
                        title={result === 'W' ? 'Vittoria' : 'Sconfitta'}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className={`text-xl sm:text-2xl font-bold flex-shrink-0 ${isLeader ? 'text-gold' : ''}`}>
                {formatPoints(player.points)}
              </div>

              <button
                onClick={() => onPlayerClick(player)}
                className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors flex-shrink-0"
                title="Profilo"
              >
                <Info className="w-5 h-5" />
              </button>

              <button
                onClick={() => onStatsClick(player)}
                className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors flex-shrink-0"
                title="Statistiche"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}