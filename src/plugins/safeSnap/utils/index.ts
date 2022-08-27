import { keccak256 } from '@ethersproject/solidity';
import { calcTransactionHashes } from '../index';
import {
  createMultiSendTx,
  getMultiSend,
  MULTI_SEND_VERSION
} from './multiSend';
import {
  SafeTransaction,
  SafeExecutionData
} from '@/plugins/safeSnap/interfaces';
import {
  ExecutionData,
  SafeConfig,
  SafeModuleType,
  SafeType
} from '@/helpers/safe';

export function mapLegacyConfig(config: any): SafeConfig[] {
  if (config[0]?.safe) {
    return config;
  }

  return [
    {
      safe: {
        name: 'Main Safe',
        type: SafeType.GNOSIS,
        network: '4',
        address: '0x6934DeeB18a7B7F25DbFB1ed8a0b361e42e4D2aF'
      },
      modules: [
        {
          type: SafeModuleType.REALITY,
          address: '0x06340d38ED304703Ca200e3f9CD5f902C8605c43'
        },
        {
          type: SafeModuleType.UMA,
          address: '0xd6FDB4ACFF1B01493eCB84494c220d3295E8fAe2'
        }
      ]
    },
    {
      safe: {
        name: 'Secondary Safe',
        type: SafeType.GNOSIS,
        network: '4',
        address: '0x6934DeeB18a7B7F25DbFB1ed8a0b361e42e4D2aF'
      },
      modules: [
        {
          type: SafeModuleType.REALITY,
          address: '0x06340d38ED304703Ca200e3f9CD5f902C8605c43'
        },
        {
          type: SafeModuleType.UMA,
          address: '0xd6FDB4ACFF1B01493eCB84494c220d3295E8fAe2'
        }
      ]
    }
  ];
}

export function mapLegacyExecutionData(executionData: any): ExecutionData[] {
  if (executionData[0]?.safe) {
    return executionData;
  }

  return [
    {
      safe: {
        name: 'Main Safe',
        type: SafeType.GNOSIS,
        network: '4',
        address: '0x6934DeeB18a7B7F25DbFB1ed8a0b361e42e4D2aF'
      },
      module: {
        type: SafeModuleType.REALITY,
        address: '0x06340d38ED304703Ca200e3f9CD5f902C8605c43'
      },
      batches: []
    }
  ];
}

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
