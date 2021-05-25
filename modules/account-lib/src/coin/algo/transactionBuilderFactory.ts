import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { NotImplementedError } from '../baseCoin/errors';
import { KeyRegistrationBuilder } from './keyRegistrationBuilder';
import { TransferBuilder } from './transferBuilder';
import { AssetTransferBuilder } from './assetTransferBuilder';

export class TransactionBuilderFactory {
  private readonly coinConfig: Readonly<CoinConfig>;

  constructor(coinConfig: Readonly<CoinConfig>) {
    this.coinConfig = coinConfig;
  }

  getKeyRegistrationBuilder(): KeyRegistrationBuilder {
    throw new NotImplementedError('getKeyRegistrationBuilder not implemented');
  }

  getTransferBuilder(): TransferBuilder {
    throw new NotImplementedError('getTransferBuilder not implemented');
  }

  /**
   * Gets the asset transfer builder.
   *
   * @returns {AssetTransferBuilder} A new AssetTransferBuilder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/#asset-transfer-transaction
   */
  getAssetTransferBuilder(): AssetTransferBuilder {
    return new AssetTransferBuilder(this.coinConfig);
  }
}
