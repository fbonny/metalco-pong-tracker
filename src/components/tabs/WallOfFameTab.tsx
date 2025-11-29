import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import PlayerAvatar from '@/components/PlayerAvatar';
import { Crown } from 'lucide-react';

interface WallOfFameTabProps {
  onPlayerClick: (player: Player) => void;
}

export default function WallOfFameTab({ onPlayerClick }: WallOfFameTabProps) {
  const [legends, setLegends] = useState<Player[]>([]);

  useEffect(() => {
    loadLegends();
  }, []);

  async function loadLegends() {
    const players = await getPlayers();
    // Filter players who have been #1 at least once, sort by days_as_leader
    const hallOfFame = players
      .filter(p => (p.days_as_leader || 0) > 0)
      .sort((a, b) => (b.days_as_leader || 0) - (a.days_as_leader || 0));
    setLegends(hallOfFame);
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return 'Data non disponibile';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-gold" />
          <h2 className="text-3xl font-bold text-gold">Wall of Fame</h2>
          <Crown className="w-8 h-8 text-gold" />
        </div>
        <p className="text-muted-foreground">
          I leggendari giocatori che hanno conquistato il trono #1
        </p>
      </div>

      {legends.length === 0 ? (
        <div className="text-center py-16">
          <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">
            Nessun giocatore ha ancora conquistato il #1
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Gioca partite per salire in classifica!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {legends.map((player) => {
            return (
              <button
                key={player.id}
                onClick={() => onPlayerClick(player)}
                className="flex flex-col items-center gap-3 p-4 border-2 border-gold bg-gold/10 transition-all hover:scale-105 leader-glow"
              >
                {/* Player Avatar with gold ring */}
                <div className="ring-4 ring-gold ring-offset-4 ring-offset-background rounded-full">
                  <PlayerAvatar 
                    name={player.name} 
                    avatar={player.avatar} 
                    size="xl"
                  />
                </div>

                {/* Player Name */}
                <h3 className="text-lg font-bold text-gold text-center">
                  {player.name}
                </h3>

                {/* Date */}
                <div className="text-center w-full">
                  <div className="text-xs text-muted-foreground mb-1">
                    Primo #1
                  </div>
                  <div className="text-sm font-semibold">
                    {formatDate(player.first_leader_date)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Info */}
      {legends.length > 0 && (
        <div className="mt-12 pt-8 border-t-2 border-foreground">
          <div className="flex items-center justify-center gap-3 text-sm">
            <Crown className="w-5 h-5 text-gold" />
            <span className="text-gold font-semibold">
              {legends.length} {legends.length === 1 ? 'Leggenda' : 'Leggende'}
            </span>
            <span className="text-muted-foreground">
              {legends.length === 1 ? 'ha' : 'hanno'} conquistato il #1
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
