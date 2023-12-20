import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { parseEther } from '@ethersproject/units';
import { pin } from '@snapshot-labs/pineapple';
import { BoostStrategy } from '@/helpers/interfaces';
import ABI from './abi.json';

export const BOOST_CONTRACTS = {
  '1': '0x',
  '11155111': '0x3ef426688D6eF5ca47b4414B9f67E9E582dFc4d3'
};

export const SUPPORTED_NETWORKS = Object.keys(BOOST_CONTRACTS);

export const SNAPSHOT_GUARD_ADDRESS =
  '0xF63EB3f569C6cB8F5Cf37caD183790Ed1b251c91';

interface Boost {
  strategyURI: string;
  token: string;
  amount: string;
  guard: string;
  start: number;
  end: number;
  owner: string;
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
  boostId: number,
  recipient: string,
  amount: string,
  signature: string,
  networkId: string
): Promise<any> {
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
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
