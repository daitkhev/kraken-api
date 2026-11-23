import {
  APIIDMain,
  APIIDMainKey,
  getRestBaseUrl,
  isEmptyObject,
  KRAKEN_FUTURES_TESTNET_RETIRED_ERROR,
  REST_CLIENT_TYPE_ENUM,
  serializeParams,
} from '../src/lib/requestUtils.js';

describe('requestUtils', () => {
  describe('serializeParams', () => {
    it('returns an empty string for undefined params', () => {
      expect(serializeParams(undefined, false, false, '?', false)).toBe('');
    });

    it('returns an empty string for empty params, without prefix', () => {
      expect(serializeParams({}, false, true, '?', false)).toBe('');
    });

    it('sorts keys and prefixes the result', () => {
      expect(serializeParams({ b: 2, a: 1 }, false, false, '?', false)).toBe(
        '?a=1&b=2',
      );
    });

    it('uses an empty prefix when given one', () => {
      expect(serializeParams({ b: 2, a: 1 }, false, false, '', false)).toBe(
        'a=1&b=2',
      );
    });

    it('encodes values only when requested', () => {
      expect(serializeParams({ a: 'x y&z' }, false, true, '?', false)).toBe(
        '?a=x%20y%26z',
      );
      expect(serializeParams({ a: 'x y&z' }, false, false, '?', false)).toBe(
        '?a=x y&z',
      );
    });

    it('throws on undefined values with strict validation', () => {
      expect(() =>
        serializeParams({ a: undefined }, true, false, '?', false),
      ).toThrow('Failed to sign API request due to undefined parameter');
    });

    it('does not throw on undefined values without strict validation', () => {
      expect(serializeParams({ a: undefined }, false, false, '?', false)).toBe(
        '?a=undefined',
      );
      expect(serializeParams({ a: undefined }, undefined, false, '?', false)).toBe(
        '?a=undefined',
      );
    });

    it('does not throw for defined values with strict validation', () => {
      expect(serializeParams({ a: 0 }, true, false, '?', false)).toBe('?a=0');
    });

    it('repeats array values as key/value pairs when enabled', () => {
      expect(
        serializeParams({ a: ['x y', 'z'], b: 1 }, false, true, '?', true),
      ).toBe('?a=x%20y&a=z&b=1');
      expect(
        serializeParams({ a: ['x y', 'z'] }, false, false, '?', true),
      ).toBe('?a=x y&a=z');
    });

    it('stringifies arrays when repeating is disabled', () => {
      expect(serializeParams({ a: ['x', 'z'] }, false, false, '?', false)).toBe(
        '?a=x,z',
      );
    });
  });

  describe('isEmptyObject', () => {
    it('treats a non-empty string as non-empty when accepted', () => {
      expect(isEmptyObject('abc', true)).toBe(false);
    });

    it('treats strings as empty when not accepted', () => {
      expect(isEmptyObject('abc', false)).toBe(true);
    });

    it('treats an empty string as empty even when accepted', () => {
      expect(isEmptyObject('', true)).toBe(true);
    });

    it('treats falsy and non-object values as empty', () => {
      expect(isEmptyObject(undefined, false)).toBe(true);
      expect(isEmptyObject(null, false)).toBe(true);
      expect(isEmptyObject(5, false)).toBe(true);
    });

    it('detects empty and non-empty objects', () => {
      expect(isEmptyObject({}, false)).toBe(true);
      expect(isEmptyObject({ a: 1 }, false)).toBe(false);
    });
  });

  describe('getRestBaseUrl', () => {
    it('returns the custom baseUrl when provided', () => {
      expect(
        getRestBaseUrl(
          { baseUrl: 'https://custom.example' },
          REST_CLIENT_TYPE_ENUM.main,
        ),
      ).toBe('https://custom.example');
    });

    it('returns the default host for each client type', () => {
      expect(getRestBaseUrl({}, REST_CLIENT_TYPE_ENUM.institutional)).toBe(
        'https://api.kraken.com',
      );
      expect(getRestBaseUrl({}, REST_CLIENT_TYPE_ENUM.partner)).toBe(
        'https://embed.kraken.com',
      );
      expect(getRestBaseUrl({}, REST_CLIENT_TYPE_ENUM.affiliate)).toBe(
        'https://api.kraken.com',
      );
    });

    it('throws on testnet even with a baseUrl', () => {
      expect(() =>
        getRestBaseUrl(
          { testnet: true, baseUrl: 'https://custom.example' },
          REST_CLIENT_TYPE_ENUM.main,
        ),
      ).toThrow(KRAKEN_FUTURES_TESTNET_RETIRED_ERROR);
    });
  });

  describe('constants', () => {
    it('exposes the retired testnet message and broker ids', () => {
      expect(KRAKEN_FUTURES_TESTNET_RETIRED_ERROR).toContain(
        'Kraken retired its Futures demo (testnet) environment on 14 July 2026',
      );
      expect(APIIDMainKey).toBe('broker');
      expect(APIIDMain).toBe('AA56 N84G TOOP ELJQ');
    });
  });
});
