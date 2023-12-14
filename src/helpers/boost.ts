import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { pin } from '@snapshot-labs/pineapple';

export const IPFS_GATEWAY = 'pineapple.fyi';
export const BOOST_ADDRESS = '0xaf8b6af86044821eED74E49057De62fB5C48e061';
export const ABI = [
  'function boosts(uint256) view returns (string strategyURI, address token, uint256 balance, address guard, uint256 start, uint256 end, address owner)',
  'function claimTokens(tuple(uint256 boostId, address recipient, uint256 amount) claim, bytes signature)',
  'function claimed(address, uint256) view returns (bool)',
  'function createBoost(tuple(string strategyURI, address token, uint256 balance, address guard, uint256 start, uint256 end, address owner) boost)',
  'function depositTokens(uint256 boostId, uint256 amount)',
  'function eip712ClaimStructHash() view returns (bytes32)',
  'function nextBoostId() view returns (uint256)',
  'function withdrawRemainingTokens(uint256 boostId, address to)'
];

interface Boost {
  strategyURI: string;
  token: string;
  balance: string;
  guard: string;
  start: number;
  end: number;
  owner: string;
}

export interface BoostStrategy {
  strategy: string;
  params: Record<string, any>;
}

export async function getBoost(
  boostId: number,
  chainId: number
): Promise<Boost> {
  const broviderUrl = import.meta.env.VITE_BROVIDER_URL;
  const provider = getProvider(chainId, { broviderUrl });

  const contract = new Contract(BOOST_ADDRESS, ABI, provider);

  const boost = await contract.boosts(boostId);

  return {
    strategyURI: boost[0],
    token: boost[1],
    balance: boost[2].toString(),
    guard: boost[3],
    start: boost[4].toNumber(),
    end: boost[5].toNumber(),
    owner: boost[6]
  };
}

export async function getStrategy(
  strategyURI: string,
  gateway: string = IPFS_GATEWAY
): Promise<BoostStrategy> {
  const url = strategyURI
    .replace('ipfs://', `https://${gateway}/ipfs/`)
    .replace('ipns://', `https://${gateway}/ipns/`);

  return fetch(url).then(res => res.json());
}

export async function createBoost(
  web3: Web3Provider,
  params: Boost
): Promise<any> {
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_ADDRESS, ABI, signer);

  return await contract.createBoost(params);
}

export async function claimTokens(
  web3: Web3Provider,
  boostId: number,
  recipient: string,
  amount: string,
  signature: string
): Promise<any> {
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_ADDRESS, ABI, signer);
  const claim = {
    boostId,
    recipient,
    amount
  };

  return await contract.claimTokens(claim, signature);
}

export async function getStrategyURI(strategy: BoostStrategy) {
  const { cid } = await pin(strategy);
  return `ipfs://${cid}`;
}
