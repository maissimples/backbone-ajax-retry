import { describe, expect, it } from 'vitest';
import linearDelay from './linearDelay';

describe('linearDelay', () => {
  it('returns a linear delay', () => {
    expect(linearDelay()(1)).toBe(100);
    expect(linearDelay()(2)).toBe(200);
    expect(linearDelay()(3)).toBe(300);
  });

  it('returns a linear delay based on a defined factor', () => {
    expect(linearDelay(1_000)(1)).toBe(1_000);
    expect(linearDelay(2_000)(2)).toBe(4_000);
    expect(linearDelay(3_000)(3)).toBe(9_000);
  });
});
