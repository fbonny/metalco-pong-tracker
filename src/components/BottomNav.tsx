import { Trophy, Users, History, UserPlus, Info, Target } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'match', label: 'Partita', Icon: Target },
  { id: 'rank', label: 'Classifica', Icon: Trophy },
  { id: 'team', label: 'Squadre', Icon: Users },
  { id: 'storico', label: 'Storico', Icon: History },
  { id: 'nuovo', label: 'Nuovo', Icon: UserPlus },
  { id: 'info', label: 'Info', Icon: Info },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-foreground z-50">
      <div className="grid grid-cols-6 max-w-screen-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-foreground text-background'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}