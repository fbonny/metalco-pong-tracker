import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  createPlayer, 
  createMatch, 
  getPlayers,
  deletePlayer,
  deleteMatch,
  getMatches,
  recalculateAllStats 
} from '@/lib/database';

describe('E2E Workflow - Complete Game Scenario', () => {
  const playerIds: string[] = [];
  const matchIds: string[] = [];

  afterAll(async () => {
    // Cleanup all test data
    for (const matchId of matchIds) {
      try {
        await deleteMatch(matchId);
      } catch (e) {
        // Ignore
      }
    }
    
    for (const playerId of playerIds) {
      try {
        await deletePlayer(playerId);
      } catch (e) {
        // Ignore
      }
    }
  });

  it('should execute complete pong tracker workflow', async () => {
    // STEP 1: Create 4 players
    const alice = await createPlayer({
      name: 'Alice',
      hand: 'Destrorso',
      shot: 'Dritto',
    });
    playerIds.push(alice.id);

    const bob = await createPlayer({
      name: 'Bob',
      hand: 'Mancino',
      shot: 'Rovescio',
    });
    playerIds.push(bob.id);

    const charlie = await createPlayer({
      name: 'Charlie',
      hand: 'Destrorso',
      shot: 'Dritto',
    });
    playerIds.push(charlie.id);

    const diana = await createPlayer({
      name: 'Diana',
      hand: 'Destrorso',
      shot: 'Rovescio',
    });
    playerIds.push(diana.id);

    // STEP 2: Record singles match - Alice beats Bob 21-15
    // Expected: Alice gets 12 points (10 base + 1 bonus)
    const match1 = await createMatch({
      team1: ['Alice'],
      team2: ['Bob'],
      score1: 21,
      score2: 15,
      is_double: false,
      played_at: new Date(Date.now() - 3000).toISOString(),
    });
    matchIds.push(match1.id);

    await recalculateAllStats();

    let players = await getPlayers();
    let aliceStats = players.find(p => p.name === 'Alice');
    let bobStats = players.find(p => p.name === 'Bob');

    expect(aliceStats?.wins).toBe(1);
    expect(aliceStats?.losses).toBe(0);
    expect(aliceStats?.points).toBe(12); // 10 + (6-2)*0.5 = 12
    
    expect(bobStats?.wins).toBe(0);
    expect(bobStats?.losses).toBe(1);
    expect(bobStats?.points).toBe(0);

    // STEP 3: Record overtime match - Charlie beats Diana 21-20
    // Expected: Charlie gets 7, Diana gets 3
    const match2 = await createMatch({
      team1: ['Charlie'],
      team2: ['Diana'],
      score1: 21,
      score2: 20,
      is_double: false,
      played_at: new Date(Date.now() - 2000).toISOString(),
    });
    matchIds.push(match2.id);

    await recalculateAllStats();

    players = await getPlayers();
    let charlieStats = players.find(p => p.name === 'Charlie');
    let dianaStats = players.find(p => p.name === 'Diana');

    expect(charlieStats?.wins).toBe(1);
    expect(charlieStats?.points).toBe(7);
    
    expect(dianaStats?.losses).toBe(1);
    expect(dianaStats?.points).toBe(3);

    // STEP 4: Record doubles match - Alice+Bob beat Charlie+Diana 21-19
    // Expected: Alice and Bob each get 10 points (no bonus for 2-point margin)
    const match3 = await createMatch({
      team1: ['Alice', 'Bob'],
      team2: ['Charlie', 'Diana'],
      score1: 21,
      score2: 19,
      is_double: true,
      played_at: new Date(Date.now() - 1000).toISOString(),
    });
    matchIds.push(match3.id);

    await recalculateAllStats();

    players = await getPlayers();
    aliceStats = players.find(p => p.name === 'Alice');
    bobStats = players.find(p => p.name === 'Bob');
    charlieStats = players.find(p => p.name === 'Charlie');
    dianaStats = players.find(p => p.name === 'Diana');

    // Alice: 12 (from match1) + 10 (from match3) = 22
    expect(aliceStats?.wins).toBe(2);
    expect(aliceStats?.points).toBe(22);

    // Bob: 0 (from match1) + 10 (from match3) = 10
    expect(bobStats?.wins).toBe(1);
    expect(bobStats?.losses).toBe(1);
    expect(bobStats?.points).toBe(10);

    // Charlie: 7 (from match2) + 0 (from match3) = 7
    expect(charlieStats?.wins).toBe(1);
    expect(charlieStats?.losses).toBe(1);
    expect(charlieStats?.points).toBe(7);

    // Diana: 3 (from match2) + 0 (from match3) = 3
    expect(dianaStats?.losses).toBe(2);
    expect(dianaStats?.points).toBe(3);

    // STEP 5: Verify leaderboard ordering
    expect(players[0].name).toBe('Alice'); // 22 points
    expect(players[1].name).toBe('Bob');   // 10 points
    expect(players[2].name).toBe('Charlie'); // 7 points
    expect(players[3].name).toBe('Diana');   // 3 points

    // STEP 6: Verify match history
    const matches = await getMatches();
    const ourMatches = matches.filter(m => matchIds.includes(m.id));
    expect(ourMatches.length).toBe(3);

    // Verify matches are ordered by played_at DESC
    expect(ourMatches[0].id).toBe(match3.id); // Most recent
    expect(ourMatches[2].id).toBe(match1.id); // Oldest

    // STEP 7: Verify win/loss history tracking
    expect(aliceStats?.history).toEqual(['W', 'W']);
    expect(bobStats?.history).toEqual(['L', 'W']);
    expect(charlieStats?.history).toEqual(['W', 'L']);
    expect(dianaStats?.history).toEqual(['L', 'L']);

    // STEP 8: Verify best rank tracking (all should be 1-4)
    expect(aliceStats?.best_rank).toBeLessThanOrEqual(4);
    expect(bobStats?.best_rank).toBeLessThanOrEqual(4);
    expect(charlieStats?.best_rank).toBeLessThanOrEqual(4);
    expect(dianaStats?.best_rank).toBeLessThanOrEqual(4);
  });
});
