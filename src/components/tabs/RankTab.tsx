import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { BarChart3 } from 'lucide-react';

interface RankTabProps {
  onPlayerClick: (player: Player) => void;
}

export default function RankTab({ onPlayerClick }: RankTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const data = await getPlayers();
    // Ordina per ranking (punti desc, poi vittorie desc) - converte points a numero
    const ranked = [...data].sort((a, b) => {
      const pointsA = typeof a.points === 'string' ? parseFloat(a.points) : a.points;
      const pointsB = typeof b.points === 'string' ? parseFloat(b.points) : b.points;
      return pointsB - pointsA || b.wins - a.wins;
    });
    setPlayers(ranked);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Classifica</h2>
      
      <div className="space-y-2">
        {players.map((player, index) => {
          const rank = index + 1;
          const isLeader = rank === 1;
          const last10 = player.history.slice(-10);
          
          return (
            <div
              key={player.id}
              className={`w-full flex items-center gap-4 p-4 border-2 ${
                isLeader
                  ? 'border-gold bg-gold/10 leader-glow'
                  : 'border-foreground'
              }`}
            >
              <div className={`text-2xl font-bold w-12 text-center ${isLeader ? 'text-gold' : ''}`}>
                {rank}
              </div>
              
              <PlayerAvatar name={player.name} avatar={player.avatar} />
              
              <div className="flex-1 text-left">
                <div className="font-semibold flex items-center gap-2">
                  {player.name}
                  {isLeader && (
                    <span className="px-2 py-0.5 bg-gold text-gold-foreground text-xs font-bold">
                      LEADER
                    </span>
                  )}
                  {/* Stats button */}
                  <button
                    onClick={() => onPlayerClick(player)}
                    className="p-1.5 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors ml-2"
                    title="Vedi Statistiche"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {player.wins}V - {player.losses}S
                </div>
                {/* Last 10 matches indicators */}
                {last10.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {last10.map((result, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          result === 'W' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={result === 'W' ? 'Vittoria' : 'Sconfitta'}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className={`text-2xl font-bold ${isLeader ? 'text-gold' : ''}`}>
                {formatPoints(player.points)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}