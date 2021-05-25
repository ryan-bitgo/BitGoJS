import joi from 'joi';
import algosdk from 'algosdk';
import utils from './utils';

const addressSchema = joi.string().custom((addr) => utils.isValidAddress(addr));

export const BaseTransactionSchema = joi
  .object({
    fee: joi.number().required(),
    firstRound: joi.number().positive().required(),
    genesisHash: joi.string().base64().required(),
    lastRound: joi.number().positive().required(),
    sender: addressSchema.required(),
    txType: joi
      .string()
      .valid(...Object.values(algosdk.TransactionType))
      .required(),
    genesisId: joi.string().optional(),
    lease: joi.optional(),
    note: joi.optional(),
    reKeyTo: addressSchema.optional(),
  })
  .custom((obj) => {
    const firstRound: number = obj.firstRound;
    const lastRound: number = obj.lastRound;

    if (firstRound < lastRound) {
      return obj;
    }

    throw new Error('lastRound cannot be greater than or equal to firstRound');
  });

export const AssetTransferTxnSchema = BaseTransactionSchema.append({
  assetIndex: joi.string().required(),
  assetAmount: joi.number().unsafe().required(),
  clawbackAddress: addressSchema.required(),
  receiver: addressSchema.required(),
  closeTo: addressSchema.optional(),
});
