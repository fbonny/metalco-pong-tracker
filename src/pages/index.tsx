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
import PlayerStatsModal from '@/components/modals/PlayerStatsModal';
import EditMatchModal from '@/components/modals/EditMatchModal';
import StatsModal from '@/components/modals/StatsModal';
import { Player, Match, getPlayers } from '@/lib/database';
import { checkAndIncrementLeaderDays } from '@/lib/leaderDaysTracker';
import { useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('match');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<Player | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [statsType, setStatsType] = useState<'leader' | 'matches' | 'winStreak' | 'lossStreak' | 'winRate' | 'lossRate' | 'twoWeeks' | 'mostPlayedPair' | 'singlesRank' | null>(null);
  
  const [teamsPrefill, setTeamsPrefill] = useState<{ team1: string[]; team2: string[] } | undefined>();

  useEffect(() => {
    checkAndIncrementLeaderDays();
  }, []);

  function handleRefresh() {
    setRefreshKey(k => k + 1);
  }

  function handleUseTeamsForMatch(teams: { team1: string[]; team2: string[] }) {
    setTeamsPrefill(teams);
    setActiveTab('match');
    setTimeout(() => setTeamsPrefill(undefined), 100);
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Toaster position="top-center" />
      
      <header className="border-b-2 border-foreground py-6 px-4 mb-8">
        <div className="text-center">
          <Logo />
        </div>
      </header>

      <main className="px-4" key={refreshKey}>
        {activeTab === 'match' && (
          <MatchTab 
            prefillTeams={teamsPrefill}
            onMatchCreated={handleRefresh}
          />
        )}
        {activeTab === 'rank' && (
          <RankTab 
            onPlayerClick={setSelectedPlayer}
            onStatsClick={setSelectedPlayerStats}
          />
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

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {selectedPlayer && (
        <>
          {console.log('🔵 RENDERING PlayerProfileModal for:', selectedPlayer.name)}
          <PlayerProfileModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            onUpdate={async () => {
              // Ricarica i dati e aggiorna il player selezionato
              const updatedPlayers = await getPlayers();
              const updatedPlayer = updatedPlayers.find(p => p.id === selectedPlayer.id);
              if (updatedPlayer) {
                setSelectedPlayer(updatedPlayer);
              }
              handleRefresh();
            }}
          />
        </>
      )}

      {selectedPlayerStats && (
        <>
          {console.log('🟢 RENDERING PlayerStatsModal for:', selectedPlayerStats.name)}
          <PlayerStatsModal
            player={selectedPlayerStats}
            onClose={() => setSelectedPlayerStats(null)}
          />
        </>
      )}

      {editingMatch && (
        <>
          {console.log('🟡 RENDERING EditMatchModal for:', editingMatch.id)}
          <EditMatchModal
            match={editingMatch}
            onClose={() => setEditingMatch(null)}
            onUpdate={() => {
              setEditingMatch(null);
              handleRefresh();
            }}
          />
        </>
      )}

      {statsType && (
        <>
          {console.log('🟠 RENDERING StatsModal for:', statsType)}
          <StatsModal
            type={statsType}
            onClose={() => setStatsType(null)}
          />
        </>
      )}
    </div>
  );
}