import { BaseCoin as CoinConfig } from '@bitgo/statics';
import BigNumber from 'bignumber.js';
import algosdk from 'algosdk';
import { BaseAddress } from '../baseCoin/iface';
import { InvalidTransactionError } from '../baseCoin/errors';
import { TransactionBuilder } from './transactionBuilder';
import { Transaction } from './transaction';
import { AssetTransferTxnSchema } from './txnSchema';

export class AssetTransferBuilder extends TransactionBuilder {
  private _assetIndex: number;
  private _assetAmount: number | bigint;
  private _clawbackAddress: string;
  private _receiver: string;
  private _closeTo?: string;

  constructor(coinConfig: Readonly<CoinConfig>) {
    super(coinConfig);
  }

  /**
   * Sets the asset index.
   *
   * The asset index uniquely identifies the asset.
   *
   * @param {number} index The asset index.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/#asset-transfer-transaction
   */
  assetIndex(index: number): this {
    if (index <= 0) {
      throw new Error('Asset index must be a uint64 value');
    }
    this._assetIndex = index;

    return this;
  }

  /**
   * Sets the asset amount to be transferred.
   *
   * @param {BigNumber} amount The amount to be transferred.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/#asset-transfer-transaction
   */
  assetAmount(amount: BigNumber): this {
    if (amount.lte(0)) {
      throw new Error('transfer amount cannot be 0');
    }
    this._assetAmount = BigInt(amount.toString());

    return this;
  }

  /**
   * Sets the clawback address.
   *
   * If this field is set the transaction will initiate a clawback transaction
   * to this address.
   *
   * @param {BaseAddress} clawback The clawback address.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/#asset-transfer-transaction
   */
  clawbackAddress(clawback: BaseAddress): this {
    this.validateAddress(clawback);
    this._clawbackAddress = clawback.address;

    return this;
  }

  /**
   * Sets the receiver of the asset transfer.
   *
   * @param {BaseAddress} receiver The receiver of the asset transfer.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/#asset-transfer-transaction
   */
  receiver(receiver: BaseAddress): this {
    this.validateAddress(receiver);
    this._receiver = receiver.address;

    return this;
  }

  /**
   * Sets the closeTo address.
   *
   * If set the any remaining assets in the sender's account will be closed to
   * this address.
   *
   * @param {BaseAddress} closeTo The closeTo address.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/#asset-transfer-transaction
   */
  closeTo(closeTo: BaseAddress): this {
    this.validateAddress(closeTo);
    this._closeTo = closeTo.address;

    return this;
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this._transaction.setAlgoTransaction(
      algosdk.makeAssetTransferTxnWithSuggestedParams(
        this._sender,
        this._receiver,
        this._closeTo,
        this._clawbackAddress,
        this._assetAmount,
        this._note,
        this._assetIndex,
        {
          flatFee: false, // TODO: Wait for flat fee PR to be merged
          fee: this._fee,
          firstRound: this._firstRound,
          lastRound: this._lastRound,
          genesisID: this._genesisId,
          genesisHash: this._genesisHash,
        },
        this._reKeyTo,
      ),
    );

    return await super.buildImplementation();
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: Uint8Array | string): Transaction {
    const tx = super.fromImplementation(rawTransaction);
    const algoTx = tx.getAlgoTransaction();
    if (!algoTx) {
      throw new InvalidTransactionError('Transaction is empty');
    }

    this._assetIndex = algoTx.assetIndex;
    this._assetAmount = algoTx.amount;
    this._clawbackAddress = algosdk.encodeAddress(algoTx.assetClawback.publicKey);
    this._receiver = algosdk.encodeAddress(algoTx.to.publicKey);
    this._closeTo = algoTx.closeRemainderTo ? algosdk.encodeAddress(algoTx.closeRemainderTo.publicKey) : undefined;

    return tx;
  }

  protected validateAlgoTxn(algoTxn: algosdk.Transaction): void {
    super.validateAlgoTxn(algoTxn);

    const validationResult = AssetTransferTxnSchema.validate({
      fee: algoTxn.fee,
      firstRound: algoTxn.firstRound,
      genesisHash: algoTxn.genesisHash.toString('base64'),
      lastRound: algoTxn.lastRound,
      sender: algosdk.encodeAddress(algoTxn.from.publicKey),
      txType: algoTxn.type,
      genesisId: algoTxn.genesisID,
      lease: algoTxn.lease,
      note: algoTxn.note,
      reKeyTo: algoTxn.reKeyTo ? algosdk.encodeAddress(algoTxn.reKeyTo.publicKey) : undefined,
    });

    if (validationResult.error) {
      throw new InvalidTransactionError(`Transaction validation failed: ${validationResult.error.message}`);
    }
  }
}
