import { describe, it, expect } from 'vitest';
import { computeHash } from '../hash.js';

describe('computeHash', () => {
  it('produces expected SHA-256 hash for known input', () => {
    // echo -n "hello" | sha256sum => 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    expect(computeHash('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  it('hashes empty string consistently', () => {
    // echo -n "" | sha256sum => e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const hash = computeHash('');
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(computeHash('')).toBe(hash);
  });

  it('produces different hashes for different inputs', () => {
    expect(computeHash('foo')).not.toBe(computeHash('bar'));
  });
});
