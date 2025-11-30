import { X } from 'lucide-react';

interface VictoryModalProps {
  winners: { name: string; avatar?: string }[];
  onClose: () => void;
}

export default function VictoryModal({ winners, onClose }: VictoryModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-black border-4 border-yellow-500 max-w-2xl w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-red-500 text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* WIN Text */}
        <div className="text-center mb-8">
          <div className="text-8xl font-bold text-yellow-500">
            WIN!
          </div>
          <div className="text-xl font-semibold mt-2">
            Victory!
          </div>
        </div>

        {/* Winners Photos */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {winners.map((winner, index) => (
            <div key={index}>
              <div className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-yellow-500 bg-yellow-100 flex items-center justify-center">
                {winner.avatar ? (
                  <img
                    src={winner.avatar}
                    alt={winner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold text-yellow-600">
                    {winner.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Winners Names */}
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 uppercase mb-2">
            {winners.map(w => w.name).join(' & ')}
          </div>
          <div className="text-sm text-gray-600 uppercase">
            {winners.length === 1 ? 'Champion' : 'Champions'}
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-4 bg-yellow-500 text-black border-4 border-yellow-600 font-bold text-lg uppercase"
          >
            Continua
          </button>
        </div>
      </div>
    </div>
  );
}