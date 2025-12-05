import { Player, Match } from '@/lib/database';
import { calculateDoubleProbability, getRecentForm } from '@/lib/statsUtils';
import { X } from 'lucide-react';

interface DoublesPredictorModalProps {
  team1Player1: Player;
  team1Player2: Player;
  team2Player1: Player;
  team2Player2: Player;
  matches: Match[];
  onClose: () => void;
}

export default function DoublesPredictorModal({
  team1Player1,
  team1Player2,
  team2Player1,
  team2Player2,
  matches,
  onClose
}: DoublesPredictorModalProps) {
  const allPlayers = [team1Player1, team1Player2, team2Player1, team2Player2];
  const prediction = calculateDoubleProbability(
    team1Player1.name,
    team1Player2.name,
    team2Player1.name,
    team2Player2.name,
    allPlayers,
    matches
  );

  // Get recent form for each player
  const team1P1Form = getRecentForm(team1Player1.name, matches, 10);
  const team1P2Form = getRecentForm(team1Player2.name, matches, 10);
  const team2P1Form = getRecentForm(team2Player1.name, matches, 10);
  const team2P2Form = getRecentForm(team2Player2.name, matches, 10);

  // Calculate doubles-specific stats for each player
  const getDoublesStats = (playerName: string) => {
    const doublesMatches = matches.filter(m => {
      if (!m.is_double) return false;
      return m.team1.includes(playerName) || m.team2.includes(playerName);
    });

    const wins = doublesMatches.filter(m => {
      const winner = m.score1 > m.score2;
      const winningTeam = winner ? m.team1 : m.team2;
      return winningTeam.includes(playerName);
    }).length;

    return {
      matches: doublesMatches.length,
      wins,
      winRate: doublesMatches.length > 0 ? (wins / doublesMatches.length) * 100 : 0,
    };
  };

  const team1P1Doubles = getDoublesStats(team1Player1.name);
  const team1P2Doubles = getDoublesStats(team1Player2.name);
  const team2P1Doubles = getDoublesStats(team2Player1.name);
  const team2P2Doubles = getDoublesStats(team2Player2.name);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
          <h2 className="text-2xl font-semibold">Previsione Doppio</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Teams Header */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-foreground text-center">
              <h3 className="text-lg font-bold mb-2">
                {team1Player1.name} + {team1Player2.name}
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{team1Player1.name}: {team1Player1.wins}V - {team1Player1.losses}S</div>
                <div>{team1Player2.name}: {team1Player2.wins}V - {team1Player2.losses}S</div>
              </div>
            </div>
            <div className="p-4 border-2 border-foreground text-center">
              <h3 className="text-lg font-bold mb-2">
                {team2Player1.name} + {team2Player2.name}
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{team2Player1.name}: {team2Player1.wins}V - {team2Player1.losses}S</div>
                <div>{team2Player2.name}: {team2Player2.wins}V - {team2Player2.losses}S</div>
              </div>
            </div>
          </div>

          {/* Win Probability */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">🎯 Probabilità di Vittoria</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold w-40 truncate">
                  {team1Player1.name} + {team1Player2.name}
                </span>
                <div className="flex-1 h-8 border-2 border-foreground relative overflow-hidden">
                  <div 
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${prediction.team1WinProbability}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold mix-blend-difference text-background">
                    {prediction.team1WinProbability.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold w-40 truncate">
                  {team2Player1.name} + {team2Player2.name}
                </span>
                <div className="flex-1 h-8 border-2 border-foreground relative overflow-hidden">
                  <div 
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${prediction.team2WinProbability}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold mix-blend-difference text-background">
                    {prediction.team2WinProbability.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pair Synergy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-foreground">
              <h4 className="font-semibold text-sm mb-3">🤝 Sinergia Coppia 1</h4>
              {prediction.team1PairStats.matches > 0 ? (
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{prediction.team1PairStats.winRate.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-sm text-center text-muted-foreground">
                    {prediction.team1PairStats.wins}V - {prediction.team1PairStats.matches - prediction.team1PairStats.wins}S insieme
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Prima volta insieme
                </div>
              )}
            </div>

            <div className="p-4 border-2 border-foreground">
              <h4 className="font-semibold text-sm mb-3">🤝 Sinergia Coppia 2</h4>
              {prediction.team2PairStats.matches > 0 ? (
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{prediction.team2PairStats.winRate.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-sm text-center text-muted-foreground">
                    {prediction.team2PairStats.wins}V - {prediction.team2PairStats.matches - prediction.team2PairStats.wins}S insieme
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Prima volta insieme
                </div>
              )}
            </div>
          </div>

          {/* Head to Head */}
          {prediction.headToHeadMatches > 0 && (
            <div className="p-4 border-2 border-foreground">
              <h4 className="font-semibold text-sm mb-3">⚔️ Scontri Diretti tra Coppie</h4>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {prediction.headToHeadMatches} {prediction.headToHeadMatches === 1 ? 'partita' : 'partite'}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Queste coppie si sono già affrontate
                </div>
              </div>
            </div>
          )}

          {/* Individual Doubles Stats */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">📊 Prestazioni Individuali nei Doppi</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="p-3 border border-foreground">
                  <div className="font-semibold text-sm mb-1">{team1Player1.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {team1P1Doubles.wins}V - {team1P1Doubles.matches - team1P1Doubles.wins}S nei doppi ({team1P1Doubles.winRate.toFixed(0)}%)
                  </div>
                </div>
                <div className="p-3 border border-foreground">
                  <div className="font-semibold text-sm mb-1">{team1Player2.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {team1P2Doubles.wins}V - {team1P2Doubles.matches - team1P2Doubles.wins}S nei doppi ({team1P2Doubles.winRate.toFixed(0)}%)
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="p-3 border border-foreground">
                  <div className="font-semibold text-sm mb-1">{team2Player1.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {team2P1Doubles.wins}V - {team2P1Doubles.matches - team2P1Doubles.wins}S nei doppi ({team2P1Doubles.winRate.toFixed(0)}%)
                  </div>
                </div>
                <div className="p-3 border border-foreground">
                  <div className="font-semibold text-sm mb-1">{team2Player2.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {team2P2Doubles.wins}V - {team2P2Doubles.matches - team2P2Doubles.wins}S nei doppi ({team2P2Doubles.winRate.toFixed(0)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">📈 Forma Recente - Coppia 1</h4>
              
              <div className="p-3 border border-foreground">
                <div className="text-xs font-semibold mb-2">{team1Player1.name}</div>
                {team1P1Form.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {team1P1Form.map((result, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 border border-foreground flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Nessun dato</div>
                )}
              </div>

              <div className="p-3 border border-foreground">
                <div className="text-xs font-semibold mb-2">{team1Player2.name}</div>
                {team1P2Form.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {team1P2Form.map((result, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 border border-foreground flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Nessun dato</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">📈 Forma Recente - Coppia 2</h4>
              
              <div className="p-3 border border-foreground">
                <div className="text-xs font-semibold mb-2">{team2Player1.name}</div>
                {team2P1Form.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {team2P1Form.map((result, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 border border-foreground flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Nessun dato</div>
                )}
              </div>

              <div className="p-3 border border-foreground">
                <div className="text-xs font-semibold mb-2">{team2Player2.name}</div>
                {team2P2Form.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {team2P2Form.map((result, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 border border-foreground flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Nessun dato</div>
                )}
              </div>
            </div>
          </div>

          {/* Insights */}
          {prediction.insights.length > 0 && (
            <div className="p-4 border-2 border-foreground bg-muted/50">
              <h4 className="font-semibold text-sm mb-3">💡 Insights Chiave</h4>
              <ul className="space-y-2">
                {prediction.insights.map((insight, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
