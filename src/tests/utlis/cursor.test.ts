import { describe, test, expect } from 'vitest';
import { encodeCursor, decodeCursor } from '../../utils/cursor.js';
import { logQuerySchema } from '../../types/log-query.type.js'

describe('Unit: Cursor Utilities', () => {
  test('should correctly encode and decode a valid cursor payload', () => {
    const payload = { timestamp: '2026-08-08T00:00:00.000Z', id: 'adfjgbj' };
    const encoded = encodeCursor(payload);

    expect(typeof encoded).toBe('string');

    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(payload);
  });

  test('should throw Invalid or malformed cursor error when decoding malformed strings', () => {
    expect(() => decodeCursor('not-a-valid-base64-json')).toThrow("Invalid or malformed cursor");
    expect(() => decodeCursor(Buffer.from('{}').toString('base64url'))).toThrow("Invalid or malformed cursor");
  });
});
