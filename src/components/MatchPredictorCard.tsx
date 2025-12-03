import { Player, Match } from '@/lib/database';
import { calculateWinProbability, calculateDoubleProbability } from '@/lib/statsUtils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import WinProbabilityGauge from './WinProbabilityGauge';

interface MatchPredictorCardProps {
  // For singles
  player1?: Player;
  player2?: Player;
  // For doubles
  team1Player1?: Player;
  team1Player2?: Player;
  team2Player1?: Player;
  team2Player2?: Player;
  matches: Match[];
  onClick: () => void;
  isDouble?: boolean;
}

export default function MatchPredictorCard({ 
  player1, 
  player2, 
  team1Player1,
  team1Player2,
  team2Player1,
  team2Player2,
  matches, 
  onClick,
  isDouble = false
}: MatchPredictorCardProps) {
  // Singles prediction
  if (!isDouble && player1 && player2) {
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

        {/* Win Probability Gauge */}
        <div className="mb-4 py-2">
          <WinProbabilityGauge
            team1Probability={prediction.player1WinProbability}
            team2Probability={prediction.player2WinProbability}
            team1Name={player1.name}
            team2Name={player2.name}
          />
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

  // Doubles prediction
  if (isDouble && team1Player1 && team1Player2 && team2Player1 && team2Player2) {
    const allPlayers = [team1Player1, team1Player2, team2Player1, team2Player2];
    const prediction = calculateDoubleProbability(
      team1Player1.name,
      team1Player2.name,
      team2Player1.name,
      team2Player2.name,
      allPlayers,
      matches
    );

    return (
      <div 
        onClick={onClick}
        className="border-2 border-foreground p-4 mb-6 cursor-pointer hover:bg-muted transition-colors animate-fade-in"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">📊 Previsione Doppio</h3>
          <span className="text-xs text-muted-foreground">Click per dettagli</span>
        </div>

        {/* Win Probability Gauge */}
        <div className="mb-4 py-2">
          <WinProbabilityGauge
            team1Probability={prediction.team1WinProbability}
            team2Probability={prediction.team2WinProbability}
            team1Name={`${team1Player1.name} + ${team1Player2.name}`}
            team2Name={`${team2Player1.name} + ${team2Player2.name}`}
          />
        </div>

        {/* Pair Stats */}
        <div className="text-xs text-center mb-2 pb-2 border-b border-foreground/20">
          {prediction.team1PairStats.matches > 0 || prediction.team2PairStats.matches > 0 ? (
            <div className="space-y-1">
              {prediction.team1PairStats.matches > 0 && (
                <div>Coppia 1: {prediction.team1PairStats.wins}V-{prediction.team1PairStats.matches - prediction.team1PairStats.wins}S insieme</div>
              )}
              {prediction.team2PairStats.matches > 0 && (
                <div>Coppia 2: {prediction.team2PairStats.wins}V-{prediction.team2PairStats.matches - prediction.team2PairStats.wins}S insieme</div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Prime volte per queste coppie</span>
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

  return null;
}