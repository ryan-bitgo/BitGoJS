import { BaseCoin as CoinConfig, coins } from '@bitgo/statics';
import should from 'should';
import sinon, { assert } from 'sinon';
import algosdk from 'algosdk';
import { AddressValidationError, InsufficientFeeError, TransactionBuilder } from '../../../../../src/coin/algo';
import { BaseTransaction } from '../../../../../src/coin/baseCoin';
import { NotImplementedError } from '../../../../../src/coin/baseCoin/errors';
import { BaseKey } from '../../../../../src/coin/baseCoin/iface';

class StubTransactionBuilder extends TransactionBuilder {
  constructor(coinConfig: Readonly<CoinConfig>) {
    super(coinConfig);
  }

  protected fromImplementation(rawTransaction: unknown): BaseTransaction {
    throw new NotImplementedError('fromImplementation not implemented');
  }
  protected signImplementation(key: BaseKey): BaseTransaction {
    throw new NotImplementedError('signImplementation not implemented');
  }
  protected buildImplementation(): Promise<BaseTransaction> {
    throw new NotImplementedError('buildImplementation not implemented');
  }
}

describe('Algo Transaction Builder', () => {
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

  const account = algosdk.mnemonicToSecretKey(seedPhrase.join(' '));

  describe('Setter validation', () => {
    let txnBuilder: StubTransactionBuilder;

    beforeEach(() => {
      const config = coins.get('algo');
      txnBuilder = new StubTransactionBuilder(config);
    });

    it('should valid fee is not lt 1000 microalgos', () => {
      should.throws(
        () => txnBuilder.fee({ fee: '999' }),
        (e: Error) => e.name === InsufficientFeeError.name,
      );
      should.doesNotThrow(() => txnBuilder.fee({ fee: '1000' }));
    });

    it('should validate sender address is a valid algo address', () => {
      const spy = sinon.spy(txnBuilder, 'sender');
      should.throws(
        () => txnBuilder.sender({ address: 'asdf' }),
        (e: Error) => e.name === AddressValidationError.name,
      );
      should.doesNotThrow(() => txnBuilder.sender({ address: account.addr }));
      assert.calledTwice(spy);
    });

    it('should validate receiver address is a valid algo address', () => {
      const spy = sinon.spy(txnBuilder, 'receiver');
      should.throws(
        () => txnBuilder.receiver({ address: 'asdf' }),
        (e: Error) => e.name === AddressValidationError.name,
      );
      should.doesNotThrow(() => txnBuilder.receiver({ address: account.addr }));
      assert.calledTwice(spy);
    });

    it('should validate genesis hash is base64 encoded', () => {
      const hash = 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8='; // mainnet
      const binaryHash = Buffer.from(hash, 'base64').toString('binary');

      should.throws(() => txnBuilder.genesisHash(binaryHash));
      should.doesNotThrow(() => txnBuilder.genesisHash(hash));
    });
  });
});
