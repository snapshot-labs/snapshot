import {
  ExecutionData,
  SafeConfig,
  SafeModuleType,
  SafeType
} from '@/helpers/safe';
import { BigNumber } from '@ethersproject/bignumber';

export function mapLegacyConfig(config: any): SafeConfig[] {
  if (config[0]?.safe) {
    return config;
  }

  return [
    {
      safe: {
        name: 'Main Safe',
        type: SafeType.GNOSIS,
        network: '5',
        address: '0x6934DeeB18a7B7F25DbFB1ed8a0b361e42e4D2aF'
      },
      modules: [
        {
          type: SafeModuleType.REALITY,
          address: '0xBbf3a5B3F4678F2Bc05a4975aCB2d04e66427975'
        }
      ]
    }
  ];
}

interface LegacyExecutionData {
  safes: {
    txs:
      | {
          transactions: Record<string, any>[];
        }[]
      | [Record<string, any>[]];
    network: string;
    realityAddress: string;
  }[];
}

function isLegacyExecutionData(
  unknownExecutionData: unknown
): unknownExecutionData is LegacyExecutionData {
  return (
    typeof unknownExecutionData === 'object' &&
    unknownExecutionData !== null &&
    'safes' in unknownExecutionData &&
    Array.isArray(unknownExecutionData['safes']) &&
    unknownExecutionData['safes'].every(
      executionSet =>
        executionSet.txs &&
        Array.isArray(executionSet.txs) &&
        executionSet.txs.length > 0
    )
  );
}

function isExecutionData(
  unknownExecutionData: unknown
): unknownExecutionData is ExecutionData[] {
  return (
    Array.isArray(unknownExecutionData) &&
    unknownExecutionData.every(
      executionSet =>
        executionSet.safe &&
        Array.isArray(executionSet.batches) &&
        executionSet.batches.length > 0
    )
  );
}

/**
 * Examples:
 *
 * https://snapshot.org/#/gnosis.eth/proposal/0x41af607ec45f147b6f0196353f29c5e25951097c64c3a0a703bc519bd1883578
 * https://snapshot.org/#/gnosis.eth/proposal/0x75bd61f48bb1cc4c9e2dd4938036095d581a99f2c186cb0a0c83914253f45634
 * https://snapshot.org/#/gnosis.eth/proposal/0x9b12a093e17e92b56d070ed876883d8c2331678ca3945e44f66dd416cfd47a64
 * https://snapshot.org/#/gnosis.eth/proposal/0x8f8d2118ef3a8fa9f8b1814ce2ae34ae8776548716a45ce69082f3e266465f48
 */
export function mapLegacyExecutionData(
  unknownExecutionData: unknown
): ExecutionData[] {
  if (isExecutionData(unknownExecutionData)) {
    return unknownExecutionData;
  } else if (isLegacyExecutionData(unknownExecutionData)) {
    return unknownExecutionData.safes.map((legacyExecutionSet, index) => {
      const abis = {};
      const mappedExecutionSet: ExecutionData = {
        safe: {
          name: `Safe #${index + 1}`,
          type: SafeType.GNOSIS,
          address: '', // TODO: get address from safe
          network: legacyExecutionSet.network
        },
        module: {
          type: SafeModuleType.REALITY,
          address: legacyExecutionSet.realityAddress
        },
        batches: legacyExecutionSet.txs.map(batch => {
          let legacyTransactions;
          if (Array.isArray(batch)) {
            legacyTransactions = batch;
          } else if (Array.isArray(batch.transactions)) {
            legacyTransactions = batch.transactions;
          }

          if (!legacyTransactions) {
            throw new Error('Invalid legacy execution data');
          }

          return legacyTransactions.map(transaction => {
            if (transaction.abi) {
              abis[transaction.to] = transaction.abi;
            }

            return {
              to: transaction.to,
              data: transaction.data,
              value: BigNumber.from(transaction.value),
              operation: Number(transaction.operation)
            };
          });
        })
      };

      mappedExecutionSet.abis = abis;

      return mappedExecutionSet;
    });
  }

  throw new Error('Unknown execution data format.');
}
