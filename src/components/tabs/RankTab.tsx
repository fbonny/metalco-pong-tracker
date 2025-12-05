import { useState, useEffect } from 'react';
import { Player, getPlayers, recalculateAllStats } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { BarChart3, Info, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RankTabProps {
  onPlayerClick: (player: Player) => void;
  onStatsClick: (player: Player) => void;
}

export default function RankTab({ onPlayerClick, onStatsClick }: RankTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

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

  async function handleRecalculate() {
    setIsRecalculating(true);
    try {
      await recalculateAllStats();
      await loadPlayers();
      toast.success('Classifica ricalcolata!', {
        description: 'I punti sono stati aggiornati con le ultime 20 partite',
      });
    } catch (error) {
      console.error('Errore ricalcolo:', error);
      toast.error('Errore nel ricalcolo', {
        description: 'Riprova tra qualche secondo',
      });
    } finally {
      setIsRecalculating(false);
    }
  }

  const handleAvatarClick = (player: Player) => {
    if (player.avatar) {
      setExpandedImage({ url: player.avatar, name: player.name });
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">🏓 CLASSIFICA 🏓</h2>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ricalcola classifica (ultime 20 partite)"
          >
            <RefreshCw className={`w-5 h-5 ${isRecalculating ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-2">
          {players.map((player, index) => {
            const rank = index + 1;
            const isLeader = rank === 1;
            
            // Calculate wins/losses from last 20 matches for ranking display ONLY
            const last20History = player.history.slice(-20);
            const last20Wins = last20History.filter(r => r === 'W').length;
            const last20Losses = last20History.filter(r => r === 'L').length;
            
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
                
                <div 
                  className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => handleAvatarClick(player)}
                  title="Clicca per ingrandire"
                >
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
                    {last20Wins}V - {last20Losses}S
                  </div>
                  {last20History.length > 0 && (
                    <div className="flex gap-1 mt-1 sm:mt-2 overflow-x-auto">
                      {last20History.map((result, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}
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
                  onClick={() => {
                    console.log('🔵 INFO BUTTON - Opening Profile Modal');
                    onPlayerClick(player);
                  }}
                  className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors flex-shrink-0"
                  title="Profilo"
                >
                  <Info className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    console.log('🟢 STATS BUTTON - Opening Stats Modal');
                    onStatsClick(player);
                  }}
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

      {/* Image Lightbox */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <button 
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white text-black hover:bg-gray-200 transition-colors"
            title="Chiudi"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-4">
            <img 
              src={expandedImage.url} 
              alt={expandedImage.name}
              className="max-w-full max-h-[80vh] object-contain border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-xl font-semibold">{expandedImage.name}</p>
          </div>
        </div>
      )}
    </>
  );
}