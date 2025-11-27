import { getPlayers, updatePlayer } from './database';

const LAST_CHECK_KEY = 'pong_tracker_last_leader_check';
const CHECK_HOUR = 14; // 14:00

/**
 * Checks if we need to increment the leader's days counter
 * This runs when the app loads and checks if it's past 14:00 on a new day
 */
export async function checkAndIncrementLeaderDays(): Promise<void> {
  try {
    const now = new Date();
    const lastCheckStr = localStorage.getItem(LAST_CHECK_KEY);
    
    // If no last check, set it to now and return
    if (!lastCheckStr) {
      localStorage.setItem(LAST_CHECK_KEY, now.toISOString());
      return;
    }
    
    const lastCheck = new Date(lastCheckStr);
    
    // Check if we need to increment (it's a new day and past 14:00)
    if (shouldIncrementLeader(lastCheck, now)) {
      await incrementLeaderDays();
      localStorage.setItem(LAST_CHECK_KEY, now.toISOString());
    }
  } catch (error) {
    console.error('Error checking leader days:', error);
  }
}

/**
 * Determines if we should increment the leader counter
 * Rules:
 * - Must be a different day than last check
 * - Must be past 14:00 today
 * - OR it's already past the 14:00 of the next day(s)
 */
function shouldIncrementLeader(lastCheck: Date, now: Date): boolean {
  // Get the 14:00 timestamp for the last check day
  const lastCheckAt14 = new Date(lastCheck);
  lastCheckAt14.setHours(CHECK_HOUR, 0, 0, 0);
  
  // Get the 14:00 timestamp for today
  const todayAt14 = new Date(now);
  todayAt14.setHours(CHECK_HOUR, 0, 0, 0);
  
  // If last check was before 14:00 on that day, use that day's 14:00 as reference
  // Otherwise use the next day's 14:00
  const referenceTime = lastCheck < lastCheckAt14 ? lastCheckAt14 : new Date(lastCheckAt14.getTime() + 24 * 60 * 60 * 1000);
  
  // We should increment if now is past the reference time
  return now >= referenceTime;
}

/**
 * Increments the days_as_leader counter for the current leader
 */
async function incrementLeaderDays(): Promise<void> {
  try {
    const players = await getPlayers();
    
    if (players.length === 0) return;
    
    // The first player is the leader (players are sorted by points desc)
    const leader = players[0];
    
    const newDays = (leader.days_as_leader || 0) + 1;
    
    await updatePlayer(leader.id, {
      days_as_leader: newDays,
      updated_at: new Date().toISOString(),
    });
    
    console.log(`✅ Incremented leader days for ${leader.name}: ${newDays} days`);
  } catch (error) {
    console.error('Error incrementing leader days:', error);
    throw error;
  }
}

/**
 * Manually trigger the increment (for testing or manual adjustment)
 */
export async function manualIncrementLeaderDays(): Promise<void> {
  await incrementLeaderDays();
  localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
}
