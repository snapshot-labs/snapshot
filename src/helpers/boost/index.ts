import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { parseEther } from '@ethersproject/units';
import { pin } from '@snapshot-labs/pineapple';
import { BoostStrategy } from '@/helpers/boost/types';
import ABI from './abi.json';

export const BOOST_VERSION = '0.0.1';

export const BOOST_CONTRACTS = {
  // '1': '0x506661E5921f2c74B56eb380936f6e197C6cF49c',
  '11155111': '0xc8Ae580637bf91b7E2c0A8cf369Fb24e0253cA5a'
};

export const SUPPORTED_NETWORKS = Object.keys(BOOST_CONTRACTS);

export const SNAPSHOT_GUARD_ADDRESS =
  '0x064417ab192edC00E791d5911ecDbb7c9a718383';

export const BOOST_WHITELIST_SETTINGS = {
  demo: [],
  production: {
    'testsnap.eth': { bribeDisabled: true },
    'fabien.eth': {},
    'pscott.eth': {},
    'gillvill.eth': {},
    '0cf5e.eth': {},
    'thanku.eth': {}
  }
};

export async function createBoost(
  web3: Web3Provider,
  networkId: string,
  ethFee: string,
  params: {
    strategyURI: string;
    token: string;
    amount: string;
    owner: string;
    guard: string;
    start: number;
    end: number;
  }
): Promise<any> {
  const { strategyURI, token, amount, guard, start, end, owner } = params;
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
  const options = { value: parseEther(ethFee) };
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

export async function withdrawAndBurn(
  web3: Web3Provider,
  networkId: string,
  boostId: string,
  to: string
): Promise<any> {
  const signer = web3.getSigner();
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, signer);
  return await contract.burn(boostId, to);
}

export async function getFees(web3: Web3Provider, networkId: string) {
  const contract = new Contract(BOOST_CONTRACTS[networkId], ABI, web3);
  const ethFee = await contract.ethFee();
  const tokenFeePercent = await contract.tokenFee();
  return { ethFee, tokenFeePercent };
}
