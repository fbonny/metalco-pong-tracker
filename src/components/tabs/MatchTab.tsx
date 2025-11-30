import { useState, useEffect } from 'react';
import { Player, getPlayers, createMatch, recalculateAllStats } from '@/lib/database';
import PlayerAvatar from '@/components/PlayerAvatar';
import VictoryModal from '@/components/modals/VictoryModal';
import { toast } from 'sonner';

interface MatchTabProps {
  prefillTeams?: { team1: string[]; team2: string[] };
  onMatchCreated?: () => void;
}

export default function MatchTab({ prefillTeams, onMatchCreated }: MatchTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isDouble, setIsDouble] = useState(false);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player3, setPlayer3] = useState('');
  const [player4, setPlayer4] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [winners, setWinners] = useState<{ name: string; avatar?: string }[]>([]);

  console.log('🔄 MatchTab render - showVictory:', showVictory, 'winners:', winners.length);

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (prefillTeams) {
      setIsDouble(true);
      setPlayer1(prefillTeams.team1[0] || '');
      setPlayer2(prefillTeams.team1[1] || '');
      setPlayer3(prefillTeams.team2[0] || '');
      setPlayer4(prefillTeams.team2[1] || '');
    }
  }, [prefillTeams]);

  async function loadPlayers() {
    const data = await getPlayers();
    setPlayers(data);
  }

  function handleCloseVictory() {
    setShowVictory(false);
    // Call refresh AFTER closing modal
    onMatchCreated?.();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const s1 = parseInt(score1);
    const s2 = parseInt(score2);

    // Validation
    if (isNaN(s1) || isNaN(s2)) {
      toast.error('Inserisci punteggi validi');
      return;
    }

    if (s1 === s2) {
      toast.error('I punteggi non possono essere pari');
      return;
    }

    if (Math.max(s1, s2) < 21) {
      toast.error('Il vincitore deve avere almeno 21 punti');
      return;
    }

    const selectedPlayers = isDouble
      ? [player1, player2, player3, player4]
      : [player1, player2];

    if (selectedPlayers.some(p => !p)) {
      toast.error('Seleziona tutti i giocatori');
      return;
    }

    if (new Set(selectedPlayers).size !== selectedPlayers.length) {
      toast.error('Non puoi selezionare lo stesso giocatore più volte');
      return;
    }

    setLoading(true);
    try {
      const team1 = isDouble ? [player1, player2] : [player1];
      const team2 = isDouble ? [player3, player4] : [player2];

      await createMatch({
        team1,
        team2,
        score1: s1,
        score2: s2,
        is_double: isDouble,
        played_at: new Date().toISOString(),
      });

      await recalculateAllStats();

      toast.success('Partita salvata!');

      // Determine winners
      const winningTeam = s1 > s2 ? team1 : team2;
      const winningPlayers = winningTeam.map(name => {
        const player = players.find(p => p.name === name);
        return {
          name,
          avatar: player?.avatar
        };
      });

      setWinners(winningPlayers);
      setShowVictory(true);

      // Reset form
      setPlayer1('');
      setPlayer2('');
      setPlayer3('');
      setPlayer4('');
      setScore1('');
      setScore2('');

      onMatchCreated?.();
    } catch (error) {
      toast.error('Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  }

  const availablePlayers = players.filter(p =>
    !isDouble
      ? ![player1, player2].includes(p.name)
      : ![player1, player2, player3, player4].includes(p.name)
  );

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Nuova Partita</h2>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setIsDouble(false)}
            className={`flex-1 py-3 border-2 transition-colors ${
              !isDouble
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-foreground hover:bg-muted'
            }`}
          >
            Singolo
          </button>
          <button
            onClick={() => setIsDouble(true)}
            className={`flex-1 py-3 border-2 transition-colors ${
              isDouble
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-foreground hover:bg-muted'
            }`}
          >
            Doppio
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team 1 */}
            <div className="border-2 border-foreground p-4">
              <h3 className="font-semibold mb-3">Squadra 1</h3>
              <div className="space-y-3">
                <select
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  className="w-full p-3 border-2 border-foreground bg-background"
                  required
                >
                  <option value="">Seleziona Giocatore 1</option>
                  {players
                    .filter(p => ![player2, player3, player4].includes(p.name))
                    .map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                </select>

                {isDouble && (
                  <select
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                    className="w-full p-3 border-2 border-foreground bg-background"
                    required
                  >
                    <option value="">Seleziona Giocatore 2</option>
                    {players
                      .filter(p => ![player1, player3, player4].includes(p.name))
                      .map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                )}

                <input
                  type="number"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  placeholder="Punti"
                  className="w-full p-3 border-2 border-foreground bg-background"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Team 2 */}
            <div className="border-2 border-foreground p-4">
              <h3 className="font-semibold mb-3">Squadra 2</h3>
              <div className="space-y-3">
                <select
                  value={isDouble ? player3 : player2}
                  onChange={(e) =>
                    isDouble ? setPlayer3(e.target.value) : setPlayer2(e.target.value)
                  }
                  className="w-full p-3 border-2 border-foreground bg-background"
                  required
                >
                  <option value="">
                    Seleziona Giocatore {isDouble ? '3' : '2'}
                  </option>
                  {players
                    .filter(p =>
                      isDouble
                        ? ![player1, player2, player4].includes(p.name)
                        : ![player1].includes(p.name)
                    )
                    .map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                </select>

                {isDouble && (
                  <select
                    value={player4}
                    onChange={(e) => setPlayer4(e.target.value)}
                    className="w-full p-3 border-2 border-foreground bg-background"
                    required
                  >
                    <option value="">Seleziona Giocatore 4</option>
                    {players
                      .filter(p => ![player1, player2, player3].includes(p.name))
                      .map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                )}

                <input
                  type="number"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  placeholder="Punti"
                  className="w-full p-3 border-2 border-foreground bg-background"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-foreground text-background border-2 border-foreground font-semibold hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Salva Risultato'}
          </button>
        </form>
      </div>

      {/* Victory Modal */}
      {showVictory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'red',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '50px',
            fontSize: '50px',
            fontWeight: 'bold'
          }}>
            TEST MODALE - VINCITORI: {winners.map(w => w.name).join(', ')}
            <br />
            <button onClick={handleCloseVictory} style={{
              marginTop: '20px',
              padding: '20px',
              fontSize: '30px',
              backgroundColor: 'blue',
              color: 'white'
            }}>
              CHIUDI
            </button>
          </div>
        </div>
      )}
    </>
  );
}