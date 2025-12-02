import { useState, useEffect } from 'react';
import { Player, getPlayers, Match, getMatches } from '@/lib/database';
import { formatPoints } from '@/lib/formatUtils';
import { calculateAdvancedStats } from '@/lib/statsUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { X, Crown, TrendingUp, Swords, Target, Flame } from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PlayerProfileModal({ player, onClose }: PlayerProfileModalProps) {
  // Advanced stats state
  const [matches, setMatches] = useState<Match[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [advancedStats, setAdvancedStats] = useState<ReturnType<typeof calculateAdvancedStats> | null>(null);
  const [currentRank, setCurrentRank] = useState(0);

  const matchesPlayed = player.wins + player.losses;
  const winRate = matchesPlayed > 0 ? (player.wins / matchesPlayed) * 100 : 0;

  useEffect(() => {
    loadAdvancedData();
  }, [player.id]);

  async function loadAdvancedData() {
    const [playersData, matchesData] = await Promise.all([getPlayers(), getMatches()]);
    setAllPlayers(playersData);
    setMatches(matchesData);
    
    // Sort players by points to calculate rank
    const sorted = [...playersData].sort((a, b) => {
      const pointsA = typeof a.points === 'string' ? parseFloat(a.points) : a.points;
      const pointsB = typeof b.points === 'string' ? parseFloat(b.points) : b.points;
      return pointsB - pointsA || b.wins - a.wins;
    });
    const rank = sorted.findIndex(p => p.id === player.id) + 1;
    setCurrentRank(rank);
    
    // Calculate advanced stats
    const stats = calculateAdvancedStats(player, matchesData, playersData);
    setAdvancedStats(stats);
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={player.name} avatar={player.avatar} size="md" />
            <div>
              <h2 className="text-2xl font-semibold">{player.name}</h2>
              <div className="text-sm text-muted-foreground">
                Rank #{currentRank} • {formatPoints(player.points)} pts
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Win Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">% Vittorie</span>
              <span className="text-sm font-semibold">{winRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 border-2 border-foreground">
              <div
                className="h-full bg-foreground transition-all"
                style={{ width: `${winRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{player.wins}V</span>
              <span>{player.losses}S</span>
            </div>
          </div>

          {/* Advanced Statistics Section */}
          {advancedStats && (
            <>
              {/* Nemesis & Victim */}
              <div className="grid grid-cols-2 gap-3">
                {/* Nemesis */}
                <div className="p-4 border-2 border-destructive bg-destructive/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-semibold text-destructive">NEMESI</span>
                  </div>
                  {advancedStats.nemesis ? (
                    <>
                      <div className="font-bold text-sm truncate mb-1">
                        {advancedStats.nemesis.opponentName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advancedStats.nemesis.wins}V - {advancedStats.nemesis.losses}S
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">Nessuna nemesi</div>
                  )}
                </div>

                {/* Victim */}
                <div className="p-4 border-2 border-green-600 bg-green-600/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-600">VITTIMA</span>
                  </div>
                  {advancedStats.victim ? (
                    <>
                      <div className="font-bold text-sm truncate mb-1">
                        {advancedStats.victim.opponentName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advancedStats.victim.wins}V - {advancedStats.victim.losses}S
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">Nessuna vittima</div>
                  )}
                </div>
              </div>

              {/* Recent Form */}
              <div className="p-4 border-2 border-foreground">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">Forma Recente</span>
                </div>
                <div className="space-y-2">
                  {advancedStats.recentForm.map((form, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{form.period}</span>
                      <span className="font-semibold">
                        {form.wins}V - {form.losses}S
                        {form.pointsChange !== 0 && (
                          <span className={form.pointsChange > 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                            {form.pointsChange > 0 ? '+' : ''}{form.pointsChange.toFixed(1)}pts
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border-2 border-foreground text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-semibold">STRISCIA ATTUALE</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {advancedStats.currentStreak.count}
                    <span className={`text-sm ml-1 ${
                      advancedStats.currentStreak.type === 'W' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {advancedStats.currentStreak.type}
                    </span>
                  </div>
                </div>

                <div className="p-4 border-2 border-foreground text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="w-4 h-4" />
                    <span className="text-xs font-semibold">BEST STREAK</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {advancedStats.bestStreak.count}
                    <span className="text-sm ml-1 text-green-600">W</span>
                  </div>
                </div>
              </div>

              {/* Performance Split */}
              <div className="p-4 border-2 border-foreground">
                <div className="text-sm font-semibold mb-3">Performance per Tipo di Match</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Singolo</div>
                    <div className="text-xl font-bold">
                      {advancedStats.singoloWinRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {advancedStats.singoloMatches} partite
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Doppio</div>
                    <div className="text-xl font-bold">
                      {advancedStats.doppioWinRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {advancedStats.doppioMatches} partite
                    </div>
                  </div>
                </div>
              </div>

              {/* Balanced Rivalries */}
              {advancedStats.balancedRivalries.length > 0 && (
                <div className="p-4 border-2 border-foreground">
                  <div className="text-sm font-semibold mb-3">⚖️ Top Rivalità Bilanciate</div>
                  <div className="space-y-2">
                    {advancedStats.balancedRivalries.map((rivalry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted/50 border border-foreground/20"
                      >
                        <span className="font-semibold text-sm">{rivalry.opponentName}</span>
                        <span className="text-sm text-muted-foreground">
                          {rivalry.wins}-{rivalry.losses} ({rivalry.totalMatches} match)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
