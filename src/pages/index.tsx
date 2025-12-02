import { useState } from 'react';
import { Toaster } from 'sonner';
import Logo from '@/components/Logo';
import BottomNav from '@/components/BottomNav';
import MatchTab from '@/components/tabs/MatchTab';
import RankTab from '@/components/tabs/RankTab';
import TeamTab from '@/components/tabs/TeamTab';
import StoricoTab from '@/components/tabs/StoricoTab';
import InfoTab from '@/components/tabs/InfoTab';
import WallOfFameTab from '@/components/tabs/WallOfFameTab';
import PlayerProfileModal from '@/components/modals/PlayerProfileModal';
import EditMatchModal from '@/components/modals/EditMatchModal';
import StatsModal from '@/components/modals/StatsModal';
import { Player, Match } from '@/lib/database';
import { checkAndIncrementLeaderDays } from '@/lib/leaderDaysTracker';
import { useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('match');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Modal states
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [statsType, setStatsType] = useState<'leader' | 'matches' | 'winStreak' | 'lossStreak' | 'winRate' | 'lossRate' | 'twoWeeks' | 'mostPlayedPair' | null>(null);
  
  // Team generator prefill
  const [teamsPrefill, setTeamsPrefill] = useState<{ team1: string[]; team2: string[] } | undefined>();

  // Check and increment leader days on app load
  useEffect(() => {
    checkAndIncrementLeaderDays();
  }, []);

  function handleRefresh() {
    setRefreshKey(k => k + 1);
  }

  function handleUseTeamsForMatch(teams: { team1: string[]; team2: string[] }) {
    setTeamsPrefill(teams);
    setActiveTab('match');
    // Clear prefill after a short delay
    setTimeout(() => setTeamsPrefill(undefined), 100);
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="border-b-2 border-foreground py-6 px-4 mb-8">
        <div className="text-center">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4" key={refreshKey}>
        {activeTab === 'match' && (
          <MatchTab 
            prefillTeams={teamsPrefill}
            onMatchCreated={handleRefresh}
          />
        )}
        {activeTab === 'rank' && (
          <RankTab onPlayerClick={setSelectedPlayer} />
        )}
        {activeTab === 'team' && (
          <TeamTab onUseForMatch={handleUseTeamsForMatch} />
        )}
        {activeTab === 'storico' && (
          <StoricoTab 
            onEditMatch={setEditingMatch}
            onStatsClick={setStatsType}
          />
        )}
        {activeTab === 'walloffame' && (
          <WallOfFameTab onPlayerClick={setSelectedPlayer} />
        )}
        {activeTab === 'info' && <InfoTab onPlayerCreated={handleRefresh} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onUpdate={() => {
            setSelectedPlayer(null);
            handleRefresh();
          }}
        />
      )}

      {editingMatch && (
        <EditMatchModal
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onUpdate={() => {
            setEditingMatch(null);
            handleRefresh();
          }}
        />
      )}

      {statsType && (
        <StatsModal
          type={statsType}
          onClose={() => setStatsType(null)}
        />
      )}
    </div>
  );
}