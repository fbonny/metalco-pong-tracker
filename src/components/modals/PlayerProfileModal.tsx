import { useState } from 'react';
import { Player, updatePlayer, deletePlayer, getPlayers, recalculateAllStats, FameEntry } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { compressImage } from '@/lib/imageUtils';
import { X, Crown, Plus } from 'lucide-react';
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
  const [description, setDescription] = useState(player.description || '');
  const [fameEntries, setFameEntries] = useState<FameEntry[]>(player.fame_entries || []);
  const [newFamePhoto, setNewFamePhoto] = useState('');
  const [newFameCaption, setNewFameCaption] = useState('');
  const [hand, setHand] = useState(player.hand);
  const [shot, setShot] = useState(player.shot);
  const [loading, setLoading] = useState(false);
  const [showExpandedAvatar, setShowExpandedAvatar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const matchesPlayed = player.wins + player.losses;
  const winRate = matchesPlayed > 0 ? (player.wins / matchesPlayed) * 100 : 0;

  // Calculate current rank
  const [currentRank, setCurrentRank] = useState(0);
  useState(() => {
    getPlayers().then(players => {
      const rank = players.findIndex(p => p.id === player.id) + 1;
      setCurrentRank(rank);
    });
  });

  // Calculate current streak (only W or only L)
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

  async function handleFamePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setNewFamePhoto(compressed);
    } catch (error) {
      toast.error('Errore elaborazione immagine Fame');
      console.error(error);
    }
  }

  function handleRemoveFameEntry(index: number) {
    setFameEntries(prev => prev.filter((_, i) => i !== index));
  }

  function handleAddFameEntry() {
    if (!newFamePhoto) {
      toast.error('Carica prima una foto');
      return;
    }

    const newEntry: FameEntry = {
      photo: newFamePhoto,
      date: new Date().toISOString(),
      caption: newFameCaption.trim() || undefined,
    };

    setFameEntries([...fameEntries, newEntry]);
    setNewFamePhoto('');
    setNewFameCaption('');
    toast.success('Foto aggiunta! Salva per confermare.');
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
        description: description.trim() || undefined,
        hand,
        shot,
        fame_entries: fameEntries,
        updated_at: new Date().toISOString(),
      });

      toast.success('Profilo aggiornato!');
      setIsEditing(false);
      setNewFamePhoto('');
      setNewFameCaption('');
      onUpdate();
    } catch (error) {
      toast.error('Errore aggiornamento profilo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
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

  function handleDeleteClick() {
    setShowDeleteConfirm(true);
    setDeleteConfirmName('');
  }

  function handleConfirmDelete() {
    if (deleteConfirmName.trim().toLowerCase() !== player.name.toLowerCase()) {
      toast.error('Il nome non corrisponde');
      return;
    }
    setShowDeleteConfirm(false);
    handleDelete();
  }

  return (
    <>
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
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => {
                  if (avatar && !isEditing) {
                    setShowExpandedAvatar(true);
                  }
                }}
                className={avatar && !isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
              >
                <PlayerAvatar name={name} avatar={avatar} size="lg" />
              </div>
              
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

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border-2 border-foreground bg-background resize-none"
                    placeholder="Descrizione giocatore (opzionale)"
                    rows={3}
                  />

                  {/* Fame Photos Archive - Only for players who have been #1 */}
                  {(player.days_as_leader || 0) > 0 && (
                    <div className="space-y-4 p-4 border-2 border-gold bg-gold/5">
                      <label className="block font-semibold text-gold flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Archivio Wall of Fame
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Aggiungi foto storiche quando conquisti il #1. Ogni foto resta per sempre nell'archivio!
                      </p>

                      {/* Existing Fame Photos */}
                      {fameEntries.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-semibold">Foto nell'archivio ({fameEntries.length})</div>
                          {fameEntries.map((entry, index) => (
                            <div key={index} className="flex gap-3 p-3 border border-gold/30 bg-background">
                              <img 
                                src={entry.photo} 
                                alt={`Fame ${index + 1}`}
                                className="w-20 h-20 object-cover border-2 border-gold"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-semibold">
                                  {new Date(entry.date || '').toLocaleDateString('it-IT', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </div>
                                {entry.caption && (
                                  <div className="text-xs text-muted-foreground italic mt-1">
                                    "{entry.caption}"
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveFameEntry(index)}
                                type="button"
                                className="p-2 text-destructive hover:bg-destructive/10 transition-colors"
                                title="Rimuovi"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Fame Photo */}
                      <div className="space-y-3 pt-4 border-t border-gold/30">
                        <div className="text-sm font-semibold flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Aggiungi nuova foto
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fameEntries.length}/10 foto
                          </div>
                        </div>

                        {fameEntries.length >= 10 ? (
                          <div className="p-3 border-2 border-destructive/50 bg-destructive/10 text-sm text-destructive">
                            ⚠️ Hai raggiunto il limite di 10 foto. Rimuovine una per aggiungerne di nuove.
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFamePhotoChange}
                              className="w-full p-3 border-2 border-gold bg-gold/10 text-sm"
                            />

                            {newFamePhoto && (
                              <>
                                <div className="flex justify-center">
                                  <img 
                                    src={newFamePhoto} 
                                    alt="Preview" 
                                    className="w-32 h-32 object-cover border-2 border-gold ring-2 ring-gold/50"
                                  />
                                </div>
                                
                                <input
                                  type="text"
                                  value={newFameCaption}
                                  onChange={(e) => setNewFameCaption(e.target.value)}
                                  className="w-full p-3 border-2 border-gold bg-background"
                                  placeholder="Didascalia (opzionale)"
                                />

                                <button
                                  onClick={handleAddFameEntry}
                                  type="button"
                                  className="w-full py-3 bg-gold text-gold-foreground border-2 border-gold hover:bg-gold/80 transition-colors font-semibold"
                                >
                                  <Plus className="w-4 h-4 inline mr-2" />
                                  Aggiungi all'archivio
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <h3 className="text-2xl font-bold text-center">{player.name}</h3>
                  {player.description && (
                    <p className="text-sm text-muted-foreground text-center italic px-4">
                      "{player.description}"
                    </p>
                  )}
                </div>
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

                {/* Days as Leader */}
                {(player.days_as_leader || 0) > 0 && (
                  <div className="p-4 border-2 border-gold bg-gold/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">🏆 Giorni da #1</div>
                        <div className="text-2xl font-bold text-gold">{player.days_as_leader} giorni</div>
                      </div>
                      <div className="text-4xl">👑</div>
                    </div>
                  </div>
                )}

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
                    onClick={handleDeleteClick}
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

      {/* Expanded Avatar Modal */}
      {showExpandedAvatar && avatar && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowExpandedAvatar(false)}
        >
          <button
            onClick={() => setShowExpandedAvatar(false)}
            className="absolute top-4 right-4 p-3 text-white hover:bg-white/10 transition-colors rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={avatar} 
            alt={player.name}
            className="max-w-full max-h-full object-contain animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-background border-2 border-destructive max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-destructive mb-2">
                  Conferma Eliminazione
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Stai per eliminare <strong>{player.name}</strong>. Questa azione è <strong>irreversibile</strong> e rimuoverà:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                  <li>Il profilo del giocatore</li>
                  <li>Tutti i suoi match dallo storico</li>
                  <li>Le sue statistiche</li>
                </ul>
                <p className="text-sm font-semibold mb-2">
                  Per confermare, digita il nome del giocatore:
                </p>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  className="w-full p-3 border-2 border-foreground bg-background mb-4"
                  placeholder={player.name}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border-2 border-foreground hover:bg-muted transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmName.trim().toLowerCase() !== player.name.toLowerCase()}
                className="flex-1 py-3 bg-destructive text-destructive-foreground border-2 border-destructive hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Elimina Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}