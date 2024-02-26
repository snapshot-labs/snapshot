import { SdkBase } from '../connext';
import { getConstants } from '../constants';
import { getConnextSdkConfig } from './getConnextSdk';

interface EstimateRelayerFeeProps {
  originChain: string;
  destinyChain: string;
  txGasLimit: number;
}

export const estimateRelayerFee = async ({
  originChain,
  destinyChain,
  txGasLimit
}: EstimateRelayerFeeProps) => {
  const { Chains, relayerFeeBoost } = getConstants();

  const config = await getConnextSdkConfig();
  const sdkBase = await SdkBase.create(config);

  const txDomains = {
    originDomain: Chains[originChain].domainId.toString(),
    destinationDomain: Chains[destinyChain].domainId.toString(),
    callDataGasAmount: txGasLimit
  };
  const relayerFeeSdk = await sdkBase.estimateRelayerFee(txDomains);
  const boostedRelayerFee = relayerFeeSdk.mul(relayerFeeBoost).div(100);
  
  return boostedRelayerFee.toString();
};
