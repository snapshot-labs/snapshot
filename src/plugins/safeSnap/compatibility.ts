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
    txs: {
      transactions: Record<string, any>[];
    }[];
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

export function mapLegacyExecutionData(
  unknownExecutionData: unknown
): ExecutionData[] {
  if (isExecutionData(unknownExecutionData)) {
    return unknownExecutionData;
  } else if (isLegacyExecutionData(unknownExecutionData)) {
    return unknownExecutionData.safes.map(legacyExecutionSet => {
      return {
        safe: {
          name: 'Main Safe',
          type: SafeType.GNOSIS,
          address: '',
          network: legacyExecutionSet.network
        },
        module: {
          type: SafeModuleType.REALITY,
          address: legacyExecutionSet.realityAddress
        },
        batches: legacyExecutionSet.txs.map(tx => {
          // tx.transactions
          return []; // TODO: implement encoding
        })
      };
    });
  }

  throw new Error('Invalid execution data');
}
