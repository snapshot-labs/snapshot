import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import resolveENSContentHash from '@/helpers/resolveENSContentHash';
import { decodeContenthash } from '@/helpers/content';
import Web3 from 'web3';
import abi from '@/helpers/abi';

export async function resolveContent(provider, name) {
  const contentHash = await resolveENSContentHash(name, provider);
  return decodeContenthash(contentHash);
}

async function web3Signer(msg: string, address: string): Promise<string> {
    const ethereum: any = window.ethereum;
    const web3 = new Web3(ethereum);
    //@ts-ignore
    return await web3.eth.personal.sign(msg, address);
}

export async function signMessage(web3, msg, address) {
  //@ts-ignore
  const isStatus = window && window.ethereum && window.ethereum.isStatus;
  if (isStatus) return web3Signer(msg, address);
  return await web3.send('personal_sign', [msg, address]);
}

export async function getBlockNumber(provider) {
  try {
    const blockNumber: any = await provider.getBlockNumber();
    return parseInt(blockNumber);
  } catch (e) {
    return Promise.reject();
  }
}

export async function sendTransaction(
  web3,
  [contractType, contractAddress, action, params]
) {
  const signer = web3.getSigner();
  const contract = new Contract(
    getAddress(contractAddress),
    abi[contractType],
    web3
  );
  const contractWithSigner = contract.connect(signer);
  const overrides = {};
  // overrides.gasLimit = 12e6;
  const tx = await contractWithSigner[action](...params, overrides);
  await tx.wait();
  return tx;
}
