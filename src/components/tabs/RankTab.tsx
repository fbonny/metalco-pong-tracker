import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';

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
    setPlayers(data);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Leaderboard</h2>
      
      <div className="space-y-2">
        {players.map((player, index) => {
          const rank = index + 1;
          const isLeader = rank === 1;
          
          return (
            <button
              key={player.id}
              onClick={() => onPlayerClick(player)}
              className={`w-full flex items-center gap-4 p-4 border-2 transition-all ${
                isLeader
                  ? 'border-gold bg-gold/10 leader-glow'
                  : 'border-foreground hover:bg-muted'
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
                </div>
                <div className="text-sm text-muted-foreground">
                  {player.wins}W - {player.losses}L
                </div>
              </div>
              
              <div className={`text-2xl font-bold ${isLeader ? 'text-gold' : ''}`}>
                {formatPoints(player.points)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}