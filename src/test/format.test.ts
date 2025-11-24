import { describe, it, expect } from 'vitest';
import { formatPoints } from '@/lib/formatUtils';

describe('Format Utils - Points Display', () => {
  it('should format whole numbers without decimals', () => {
    expect(formatPoints(10)).toBe('10');
    expect(formatPoints(0)).toBe('0');
    expect(formatPoints(100)).toBe('100');
  });

  it('should format decimal numbers with one decimal place', () => {
    expect(formatPoints(10.5)).toBe('10.5');
    expect(formatPoints(12.5)).toBe('12.5');
    expect(formatPoints(7.5)).toBe('7.5');
  });

  it('should format .0 decimals as whole numbers', () => {
    expect(formatPoints(10.0)).toBe('10');
    expect(formatPoints(21.0)).toBe('21');
  });

  it('should handle real game scenarios', () => {
    // Standard win: 10 points
    expect(formatPoints(10)).toBe('10');
    
    // 21-19: 10 points
    expect(formatPoints(10)).toBe('10');
    
    // 21-18: 10.5 points
    expect(formatPoints(10.5)).toBe('10.5');
    
    // 21-15: 12 points
    expect(formatPoints(12)).toBe('12');
    
    // Overtime: 7 points
    expect(formatPoints(7)).toBe('7');
    
    // Overtime loser: 3 points
    expect(formatPoints(3)).toBe('3');
  });
});
