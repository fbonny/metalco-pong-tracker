import { useState } from 'react';
import { Match, updateMatch, recalculateAllStats } from '@/lib/database';
import { toast } from 'sonner';

interface EditMatchModalProps {
  match: Match;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditMatchModal({ match, onClose, onUpdate }: EditMatchModalProps) {
  const [score1, setScore1] = useState(match.score1.toString());
  const [score2, setScore2] = useState(match.score2.toString());
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    
    if (isNaN(s1) || isNaN(s2)) {
      toast.error('Please enter valid scores');
      return;
    }
    
    if (s1 === s2) {
      toast.error('Scores cannot be tied');
      return;
    }
    
    if (Math.max(s1, s2) < 21) {
      toast.error('Winner must have at least 21 points');
      return;
    }

    setLoading(true);
    try {
      await updateMatch(match.id, {
        score1: s1,
        score2: s2,
      });
      
      await recalculateAllStats();
      
      toast.success('Match updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update match');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background border-2 border-foreground max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
          <div>
            <h2 className="text-2xl font-semibold">Edit Match</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(match.played_at)} • {match.is_double ? 'Doubles' : 'Singles'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Team 1 */}
          <div className="border-2 border-foreground p-4">
            <div className="font-semibold mb-3">
              {match.team1.join(' + ')}
            </div>
            <input
              type="number"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className="w-full p-3 border-2 border-foreground bg-background text-2xl font-bold text-center"
              min="0"
            />
          </div>

          {/* Team 2 */}
          <div className="border-2 border-foreground p-4">
            <div className="font-semibold mb-3">
              {match.team2.join(' + ')}
            </div>
            <input
              type="number"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              className="w-full p-3 border-2 border-foreground bg-background text-2xl font-bold text-center"
              min="0"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-foreground hover:bg-muted transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
