import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import resolveENSContentHash from '@/helpers/resolveENSContentHash';
import { decodeContenthash } from '@/helpers/content';
import abi from '@/helpers/abi';

export async function resolveContent(provider, name) {
  const contentHash = await resolveENSContentHash(name, provider);
  return decodeContenthash(contentHash);
}

export async function signMessage(web3, msg) {
  return await web3.wallet.sign(msg);
}

export async function getBlockNumber(provider) {
  try {
    const chainInfo: any = await provider.blockchain.getBlockChainInfo();

    return parseInt(chainInfo.result.NumTxBlocks);
  } catch (e) {
    return Promise.reject();
  }
}

export async function getTotalSupply(provider, address: string) {
  const field = 'total_supply';
  const res: any = await provider.blockchain.getSmartContractSubState(
    address,
    field
  );

  if (res && res['result'] && res['result']['total_supply']) {
    return res['result']['total_supply'];
  }

  throw new Error('cannot fetch total_supply');
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
