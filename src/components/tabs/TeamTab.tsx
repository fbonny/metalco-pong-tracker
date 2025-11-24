import { useState, useEffect } from 'react';
import { Player, getPlayers } from '@/lib/database';
import PlayerAvatar from '@/components/PlayerAvatar';
import { toast } from 'sonner';

interface TeamTabProps {
  onUseForMatch: (teams: { team1: string[]; team2: string[] }) => void;
}

export default function TeamTab({ onUseForMatch }: TeamTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<{ teamBlu: string[]; teamRosso: string[] } | null>(null);

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
      toast.error('Please select at least 4 players');
      return;
    }

    // Shuffle players
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    
    // Split into two teams
    const mid = Math.floor(shuffled.length / 2);
    const teamBlu = shuffled.slice(0, mid);
    const teamRosso = shuffled.slice(mid);
    
    setGeneratedTeams({ teamBlu, teamRosso });
  }

  function handleUseForMatch() {
    if (!generatedTeams) return;
    
    if (generatedTeams.teamBlu.length !== 2 || generatedTeams.teamRosso.length !== 2) {
      toast.error('Please select exactly 4 players for a doubles match');
      return;
    }
    
    onUseForMatch({
      team1: generatedTeams.teamBlu,
      team2: generatedTeams.teamRosso,
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Team Generator</h2>
      
      {!generatedTeams ? (
        <>
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Select Players (min 4)</h3>
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
            Generate Match ({selectedPlayers.length} selected)
          </button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Team Blu */}
            <div className="border-2 border-team-blu p-6">
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: 'hsl(var(--team-blu))' }}>
                Team Blu
              </h3>
              <div className="space-y-3">
                {generatedTeams.teamBlu.map(name => {
                  const player = players.find(p => p.name === name);
                  return (
                    <div key={name} className="flex items-center gap-3 p-3 border-2 border-foreground">
                      <PlayerAvatar name={name} avatar={player?.avatar} />
                      <span className="font-medium">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Rosso */}
            <div className="border-2 border-team-rosso p-6">
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: 'hsl(var(--team-rosso))' }}>
                Team Rosso
              </h3>
              <div className="space-y-3">
                {generatedTeams.teamRosso.map(name => {
                  const player = players.find(p => p.name === name);
                  return (
                    <div key={name} className="flex items-center gap-3 p-3 border-2 border-foreground">
                      <PlayerAvatar name={name} avatar={player?.avatar} />
                      <span className="font-medium">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setGeneratedTeams(null);
                setSelectedPlayers([]);
              }}
              className="flex-1 py-4 border-2 border-foreground bg-background text-foreground font-semibold hover:bg-muted transition-colors"
            >
              Generate New Teams
            </button>
            <button
              onClick={handleUseForMatch}
              className="flex-1 py-4 bg-foreground text-background border-2 border-foreground font-semibold hover:bg-background hover:text-foreground transition-colors"
            >
              Use for Match
            </button>
          </div>
        </>
      )}
    </div>
  );
}
