import joi from 'joi';
import { isValidEd25519SecretKey } from '../../utils/crypto';

/**
 * @param {string} str a base64 string
 *
 * @returns {boolean} true if the string is base64, otherwise false
 */
export function isBase64String(str: string): boolean {
  const schema = joi.string().base64();
  if (schema.validate(str).error) {
    return false;
  }

  return true;
}

/**
 * Validates the format of an Algorand private key.
 *
 * A valid Algorand private key must be base64 encoded composed of the
 * concatenation of the public (32 bytes) and private (32 bytes) keys.
 *
 * @param {string} prvKey base64 encoded Algorand private key
 * @see https://developer.algorand.org/docs/features/accounts/#transformation-private-key-to-base64-private-key
 *
 * @returns {boolean} true if the private key is valid, otherwise false
 */
export function isValidPrivateKey(prvKey: string): boolean {
  if (!isBase64String(prvKey)) {
    return false;
  }

  const buffer = Buffer.from(prvKey, 'base64');

  return isValidEd25519SecretKey(buffer.toString('hex'));
}
