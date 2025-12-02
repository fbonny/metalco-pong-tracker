import { useState, useEffect } from 'react';
import { Match, getMatches, deleteMatch, recalculateAllStats, Player, getPlayers } from '@/lib/database';
import { Trophy, Flame, TrendingUp, TrendingDown, TrendingUpDown, Edit, Trash2, Users, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface StoricoTabProps {
  onEditMatch: (match: Match) => void;
  onStatsClick: (type: 'leader' | 'matches' | 'winStreak' | 'lossStreak' | 'winRate' | 'lossRate' | 'twoWeeks' | 'mostPlayedPair' | 'singlesRank') => void;
}

interface MatchesByDay {
  date: string;
  displayDate: string;
  matches: Match[];
}

export default function StoricoTab({ onEditMatch, onStatsClick }: StoricoTabProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalMatches: 0,
  });

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    const data = await getMatches();
    setMatches(data);
    setStats({ totalMatches: data.length });
  }

  async function handleDelete(matchId: string) {
    if (!confirm('Eliminare questa partita? Le statistiche verranno ricalcolate.')) return;
    
    try {
      await deleteMatch(matchId);
      await recalculateAllStats();
      await loadMatches();
      toast.success('Partita eliminata');
    } catch (error) {
      toast.error('Errore eliminazione partita');
      console.error(error);
    }
  }

  const filteredMatches = matches.filter(match => {
    const query = searchQuery.toLowerCase();
    return [...match.team1, ...match.team2].some(name => 
      name.toLowerCase().includes(query)
    );
  });

  // Group matches by day
  function groupMatchesByDay(matches: Match[]): MatchesByDay[] {
    const groups = new Map<string, Match[]>();
    
    matches.forEach(match => {
      const date = new Date(match.played_at);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups.has(dayKey)) {
        groups.set(dayKey, []);
      }
      groups.get(dayKey)!.push(match);
    });
    
    // Convert to array and sort by date (newest first)
    return Array.from(groups.entries())
      .map(([date, matches]) => ({
        date,
        displayDate: formatDayDate(date),
        matches: matches.sort((a, b) => 
          new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
        ),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function formatDayDate(dateString: string): string {
    const date = new Date(dateString + 'T12:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Oggi';
    if (isYesterday) return 'Ieri';
    
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function toggleDay(dayKey: string) {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayKey)) {
        newSet.delete(dayKey);
      } else {
        newSet.add(dayKey);
      }
      return newSet;
    });
  }

  const matchesByDay = groupMatchesByDay(filteredMatches);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Storico Partite</h2>
      
      {/* Stats Cards - 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => onStatsClick('leader')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Re del Ranking</div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>
        
        <button
          onClick={() => onStatsClick('matches')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Totale Partite</div>
          <div className="text-2xl font-bold">{stats.totalMatches}</div>
        </button>
        
        <button
          onClick={() => onStatsClick('singlesRank')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Classifica Singolo</div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>

        <button
          onClick={() => onStatsClick('lossStreak')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Peggior Striscia</div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>

        <button
          onClick={() => onStatsClick('winRate')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Miglior % Vittorie</div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>

        <button
          onClick={() => onStatsClick('lossRate')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Peggior % Sconfitte</div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>

        <button
          onClick={() => onStatsClick('winStreak')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Miglior Striscia</div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>

        <button
          onClick={() => onStatsClick('mostPlayedPair')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Coppia Frequente</div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>

        <button
          onClick={() => onStatsClick('twoWeeks')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Top e Flop - 14gg</div>
          <div className="flex items-center gap-2">
            <TrendingUpDown className="w-5 h-5" />
            <span className="text-sm font-medium">Vedi Stats</span>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cerca per nome giocatore..."
          className="w-full p-3 border-2 border-foreground bg-background"
        />
      </div>

      {/* Matches by Day */}
      <div className="space-y-3">
        {matchesByDay.map(({ date, displayDate, matches }) => {
          const isExpanded = expandedDays.has(date);
          
          return (
            <div key={date} className="border-2 border-foreground">
              {/* Day Header - Clickable */}
              <button
                onClick={() => toggleDay(date)}
                className="w-full p-4 hover:bg-muted transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <Calendar className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{displayDate}</div>
                    <div className="text-sm text-muted-foreground">
                      {matches.length} {matches.length === 1 ? 'partita' : 'partite'}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isExpanded ? 'Comprimi' : 'Espandi'}
                </div>
              </button>

              {/* Matches for this day */}
              {isExpanded && (
                <div className="border-t-2 border-foreground">
                  {matches.map((match, index) => {
                    const winner = match.score1 > match.score2;
                    
                    return (
                      <div
                        key={match.id}
                        className={`p-4 hover:bg-muted transition-colors group ${
                          index > 0 ? 'border-t-2 border-foreground' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-2">
                              {formatTime(match.played_at)} • {match.is_double ? 'Doppio' : 'Singolo'}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className={`font-medium ${winner ? 'font-bold' : ''}`}>
                                {match.team1.join(' + ')}
                              </div>
                              <div className={`text-2xl ${winner ? 'font-bold' : ''}`}>
                                {match.score1}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2">
                              <div className={`font-medium ${!winner ? 'font-bold' : ''}`}>
                                {match.team2.join(' + ')}
                              </div>
                              <div className={`text-2xl ${!winner ? 'font-bold' : ''}`}>
                                {match.score2}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditMatch(match)}
                              className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                              title="Modifica"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(match.id)}
                              className="p-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        
        {matchesByDay.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Nessuna partita trovata
          </div>
        )}
      </div>
    </div>
  );
}