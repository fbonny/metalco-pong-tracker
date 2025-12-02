import { Player, Match } from '@/lib/database';
import { calculateWinProbability, getRecentForm } from '@/lib/statsUtils';
import { X } from 'lucide-react';

interface MatchPredictorModalProps {
  player1: Player;
  player2: Player;
  matches: Match[];
  onClose: () => void;
}

export default function MatchPredictorModal({ player1, player2, matches, onClose }: MatchPredictorModalProps) {
  const prediction = calculateWinProbability(player1.name, player2.name, player1, player2, matches);
  const player1Form = getRecentForm(player1.name, matches, 10);
  const player2Form = getRecentForm(player2.name, matches, 10);

  const p1Matches = player1.wins + player1.losses;
  const p2Matches = player2.wins + player2.losses;
  const p1WinRate = p1Matches > 0 ? (player1.wins / p1Matches) * 100 : 0;
  const p2WinRate = p2Matches > 0 ? (player2.wins / p2Matches) * 100 : 0;

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
          <h2 className="text-2xl font-semibold">Previsione Match</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Players Header */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 border-2 border-foreground">
              <h3 className="text-xl font-bold mb-1">{player1.name}</h3>
              <div className="text-sm text-muted-foreground">
                {player1.wins}V - {player1.losses}S
              </div>
            </div>
            <div className="p-4 border-2 border-foreground">
              <h3 className="text-xl font-bold mb-1">{player2.name}</h3>
              <div className="text-sm text-muted-foreground">
                {player2.wins}V - {player2.losses}S
              </div>
            </div>
          </div>

          {/* Win Probability */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">🎯 Probabilità di Vittoria</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold w-28">{player1.name}</span>
                <div className="flex-1 h-8 border-2 border-foreground relative overflow-hidden">
                  <div 
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${prediction.player1WinProbability}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold mix-blend-difference text-background">
                    {prediction.player1WinProbability.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold w-28">{player2.name}</span>
                <div className="flex-1 h-8 border-2 border-foreground relative overflow-hidden">
                  <div 
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${prediction.player2WinProbability}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold mix-blend-difference text-background">
                    {prediction.player2WinProbability.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Head to Head */}
          <div className="p-4 border-2 border-foreground">
            <h4 className="font-semibold text-sm mb-3">⚔️ Scontri Diretti</h4>
            {prediction.headToHead.totalMatches > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold">{prediction.headToHead.player1Wins}</div>
                    <div className="text-xs text-muted-foreground">Vittorie {player1.name}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{prediction.headToHead.totalMatches}</div>
                    <div className="text-xs text-muted-foreground">Partite Totali</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{prediction.headToHead.player2Wins}</div>
                    <div className="text-xs text-muted-foreground">Vittorie {player2.name}</div>
                  </div>
                </div>
                {prediction.headToHead.lastWinner && prediction.headToHead.lastMatchDate && (
                  <div className="text-xs text-center text-muted-foreground pt-2 border-t border-foreground/20">
                    Ultimo vincitore: <strong>{prediction.headToHead.lastWinner}</strong> •{' '}
                    {new Date(prediction.headToHead.lastMatchDate).toLocaleDateString('it-IT')}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                Nessuno scontro diretto precedente
              </div>
            )}
          </div>

          {/* Recent Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-foreground">
              <h4 className="font-semibold text-sm mb-3">📈 Forma Recente - {player1.name}</h4>
              {player1Form.length > 0 ? (
                <>
                  <div className="flex gap-1 mb-2 justify-center flex-wrap">
                    {player1Form.map((result, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 border-2 border-foreground flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {player1Form.filter(r => r === 'W').length}V -{' '}
                    {player1Form.filter(r => r === 'L').length}S nelle ultime {player1Form.length}
                  </div>
                </>
              ) : (
                <div className="text-xs text-center text-muted-foreground">Nessun dato</div>
              )}
            </div>

            <div className="p-4 border-2 border-foreground">
              <h4 className="font-semibold text-sm mb-3">📈 Forma Recente - {player2.name}</h4>
              {player2Form.length > 0 ? (
                <>
                  <div className="flex gap-1 mb-2 justify-center flex-wrap">
                    {player2Form.map((result, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 border-2 border-foreground flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {player2Form.filter(r => r === 'W').length}V -{' '}
                    {player2Form.filter(r => r === 'L').length}S nelle ultime {player2Form.length}
                  </div>
                </>
              ) : (
                <div className="text-xs text-center text-muted-foreground">Nessun dato</div>
              )}
            </div>
          </div>

          {/* Overall Stats Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-foreground text-center">
              <div className="text-2xl font-bold">{p1WinRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Win Rate Totale</div>
              <div className="text-xs text-muted-foreground mt-1">{player1.name}</div>
            </div>
            <div className="p-4 border-2 border-foreground text-center">
              <div className="text-2xl font-bold">{p2WinRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Win Rate Totale</div>
              <div className="text-xs text-muted-foreground mt-1">{player2.name}</div>
            </div>
          </div>

          {/* Key Insights */}
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
