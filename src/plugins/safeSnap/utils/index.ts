import { keccak256 } from '@ethersproject/solidity';

import { calcTransactionHashes } from '../index';
import {
  createMultiSendTx,
  getMultiSend,
  MULTI_SEND_VERSION
} from './multiSend';
import { SafeTransaction, SafeExecutionData } from '@/helpers/interfaces';

export function formatBatchTransaction(
  batch: SafeTransaction[],
  nonce: number,
  multiSendAddress: string
): SafeTransaction | null {
  if (!batch.every(x => x)) return null;
  if (batch.length === 1) {
    return { ...batch[0], nonce: nonce.toString() };
  }
  return createMultiSendTx(batch, nonce, multiSendAddress);
}

export function createBatch(
  module: string,
  chainId: number,
  nonce: number,
  txs: SafeTransaction[],
  multiSendAddress: string
) {
  const mainTransaction = formatBatchTransaction(txs, nonce, multiSendAddress);
  const hash = mainTransaction
    ? getBatchHash(module, chainId, mainTransaction)
    : null;
  return {
    hash,
    nonce,
    mainTransaction,
    transactions: txs
  };
}

export function getBatchHash(
  module: string,
  chainId: number,
  transaction: SafeTransaction
) {
  try {
    const hashes = calcTransactionHashes(chainId, module, [transaction]);
    return hashes[0];
  } catch (err) {
    console.warn('invalid batch hash', err);
    return null;
  }
}

export function getSafeHash(safe: SafeExecutionData) {
  const hashes = safe.txs.map(batch => batch.hash);
  const valid = hashes.every(hash => hash);
  if (!valid || !hashes.length) return null;
  return keccak256(['bytes32[]'], [hashes]);
}

export function isValidInput(input: { safes: any[] }) {
  return input.safes.every(
    (safe: SafeExecutionData) =>
      safe.txs.length === 0 ||
      safe.txs
        .map(batch => batch.transactions)
        .flat()
        .every(tx => tx)
  );
}

export function coerceConfig(config, network) {
  if (config.safes) {
    return {
      ...config,
      safes: config.safes.map(safe => {
        const _network = safe.network || network;
        const multiSendAddress =
          safe.multiSendAddress || getMultiSend(_network);
        const txs = (safe.txs || []).map((batch, nonce) => {
          const oldMultiSendAddress =
            safe.multiSendAddress ||
            getMultiSend(_network, MULTI_SEND_VERSION.V1_1_1) ||
            getMultiSend(_network, MULTI_SEND_VERSION.V1_3_0);
          if (Array.isArray(batch)) {
            // Assume old config
            return createBatch(
              safe.realityAddress,
              _network,
              nonce,
              batch,
              oldMultiSendAddress
            );
          }

          if (!batch.mainTransaction) {
            return {
              ...batch,
              mainTransaction: formatBatchTransaction(
                batch.transactions,
                batch.nonce,
                oldMultiSendAddress
              )
            };
          }
          return batch;
        });
        const sanitizedSafe = {
          ...safe,
          txs,
          multiSendAddress
        };
        return {
          ...sanitizedSafe,
          hash: sanitizedSafe.hash ?? getSafeHash(sanitizedSafe)
        };
      })
    };
  }

  // map legacy config to new format
  return {
    safes: [
      {
        network,
        realityAddress: config.address,
        multiSendAddress:
          getMultiSend(network, MULTI_SEND_VERSION.V1_1_1) ||
          getMultiSend(network, MULTI_SEND_VERSION.V1_3_0)
      }
    ]
  };
}

export async function fetchTextSignatures(
  methodSignature: string
): Promise<string[]> {
  const url = new URL('/api/v1/signatures', 'https://www.4byte.directory');
  url.searchParams.set('hex_signature', methodSignature);
  url.searchParams.set('ordering', 'created_at');
  const response = await fetch(url.toString());
  const { results } = await response.json();
  return results.map(signature => signature.text_signature);
}
