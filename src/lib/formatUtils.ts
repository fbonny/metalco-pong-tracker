/**
 * Formats points to avoid unnecessary decimals
 * 10 -> "10"
 * 10.5 -> "10.5"
 * 10.0 -> "10"
 */
export function formatPoints(points: number): string {
  return points % 1 === 0 ? points.toFixed(0) : points.toFixed(1);
}
