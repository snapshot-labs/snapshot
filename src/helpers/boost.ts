import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { pin } from '@snapshot-labs/pineapple';
import { BoostStrategy } from '@/helpers/interfaces';

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
