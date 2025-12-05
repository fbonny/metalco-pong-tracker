import { useState } from 'react';
import { createPlayer } from '@/lib/database';
import { compressImage } from '@/lib/imageUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

interface InfoTabProps {
  onPlayerCreated: () => void;
}

export default function InfoTab({ onPlayerCreated }: InfoTabProps) {
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [hand, setHand] = useState('N.D.');
  const [shot, setShot] = useState('N.D.');
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Inserisci un nome');
      return;
    }

    setLoading(true);
    try {
      await createPlayer({
        name: name.trim(),
        avatar: avatar || undefined,
        hand,
        shot,
      });

      toast.success('Giocatore creato!');

      // Reset form
      setName('');
      setAvatar('');
      setHand('N.D.');
      setShot('N.D.');
      setShowNewPlayerForm(false);

      onPlayerCreated();
    } catch (error) {
      toast.error('Errore creazione giocatore');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with New Player Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Regole Punteggio</h2>
        <button
          onClick={() => setShowNewPlayerForm(!showNewPlayerForm)}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background border-2 border-foreground font-semibold hover:bg-background hover:text-foreground transition-colors"
        >
          {showNewPlayerForm ? (
            <>
              <X className="w-5 h-5" />
              Chiudi
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Nuovo Giocatore
            </>
          )}
        </button>
      </div>

      {/* New Player Form (collapsible) */}
      {showNewPlayerForm && (
        <div className="mb-8 p-6 border-2 border-foreground bg-muted animate-zoom-in">
          <h3 className="text-xl font-semibold mb-4">Crea Nuovo Giocatore</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Preview */}
            {(avatar || name) && (
              <div className="flex justify-center">
                <PlayerAvatar name={name || 'Giocatore'} avatar={avatar} size="lg" />
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block font-semibold mb-2">Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Inserisci nome giocatore"
                className="w-full p-3 border-2 border-foreground bg-background"
                required
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block font-semibold mb-2">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full p-3 border-2 border-foreground bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'immagine verrà compressa e ridimensionata automaticamente
              </p>
            </div>

            {/* Hand */}
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
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-foreground hover:bg-muted'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Shot */}
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
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-foreground hover:bg-muted'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-foreground text-background border-2 border-foreground font-semibold hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
            >
              {loading ? 'Creazione...' : 'Crea Giocatore'}
            </button>
          </form>
        </div>
      )}
      
      {/* Rules sections */}
      <div className="space-y-6">
        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Vittoria Standard</h3>
          <div className="space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Punti Base:</strong> 10 punti</p>
            <p><strong className="text-foreground">Bonus:</strong> +0,5 punti per ogni punto di scarto oltre i 2</p>
            <p><strong className="text-foreground">Massimo:</strong> 14 punti (scarto di 10 o più, es. 21-11 o meglio)</p>
            <p className="mt-4 text-sm">
              <strong className="text-foreground">Esempi:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>21-19: Il vincitore ottiene 10 punti (nessun bonus)</li>
              <li>21-18: Il vincitore ottiene 10,5 punti (1 punto di bonus)</li>
              <li>21-15: Il vincitore ottiene 12 punti (4 punti di bonus)</li>
              <li>21-11: Il vincitore ottiene 14 punti (massimo raggiunto)</li>
              <li>21-5 o 21-0: Il vincitore ottiene 14 punti (massimo)</li>
            </ul>
          </div>
        </div>

        <div className="border-2 border-gold p-6 bg-gold/10">
          <h3 className="text-xl font-semibold mb-3">Vittoria ai Vantaggi (21-20)</h3>
          <div className="space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Vincitore:</strong> 7 punti</p>
            <p><strong className="text-foreground">Perdente:</strong> 3 punti</p>
            <p className="mt-4 text-sm text-foreground">
              Questa è considerata una vittoria simbolica in cui entrambe le squadre hanno giocato bene. Il perdente riceve punti per l'impegno.
            </p>
          </div>
        </div>

        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Tipi di Partita</h3>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong className="text-foreground">Singolo:</strong> 1 vs 1
              <p className="text-sm">I punti vengono assegnati ai singoli giocatori</p>
            </div>
            <div>
              <strong className="text-foreground">Doppio:</strong> 2 vs 2
              <p className="text-sm">I punti vengono divisi equamente tra i membri del team</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Classifica</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>I giocatori sono classificati per:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li><strong className="text-foreground">Punti Totali</strong> (principale)</li>
              <li><strong className="text-foreground">Vittorie Totali</strong> (spareggio)</li>
            </ol>
            <p className="mt-4 text-sm">
              Il giocatore classificato #1 riceve il badge <strong className="text-gold">LEADER</strong>
            </p>
          </div>
        </div>

        <div className="border-2 border-foreground p-6 bg-muted">
          <h3 className="text-xl font-semibold mb-3">⛅ Condizioni Meteo</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>
              Poiché le partite si svolgono all'aperto, in caso di <strong className="text-foreground">condizioni meteo non ideali</strong>, solo il creatore <strong className="text-foreground">Federico B.</strong> può decretare se la partita può ritenersi <strong className="text-foreground">valida per la classifica</strong> o no.
            </p>
          </div>
        </div>

        <div className="border-2 border-red-500 p-6 bg-red-500/10">
          <h3 className="text-xl font-semibold mb-3 text-red-600">🏓 Regola Racchetta</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>
              Chi usa la <strong className="text-foreground">racchetta personale di Federico</strong> in assenza di chiaro permesso di concessione, avrà <strong className="text-red-600">50 punti di penalità</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}