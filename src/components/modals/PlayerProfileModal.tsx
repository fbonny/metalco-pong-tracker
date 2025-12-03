import { Player } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { X } from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PlayerProfileModal({ player, onClose }: PlayerProfileModalProps) {
  const matchesPlayed = player.wins + player.losses;
  const winRate = matchesPlayed > 0 ? (player.wins / matchesPlayed) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
          <h2 className="text-2xl font-semibold">👤 Profilo Giocatore</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <PlayerAvatar name={player.name} avatar={player.avatar} size="lg" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{player.name}</h3>
              <div className="text-lg text-muted-foreground">
                {formatPoints(player.points)} punti
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-foreground text-center">
              <div className="text-2xl font-bold">{player.wins}</div>
              <div className="text-sm text-muted-foreground">Vittorie</div>
            </div>
            <div className="p-4 border-2 border-foreground text-center">
              <div className="text-2xl font-bold">{player.losses}</div>
              <div className="text-sm text-muted-foreground">Sconfitte</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">% Vittorie</span>
              <span className="text-sm font-semibold">{winRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-6 border-2 border-foreground">
              <div 
                className="h-full bg-foreground transition-all" 
                style={{ width: `${winRate}%` }} 
              />
            </div>
          </div>

          <div className="p-4 bg-muted border-2 border-foreground">
            <p className="text-sm text-muted-foreground text-center">
              💡 Per modificare il profilo, vai nella tab <strong>Info</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}