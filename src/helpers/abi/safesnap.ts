import { getMultiSend } from '@/../snapshot-plugins/src/plugins/safeSnap';
import { validateSafeData } from '@/helpers/abi/utils';

export const isValidInput = input => {
  return input.safes.every(validateSafeData);
};

export const coerceConfig = (config, network) => {
  if (config.safes) {
    return {
      ...config,
      safes: config.safes.map(safe => ({
        ...safe,
        multiSendAddress:
          safe.multiSendAddress || getMultiSend(safe.network || network)
      }))
    };
  }

  // map legacy config to new format
  return {
    safes: [
      {
        network,
        realityAddress: config.address,
        multiSendAddress: getMultiSend(network)
      }
    ]
  };
};
