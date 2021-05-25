import { coins } from '@bitgo/statics';
import BigNumber from 'bignumber.js';
import should from 'should';
import sinon, { assert } from 'sinon';
import { AddressValidationError, AssetTransferBuilder } from '../../../../../src/coin/algo';

import * as AlgoResources from '../../../../resources/algo';

describe('Algo Asset Transfer Transaction Builder', () => {
  let txnBuilder: AssetTransferBuilder;

  const {
    accounts: { account1 },
  } = AlgoResources;

  beforeEach(() => {
    const config = coins.get('algo');
    txnBuilder = AssetTransferBuilder.new(config);
  });

  describe('setter validation', () => {
    it('should validate asset index is not lte 0', () => {
      should.throws(() => txnBuilder.assetIndex(-1));
      should.throws(() => txnBuilder.assetIndex(0));
      should.doesNotThrow(() => txnBuilder.assetIndex(1));
    });

    it('should validate asset amount is not lt 0', () => {
      should.throws(() => txnBuilder.assetAmount(new BigNumber(-1)));
      should.doesNotThrow(() => txnBuilder.assetAmount(new BigNumber(0)));
      should.doesNotThrow(() => txnBuilder.assetAmount(new BigNumber(1)));
    });

    it('should validate clawback address is a valid algo address', () => {
      const spy = sinon.spy(txnBuilder, 'clawbackAddress');
      should.throws(
        () => txnBuilder.clawbackAddress({ address: 'asdf' }),
        (e: Error) => e.name === AddressValidationError.name,
      );
      should.doesNotThrow(() => txnBuilder.clawbackAddress({ address: account1.address }));
      assert.calledTwice(spy);
    });

    it('should validate receiver address is a valid algo address', () => {
      const spy = sinon.spy(txnBuilder, 'receiver');
      should.throws(
        () => txnBuilder.receiver({ address: 'asdf' }),
        (e: Error) => e.name === AddressValidationError.name,
      );
      should.doesNotThrow(() => txnBuilder.receiver({ address: account1.address }));
      assert.calledTwice(spy);
    });

    it('should validate closeTo address is a valid algo address', () => {
      const spy = sinon.spy(txnBuilder, 'closeTo');
      should.throws(
        () => txnBuilder.closeTo({ address: 'asdf' }),
        (e: Error) => e.name === AddressValidationError.name,
      );
      should.doesNotThrow(() => txnBuilder.closeTo({ address: account1.address }));
      assert.calledTwice(spy);
    });
  });
});
