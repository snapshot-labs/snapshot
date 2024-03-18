import { SdkConfig } from '../connext';
import { getConstants } from '../constants';

export const getConnextSdkConfig = async () => {
  const { Chains } = getConstants();

  const _chains: { [x: string]: { providers: string[] } } = {};

  Object.keys(Chains).map(chain => {
    const { domainId, publicRpcProvider } = Chains[chain];
    const domainIdString = domainId.toString();
    _chains[domainIdString] = { providers: [] };
    _chains[domainIdString].providers.push(publicRpcProvider);
  });

  const sdkConfig: SdkConfig = {
    chains: _chains
  };

  return sdkConfig;
};
