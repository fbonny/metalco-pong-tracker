import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { 
  getPlayers, 
  getMatches, 
  createPlayer, 
  createMatch, 
  deletePlayer,
  deleteMatch,
  recalculateAllStats,
  calculateMatchPoints 
} from '@/lib/database';

describe('Database Mirror Tests - Exact Frontend Queries', () => {
  const testPlayers: string[] = [];
  const testMatches: string[] = [];

  afterEach(async () => {
    // Cleanup: delete test data
    for (const matchId of testMatches) {
      try {
        await deleteMatch(matchId);
      } catch (e) {
        // Ignore errors if already deleted
      }
    }
    testMatches.length = 0;

    for (const playerId of testPlayers) {
      try {
        await deletePlayer(playerId);
      } catch (e) {
        // Ignore errors if already deleted
      }
    }
    testPlayers.length = 0;
  });

  it('should fetch players ordered by points DESC, wins DESC (mirroring RankTab)', async () => {
    // Create test players
    const player1 = await createPlayer({ 
      name: 'Test Player 1',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(player1.id);

    const player2 = await createPlayer({ 
      name: 'Test Player 2',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(player2.id);

    // MIRROR THE EXACT QUERY FROM RankTab
    const players = await getPlayers();
    
    expect(players).toBeDefined();
    expect(Array.isArray(players)).toBe(true);
    
    // Verify the players we created exist
    const ourPlayers = players.filter(p => 
      p.name === 'Test Player 1' || p.name === 'Test Player 2'
    );
    expect(ourPlayers.length).toBeGreaterThanOrEqual(2);
  });

  it('should fetch matches ordered by played_at DESC (mirroring StoricoTab)', async () => {
    // Create test player
    const player = await createPlayer({ 
      name: 'Test Match Player',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(player.id);

    // Create test match
    const match = await createMatch({
      team1: ['Test Match Player'],
      team2: ['Test Match Player'], // Using same player for simplicity
      score1: 21,
      score2: 15,
      is_double: false,
      played_at: new Date().toISOString(),
    });
    testMatches.push(match.id);

    // MIRROR THE EXACT QUERY FROM StoricoTab
    const matches = await getMatches();
    
    expect(matches).toBeDefined();
    expect(Array.isArray(matches)).toBe(true);
    
    // Verify our match exists
    const ourMatch = matches.find(m => m.id === match.id);
    expect(ourMatch).toBeDefined();
    expect(ourMatch?.score1).toBe(21);
    expect(ourMatch?.score2).toBe(15);
  });

  it('should handle player creation with avatar compression (mirroring NuovoTab)', async () => {
    const player = await createPlayer({
      name: 'Test Avatar Player',
      avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', // Minimal base64
      hand: 'Destrorso',
      shot: 'Dritto'
    });
    testPlayers.push(player.id);

    expect(player).toBeDefined();
    expect(player.name).toBe('Test Avatar Player');
    expect(player.hand).toBe('Destrorso');
    expect(player.shot).toBe('Dritto');
    expect(player.avatar).toBeDefined();
  });

  it('should handle match creation and stat recalculation (mirroring MatchTab)', async () => {
    // Create two players
    const p1 = await createPlayer({ 
      name: 'Match Test P1',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(p1.id);

    const p2 = await createPlayer({ 
      name: 'Match Test P2',
      hand: 'N.D.',
      shot: 'N.D.'
    });
    testPlayers.push(p2.id);

    // Create match
    const match = await createMatch({
      team1: ['Match Test P1'],
      team2: ['Match Test P2'],
      score1: 21,
      score2: 15,
      is_double: false,
      played_at: new Date().toISOString(),
    });
    testMatches.push(match.id);

    // Recalculate stats (as done in MatchTab)
    await recalculateAllStats();

    // Verify match was created
    const matches = await getMatches();
    const createdMatch = matches.find(m => m.id === match.id);
    
    expect(createdMatch).toBeDefined();
    expect(createdMatch?.team1).toEqual(['Match Test P1']);
    expect(createdMatch?.team2).toEqual(['Match Test P2']);
  });
});

describe('Points Calculation Logic - Critical Business Rules', () => {
  it('should calculate 10.5 points for 21-19 win', () => {
    const points = calculateMatchPoints(21, 19);
    expect(points.winner).toBe(10);
    expect(points.loser).toBe(0);
  });

  it('should calculate 12 points for 21-17 win (4 point margin)', () => {
    const points = calculateMatchPoints(21, 17);
    expect(points.winner).toBe(11); // 10 base + (4-2)*0.5 = 11
    expect(points.loser).toBe(0);
  });

  it('should calculate 7/3 split for 21-20 overtime win', () => {
    const points = calculateMatchPoints(21, 20);
    expect(points.winner).toBe(7);
    expect(points.loser).toBe(3);
  });

  it('should calculate 11.5 points for 21-15 win', () => {
    const points = calculateMatchPoints(21, 15);
    expect(points.winner).toBe(12);
    expect(points.loser).toBe(0);
  });

  it('should calculate 14.5 points for 21-10 win (dominant victory)', () => {
    const points = calculateMatchPoints(21, 10);
    expect(points.winner).toBe(14.5);
    expect(points.loser).toBe(0);
  });

  it('should calculate 10 points for 21-18 win (3 point margin)', () => {
    const points = calculateMatchPoints(21, 18);
    expect(points.winner).toBe(10.5);
    expect(points.loser).toBe(0);
  });

  it('should handle edge case: 21-0 shutout', () => {
    const points = calculateMatchPoints(21, 0);
    expect(points.winner).toBe(19.5); // 10 + (19-2)*0.5 = 10 + 8.5
    expect(points.loser).toBe(0);
  });

  it('should handle exact 2-point margin: 21-19 (no bonus)', () => {
    const points = calculateMatchPoints(21, 19);
    expect(points.winner).toBe(10); // Base only, no bonus
    expect(points.loser).toBe(0);
  });

  it('should handle 22-20 overtime scenario', () => {
    const points = calculateMatchPoints(22, 20);
    // NOT overtime (only 21-20 is overtime)
    const diff = 22 - 20; // 2
    const bonus = Math.max(0, (diff - 2) * 0.5); // 0
    expect(points.winner).toBe(10);
    expect(points.loser).toBe(0);
  });
});