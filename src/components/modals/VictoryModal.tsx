import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VictoryModalProps {
  winners: { name: string; avatar?: string }[];
  onClose: () => void;
}

export default function VictoryModal({ winners, onClose }: VictoryModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay before showing to allow previous modal to close
    setTimeout(() => setShow(true), 100);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-background border-4 border-gold max-w-2xl w-full p-8 relative animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 8px 0 hsl(var(--gold)), 0 16px 40px rgba(255, 215, 0, 0.4)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* WIN Text - Animated */}
        <div
          className="text-center mb-8 animate-vs-appear opacity-0"
          style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}
        >
          <div
            className="text-8xl font-bold animate-vs-pulse uppercase tracking-widest"
            style={{
              color: 'hsl(var(--gold))',
              WebkitTextStroke: '3px black',
              textShadow: '5px 5px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            WIN!
          </div>
          <div className="text-xl font-semibold mt-2 uppercase tracking-wide">
            Victory!
          </div>
        </div>

        {/* Winners Photos */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {winners.map((winner, index) => (
            <div
              key={index}
              className={`animate-slide-in-${index % 2 === 0 ? 'left' : 'right'} opacity-0`}
              style={{
                animationFillMode: 'forwards',
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-gold bg-gold/10 flex items-center justify-center"
                style={{
                  boxShadow: '0 4px 0 hsl(var(--gold)), 0 8px 20px rgba(255, 215, 0, 0.3)',
                }}
              >
                {winner.avatar ? (
                  <img
                    src={winner.avatar}
                    alt={winner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold text-gold">
                    {winner.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Winners Names */}
        <div
          className="text-center animate-slide-in-left opacity-0"
          style={{
            animationFillMode: 'forwards',
            animationDelay: `${winners.length * 0.1 + 0.1}s`,
          }}
        >
          <div className="text-3xl font-bold text-gold uppercase tracking-wide mb-2">
            {winners.map((w) => w.name).join(' & ')}
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-widest">
            {winners.length === 1 ? 'Champion' : 'Champions'}
          </div>
        </div>

        {/* Confetti effect with CSS */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gold animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Continue Button */}
        <div
          className="mt-8 animate-fade-in opacity-0"
          style={{
            animationFillMode: 'forwards',
            animationDelay: `${winners.length * 0.1 + 0.3}s`,
          }}
        >
          <button
            onClick={onClose}
            className="w-full py-4 bg-gold text-gold-foreground border-4 border-gold font-bold text-lg uppercase tracking-wider hover:bg-gold/80 transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 4px 0 rgba(0, 0, 0, 0.3), 0 8px 20px rgba(255, 215, 0, 0.3)' }}
          >
            Continua
          </button>
        </div>
      </div>
    </div>
  );
}