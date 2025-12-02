import { getPlayers, updatePlayer } from './database';

const DB_URL = 'https://9a23583f-f98.db-pool-europe-west1.altan.ai';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwNzkzMTc0MzQsImlhdCI6MTc2Mzk1NzQzNCwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoiYW5vbiJ9.hz_DIcdZmxo0F5SypV4J17FZRmTKdzZXc1WhPgeLH3k';

const CHECK_HOUR = 14; // 14:00

/**
 * Checks if we need to increment the leader's days counter
 * This runs when the app loads and checks if:
 * 1. It's a new day (different from last increment)
 * 2. Current time is past 14:00
 */
export async function checkAndIncrementLeaderDays(): Promise<void> {
  try {
    const now = new Date();
    const today = formatDateOnly(now);
    
    // Get last increment date from database
    const lastIncrementDate = await getLastIncrementDate();
    
    // If no last increment date, just set it to today and don't increment
    if (!lastIncrementDate) {
      await setLastIncrementDate(today);
      console.log(`📅 First load - set increment date to ${today}`);
      return;
    }
    
    // If this is a new day AND we're past 14:00, increment
    if (lastIncrementDate !== today && now.getHours() >= CHECK_HOUR) {
      await incrementLeaderDays();
      await setLastIncrementDate(today);
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
 * Get last increment date from database
 */
async function getLastIncrementDate(): Promise<string | null> {
  try {
    const response = await fetch(
      `${DB_URL}/rest/v1/app_metadata?key=eq.last_leader_increment_date`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        },
      }
    );
    
    const data = await response.json();
    return data[0]?.value || null;
  } catch (error) {
    console.error('Error getting last increment date:', error);
    return null;
  }
}

/**
 * Set last increment date in database
 */
async function setLastIncrementDate(date: string): Promise<void> {
  try {
    await fetch(`${DB_URL}/rest/v1/app_metadata`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        key: 'last_leader_increment_date',
        value: date,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Error setting last increment date:', error);
  }
}

/**
 * Increments the days_as_leader counter for the current leader
 */
async function incrementLeaderDays(): Promise<void> {
  try {
    const players = await getPlayers();
    
    if (players.length === 0) return;
    
    // Sort by ranking to get the actual leader
    const ranked = players.sort((a, b) => b.points - a.points || b.wins - a.wins);
    const leader = ranked[0];
    
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
  await setLastIncrementDate(today);
}