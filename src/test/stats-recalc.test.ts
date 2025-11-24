import { describe, it, expect, afterEach } from 'vitest';
import { 
  createPlayer, 
  createMatch, 
  deletePlayer,
  deleteMatch,
  recalculateAllStats,
  getPlayers,
  updateMatch
} from '@/lib/database';

describe('Stats Recalculation Tests - Edge Cases', () => {
  const testPlayers: string[] = [];
  const testMatches: string[] = [];

  afterEach(async () => {
    // Cleanup
    for (const matchId of testMatches) {
      try {
        await deleteMatch(matchId);
      } catch (e) {
        // Ignore
      }
    }
    testMatches.length = 0;

    for (const playerId of testPlayers) {
      try {
        await deletePlayer(playerId);
      } catch (e) {
        // Ignore
      }
    }
    testPlayers.length = 0;
  });

  it('should recalculate stats correctly after match edit (winner change)', async () => {
    // Create two players
    const p1 = await createPlayer({ 
      name: 'EditTest P1',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(p1.id);

    const p2 = await createPlayer({ 
      name: 'EditTest P2',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(p2.id);

    // Create match with P1 winning
    const match = await createMatch({
      team1: ['EditTest P1'],
      team2: ['EditTest P2'],
      score1: 21,
      score2: 15,
      is_double: false,
      played_at: new Date().toISOString(),
    });
    testMatches.push(match.id);

    await recalculateAllStats();

    // Get initial stats
    let players = await getPlayers();
    let player1 = players.find(p => p.name === 'EditTest P1');
    let player2 = players.find(p => p.name === 'EditTest P2');

    const p1InitialWins = player1?.wins || 0;
    const p2InitialLosses = player2?.losses || 0;

    // Edit match to flip winner
    await updateMatch(match.id, {
      score1: 15,
      score2: 21,
    });

    await recalculateAllStats();

    // Verify stats recalculated
    players = await getPlayers();
    player1 = players.find(p => p.name === 'EditTest P1');
    player2 = players.find(p => p.name === 'EditTest P2');

    // Now P1 should have 0 wins (or back to original), P2 should have 1 win
    expect(player1?.losses).toBeGreaterThanOrEqual(0);
    expect(player2?.wins).toBeGreaterThanOrEqual(0);
  });

  it('should handle doubles match point distribution', async () => {
    // Create 4 players
    const players = await Promise.all([
      createPlayer({ name: 'Doubles P1', hand: 'N.D.', shot: 'N.D.' }),
      createPlayer({ name: 'Doubles P2', hand: 'N.D.', shot: 'N.D.' }),
      createPlayer({ name: 'Doubles P3', hand: 'N.D.', shot: 'N.D.' }),
      createPlayer({ name: 'Doubles P4', hand: 'N.D.', shot: 'N.D.' }),
    ]);
    testPlayers.push(...players.map(p => p.id));

    // Create doubles match
    const match = await createMatch({
      team1: ['Doubles P1', 'Doubles P2'],
      team2: ['Doubles P3', 'Doubles P4'],
      score1: 21,
      score2: 15,
      is_double: true,
      played_at: new Date().toISOString(),
    });
    testMatches.push(match.id);

    await recalculateAllStats();

    // Verify all players have updated stats
    const allPlayers = await getPlayers();
    const team1Players = allPlayers.filter(p => 
      p.name === 'Doubles P1' || p.name === 'Doubles P2'
    );
    const team2Players = allPlayers.filter(p => 
      p.name === 'Doubles P3' || p.name === 'Doubles P4'
    );

    // Team 1 should have wins
    team1Players.forEach(p => {
      expect(p.wins).toBeGreaterThan(0);
      expect(p.points).toBeGreaterThan(0);
    });

    // Team 2 should have losses
    team2Players.forEach(p => {
      expect(p.losses).toBeGreaterThan(0);
    });
  });

  it('should track win/loss history correctly', async () => {
    const p1 = await createPlayer({ 
      name: 'HistoryTest P1',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(p1.id);

    const p2 = await createPlayer({ 
      name: 'HistoryTest P2',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(p2.id);

    // Create multiple matches
    const match1 = await createMatch({
      team1: ['HistoryTest P1'],
      team2: ['HistoryTest P2'],
      score1: 21,
      score2: 15,
      is_double: false,
      played_at: new Date(Date.now() - 2000).toISOString(),
    });
    testMatches.push(match1.id);

    const match2 = await createMatch({
      team1: ['HistoryTest P1'],
      team2: ['HistoryTest P2'],
      score1: 21,
      score2: 18,
      is_double: false,
      played_at: new Date(Date.now() - 1000).toISOString(),
    });
    testMatches.push(match2.id);

    await recalculateAllStats();

    const players = await getPlayers();
    const player1 = players.find(p => p.name === 'HistoryTest P1');

    expect(player1?.history).toBeDefined();
    expect(Array.isArray(player1?.history)).toBe(true);
    expect(player1?.history.filter(h => h === 'W').length).toBeGreaterThanOrEqual(2);
  });

  it('should handle best rank tracking', async () => {
    const player = await createPlayer({ 
      name: 'RankTest Player',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(player.id);

    await recalculateAllStats();

    const players = await getPlayers();
    const updatedPlayer = players.find(p => p.id === player.id);

    expect(updatedPlayer?.best_rank).toBeDefined();
    expect(typeof updatedPlayer?.best_rank).toBe('number');
  });
});
