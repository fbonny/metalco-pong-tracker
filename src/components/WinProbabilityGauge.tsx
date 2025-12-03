interface WinProbabilityGaugeProps {
  team1Probability: number;
  team2Probability: number;
  team1Name: string;
  team2Name: string;
}

export default function WinProbabilityGauge({ 
  team1Probability, 
  team2Probability,
  team1Name,
  team2Name 
}: WinProbabilityGaugeProps) {
  // Calculate needle angle: -90° (left) to +90° (right)
  // 50% = 0° (center), 0% = -90°, 100% = +90°
  const needleAngle = (team1Probability - 50) * 1.8; // Scale 0-100 to -90 to +90

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Gauge Container */}
      <div className="relative aspect-[2/1] w-full">
        {/* Background semicircle */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Left side (Team 2) - Red gradient */}
          <defs>
            <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="rightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Left half (Team 2 - disadvantage) */}
          <path
            d="M 20 95 A 80 80 0 0 1 100 15"
            fill="none"
            stroke="url(#leftGradient)"
            strokeWidth="8"
            className="opacity-30"
          />
          
          {/* Right half (Team 1 - advantage) */}
          <path
            d="M 100 15 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="url(#rightGradient)"
            strokeWidth="8"
            className="opacity-30"
          />
          
          {/* Center line */}
          <line
            x1="100"
            y1="95"
            x2="100"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-20"
            strokeDasharray="2,2"
          />
          
          {/* Tick marks */}
          {[-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 75 * Math.sin(rad);
            const y1 = 95 - 75 * Math.cos(rad);
            const x2 = 100 + 68 * Math.sin(rad);
            const y2 = 95 - 68 * Math.cos(rad);
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                className="opacity-40"
              />
            );
          })}
          
          {/* Needle */}
          <g transform={`rotate(${needleAngle} 100 95)`}>
            {/* Needle shadow */}
            <line
              x1="100"
              y1="95"
              x2="100"
              y2="25"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="3"
              strokeLinecap="round"
              transform="translate(1, 1)"
            />
            
            {/* Needle */}
            <line
              x1="100"
              y1="95"
              x2="100"
              y2="25"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-lg"
            />
            
            {/* Needle tip */}
            <circle
              cx="100"
              cy="25"
              r="3"
              fill="currentColor"
              className="drop-shadow-lg"
            />
          </g>
          
          {/* Center bolt */}
          <circle
            cx="100"
            cy="95"
            r="6"
            fill="currentColor"
            stroke="hsl(var(--background))"
            strokeWidth="2"
          />
        </svg>

        {/* VS Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold opacity-20 select-none" style={{ transform: 'translate(-50%, -70%)' }}>
          VS
        </div>
      </div>

      {/* Percentages */}
      <div className="flex justify-between items-center mt-1 px-2">
        <div className="text-center flex-1">
          <div className={`text-xl font-bold ${team2Probability > 50 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {team2Probability.toFixed(0)}%
          </div>
          <div className="text-[10px] font-semibold text-muted-foreground mt-1 truncate">
            {team2Name}
          </div>
        </div>
        
        <div className="text-center flex-1">
          <div className={`text-xl font-bold ${team1Probability > 50 ? 'text-green-500' : 'text-muted-foreground'}`}>
            {team1Probability.toFixed(0)}%
          </div>
          <div className="text-[10px] font-semibold text-muted-foreground mt-1 truncate">
            {team1Name}
          </div>
        </div>
      </div>

      {/* Probability label */}
      <div className="text-center mt-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Probabilità di Vittoria
        </p>
      </div>
    </div>
  );
}