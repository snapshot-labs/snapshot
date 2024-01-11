import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { parseEther } from '@ethersproject/units';
import { pin } from '@snapshot-labs/pineapple';
import { BoostStrategy } from '@/helpers/interfaces';
import ABI from './abi.json';

export const BOOST_CONTRACTS = {
  '11155111': '0x3a18420C0646CC8e6D46E43d792335AeCB657fd0'
};

export const SUPPORTED_NETWORKS = Object.keys(BOOST_CONTRACTS);

export const SNAPSHOT_GUARD_ADDRESS =
  '0xF63EB3f569C6cB8F5Cf37caD183790Ed1b251c91';

interface Boost {
  strategyURI: string;
  token: string;
  amount: string;
  owner: string;
  guard: string;
  start: number;
  end: number;
}

export async function createBoost(
  web3: Web3Provider,
  networkId: string,
  params: Boost
): Promise<any> {
  const { strategyURI, token, amount, guard, start, end, owner } = params;
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
  const options = { value: parseEther('0.01') };
  return await contract.mint(
    strategyURI,
    token,
    amount,
    owner,
    guard,
    start,
    end,
    options
  );
}

export async function claimTokens(
  web3: Web3Provider,
  networkId: string,
  boost: {
    boostId: string;
    recipient: string;
    amount: string;
  },
  signature: string
): Promise<any> {
  const { boostId, recipient, amount } = boost;
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
  return await contract.claim([boostId, recipient, amount], signature);
}

export async function claimAllTokens(
  web3: Web3Provider,
  networkId: string,
  boosts: {
    boostId: string;
    recipient: string;
    amount: string;
  }[],
  signatures: string[]
): Promise<any> {
  console.log('🚀 ~ file: index.ts:74 ~ signatures:', signatures);
  console.log('🚀 ~ file: index.ts:74 ~ boosts:', boosts);

  const boostsArray = boosts.map(boost => [
    boost.boostId,
    boost.recipient,
    boost.amount
  ]);
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
  return await contract.claimMultiple(boostsArray, signatures);
}

export async function getStrategyURI(strategy: BoostStrategy) {
  const { cid } = await pin(strategy);
  return `ipfs://${cid}`;
}
