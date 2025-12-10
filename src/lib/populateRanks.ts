import { getMatches, getPlayers, updateMatch } from './database';

/**
 * Populate player_ranks for all existing matches that don't have it yet
 * Uses current rankings as best approximation
 */
export async function populateHistoricalRanks(): Promise<void> {
  console.log('🔄 Starting historical ranks population...');
  
  // Load all matches and players
  const [matches, allPlayers] = await Promise.all([getMatches(), getPlayers()]);
  
  // Calculate current rankings
  const rankedPlayers = [...allPlayers].sort((a, b) => {
    const pointsA = typeof a.points === 'string' ? parseFloat(a.points) : a.points;
    const pointsB = typeof b.points === 'string' ? parseFloat(b.points) : b.points;
    return pointsB - pointsA || b.wins - a.wins;
  });
  
  const rankMap: Record<string, number> = {};
  rankedPlayers.forEach((player, index) => {
    rankMap[player.name] = index + 1;
  });
  
  // Find matches without player_ranks
  const matchesNeedingRanks = matches.filter(match => {
    return !match.player_ranks || Object.keys(match.player_ranks).length === 0;
  });
  
  console.log(`📊 Found ${matchesNeedingRanks.length} matches without rank data`);
  console.log(`✅ ${matches.length - matchesNeedingRanks.length} matches already have rank data`);
  
  if (matchesNeedingRanks.length === 0) {
    console.log('✅ All matches already have player_ranks! Nothing to do.');
    return;
  }
  
  console.log(`🔧 Populating ranks for ${matchesNeedingRanks.length} matches...`);
  
  let updated = 0;
  let errors = 0;
  
  for (const match of matchesNeedingRanks) {
    try {
      // Create player_ranks object for this match
      const playerRanks: Record<string, number> = {};
      const allMatchPlayers = [...match.team1, ...match.team2];
      
      allMatchPlayers.forEach(playerName => {
        if (rankMap[playerName]) {
          playerRanks[playerName] = rankMap[playerName];
        }
      });
      
      // Update match with estimated ranks
      await updateMatch(match.id, { player_ranks: playerRanks });
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`   Progress: ${updated}/${matchesNeedingRanks.length} matches updated`);
      }
    } catch (error) {
      console.error(`   Error updating match ${match.id}:`, error);
      errors++;
    }
  }
  
  console.log('\n✅ Population complete!');
  console.log(`   Updated: ${updated} matches`);
  console.log(`   Errors: ${errors} matches`);
  console.log(`   Total: ${matches.length} matches in database`);
  console.log('\n⚠️  Note: Historical ranks are estimates based on current rankings.');
  console.log('   Future matches will have accurate historical snapshots!');
}
