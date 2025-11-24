import { useState } from 'react';
import { Player, updatePlayer, deletePlayer, getPlayers, recalculateAllStats } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { compressImage } from '@/lib/imageUtils';
import { toast } from 'sonner';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PlayerProfileModal({ player, onClose, onUpdate }: PlayerProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(player.name);
  const [avatar, setAvatar] = useState(player.avatar || '');
  const [hand, setHand] = useState(player.hand);
  const [shot, setShot] = useState(player.shot);
  const [loading, setLoading] = useState(false);

  // Calculate current rank
  const [currentRank, setCurrentRank] = useState(0);
  useState(() => {
    getPlayers().then(players => {
      const rank = players.findIndex(p => p.id === player.id) + 1;
      setCurrentRank(rank);
    });
  });

  const matchesPlayed = player.wins + player.losses;
  const winRate = matchesPlayed > 0 ? (player.wins / matchesPlayed) * 100 : 0;

  // Calculate current streak
  const getCurrentStreak = () => {
    let streak = 0;
    for (let i = player.history.length - 1; i >= 0; i--) {
      if (player.history[i] === player.history[player.history.length - 1]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setAvatar(compressed);
    } catch (error) {
      toast.error('Errore elaborazione immagine');
      console.error(error);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Il nome non può essere vuoto');
      return;
    }

    setLoading(true);
    try {
      await updatePlayer(player.id, {
        name: name.trim(),
        avatar: avatar || undefined,
        hand,
        shot,
        updated_at: new Date().toISOString(),
      });
      
      toast.success('Profilo aggiornato!');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Errore aggiornamento profilo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Eliminare ${player.name}? Verranno rimossi anche tutti i suoi match dallo storico.`)) return;

    setLoading(true);
    try {
      await deletePlayer(player.id);
      await recalculateAllStats();
      toast.success('Giocatore eliminato');
      onClose();
      onUpdate();
    } catch (error) {
      toast.error('Errore eliminazione giocatore');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
          <h2 className="text-2xl font-semibold">Profilo Giocatore</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center gap-4">
            <PlayerAvatar name={name} avatar={avatar} size="lg" />
            
            {isEditing ? (
              <div className="w-full space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border-2 border-foreground bg-background text-center text-xl font-semibold"
                  placeholder="Nome giocatore"
                />
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full p-3 border-2 border-foreground bg-background"
                />
              </div>
            ) : (
              <h3 className="text-2xl font-bold">{player.name}</h3>
            )}
          </div>

          {/* Player Details */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Mano</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Destrorso', 'Mancino', 'N.D.'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setHand(option)}
                      className={`py-3 border-2 transition-colors ${
                        hand === option
                          ? 'bg-foreground text-background'
                          : 'bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2">Colpo</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Dritto', 'Rovescio', 'N.D.'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setShot(option)}
                      className={`py-3 border-2 transition-colors ${
                        shot === option
                          ? 'bg-foreground text-background'
                          : 'bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border-2 border-foreground">
                <div className="text-xs text-muted-foreground">Mano</div>
                <div className="font-semibold">{player.hand}</div>
              </div>
              <div className="p-3 border-2 border-foreground">
                <div className="text-xs text-muted-foreground">Colpo</div>
                <div className="font-semibold">{player.shot}</div>
              </div>
            </div>
          )}

          {/* Stats */}
          {!isEditing && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border-2 border-foreground">
                  <div className="text-xs text-muted-foreground mb-1">Classifica Attuale</div>
                  <div className="text-3xl font-bold">#{currentRank}</div>
                </div>
                <div className="p-4 border-2 border-foreground">
                  <div className="text-xs text-muted-foreground mb-1">Miglior Classifica</div>
                  <div className="text-3xl font-bold">#{player.best_rank || currentRank}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 border-2 border-foreground text-center">
                  <div className="text-2xl font-bold">{matchesPlayed}</div>
                  <div className="text-xs text-muted-foreground">Partite</div>
                </div>
                <div className="p-4 border-2 border-foreground text-center">
                  <div className="text-2xl font-bold">{formatPoints(player.points)}</div>
                  <div className="text-xs text-muted-foreground">Punti</div>
                </div>
                <div className="p-4 border-2 border-foreground text-center">
                  <div className="text-2xl font-bold">{getCurrentStreak()}</div>
                  <div className="text-xs text-muted-foreground">Striscia</div>
                </div>
              </div>

              {/* Win Rate */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">% Vittorie</span>
                  <span className="text-sm font-semibold">{winRate.toFixed(1)}%</span>
                </div>
                <div className="w-full h-4 border-2 border-foreground">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${winRate}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>{player.wins}V</span>
                  <span>{player.losses}S</span>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 border-2 border-foreground hover:bg-muted transition-colors"
                  disabled={loading}
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="py-3 px-6 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  disabled={loading}
                >
                  Elimina
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-3 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground transition-colors"
                >
                  Modifica Profilo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}