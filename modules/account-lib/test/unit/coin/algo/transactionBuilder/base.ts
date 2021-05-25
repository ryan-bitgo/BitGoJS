import crypto from 'crypto';
import { BaseCoin as CoinConfig, coins } from '@bitgo/statics';
import algosdk from 'algosdk';
import should from 'should';
import sinon, { assert } from 'sinon';
import {
  AddressValidationError,
  InsufficientFeeError,
  KeyPair,
  TransactionBuilder,
} from '../../../../../src/coin/algo';
import { Transaction } from '../../../../../src/coin/algo/transaction';
import { BaseKey } from '../../../../../src/coin/baseCoin/iface';

import * as AlgoResources from '../../../../resources/algo';

class StubTransactionBuilder extends TransactionBuilder {
  constructor(coinConfig: Readonly<CoinConfig>) {
    super(coinConfig);
  }

  getFee(): number {
    return this._fee;
  }

  getSender(): string {
    return this._sender;
  }

  getGenesisHash(): string {
    return this._genesisHash;
  }

  getGenesisId(): string {
    return this._genesisId;
  }

  getFirstRound(): number {
    return this._firstRound;
  }

  getLastRound(): number {
    return this._lastRound;
  }

  getLease(): Uint8Array | undefined {
    return this._lease;
  }

  getNote(): Uint8Array | undefined {
    return this._note;
  }

  getReKeyTo(): string | undefined {
    return this._reKeyTo;
  }

  getKeyPairs(): KeyPair[] {
    return this._keyPairs;
  }

  getTransaction(): Transaction {
    return this._transaction;
  }

  buildImplementation(): Promise<Transaction> {
    return super.buildImplementation();
  }

  fromImplementation(rawTransaction: Uint8Array | string): Transaction {
    return super.fromImplementation(rawTransaction);
  }

  signImplementation(key: BaseKey): Transaction {
    return super.signImplementation(key);
  }
}

describe('Algo Transaction Builder', () => {
  let txnBuilder: StubTransactionBuilder;

  const {
    accounts: { account1, account2, account3 },
    networks: { testnet },
  } = AlgoResources;

  beforeEach(() => {
    const config = coins.get('algo');
    txnBuilder = new StubTransactionBuilder(config);
  });

  describe('setter validation', () => {
    it('should validate fee is not lt 1000 microalgos', () => {
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
      should.doesNotThrow(() => txnBuilder.sender({ address: account1.address }));
      assert.calledTwice(spy);
    });
  });

  describe('private key validation', () => {
    it('validates byte arrays', () => {
      should.doesNotThrow(() => txnBuilder.validateKey({ key: account1.secretKey }));
    });

    it('validates hex encoded strings', () => {
      should.doesNotThrow(() => txnBuilder.validateKey({ key: account1.secretKey.toString('hex') }));
    });

    it('validates base64 encoded strings', () => {
      should.doesNotThrow(() => txnBuilder.validateKey({ key: account1.secretKey.toString('base64') }));
    });
  });

  describe('implementation functions', () => {
    const to = account1.address;
    const from = account2.address;
    const reKeyTo = account3.address;
    const amount = 1000;
    const firstRound = 1;
    const lastRound = 10;
    const closeRemainderTo = account3.address;

    // Uint8array conversion required because algosdk checks if the constructor
    // is Uint8Array.
    const lease = new Uint8Array(crypto.randomBytes(32));
    const note = new Uint8Array(Buffer.from('note', 'utf-8'));

    const fee = 1000;

    const algoTxn = algosdk.makePaymentTxnWithSuggestedParams(
      from,
      to,
      amount,
      closeRemainderTo,
      note,
      {
        fee,
        flatFee: true,
        firstRound,
        lastRound,
        genesisID: testnet.genesisID,
        genesisHash: testnet.genesisHash,
      },
      reKeyTo,
    );
    algoTxn.fee = fee;
    algoTxn.flatFee = true;
    algoTxn.addLease(lease);

    it('should assign all decoded fields into transaction builder', () => {
      txnBuilder.fromImplementation(algosdk.encodeUnsignedTransaction(algoTxn));

      should(txnBuilder.getFee()).equal(fee);
      should(txnBuilder.getSender()).equal(from);
      should(txnBuilder.getGenesisHash()).equal(testnet.genesisHash);
      should(txnBuilder.getGenesisId()).equal(testnet.genesisID);
      should(txnBuilder.getFirstRound()).equal(firstRound);
      should(txnBuilder.getLastRound()).equal(lastRound);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      should(Buffer.from(txnBuilder.getLease()!).toString('hex')).equal(Buffer.from(lease).toString('hex'));
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      should(Buffer.from(txnBuilder.getNote()!).toString('hex')).equal(Buffer.from(note).toString('hex'));
      should(txnBuilder.getReKeyTo()).equal(reKeyTo);

      should(txnBuilder.getTransaction().getAlgoTransaction()).not.be.undefined();
    });

    // TODO: uncomment after recordKeysFromPrivateKeyInProtocolFormat is implemented
    // in keypair
    /*  it('should sign the transaction', () => {
      const txn = txnBuilder.getTransaction();
      txn.setAlgoTransaction(algoTxn);
      txn.numberOfSigners(1);
      txnBuilder.signImplementation({ key: account1.secretKey });
      txnBuilder.buildImplementation();

      should.doesNotThrow(() => txnBuilder.getTransaction().toBroadcastFormat());
    }); */
  });
});
