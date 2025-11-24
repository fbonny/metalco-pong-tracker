import { useState, useEffect } from 'react';
import { Match, getMatches, deleteMatch, recalculateAllStats } from '@/lib/database';
import { toast } from 'sonner';

interface StoricoTabProps {
  onEditMatch: (match: Match) => void;
  onStatsClick: (type: 'leader' | 'matches' | 'streak') => void;
}

export default function StoricoTab({ onEditMatch, onStatsClick }: StoricoTabProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (!confirm('Delete this match? Player stats will be recalculated.')) return;
    
    try {
      await deleteMatch(matchId);
      await recalculateAllStats();
      await loadMatches();
      toast.success('Match deleted');
    } catch (error) {
      toast.error('Failed to delete match');
      console.error(error);
    }
  }

  const filteredMatches = matches.filter(match => {
    const query = searchQuery.toLowerCase();
    return [...match.team1, ...match.team2].some(name => 
      name.toLowerCase().includes(query)
    );
  });

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Match History</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => onStatsClick('leader')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Re del Ranking</div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold">emoji_events</span>
            <span className="text-sm font-medium">View Stats</span>
          </div>
        </button>
        
        <button
          onClick={() => onStatsClick('matches')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Totale Match</div>
          <div className="text-2xl font-bold">{stats.totalMatches}</div>
        </button>
        
        <button
          onClick={() => onStatsClick('streak')}
          className="p-4 border-2 border-foreground hover:bg-muted transition-colors text-left"
        >
          <div className="text-xs text-muted-foreground mb-1">Best Streak</div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">local_fire_department</span>
            <span className="text-sm font-medium">View Stats</span>
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by player name..."
          className="w-full p-3 border-2 border-foreground bg-background"
        />
      </div>

      {/* Matches List */}
      <div className="space-y-2">
        {filteredMatches.map(match => {
          const winner = match.score1 > match.score2;
          
          return (
            <div
              key={match.id}
              className="p-4 border-2 border-foreground hover:bg-muted transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-2">
                    {formatDate(match.played_at)} • {match.is_double ? 'Doubles' : 'Singles'}
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
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    className="p-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
