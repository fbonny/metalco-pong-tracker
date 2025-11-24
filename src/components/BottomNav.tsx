interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'match', label: 'Match', icon: 'sports_tennis' },
  { id: 'rank', label: 'Rank', icon: 'leaderboard' },
  { id: 'team', label: 'Team', icon: 'groups' },
  { id: 'storico', label: 'Storico', icon: 'history' },
  { id: 'nuovo', label: 'Nuovo', icon: 'person_add' },
  { id: 'info', label: 'Info', icon: 'info' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-foreground z-50">
      <div className="grid grid-cols-6 max-w-screen-lg mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-foreground text-background'
                : 'bg-background text-foreground hover:bg-muted'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
