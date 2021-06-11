import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { NotSupported } from '../baseCoin/errors';
import { KeyRegistrationBuilder } from './keyRegistrationBuilder';
import { TransferBuilder } from './transferBuilder';
import { TransactionBuilder } from './transactionBuilder';
import { AssetTransferBuilder } from './assetTransferBuilder';

export class TransactionBuilderFactory {
  private readonly coinConfig: Readonly<CoinConfig>;

  constructor(coinConfig: Readonly<CoinConfig>) {
    this.coinConfig = coinConfig;
  }

  getKeyRegistrationBuilder(): KeyRegistrationBuilder {
    return new KeyRegistrationBuilder(this.coinConfig);
  }

  getTransferBuilder(): TransferBuilder {
    return new TransferBuilder(this.coinConfig);
  }

  getAssetTransferBuilder(): AssetTransferBuilder {
    return new AssetTransferBuilder(this.coinConfig);
  }

  from(rawTxn: string | Uint8Array): TransactionBuilder {
    const builder = this.getBuilder(rawTxn);
    if (!builder) {
      throw new NotSupported('Transaction cannot be parsed or has an unsupported transaction type');
    }

    builder.from(rawTxn);

    return builder;
  }

  private getBuilder(rawTxn: string | Uint8Array): TransactionBuilder | undefined {
    if (this.isRawKeyRegistrationTransaction(rawTxn)) {
      return this.getKeyRegistrationBuilder();
    } else if (this.isRawTransferTransaction(rawTxn)) {
      return this.getTransferBuilder();
    } else if (this.isRawAssetTransferTransaction(rawTxn)) {
      return this.getAssetTransferBuilder();
    }
  }

  private isRawKeyRegistrationTransaction(raw: string | Uint8Array): boolean {
    const builder = this.getKeyRegistrationBuilder();
    try {
      builder.from(raw);
      return true;
    } catch (_: unknown) {
      return false;
    }
  }

  private isRawTransferTransaction(raw: string | Uint8Array): boolean {
    const builder = this.getTransferBuilder();
    try {
      builder.from(raw);
      return true;
    } catch (_: unknown) {
      return false;
    }
  }

  private isRawAssetTransferTransaction(raw: string | Uint8Array): boolean {
    const builder = this.getAssetTransferBuilder();
    try {
      builder.from(raw);
      return true;
    } catch (_: unknown) {
      return false;
    }
  }
}
