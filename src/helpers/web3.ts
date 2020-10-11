import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import resolveENSContentHash from '@/helpers/resolveENSContentHash';
import { decodeContenthash } from '@/helpers/content';
import abi from '@/helpers/abi';

export async function resolveContent(provider, name) {
  const contentHash = await resolveENSContentHash(name, provider);
  return decodeContenthash(contentHash);
}

export async function signMessage(web3, message) {
  const signer = web3.getSigner();
  return await signer.signMessage(message);
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
