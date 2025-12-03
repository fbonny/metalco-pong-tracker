import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { BarChart3, Info, X } from 'lucide-react';

interface RankTabProps {
  onPlayerClick: (player: Player) => void;
  onStatsClick: (player: Player) => void;
}

export default function RankTab({ onPlayerClick, onStatsClick }: RankTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [expandedImage, setExpandedImage] = useState<{ url: string; name: string } | null>(null);

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

  const handleAvatarClick = (player: Player) => {
    if (player.avatar) {
      setExpandedImage({ url: player.avatar, name: player.name });
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">🏓 CLASSIFICA 🏓</h2>
        
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