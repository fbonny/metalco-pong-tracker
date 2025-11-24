import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import PlayerAvatar from '@/components/PlayerAvatar';

interface StatsModalProps {
  type: 'leader' | 'matches' | 'streak';
  onClose: () => void;
}

export default function StatsModal({ type, onClose }: StatsModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const data = await getPlayers();
    setPlayers(data);
  }

  function getTopPlayers() {
    if (type === 'streak') {
      return players
        .map(p => {
          let streak = 0;
          let maxStreak = 0;
          let currentType = '';
          
          p.history.forEach(result => {
            if (result === currentType) {
              streak++;
            } else {
              maxStreak = Math.max(maxStreak, streak);
              streak = 1;
              currentType = result;
            }
          });
          maxStreak = Math.max(maxStreak, streak);
          
          return { player: p, value: maxStreak };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }
    
    // For 'leader', just show top 5 by points
    return players
      .slice(0, 5)
      .map(p => ({ player: p, value: p.points }));
  }

  const topPlayers = getTopPlayers();

  const titles = {
    leader: 'Re del Ranking',
    matches: 'Most Matches',
    streak: 'Best Win Streak',
  };

  const icons = {
    leader: 'emoji_events',
    matches: 'sports_tennis',
    streak: 'local_fire_department',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">{icons[type]}</span>
            <h2 className="text-2xl font-semibold">{titles[type]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {topPlayers.map(({ player, value }, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 border-2 ${
                  index === 0 ? 'border-gold bg-gold/10' : 'border-foreground'
                }`}
              >
                <div className={`text-2xl font-bold w-8 ${index === 0 ? 'text-gold' : ''}`}>
                  {index + 1}
                </div>
                
                <PlayerAvatar name={player.name} avatar={player.avatar} size="sm" />
                
                <div className="flex-1">
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {player.wins}W - {player.losses}L
                  </div>
                </div>
                
                <div className="text-xl font-bold">
                  {type === 'streak' ? value : value.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
