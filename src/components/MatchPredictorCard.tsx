import { Player, Match } from '@/lib/database';
import { calculateWinProbability } from '@/lib/statsUtils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MatchPredictorCardProps {
  player1: Player;
  player2: Player;
  matches: Match[];
  onClick: () => void;
}

export default function MatchPredictorCard({ player1, player2, matches, onClick }: MatchPredictorCardProps) {
  const prediction = calculateWinProbability(player1.name, player2.name, player1, player2, matches);

  return (
    <div 
      onClick={onClick}
      className="border-2 border-foreground p-4 mb-6 cursor-pointer hover:bg-muted transition-colors animate-fade-in"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">📊 Previsione Match</h3>
        <span className="text-xs text-muted-foreground">Click per dettagli</span>
      </div>

      {/* Win Probability Bars */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold w-32 truncate">{player1.name}</span>
          <div className="flex-1 h-6 border-2 border-foreground relative overflow-hidden">
            <div 
              className="h-full bg-foreground transition-all"
              style={{ width: `${prediction.player1WinProbability}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold mix-blend-difference text-background">
              {prediction.player1WinProbability.toFixed(0)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold w-32 truncate">{player2.name}</span>
          <div className="flex-1 h-6 border-2 border-foreground relative overflow-hidden">
            <div 
              className="h-full bg-foreground transition-all"
              style={{ width: `${prediction.player2WinProbability}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold mix-blend-difference text-background">
              {prediction.player2WinProbability.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Head to Head */}
      <div className="text-xs text-center mb-2 pb-2 border-b border-foreground/20">
        {prediction.headToHead.totalMatches > 0 ? (
          <span className="font-semibold">
            Scontri diretti: {prediction.headToHead.player1Wins}-{prediction.headToHead.player2Wins}
          </span>
        ) : (
          <span className="text-muted-foreground">Nessuno scontro diretto precedente</span>
        )}
      </div>

      {/* Top Insight */}
      {prediction.insights.length > 0 && (
        <div className="text-xs text-muted-foreground italic">
          💡 {prediction.insights[0]}
        </div>
      )}
    </div>
  );
}
