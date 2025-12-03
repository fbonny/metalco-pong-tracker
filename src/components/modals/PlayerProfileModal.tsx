import { Player, updatePlayer, FameEntry } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { X, Edit2, Save, Upload, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { compressImage, compressFamePhoto } from '@/lib/imageUtils';
import { toast } from '@/hooks/use-toast';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PlayerProfileModal({ player, onClose, onUpdate }: PlayerProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [avatar, setAvatar] = useState(player.avatar || '');
  const [description, setDescription] = useState(player.description || '');
  const [fameEntries, setFameEntries] = useState<FameEntry[]>(player.fame_entries || []);
  
  const matchesPlayed = player.wins + player.losses;
  const winRate = matchesPlayed > 0 ? (player.wins / matchesPlayed) * 100 : 0;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const imageUrl = await compressImage(file);
      setAvatar(imageUrl);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare l\'immagine',
        variant: 'destructive',
      });
    }
  };

  const handleFamePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const imageUrl = await compressFamePhoto(file);
      setFameEntries([...fameEntries, { photo: imageUrl, date: new Date().toISOString().split('T')[0], caption: '' }]);
    } catch (error) {
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Impossibile caricare l\'immagine',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePlayer(player.id, {
        avatar,
        description,
        fame_entries: fameEntries,
        updated_at: new Date().toISOString(),
      });
      
      toast({
        title: 'Profilo aggiornato',
        description: 'Le modifiche sono state salvate con successo',
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le modifiche',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeFameEntry = (index: number) => {
    setFameEntries(fameEntries.filter((_, i) => i !== index));
  };

  const updateFameEntry = (index: number, field: 'caption' | 'date', value: string) => {
    const updated = [...fameEntries];
    updated[index] = { ...updated[index], [field]: value };
    setFameEntries(updated);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
          <h2 className="text-2xl font-semibold">👤 Profilo Giocatore</h2>
          <div className="flex gap-2">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-2 hover:bg-muted transition-colors"
                title="Modifica profilo"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Avatar e Nome */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <PlayerAvatar name={player.name} avatar={avatar} size="lg" />
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 bg-foreground text-background p-2 cursor-pointer hover:bg-foreground/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{player.name}</h3>
              <div className="text-lg text-muted-foreground">
                {formatPoints(player.points)} punti
              </div>
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-semibold mb-2">📝 Descrizione</label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aggiungi una descrizione..."
                className="w-full p-3 border-2 border-foreground bg-background resize-none"
                rows={3}
              />
            ) : (
              <p className="text-muted-foreground italic p-3 border-2 border-muted">
                {description || 'Nessuna descrizione'}
              </p>
            )}
          </div>

          {/* Statistiche */}
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

          {/* Win Rate */}
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

          {/* Wall of Fame */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold">🏆 Wall of Fame</label>
              {isEditing && (
                <label className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background cursor-pointer hover:bg-foreground/80 transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  Aggiungi Foto
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFamePhotoUpload}
                  />
                </label>
              )}
            </div>
            
            {fameEntries.length === 0 ? (
              <p className="text-muted-foreground italic text-center p-4 border-2 border-muted">
                Nessuna foto nella Wall of Fame
              </p>
            ) : (
              <div className="space-y-3">
                {fameEntries.map((entry, index) => (
                  <div key={index} className="border-2 border-foreground p-3 space-y-2">
                    <div className="flex gap-3">
                      <img 
                        src={entry.photo} 
                        alt={`Fame ${index + 1}`} 
                        className="w-24 h-24 object-cover border-2 border-foreground"
                      />
                      <div className="flex-1 space-y-2">
                        {isEditing ? (
                          <>
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(e) => updateFameEntry(index, 'date', e.target.value)}
                              className="w-full p-2 border-2 border-foreground bg-background text-sm"
                            />
                            <input
                              type="text"
                              value={entry.caption || ''}
                              onChange={(e) => updateFameEntry(index, 'caption', e.target.value)}
                              placeholder="Didascalia..."
                              className="w-full p-2 border-2 border-foreground bg-background text-sm"
                            />
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-semibold">{new Date(entry.date).toLocaleDateString('it-IT')}</div>
                            {entry.caption && <p className="text-sm text-muted-foreground">{entry.caption}</p>}
                          </>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeFameEntry(index)}
                          className="p-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          title="Rimuovi foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pulsante Salva */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t-2 border-foreground">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setAvatar(player.avatar || '');
                  setDescription(player.description || '');
                  setFameEntries(player.fame_entries || []);
                }}
                className="flex-1 px-4 py-3 border-2 border-foreground hover:bg-muted transition-colors"
                disabled={isSaving}
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
