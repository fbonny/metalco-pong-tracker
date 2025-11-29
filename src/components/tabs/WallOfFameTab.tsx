import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { Trophy, Crown, Medal } from 'lucide-react';

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

  function getMedalColor(index: number): string {
    if (index === 0) return 'border-gold bg-gold/10';
    if (index === 1) return 'border-silver bg-silver/10';
    if (index === 2) return 'border-bronze bg-bronze/10';
    return 'border-foreground';
  }

  function getMedalIcon(index: number) {
    if (index === 0) return <Crown className="w-8 h-8 text-gold" />;
    if (index === 1) return <Medal className="w-7 h-7 text-silver" />;
    if (index === 2) return <Medal className="w-7 h-7 text-bronze" />;
    return <Trophy className="w-6 h-6" />;
  }

  function getMedalTextColor(index: number): string {
    if (index === 0) return 'text-gold';
    if (index === 1) return 'text-silver';
    if (index === 2) return 'text-bronze';
    return '';
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-gold" />
          <h2 className="text-3xl font-bold">Wall of Fame</h2>
          <Trophy className="w-8 h-8 text-gold" />
        </div>
        <p className="text-muted-foreground">
          I leggendari giocatori che hanno conquistato il trono #1
        </p>
      </div>

      {legends.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">
            Nessun giocatore ha ancora conquistato il #1
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Gioca partite per salire in classifica!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {legends.map((player, index) => {
            const winRate = player.wins + player.losses > 0 
              ? (player.wins / (player.wins + player.losses)) * 100 
              : 0;
            
            return (
              <button
                key={player.id}
                onClick={() => onPlayerClick(player)}
                className={`p-6 border-2 transition-all hover:scale-105 relative ${getMedalColor(index)}`}
              >
                {/* Medal badge */}
                <div className="absolute -top-3 -right-3 bg-background border-2 border-inherit rounded-full p-2">
                  {getMedalIcon(index)}
                </div>

                {/* Rank number */}
                {index < 3 && (
                  <div className={`absolute top-3 left-3 text-4xl font-bold opacity-20 ${getMedalTextColor(index)}`}>
                    #{index + 1}
                  </div>
                )}

                {/* Player Avatar */}
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className={`${index === 0 ? 'ring-4 ring-gold ring-offset-4 ring-offset-background rounded-full' : ''}`}>
                    <PlayerAvatar 
                      name={player.name} 
                      avatar={player.avatar} 
                      size="xl"
                    />
                  </div>

                  {/* Player Name */}
                  <div className="text-center w-full">
                    <h3 className={`text-xl font-bold mb-1 ${index === 0 ? 'text-gold' : ''}`}>
                      {player.name}
                    </h3>
                    {player.description && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        "{player.description}"
                      </p>
                    )}
                  </div>

                  {/* Days as Leader - Big Badge */}
                  <div className={`w-full py-3 border-2 ${index === 0 ? 'border-gold bg-gold/20' : index === 1 ? 'border-silver bg-silver/20' : index === 2 ? 'border-bronze bg-bronze/20' : 'border-foreground'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <Crown className={`w-5 h-5 ${getMedalTextColor(index)}`} />
                      <span className={`text-2xl font-bold ${getMedalTextColor(index)}`}>
                        {player.days_as_leader}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {player.days_as_leader === 1 ? 'giorno' : 'giorni'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      da #1
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="w-full grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 border border-foreground/50">
                      <div className="text-xs text-muted-foreground">Record</div>
                      <div className="font-semibold">
                        {player.wins}V - {player.losses}S
                      </div>
                    </div>
                    <div className="p-2 border border-foreground/50">
                      <div className="text-xs text-muted-foreground">% Vitt.</div>
                      <div className="font-semibold">
                        {winRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Punti Totali</div>
                    <div className={`text-xl font-bold ${index === 0 ? 'text-gold' : ''}`}>
                      {formatPoints(player.points)}
                    </div>
                  </div>

                  {/* Best Rank */}
                  {player.best_rank && (
                    <div className="text-xs text-muted-foreground">
                      Miglior classifica: #{player.best_rank}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {legends.length > 0 && (
        <div className="mt-12 pt-8 border-t-2 border-foreground">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              <span className="text-gold font-semibold">1° Posto</span>
              <span className="text-muted-foreground">- Cornice Oro</span>
            </div>
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-silver" />
              <span className="text-silver font-semibold">2° Posto</span>
              <span className="text-muted-foreground">- Cornice Argento</span>
            </div>
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-bronze" />
              <span className="text-bronze font-semibold">3° Posto</span>
              <span className="text-muted-foreground">- Cornice Bronzo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
