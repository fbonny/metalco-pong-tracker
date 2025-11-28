import { getPlayers, updatePlayer } from './database';

const LAST_INCREMENT_DATE_KEY = 'pong_tracker_last_increment_date';
const CHECK_HOUR = 14; // 14:00

/**
 * Checks if we need to increment the leader's days counter
 * This runs when the app loads and checks if:
 * 1. It's a new day (different from last increment)
 * 2. Current time is past 14:00
 */
export async function checkAndIncrementLeaderDays(): Promise<void> {\n  try {
    const now = new Date();
    const today = formatDateOnly(now);
    const lastIncrementDate = localStorage.getItem(LAST_INCREMENT_DATE_KEY);
    
    // If this is a new day AND we're past 14:00, increment
    if (lastIncrementDate !== today && now.getHours() >= CHECK_HOUR) {
      await incrementLeaderDays();
      localStorage.setItem(LAST_INCREMENT_DATE_KEY, today);
      console.log(`✅ Incremented leader on ${today}`);
    }
  } catch (error) {
    console.error('Error checking leader days:', error);
  }
}

/**
 * Format date as YYYY-MM-DD (date only, no time)
 */
function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    
    console.log(`✅ Leader ${leader.name} now at ${newDays} days`);
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
  const today = formatDateOnly(new Date());
  localStorage.setItem(LAST_INCREMENT_DATE_KEY, today);
}
