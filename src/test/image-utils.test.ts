import { describe, it, expect } from 'vitest';
import { getInitials } from '@/lib/imageUtils';

describe('Image Utils - Initials Generation', () => {
  it('should generate initials from single word name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('should generate initials from two word name', () => {
    expect(getInitials('Bob Smith')).toBe('BS');
  });

  it('should generate initials from multi-word name', () => {
    expect(getInitials('Charlie David Evans')).toBe('CD');
  });

  it('should handle names with special characters', () => {
    expect(getInitials("O'Brien")).toBe('O');
  });

  it('should uppercase initials', () => {
    expect(getInitials('alice bob')).toBe('AB');
  });

  it('should limit to 2 characters', () => {
    expect(getInitials('One Two Three Four')).toBe('OT');
  });
});