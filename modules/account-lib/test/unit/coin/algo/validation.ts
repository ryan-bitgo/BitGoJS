import crypto from 'crypto';
import should from 'should';
import algosdk from 'algosdk';
import { isValidPrivateKey } from '../../../../src/coin/algo/validation';

/**
 * Algorand seed phrases are 25 words
 */
const seedPhrase = [
  'phone',
  'right',
  'sick',
  'hotel',
  'else',
  'arrive',
  'pair',
  'spread',
  'silent',
  'average',
  'firm',
  'casual',
  'strategy',
  'minimum',
  'pledge',
  'bird',
  'echo',
  'visa',
  'reduce',
  'cabbage',
  'curtain',
  'various',
  'major',
  'ability',
  'uphold',
];

describe('Algorand validation functions', () => {
  /**
   * @see https://developer.algorand.org/docs/features/accounts/#transformation-private-key-to-base64-private-key
   */
  describe('private key validation', () => {
    const account = algosdk.mnemonicToSecretKey(seedPhrase.join(' '));
    const prvKey = Buffer.from(account.sk);

    it('should enforce the base64 constraint', () => {
      should.equal(isValidPrivateKey(prvKey.toString('binary')), false);
      should.equal(isValidPrivateKey(prvKey.toString('base64')), true);
    });

    it('should enforce the 64 byte length constraint', () => {
      should.equal(isValidPrivateKey(crypto.randomBytes(63).toString('base64')), false);
      should.equal(isValidPrivateKey(crypto.randomBytes(65).toString('base64')), false);
    });
  });
});
