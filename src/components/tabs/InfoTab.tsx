export default function InfoTab() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Scoring Rules</h2>
      
      <div className="space-y-6">
        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Standard Win</h3>
          <div className="space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Base Points:</strong> 10 points</p>
            <p><strong className="text-foreground">Bonus:</strong> +0.5 points for each point of difference beyond 2</p>
            <p className="mt-4 text-sm">
              <strong className="text-foreground">Examples:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>21-19: Winner gets 10 points (no bonus)</li>
              <li>21-18: Winner gets 10.5 points (1 point bonus)</li>
              <li>21-15: Winner gets 12 points (4 points bonus)</li>
              <li>21-10: Winner gets 14.5 points (9 points bonus)</li>
            </ul>
          </div>
        </div>

        <div className="border-2 border-gold p-6 bg-gold/10">
          <h3 className="text-xl font-semibold mb-3">Overtime Win (21-20)</h3>
          <div className="space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Winner:</strong> 7 points</p>
            <p><strong className="text-foreground">Loser:</strong> 3 points</p>
            <p className="mt-4 text-sm text-foreground">
              This is considered a symbolic win where both teams played well. The loser receives points for their effort.
            </p>
          </div>
        </div>

        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Match Types</h3>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong className="text-foreground">Singles:</strong> 1 vs 1
              <p className="text-sm">Points are awarded to individual players</p>
            </div>
            <div>
              <strong className="text-foreground">Doubles:</strong> 2 vs 2
              <p className="text-sm">Points are split equally among team members</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-semibold mb-3">Leaderboard</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>Players are ranked by:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li><strong className="text-foreground">Total Points</strong> (primary)</li>
              <li><strong className="text-foreground">Total Wins</strong> (tiebreaker)</li>
            </ol>
            <p className="mt-4 text-sm">
              The #1 ranked player receives the <strong className="text-gold">LEADER</strong> badge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
