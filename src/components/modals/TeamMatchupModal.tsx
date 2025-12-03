import { Player, Match } from '@/lib/database';
import PlayerAvatar from '@/components/PlayerAvatar';
import WinProbabilityGauge from '@/components/WinProbabilityGauge';
import { calculateDoubleProbability } from '@/lib/statsUtils';
import { X, RefreshCw } from 'lucide-react';

interface TeamMatchupModalProps {
  teamBluPlayers: Player[];
  teamRossoPlayers: Player[];
  matches: Match[];
  onClose: () => void;
  onUseForMatch: () => void;
  onGenerateAgain: () => void;
}

export default function TeamMatchupModal({
  teamBluPlayers,
  teamRossoPlayers,
  matches,
  onClose,
  onUseForMatch,
  onGenerateAgain,
}: TeamMatchupModalProps) {
  // Calculate win probability
  const prediction = teamBluPlayers.length === 2 && teamRossoPlayers.length === 2
    ? calculateDoubleProbability(
        teamBluPlayers[0].name,
        teamBluPlayers[1].name,
        teamRossoPlayers[0].name,
        teamRossoPlayers[1].name,
        [...teamBluPlayers, ...teamRossoPlayers],
        matches
      )
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-background border-2 border-foreground max-w-4xl w-full p-8 relative animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* VS Matchup */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Team Rosso (Left) */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Player boxes */}
              <div className="flex flex-col gap-3">
                {teamRossoPlayers.map((player, index) => (
                  <div
                    key={index}
                    className={`w-32 h-32 sm:w-40 sm:h-40 border-4 border-team-rosso bg-team-rosso/10 flex items-center justify-center animate-slide-in-left opacity-0 ${
                      index === 0 ? '' : 'animate-delay-100'
                    }`}
                    style={{ animationFillMode: 'forwards' }}
                  >
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-bold" style={{ color: 'hsl(var(--team-rosso))' }}>
                        {player.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="text-5xl sm:text-6xl font-bold px-4 animate-vs-appear opacity-0 animate-delay-300" style={{ animationFillMode: 'forwards' }}>
            VS
          </div>

          {/* Team Blu (Right) */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Player boxes */}
              <div className="flex flex-col gap-3">
                {teamBluPlayers.map((player, index) => (
                  <div
                    key={index}
                    className={`w-32 h-32 sm:w-40 sm:h-40 border-4 border-team-blu bg-team-blu/10 flex items-center justify-center animate-slide-in-right opacity-0 ${
                      index === 0 ? '' : 'animate-delay-100'
                    }`}
                    style={{ animationFillMode: 'forwards' }}
                  >
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-bold" style={{ color: 'hsl(var(--team-blu))' }}>
                        {player.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Win Probability Gauge - ADDED BELOW VS */}
        {prediction && (
          <div className="mb-8 animate-fade-in opacity-0 animate-delay-400" style={{ animationFillMode: 'forwards' }}>
            <WinProbabilityGauge
              team1Probability={prediction.team1WinProbability}
              team2Probability={prediction.team2WinProbability}
              team1Name={teamBluPlayers.map(p => p.name).join(' + ')}
              team2Name={teamRossoPlayers.map(p => p.name).join(' + ')}
            />
          </div>
        )}

        {/* Player Names */}
        <div className="flex items-start justify-center gap-8 mb-8">
          {/* Team Rosso Names */}
          <div className="flex-1 max-w-xs">
            <div className="space-y-2">
              {teamRossoPlayers.map((player, index) => (
                <div
                  key={index}
                  className={`text-2xl font-bold text-center animate-slide-in-left opacity-0 ${
                    index === 0 ? 'animate-delay-200' : 'animate-delay-300'
                  }`}
                  style={{
                    color: 'hsl(var(--team-rosso))',
                    animationFillMode: 'forwards',
                  }}
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          {/* Spacer for VS */}
          <div className="w-24"></div>

          {/* Team Blu Names */}
          <div className="flex-1 max-w-xs">
            <div className="space-y-2">
              {teamBluPlayers.map((player, index) => (
                <div
                  key={index}
                  className={`text-2xl font-bold text-center animate-slide-in-right opacity-0 ${
                    index === 0 ? 'animate-delay-200' : 'animate-delay-300'
                  }`}
                  style={{
                    color: 'hsl(var(--team-blu))',
                    animationFillMode: 'forwards',
                  }}
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 animate-fade-in opacity-0 animate-delay-300" style={{ animationFillMode: 'forwards' }}>
          <button
            onClick={onUseForMatch}
            className="w-full py-4 border-2 border-foreground bg-background text-foreground font-semibold text-lg hover:bg-muted transition-colors"
          >
            Usa per partita
          </button>
          <button
            onClick={onGenerateAgain}
            className="w-full py-4 bg-foreground text-background border-2 border-foreground font-semibold text-lg hover:bg-background hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Genera ancora
          </button>
        </div>
      </div>
    </div>
  );
}