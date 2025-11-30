import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import { Crown, X } from 'lucide-react';

interface WallOfFameTabProps {
  onPlayerClick: (player: Player) => void;
}

export default function WallOfFameTab({ onPlayerClick }: WallOfFameTabProps) {
  const [legends, setLegends] = useState<Player[]>([]);
  const [expandedPhoto, setExpandedPhoto] = useState<{ photo: string; player: string; date: string } | null>(null);

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

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  return (
    <>
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
          <div className="space-y-8">
            {legends.map((player) => {
              const fameEntries = player.fame_entries || [];
              
              return (
                <div
                  key={player.id}
                  className="p-6 border-2 border-gold bg-gold/10 leader-glow"
                >
                  {/* Player Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-gold/30">
                    <button
                      onClick={() => onPlayerClick(player)}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <div className="w-16 h-16 border-2 border-foreground">
                        {player.avatar ? (
                          <img 
                            src={player.avatar} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-background font-bold">
                            {player.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </button>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gold flex items-center gap-2">
                        <Crown className="w-6 h-6" />
                        {player.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {player.days_as_leader} {player.days_as_leader === 1 ? 'giorno' : 'giorni'} da #1
                        {player.first_leader_date && ` • Primo #1: ${formatDate(player.first_leader_date)}`}
                      </p>
                    </div>
                  </div>

                  {/* Fame Photos Gallery */}
                  {fameEntries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {fameEntries.map((entry, index) => (
                        <button
                          key={index}
                          onClick={() => setExpandedPhoto({ 
                            photo: entry.photo, 
                            player: player.name,
                            date: entry.date 
                          })}
                          className="group relative aspect-square border-2 border-gold hover:border-gold/50 transition-all hover:scale-105"
                        >
                          <img 
                            src={entry.photo} 
                            alt={`${player.name} - ${formatDate(entry.date)}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-2">
                            <div className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatDate(entry.date)}
                            </div>
                          </div>
                          {entry.caption && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
                                💬
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nessuna foto caricata ancora.
                      <button
                        onClick={() => onPlayerClick(player)}
                        className="block mx-auto mt-2 text-gold hover:underline"
                      >
                        Clicca qui per aggiungerne una →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        {legends.length > 0 && (
          <div className="mt-12 pt-8 border-t-2 border-foreground">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Crown className="w-5 h-5 text-gold" />
              <span className="text-gold font-semibold">
                {legends.length} {legends.length === 1 ? 'Leggenda' : 'Leggende'}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {legends.reduce((sum, p) => sum + (p.fame_entries?.length || 0), 0)} foto totali
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Photo Modal */}
      {expandedPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setExpandedPhoto(null)}
        >
          <button
            onClick={() => setExpandedPhoto(null)}
            className="absolute top-4 right-4 p-3 text-white hover:bg-white/10 transition-colors rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={expandedPhoto.photo} 
              alt={expandedPhoto.player}
              className="w-full max-h-[80vh] object-contain animate-zoom-in border-4 border-gold"
            />
            <div className="mt-4 text-center text-white">
              <div className="text-2xl font-bold text-gold">{expandedPhoto.player}</div>
              <div className="text-lg mt-2">{formatDate(expandedPhoto.date)}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
