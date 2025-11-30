import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import PlayerAvatar from '@/components/PlayerAvatar';
import TeamMatchupModal from '@/components/modals/TeamMatchupModal';
import { toast } from 'sonner';

interface TeamTabProps {
  onUseForMatch: (teams: { team1: string[]; team2: string[] }) => void;
}

export default function TeamTab({ onUseForMatch }: TeamTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<{ teamBlu: string[]; teamRosso: string[] } | null>(null);
  const [showMatchupModal, setShowMatchupModal] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    const data = await getPlayers();
    setPlayers(data);
  }

  function togglePlayer(name: string) {
    setSelectedPlayers(prev =>
      prev.includes(name)
        ? prev.filter(p => p !== name)
        : [...prev, name]
    );
  }

  function generateTeams() {
    if (selectedPlayers.length < 4) {
      toast.error('Seleziona almeno 4 giocatori');
      return;
    }

    console.log('🎯 Giocatori selezionati:', selectedPlayers);

    // Shuffle players
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    console.log('🔀 Giocatori mescolati:', shuffled);

    // Always take only 4 players (2 vs 2)
    const selectedFour = shuffled.slice(0, 4);
    console.log('✂️ Presi primi 4 giocatori:', selectedFour);

    // Split into two teams of 2 players each
    const teamBlu = selectedFour.slice(0, 2);
    const teamRosso = selectedFour.slice(2, 4);

    console.log('🔵 Team Blu:', teamBlu);
    console.log('🔴 Team Rosso:', teamRosso);

    setGeneratedTeams({ teamBlu, teamRosso });
    setShowMatchupModal(true);

    if (selectedPlayers.length > 4) {
      toast.success(`Selezionati 4 giocatori casuali su ${selectedPlayers.length}`);
    }
  }

  function handleUseForMatch() {
    if (!generatedTeams) return;

    onUseForMatch({
      team1: generatedTeams.teamBlu,
      team2: generatedTeams.teamRosso,
    });

    setShowMatchupModal(false);
    setGeneratedTeams(null);
    setSelectedPlayers([]);
  }

  function handleGenerateAgain() {
    setShowMatchupModal(false);
    setGeneratedTeams(null);
    // Keep selectedPlayers to allow regeneration with same selection
    generateTeams();
  }

  function handleCloseModal() {
    setShowMatchupModal(false);
    setGeneratedTeams(null);
    setSelectedPlayers([]);
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Genera Squadre</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Seleziona Giocatori (min 4)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Se selezioni più di 4 giocatori, verranno scelti casualmente 4 per creare 2 squadre da 2
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => togglePlayer(player.name)}
                className={`flex items-center gap-2 p-3 border-2 transition-colors ${
                  selectedPlayers.includes(player.name)
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-foreground hover:bg-muted'
                }`}
              >
                <PlayerAvatar name={player.name} avatar={player.avatar} size="sm" />
                <span className="text-sm font-medium truncate">{player.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateTeams}
          disabled={selectedPlayers.length < 4}
          className="w-full py-4 bg-foreground text-background border-2 border-foreground font-semibold hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
        >
          Genera Partite ({selectedPlayers.length} selezionati)
        </button>
      </div>

      {/* Team Matchup Modal */}
      {showMatchupModal && generatedTeams && (
        <TeamMatchupModal
          teamBlu={generatedTeams.teamBlu.map(name => {
            const player = players.find(p => p.name === name);
            return { name, avatar: player?.avatar };
          })}
          teamRosso={generatedTeams.teamRosso.map(name => {
            const player = players.find(p => p.name === name);
            return { name, avatar: player?.avatar };
          })}
          onClose={handleCloseModal}
          onUseForMatch={handleUseForMatch}
          onGenerateAgain={handleGenerateAgain}
        />
      )}
    </>
  );
}