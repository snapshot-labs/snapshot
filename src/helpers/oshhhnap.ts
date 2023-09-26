import { timelockDecrypt, timelockEncrypt } from 'tlock-js';
import { HttpChainClient, HttpCachingChain } from 'drand-client';

const testnetUnchainedUrl =
  'https://pl-eu.testnet.drand.sh/7672797f548f3f4748ac4bf3352fc6c6b6468c9ad40ad456a397545c6e2df5bf';

const getFastestNode = async () => {
  const chain = new HttpCachingChain(testnetUnchainedUrl);
  const client = new HttpChainClient(chain);

  return client;
};

export async function timelockEncryption(message: string, duration: number) {
  if (duration < 30)
    throw new Error(
      'Duration must be positive and greater or equal to 30 seconds'
    );
  const fastestNodeClient = await getFastestNode();
  const latestRound = await fastestNodeClient.latest();
  const chain = new HttpCachingChain(testnetUnchainedUrl);

  const { period } = await chain.info();

  const roundNumber = latestRound.round + Math.floor(duration / period);

  const result = await timelockEncrypt(
    latestRound.round + roundNumber,
    Buffer.from(message),
    fastestNodeClient
  );

  return result;
}

export async function timelockEncryptionForOshhhnap(
  message: string,
  proposalId: string,
  duration: number
) {
  let result = await timelockEncryption(message, duration);

  // We need to append the ID to the ciphertext, so we can decrypt it later
  // and know which proposal it belongs to.
  result = `${result}__ID__${proposalId}`;

  return result;
}

export async function timelockDecryption(ciphertext: string) {
  const fastestNodeClient = await getFastestNode();
  const result = await timelockDecrypt(ciphertext, fastestNodeClient);
  return result;
}

export async function timelockDecryptionForOshhhnap(ciphertext: string) {
  // We need to remove the ID from the ciphertext, so we can decrypt it.
  const [ciphertextWithoutId, proposalId] = ciphertext.split('__ID__');
  const result = await timelockDecryption(ciphertextWithoutId);
  return {
    result,
    proposalId
  };
}
