import { getConstants } from '../constants';
import {
  AlchemyProvider,
  InfuraProvider,
  JsonRpcProvider
} from '@ethersproject/providers';

const { Chains } = getConstants();

export const getAlchemyProvider = (chainName: string, apiKey: string) => {
  return new AlchemyProvider(Chains[chainName].id, apiKey);
};

export const getInfuraProvider = (chainName: string, apiKey: string) => {
  return new InfuraProvider(Chains[chainName].id, apiKey);
};

export const getPublicProvider = (chainName: string) => {
  return new JsonRpcProvider(
    Chains[chainName].publicRpcProvider,
    Chains[chainName].id
  );
};

export const getDestinationProvider = (
  chainName: string,
  alchemyKey?: string,
  infuraKey?: string
) => {
  if (alchemyKey) {
    return getAlchemyProvider(chainName, alchemyKey);
  } else if (infuraKey) {
    return getInfuraProvider(chainName, infuraKey);
  } else {
    return getPublicProvider(chainName);
  }
};
